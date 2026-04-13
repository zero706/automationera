import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchSubredditPosts, filterPostsByKeywords } from "@/lib/reddit";
import { scorePost } from "@/lib/ai";
import { getPlanLimits } from "@/lib/plans";
import { sendHotLeadEmail } from "@/lib/resend";
import type { Lead, Monitor, Profile, RedditPost } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

function unauthorized(request: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false; // skip check if not configured (dev only)
  const auth = request.headers.get("authorization");
  return auth !== `Bearer ${expected}`;
}

const MIN_SCORE_TO_KEEP = 30;
const HOT_SCORE = 80;

export async function GET(request: NextRequest) {
  if (unauthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Reset daily counters first
  await admin.rpc("reset_daily_lead_counters").throwOnError();

  // Pull all active monitors with their owners
  const { data: monitors, error } = await admin
    .from("monitors")
    .select("*, profiles!inner(*)")
    .eq("is_active", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  type MonitorWithProfile = Monitor & { profiles: Profile };
  const all = (monitors ?? []) as unknown as MonitorWithProfile[];

  const now = Date.now();
  const due = all.filter((m) => {
    const limits = getPlanLimits(m.profiles.plan);
    if (!m.last_scanned_at) return true;
    const last = new Date(m.last_scanned_at).getTime();
    return now - last >= limits.scanIntervalMinutes * 60_000;
  });

  let totalLeads = 0;
  const results: Array<{ monitorId: string; leads: number; error?: string }> = [];

  for (const monitor of due) {
    const profile = monitor.profiles;
    const limits = getPlanLimits(profile.plan);

    if (profile.leads_found_today >= limits.maxLeadsPerDay) {
      results.push({ monitorId: monitor.id, leads: 0 });
      continue;
    }

    let postsScanned = 0;
    let leadsCreated = 0;
    let errorMessage: string | undefined;

    try {
      // Fetch all subreddits in parallel
      const fetched = await Promise.allSettled(
        monitor.subreddits.map((sub) => fetchSubredditPosts(sub, 50)),
      );
      const allPosts: RedditPost[] = fetched
        .filter(
          (r): r is PromiseFulfilledResult<RedditPost[]> =>
            r.status === "fulfilled",
        )
        .flatMap((r) => r.value);
      postsScanned = allPosts.length;

      // Apply keyword filter
      const filtered = filterPostsByKeywords(
        allPosts,
        monitor.keywords,
        monitor.negative_keywords,
      );

      // Skip posts already in DB
      const ids = filtered.map((p) => p.id);
      const existing = ids.length
        ? await admin
            .from("leads")
            .select("reddit_post_id")
            .in("reddit_post_id", ids)
        : { data: [] as { reddit_post_id: string }[] };
      const existingSet = new Set(
        (existing.data ?? []).map((l) => l.reddit_post_id),
      );
      const fresh = filtered.filter((p) => !existingSet.has(p.id));

      // Apply daily lead budget for this monitor
      const remaining =
        limits.maxLeadsPerDay - profile.leads_found_today;
      const toScore = fresh.slice(0, Math.min(fresh.length, remaining, 25));

      for (const post of toScore) {
        try {
          const score = await scorePost(post, monitor.keywords);
          if (score.intent_score < MIN_SCORE_TO_KEEP) continue;

          const { data: inserted } = await admin
            .from("leads")
            .insert({
              monitor_id: monitor.id,
              user_id: monitor.user_id,
              reddit_post_id: post.id,
              subreddit: post.subreddit,
              title: post.title,
              body: post.selftext,
              author: post.author,
              permalink: post.permalink,
              score: post.score,
              num_comments: post.num_comments,
              intent_score: score.intent_score,
              intent_category: score.intent_category,
              ai_summary: score.summary,
              suggested_reply: limits.aiReplies ? score.suggested_reply : null,
              status: "new",
              reddit_created_at: new Date(post.created_utc * 1000).toISOString(),
            })
            .select()
            .single();

          if (inserted) {
            leadsCreated++;

            // Realtime alert for hot leads
            if (
              limits.emailAlerts &&
              profile.notification_frequency === "realtime" &&
              score.intent_score >= HOT_SCORE
            ) {
              try {
                await sendHotLeadEmail(profile.email, inserted as Lead);
              } catch {
                // ignore email failures
              }
            }
          }
        } catch {
          // skip this post
        }
      }

      // Update profile counters
      if (leadsCreated > 0) {
        await admin
          .from("profiles")
          .update({
            leads_found_today: profile.leads_found_today + leadsCreated,
            leads_found_total: profile.leads_found_total + leadsCreated,
          })
          .eq("id", profile.id);
      }
    } catch (e) {
      errorMessage = e instanceof Error ? e.message : "scan failed";
    }

    // Update monitor + log
    await admin
      .from("monitors")
      .update({ last_scanned_at: new Date().toISOString() })
      .eq("id", monitor.id);

    await admin.from("scan_logs").insert({
      monitor_id: monitor.id,
      posts_scanned: postsScanned,
      leads_found: leadsCreated,
      error: errorMessage ?? null,
    });

    totalLeads += leadsCreated;
    results.push({ monitorId: monitor.id, leads: leadsCreated, error: errorMessage });
  }

  return NextResponse.json({
    ok: true,
    monitorsScanned: due.length,
    totalLeads,
    results,
  });
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchSubredditPosts, filterPostsByKeywords } from "@/lib/reddit";
import { scorePost } from "@/lib/ai";
import { getPlanLimits } from "@/lib/plans";
import type { Monitor, Profile, RedditPost } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 120;
export const dynamic = "force-dynamic";

const MIN_SCORE = 30;
const MAX_PER_SCAN = 5;

export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [{ data: monitors, error: monErr }, { data: profileRow, error: profErr }] =
    await Promise.all([
      supabase
        .from("monitors")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true),
      supabase.from("profiles").select("*").eq("id", user.id).single(),
    ]);

  if (monErr) {
    return NextResponse.json(
      { error: `Failed to fetch monitors: ${monErr.message}` },
      { status: 500 },
    );
  }

  if (!monitors?.length) {
    return NextResponse.json({ ok: true, leadsFound: 0, message: "No active monitors" });
  }

  if (profErr || !profileRow) {
    return NextResponse.json(
      { error: `Profile not found: ${profErr?.message ?? "no row"}` },
      { status: 400 },
    );
  }

  const profile = profileRow as Profile;
  const limits = getPlanLimits(profile.plan);
  let totalLeads = 0;

  const diagnostics: Array<{
    monitor: string;
    subredditsOk: number;
    subredditsFailed: string[];
    postsFetched: number;
    postsMatchedKeywords: number;
    postsAlreadySeen: number;
    postsToScore: number;
    scores: Array<{ title: string; score: number }>;
    leadsInserted: number;
    insertErrors: string[];
    error?: string;
  }> = [];

  for (const monitor of monitors as Monitor[]) {
    const diag: (typeof diagnostics)[number] = {
      monitor: monitor.name,
      subredditsOk: 0,
      subredditsFailed: [],
      postsFetched: 0,
      postsMatchedKeywords: 0,
      postsAlreadySeen: 0,
      postsToScore: 0,
      scores: [],
      leadsInserted: 0,
      insertErrors: [],
    };

    try {
      const settled = await Promise.allSettled(
        monitor.subreddits.map((sub) => fetchSubredditPosts(sub, 50)),
      );

      const allPosts: RedditPost[] = [];
      for (let i = 0; i < settled.length; i++) {
        const r = settled[i];
        if (r.status === "fulfilled") {
          diag.subredditsOk++;
          allPosts.push(...r.value);
        } else {
          diag.subredditsFailed.push(
            `r/${monitor.subreddits[i]}: ${r.reason instanceof Error ? r.reason.message : "failed"}`,
          );
        }
      }
      diag.postsFetched = allPosts.length;

      const filtered = filterPostsByKeywords(
        allPosts,
        monitor.keywords,
        monitor.negative_keywords,
      );
      diag.postsMatchedKeywords = filtered.length;

      const ids = filtered.map((p) => p.id);
      const { data: existing } = ids.length
        ? await supabase.from("leads").select("reddit_post_id").in("reddit_post_id", ids)
        : { data: [] as { reddit_post_id: string }[] };

      const seen = new Set((existing ?? []).map((l) => l.reddit_post_id));
      diag.postsAlreadySeen = filtered.length - filtered.filter((p) => !seen.has(p.id)).length;
      const fresh = filtered.filter((p) => !seen.has(p.id)).slice(0, MAX_PER_SCAN);
      diag.postsToScore = fresh.length;

      for (let pi = 0; pi < fresh.length; pi++) {
        if (pi > 0) await new Promise((r) => setTimeout(r, 4500));
        const post = fresh[pi];
        try {
          const scored = await scorePost(post, monitor.keywords);
          diag.scores.push({
            title: post.title.slice(0, 80),
            score: scored.intent_score,
          });

          if (scored.intent_score < MIN_SCORE) continue;

          const { error: insertErr } = await supabase.from("leads").insert({
            monitor_id: monitor.id,
            user_id: user.id,
            reddit_post_id: post.id,
            subreddit: post.subreddit,
            title: post.title,
            body: post.selftext,
            author: post.author,
            permalink: post.permalink,
            score: post.score,
            num_comments: post.num_comments,
            intent_score: scored.intent_score,
            intent_category: scored.intent_category,
            ai_summary: scored.summary,
            suggested_reply: limits.aiReplies ? scored.suggested_reply : null,
            status: "new",
            reddit_created_at: new Date(post.created_utc * 1000).toISOString(),
          });

          if (insertErr) {
            diag.insertErrors.push(insertErr.message);
          } else {
            diag.leadsInserted++;
            totalLeads++;
          }
        } catch (e) {
          diag.insertErrors.push(
            `Score/insert failed: ${e instanceof Error ? e.message : "unknown"}`,
          );
        }
      }

      await supabase
        .from("monitors")
        .update({ last_scanned_at: new Date().toISOString() })
        .eq("id", monitor.id)
        .eq("user_id", user.id);
    } catch (e) {
      diag.error = e instanceof Error ? e.message : "failed";
    }

    diagnostics.push(diag);
  }

  if (totalLeads > 0) {
    await supabase
      .from("profiles")
      .update({
        leads_found_today: profile.leads_found_today + totalLeads,
        leads_found_total: profile.leads_found_total + totalLeads,
      })
      .eq("id", user.id);
  }

  return NextResponse.json({
    ok: true,
    leadsFound: totalLeads,
    monitorsScanned: monitors.length,
    diagnostics,
  });
}

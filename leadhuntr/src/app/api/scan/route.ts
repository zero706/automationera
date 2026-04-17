import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchSubredditPosts, filterPostsByKeywords } from "@/lib/reddit";
import { scorePost } from "@/lib/ai";
import { getPlanLimits } from "@/lib/plans";
import type { Monitor, Profile, RedditPost } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 120;
export const dynamic = "force-dynamic";

const MIN_SCORE = 30;
const MAX_PER_SCAN = 10; // cap per manual scan to keep it fast

export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  const [{ data: monitors }, { data: profileRow }] = await Promise.all([
    admin.from("monitors").select("*").eq("user_id", user.id).eq("is_active", true),
    admin.from("profiles").select("*").eq("id", user.id).single(),
  ]);

  if (!monitors?.length) {
    return NextResponse.json({ ok: true, leadsFound: 0, message: "No active monitors" });
  }
  if (!profileRow) {
    return NextResponse.json({ error: "Profile not found" }, { status: 400 });
  }

  const profile = profileRow as Profile;
  const limits = getPlanLimits(profile.plan);
  let totalLeads = 0;
  const errors: string[] = [];

  for (const monitor of monitors as Monitor[]) {
    try {
      // Fetch posts from all subreddits in parallel
      const settled = await Promise.allSettled(
        monitor.subreddits.map((sub) => fetchSubredditPosts(sub, 50)),
      );
      const allPosts: RedditPost[] = settled
        .filter((r): r is PromiseFulfilledResult<RedditPost[]> => r.status === "fulfilled")
        .flatMap((r) => r.value);

      const filtered = filterPostsByKeywords(
        allPosts,
        monitor.keywords,
        monitor.negative_keywords,
      );

      // Skip posts already stored
      const ids = filtered.map((p) => p.id);
      const { data: existing } = ids.length
        ? await admin.from("leads").select("reddit_post_id").in("reddit_post_id", ids)
        : { data: [] as { reddit_post_id: string }[] };

      const seen = new Set((existing ?? []).map((l) => l.reddit_post_id));
      const fresh = filtered.filter((p) => !seen.has(p.id)).slice(0, MAX_PER_SCAN);

      for (const post of fresh) {
        try {
          const scored = await scorePost(post, monitor.keywords);
          if (scored.intent_score < MIN_SCORE) continue;

          const { error: insertErr } = await admin.from("leads").insert({
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

          if (!insertErr) totalLeads++;
        } catch {
          // skip individual post errors silently
        }
      }

      await admin
        .from("monitors")
        .update({ last_scanned_at: new Date().toISOString() })
        .eq("id", monitor.id);
    } catch (e) {
      errors.push(`Monitor "${monitor.name}": ${e instanceof Error ? e.message : "failed"}`);
    }
  }

  if (totalLeads > 0) {
    await admin
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
    ...(errors.length ? { errors } : {}),
  });
}

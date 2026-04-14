import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SubredditBadge, Badge } from "@/components/ui/Badge";
import { IntentScoreBar } from "@/components/ui/IntentScoreBar";
import { Button } from "@/components/ui/Button";
import { LeadReplyEditor } from "./LeadReplyEditor";
import { formatRelativeTime } from "@/lib/utils";
import type { Lead } from "@/types";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: lead } = await supabase
    .from("leads")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!lead) notFound();
  const row = lead as Lead;

  const { data: relatedRaw } = await supabase
    .from("leads")
    .select("id, title, subreddit, intent_score")
    .eq("user_id", user.id)
    .eq("subreddit", row.subreddit)
    .neq("id", row.id)
    .order("intent_score", { ascending: false })
    .limit(5);

  const related = (relatedRaw ?? []) as Array<
    Pick<Lead, "id" | "title" | "subreddit" | "intent_score">
  >;

  return (
    <div className="space-y-6 animate-fade-in">
      <Link
        href="/dashboard/leads"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
      >
        ← All leads
      </Link>

      <div className="glass-card p-6">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <SubredditBadge name={row.subreddit} />
          <Badge variant="primary">{row.intent_category.replace("_", " ")}</Badge>
          <span className="text-[11px] text-text-tertiary">
            {formatRelativeTime(row.reddit_created_at)} · u/{row.author}
          </span>
        </div>
        <h1 className="text-xl font-bold font-display mb-3">{row.title}</h1>
        <IntentScoreBar score={row.intent_score} className="mb-5 max-w-sm" />
        {row.body && (
          <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-text-secondary leading-relaxed">
            {row.body}
          </div>
        )}
        <div className="flex items-center gap-2 mt-5">
          <a
            href={row.permalink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary">Open on Reddit ↗</Button>
          </a>
          <div className="text-xs text-text-tertiary ml-auto">
            {row.score} upvotes · {row.num_comments} comments
          </div>
        </div>
      </div>

      {row.ai_summary && (
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-primary-300 mb-2 uppercase tracking-wider">
            Why this is a lead
          </h2>
          <p className="text-sm text-text-primary leading-relaxed">
            {row.ai_summary}
          </p>
        </div>
      )}

      <LeadReplyEditor lead={row} />

      {related.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
            More from r/{row.subreddit}
          </h2>
          <ul className="divide-y divide-border">
            {related.map((l) => (
              <li key={l.id}>
                <Link
                  href={`/dashboard/lead/${l.id}`}
                  className="flex items-center justify-between py-3 hover:text-primary-200 transition-colors"
                >
                  <span className="text-sm text-text-primary truncate pr-3">
                    {l.title}
                  </span>
                  <span className="text-xs font-mono text-text-secondary">
                    {l.intent_score}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

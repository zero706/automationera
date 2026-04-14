"use client";

import Link from "next/link";
import { useState } from "react";
import { SubredditBadge, Badge } from "@/components/ui/Badge";
import { IntentScoreBar } from "@/components/ui/IntentScoreBar";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";
import { formatRelativeTime, truncate } from "@/lib/utils";
import type { Lead } from "@/types";

const categoryLabels: Record<Lead["intent_category"], string> = {
  buying_intent: "Buying intent",
  pain_point: "Pain point",
  recommendation_request: "Looking for tool",
  comparison: "Comparison",
  negative_review: "Negative review",
};

const categoryVariants: Record<
  Lead["intent_category"],
  "primary" | "success" | "warning" | "danger" | "default"
> = {
  buying_intent: "success",
  pain_point: "warning",
  recommendation_request: "primary",
  comparison: "default",
  negative_review: "danger",
};

interface LeadCardProps {
  lead: Lead;
  onStatusChange?: (id: string, status: Lead["status"]) => void;
}

export function LeadCard({ lead, onStatusChange }: LeadCardProps) {
  const [status, setStatus] = useState<Lead["status"]>(lead.status);
  const [busy, setBusy] = useState(false);

  async function updateStatus(next: Lead["status"]) {
    setBusy(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error("Failed to update lead");
      setStatus(next);
      onStatusChange?.(lead.id, next);
      toast(
        next === "saved"
          ? "Lead saved"
          : next === "dismissed"
            ? "Lead dismissed"
            : "Updated",
        "success",
      );
    } catch (e) {
      toast(e instanceof Error ? e.message : "Something went wrong", "error");
    } finally {
      setBusy(false);
    }
  }

  async function copyReply() {
    if (!lead.suggested_reply) return;
    await navigator.clipboard.writeText(lead.suggested_reply);
    toast("Reply copied to clipboard", "success");
  }

  if (status === "dismissed") return null;

  return (
    <article className="glass-card p-5 hover:border-primary/30 transition-all duration-200 animate-fade-in">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <SubredditBadge name={lead.subreddit} />
          <Badge variant={categoryVariants[lead.intent_category]}>
            {categoryLabels[lead.intent_category]}
          </Badge>
          <span className="text-[11px] text-text-tertiary">
            {formatRelativeTime(lead.reddit_created_at)} · u/{lead.author}
          </span>
        </div>
        <IntentScoreBar score={lead.intent_score} className="w-32" />
      </div>

      <Link
        href={`/dashboard/lead/${lead.id}`}
        className="block group"
      >
        <h3 className="text-[15px] font-semibold text-text-primary group-hover:text-primary-200 transition-colors mb-1.5">
          {lead.title}
        </h3>
        {lead.ai_summary && (
          <p className="text-sm text-text-secondary leading-relaxed">
            {truncate(lead.ai_summary, 200)}
          </p>
        )}
      </Link>

      <div className="flex items-center gap-2 mt-4 flex-wrap">
        <a
          href={lead.permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-primary-300 hover:text-primary-200 font-medium"
        >
          View on Reddit ↗
        </a>
        {lead.suggested_reply && (
          <Button size="sm" variant="ghost" onClick={copyReply}>
            Copy AI Reply
          </Button>
        )}
        <div className="ml-auto flex items-center gap-1.5">
          <Button
            size="sm"
            variant={status === "saved" ? "primary" : "secondary"}
            onClick={() => updateStatus(status === "saved" ? "new" : "saved")}
            disabled={busy}
          >
            {status === "saved" ? "Saved" : "Save"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => updateStatus("dismissed")}
            disabled={busy}
          >
            Dismiss
          </Button>
        </div>
      </div>
    </article>
  );
}

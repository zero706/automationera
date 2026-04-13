"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { toast } from "@/components/ui/Toast";
import type { Lead } from "@/types";

export function LeadReplyEditor({ lead }: { lead: Lead }) {
  const [reply, setReply] = useState(lead.suggested_reply ?? "");
  const [busy, setBusy] = useState(false);

  async function regenerate() {
    setBusy(true);
    try {
      const res = await fetch("/api/ai/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: lead.id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to generate reply");
      }
      const data = (await res.json()) as { reply: string };
      setReply(data.reply);
      toast("New reply generated", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Generation failed", "error");
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!reply) return;
    await navigator.clipboard.writeText(reply);
    toast("Reply copied", "success");
  }

  async function markContacted() {
    try {
      await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "contacted" }),
      });
      toast("Marked as contacted", "success");
    } catch {
      toast("Failed to update status", "error");
    }
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-primary-300 uppercase tracking-wider">
          Suggested reply
        </h2>
        <Button size="sm" variant="ghost" onClick={regenerate} loading={busy}>
          Regenerate
        </Button>
      </div>
      <Textarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="No reply generated yet. Click regenerate to ask the AI."
        rows={5}
      />
      <div className="flex items-center gap-2 mt-3">
        <Button onClick={copy} disabled={!reply}>
          Copy reply
        </Button>
        <Button variant="secondary" onClick={markContacted}>
          Mark as contacted
        </Button>
      </div>
    </div>
  );
}

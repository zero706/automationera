"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TagInput } from "@/components/ui/TagInput";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge, SubredditBadge } from "@/components/ui/Badge";
import { toast } from "@/components/ui/Toast";
import { formatRelativeTime } from "@/lib/utils";
import type { Monitor } from "@/types";

interface Limits {
  maxMonitors: number;
  maxSubreddits: number;
  maxKeywords: number;
}

export function MonitorsClient({
  initialMonitors,
  limits,
}: {
  initialMonitors: Monitor[];
  limits: Limits;
}) {
  const router = useRouter();
  const [monitors, setMonitors] = useState(initialMonitors);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Monitor | null>(null);
  const [scanning, setScanning] = useState(false);
  const MIN_SCORE_DISPLAY = 15;

  const canCreate = monitors.length < limits.maxMonitors;

  function startCreate() {
    setEditing(null);
    setOpen(true);
  }

  function startEdit(m: Monitor) {
    setEditing(m);
    setOpen(true);
  }

  async function runScan() {
    setScanning(true);
    try {
      const res = await fetch("/api/scan", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Scan failed");

      if (data.leadsFound > 0) {
        toast(
          `Scan complete — ${data.leadsFound} new lead${data.leadsFound === 1 ? "" : "s"} found!`,
          "success",
        );
      } else if (data.diagnostics?.length) {
        const d = data.diagnostics[0];
        const parts: string[] = [];
        if (d.subredditsFailed?.length)
          parts.push(`${d.subredditsFailed.length} subreddit(s) failed`);
        if (d.postsFetched === 0) parts.push("0 posts fetched from Reddit");
        else if (d.postsMatchedKeywords === 0)
          parts.push(`${d.postsFetched} posts fetched, 0 matched keywords`);
        else if (d.postsAlreadySeen > 0 && d.postsToScore === 0)
          parts.push(`${d.postsMatchedKeywords} matched but all already seen`);
        else if (d.postsToScore > 0 && d.scores?.length === 0)
          parts.push("AI scoring failed");
        else if (d.scores?.length > 0) {
          const best = Math.max(...d.scores.map((s: { score: number }) => s.score));
          parts.push(
            `${d.scores.length} scored, best = ${best}/100 (min ${MIN_SCORE_DISPLAY} to keep)`,
          );
        }
        if (d.insertErrors?.length) parts.push(d.insertErrors[0]);
        toast(
          `No new leads. ${parts.join(" — ") || "Try broader keywords."}`,
          "info",
        );
        console.log("[Scan diagnostics]", data.diagnostics);
      } else {
        toast("Scan complete — no new leads", "info");
      }

      router.refresh();
      const fresh = await fetch("/api/monitors").then((r) => r.json());
      if (Array.isArray(fresh.monitors)) setMonitors(fresh.monitors);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Scan failed", "error");
    } finally {
      setScanning(false);
    }
  }

  async function saveMonitor(payload: Partial<Monitor>) {
    const method = editing ? "PATCH" : "POST";
    const url = editing ? `/api/monitors/${editing.id}` : "/api/monitors";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast(data.error ?? "Failed to save monitor", "error");
      return;
    }
    toast(editing ? "Monitor updated" : "Monitor created", "success");
    setOpen(false);
    router.refresh();
    // Optimistic refresh
    const fresh = await fetch("/api/monitors").then((r) => r.json());
    if (Array.isArray(fresh.monitors)) setMonitors(fresh.monitors);
  }

  async function toggleActive(m: Monitor) {
    const res = await fetch(`/api/monitors/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !m.is_active }),
    });
    if (!res.ok) return toast("Failed to update", "error");
    setMonitors((prev) =>
      prev.map((x) => (x.id === m.id ? { ...x, is_active: !m.is_active } : x)),
    );
  }

  async function deleteMonitor(m: Monitor) {
    if (!confirm(`Delete "${m.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/monitors/${m.id}`, { method: "DELETE" });
    if (!res.ok) return toast("Failed to delete", "error");
    setMonitors((prev) => prev.filter((x) => x.id !== m.id));
    toast("Monitor deleted", "success");
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-display">Monitors</h1>
          <p className="text-sm text-text-secondary">
            Surveille des subreddits et mots-clés pour trouver des leads en temps réel.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={runScan}
            loading={scanning}
            disabled={monitors.length === 0}
          >
            {scanning ? "Scanning…" : "⚡ Scan now"}
          </Button>
          <Button onClick={startCreate} disabled={!canCreate}>
            + New monitor
          </Button>
        </div>
      </div>

      {!canCreate && (
        <div className="glass-card p-4 border border-warning/30">
          <p className="text-sm text-warning">
            You&apos;ve reached your plan limit of {limits.maxMonitors} monitor
            {limits.maxMonitors === 1 ? "" : "s"}.{" "}
            <a href="/dashboard/billing" className="underline">
              Upgrade your plan
            </a>{" "}
            to add more.
          </p>
        </div>
      )}

      {monitors.length === 0 ? (
        <EmptyState
          title="No monitors yet"
          description="Create your first monitor to start tracking Reddit for leads."
          action={<Button onClick={startCreate}>Create a monitor</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {monitors.map((m) => (
            <div key={m.id} className="glass-card p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-text-primary font-display">
                    {m.name}
                  </h3>
                  <p className="text-xs text-text-tertiary">
                    {m.last_scanned_at
                      ? `Last scanned ${formatRelativeTime(m.last_scanned_at)}`
                      : "Never scanned"}
                  </p>
                </div>
                <Badge variant={m.is_active ? "success" : "outline"}>
                  {m.is_active ? "Active" : "Paused"}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {m.subreddits.slice(0, 5).map((s) => (
                  <SubredditBadge key={s} name={s} />
                ))}
                {m.subreddits.length > 5 && (
                  <span className="text-[11px] text-text-tertiary">
                    +{m.subreddits.length - 5} more
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {m.keywords.slice(0, 4).map((k) => (
                  <span
                    key={k}
                    className="inline-flex px-2 py-0.5 rounded-md bg-border text-[11px] text-text-secondary"
                  >
                    {k}
                  </span>
                ))}
                {m.keywords.length > 4 && (
                  <span className="text-[11px] text-text-tertiary">
                    +{m.keywords.length - 4} more
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Button size="sm" variant="secondary" onClick={() => startEdit(m)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleActive(m)}
                >
                  {m.is_active ? "Pause" : "Resume"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-auto text-danger hover:text-danger"
                  onClick={() => deleteMonitor(m)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <MonitorForm
        open={open}
        onClose={() => setOpen(false)}
        onSave={saveMonitor}
        editing={editing}
        limits={limits}
      />
    </div>
  );
}

function MonitorForm({
  open,
  onClose,
  onSave,
  editing,
  limits,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Monitor>) => Promise<void>;
  editing: Monitor | null;
  limits: Limits;
}) {
  const [name, setName] = useState(editing?.name ?? "");
  const [subreddits, setSubreddits] = useState<string[]>(
    editing?.subreddits ?? [],
  );
  const [keywords, setKeywords] = useState<string[]>(editing?.keywords ?? []);
  const [negative, setNegative] = useState<string[]>(
    editing?.negative_keywords ?? [],
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(editing?.name ?? "");
    setSubreddits(editing?.subreddits ?? []);
    setKeywords(editing?.keywords ?? []);
    setNegative(editing?.negative_keywords ?? []);
  }, [open, editing]);

  async function submit() {
    if (!name.trim() || subreddits.length === 0 || keywords.length === 0) {
      toast("Name, subreddits, and keywords are required", "error");
      return;
    }
    setSaving(true);
    await onSave({
      name: name.trim(),
      subreddits,
      keywords,
      negative_keywords: negative,
    });
    setSaving(false);
  }

  const maxSub = limits.maxSubreddits >= 9999 ? undefined : limits.maxSubreddits;
  const maxKw = limits.maxKeywords >= 9999 ? undefined : limits.maxKeywords;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit monitor" : "Create a monitor"}
      description="Define what LeadHuntr should watch on Reddit."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} loading={saving}>
            {editing ? "Save changes" : "Create monitor"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Name"
          placeholder="My SaaS product"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TagInput
          label="Subreddits"
          placeholder="SaaS, startups, smallbusiness"
          prefix="r/"
          value={subreddits}
          onChange={setSubreddits}
          maxTags={maxSub}
          hint="Press Enter or comma to add. Don't include r/."
        />
        <TagInput
          label="Keywords"
          placeholder="CRM, alternative to hubspot"
          value={keywords}
          onChange={setKeywords}
          maxTags={maxKw}
          hint="Posts matching at least one keyword will be analyzed."
        />
        <TagInput
          label="Negative keywords (optional)"
          placeholder="job, hiring"
          value={negative}
          onChange={setNegative}
          hint="Posts containing these words will be excluded."
        />
      </div>
    </Modal>
  );
}

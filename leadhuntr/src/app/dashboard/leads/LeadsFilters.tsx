"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const CATEGORIES: { value: string; label: string }[] = [
  { value: "", label: "All categories" },
  { value: "buying_intent", label: "Buying intent" },
  { value: "pain_point", label: "Pain point" },
  { value: "recommendation_request", label: "Looking for tool" },
  { value: "comparison", label: "Comparison" },
  { value: "negative_review", label: "Negative review" },
];

const STATUSES: { value: string; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "saved", label: "Saved" },
  { value: "contacted", label: "Contacted" },
];

const SCORES = [
  { value: "", label: "Any score" },
  { value: "80", label: "80+ (hot)" },
  { value: "60", label: "60+" },
  { value: "40", label: "40+" },
];

export function LeadsFilters() {
  const router = useRouter();
  const params = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      router.replace(`/dashboard/leads?${next.toString()}`);
    },
    [params, router],
  );

  const selectClass =
    "h-9 rounded-md bg-surface border border-border px-3 text-xs text-text-primary focus:outline-none focus:border-primary/60";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <select
        className={selectClass}
        value={params.get("category") ?? ""}
        onChange={(e) => setParam("category", e.target.value)}
      >
        {CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
      <select
        className={selectClass}
        value={params.get("status") ?? ""}
        onChange={(e) => setParam("status", e.target.value)}
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <select
        className={selectClass}
        value={params.get("min_score") ?? ""}
        onChange={(e) => setParam("min_score", e.target.value)}
      >
        {SCORES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder="subreddit"
        className="h-9 rounded-md bg-surface border border-border px-3 text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary/60 w-40"
        defaultValue={params.get("subreddit") ?? ""}
        onBlur={(e) => setParam("subreddit", e.target.value)}
      />
    </div>
  );
}

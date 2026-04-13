import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { LeadCard } from "@/components/dashboard/LeadCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { LeadsFilters } from "./LeadsFilters";
import type { Lead } from "@/types";

export const dynamic = "force-dynamic";

type SearchParams = {
  [key: string]: string | string[] | undefined;
};

export default async function AllLeadsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const status = typeof searchParams.status === "string" ? searchParams.status : undefined;
  const category = typeof searchParams.category === "string" ? searchParams.category : undefined;
  const minScore = typeof searchParams.min_score === "string" ? searchParams.min_score : undefined;
  const subreddit = typeof searchParams.subreddit === "string" ? searchParams.subreddit : undefined;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  let query = supabase
    .from("leads")
    .select("*")
    .eq("user_id", user.id)
    .order("intent_score", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(100);

  if (status) {
    query = query.eq("status", status);
  } else {
    query = query.neq("status", "dismissed");
  }
  if (category) {
    query = query.eq("intent_category", category);
  }
  if (minScore) {
    const min = parseInt(minScore, 10);
    if (!Number.isNaN(min)) query = query.gte("intent_score", min);
  }
  if (subreddit) {
    query = query.ilike("subreddit", subreddit);
  }

  const { data: leads } = await query;
  const rows = (leads ?? []) as Lead[];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display">All Leads</h1>
        <p className="text-sm text-text-secondary">
          Filter, save, and act on every lead LeadHuntr has found.
        </p>
      </div>

      <Suspense fallback={null}>
        <LeadsFilters />
      </Suspense>

      {rows.length === 0 ? (
        <EmptyState
          title="No leads match these filters"
          description="Try lowering the minimum score or clearing the filters."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {rows.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </div>
  );
}

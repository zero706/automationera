import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { LeadCard } from "@/components/dashboard/LeadCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import type { Lead } from "@/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);

  const [
    { data: leads },
    { count: hotLeads },
    { count: monitorsCount },
    { count: leadsTodayCount },
  ] = await Promise.all([
    supabase
      .from("leads")
      .select("*")
      .eq("user_id", user.id)
      .neq("status", "dismissed")
      .order("intent_score", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("intent_score", 80)
      .neq("status", "dismissed"),
    supabase
      .from("monitors")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_active", true),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", since.toISOString()),
  ]);

  const rows = (leads ?? []) as Lead[];
  const contactedCount = rows.filter((l) => l.status === "contacted").length;
  const responseRate = rows.length
    ? Math.round((contactedCount / rows.length) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-display">Overview</h1>
          <p className="text-sm text-text-secondary">
            Your highest-intent Reddit leads, scored by AI.
          </p>
        </div>
        <Link href="/dashboard/monitors">
          <Button variant="secondary">Manage monitors</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Leads today"
          value={leadsTodayCount ?? 0}
          icon={<Dot />}
        />
        <StatsCard
          label="Hot leads (80+)"
          value={hotLeads ?? 0}
          icon={<FireIcon />}
        />
        <StatsCard
          label="Active monitors"
          value={monitorsCount ?? 0}
          icon={<RadarDot />}
        />
        <StatsCard
          label="Response rate"
          value={`${responseRate}%`}
          icon={<ChartIcon />}
        />
      </div>

      <section>
        <h2 className="text-base font-semibold font-display mb-3">
          Top leads
        </h2>
        {rows.length === 0 ? (
          <EmptyState
            icon={<RadarDot />}
            title="No leads yet"
            description="Create your first monitor to start tracking Reddit for high-intent conversations."
            action={
              <Link href="/dashboard/monitors">
                <Button>Create a monitor</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {rows.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Dot() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}
function FireIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M12 2s4 4 4 9-4 7-4 7-4-2-4-7 4-9 4-9z" />
    </svg>
  );
}
function RadarDot() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M4 19V5m0 14h16M8 15l3-4 3 2 5-7" />
    </svg>
  );
}

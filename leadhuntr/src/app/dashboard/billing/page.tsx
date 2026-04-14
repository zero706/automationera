import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { BillingActions } from "./BillingActions";
import { PLAN_LIMITS } from "@/lib/plans";
import type { Profile } from "@/types";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return null;
  const p = profile as Profile;
  const current = PLAN_LIMITS[p.plan];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display">Billing</h1>
        <p className="text-sm text-text-secondary">
          Manage your subscription and upgrade your plan.
        </p>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-xs text-text-secondary uppercase tracking-wider">
              Current plan
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-2xl font-bold font-display">{current.name}</h2>
              <Badge variant={p.plan === "free" ? "outline" : "primary"}>
                {p.plan}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold font-mono">
              ${current.price}
              <span className="text-sm text-text-secondary font-normal">
                /mo
              </span>
            </div>
          </div>
        </div>
        <BillingActions plan={p.plan} hasStripeCustomer={!!p.stripe_customer_id} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(["free", "pro", "business"] as const).map((planKey) => {
          const plan = PLAN_LIMITS[planKey];
          const isCurrent = planKey === p.plan;
          return (
            <div
              key={planKey}
              className={`glass-card p-6 ${isCurrent ? "ring-2 ring-primary/50" : ""}`}
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-bold font-display">{plan.name}</h3>
                {isCurrent && <Badge variant="primary">Current</Badge>}
              </div>
              <div className="text-3xl font-bold font-mono mb-4">
                ${plan.price}
                <span className="text-sm text-text-secondary font-normal">
                  /mo
                </span>
              </div>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>
                  <Check />
                  {plan.maxMonitors} monitor
                  {plan.maxMonitors === 1 ? "" : "s"}
                </li>
                <li>
                  <Check />
                  {isFinite(plan.maxSubreddits)
                    ? `${plan.maxSubreddits} subreddits`
                    : "Unlimited subreddits"}
                </li>
                <li>
                  <Check />
                  {isFinite(plan.maxKeywords)
                    ? `${plan.maxKeywords} keywords`
                    : "Unlimited keywords"}
                </li>
                <li>
                  <Check />
                  {isFinite(plan.maxLeadsPerDay)
                    ? `${plan.maxLeadsPerDay} leads/day`
                    : "Unlimited leads"}
                </li>
                <li>
                  <Check />
                  Scan every {plan.scanIntervalMinutes} min
                </li>
                {plan.aiReplies && (
                  <li>
                    <Check />
                    AI-suggested replies
                  </li>
                )}
                {plan.emailAlerts && (
                  <li>
                    <Check />
                    Email alerts
                  </li>
                )}
                {plan.exportCsv && (
                  <li>
                    <Check />
                    Export CSV
                  </li>
                )}
                {plan.apiAccess && (
                  <li>
                    <Check />
                    API access
                  </li>
                )}
                {plan.prioritySupport && (
                  <li>
                    <Check />
                    Priority support
                  </li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Check() {
  return (
    <svg
      className="inline w-4 h-4 mr-2 text-success"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

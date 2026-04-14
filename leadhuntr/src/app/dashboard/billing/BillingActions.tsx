"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";
import type { Plan } from "@/types";

export function BillingActions({
  plan,
  hasStripeCustomer,
}: {
  plan: Plan;
  hasStripeCustomer: boolean;
}) {
  const [loading, setLoading] = useState<string | null>(null);

  async function checkout(target: Plan) {
    setLoading(target);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: target }),
      });
      if (!res.ok) throw new Error("Checkout failed");
      const { url } = (await res.json()) as { url: string };
      window.location.href = url;
    } catch (e) {
      toast(e instanceof Error ? e.message : "Something went wrong", "error");
      setLoading(null);
    }
  }

  async function portal() {
    setLoading("portal");
    try {
      const res = await fetch("/api/stripe/create-portal", { method: "POST" });
      if (!res.ok) throw new Error("Portal failed");
      const { url } = (await res.json()) as { url: string };
      window.location.href = url;
    } catch (e) {
      toast(e instanceof Error ? e.message : "Something went wrong", "error");
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {plan === "free" && (
        <>
          <Button onClick={() => checkout("pro")} loading={loading === "pro"}>
            Upgrade to Pro — $29/mo
          </Button>
          <Button
            variant="secondary"
            onClick={() => checkout("business")}
            loading={loading === "business"}
          >
            Upgrade to Business — $79/mo
          </Button>
        </>
      )}
      {plan === "pro" && (
        <>
          <Button
            onClick={() => checkout("business")}
            loading={loading === "business"}
          >
            Upgrade to Business
          </Button>
          {hasStripeCustomer && (
            <Button
              variant="secondary"
              onClick={portal}
              loading={loading === "portal"}
            >
              Manage subscription
            </Button>
          )}
        </>
      )}
      {plan === "business" && hasStripeCustomer && (
        <Button
          variant="secondary"
          onClick={portal}
          loading={loading === "portal"}
        >
          Manage subscription
        </Button>
      )}
    </div>
  );
}

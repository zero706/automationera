import Stripe from "stripe";
import type { Plan } from "@/types";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY");
  _stripe = new Stripe(key, { apiVersion: "2024-09-30.acacia" });
  return _stripe;
}

export function planFromPriceId(priceId: string | null | undefined): Plan {
  if (!priceId) return "free";
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "pro";
  if (priceId === process.env.STRIPE_BUSINESS_PRICE_ID) return "business";
  return "free";
}

export function priceIdForPlan(plan: Plan): string | null {
  switch (plan) {
    case "pro":
      return process.env.STRIPE_PRO_PRICE_ID ?? null;
    case "business":
      return process.env.STRIPE_BUSINESS_PRICE_ID ?? null;
    default:
      return null;
  }
}

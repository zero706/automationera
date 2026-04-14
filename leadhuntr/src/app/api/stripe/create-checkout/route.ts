import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getStripe, priceIdForPlan } from "@/lib/stripe";
import { getBaseUrl } from "@/lib/utils";
import type { Profile } from "@/types";

const schema = z.object({ plan: z.enum(["pro", "business"]) });

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const priceId = priceIdForPlan(parsed.data.plan);
  if (!priceId)
    return NextResponse.json(
      { error: "Plan not configured" },
      { status: 500 },
    );

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  const p = profile as Profile | null;

  const stripe = getStripe();
  const baseUrl = getBaseUrl();

  let customerId = p?.stripe_customer_id ?? undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/dashboard/billing?success=1`,
    cancel_url: `${baseUrl}/dashboard/billing?canceled=1`,
    allow_promotion_codes: true,
    subscription_data: {
      metadata: { user_id: user.id },
    },
    metadata: { user_id: user.id, plan: parsed.data.plan },
  });

  return NextResponse.json({ url: session.url });
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { getBaseUrl } from "@/lib/utils";
import type { Profile } from "@/types";

export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  const customerId = (profile as Pick<Profile, "stripe_customer_id"> | null)
    ?.stripe_customer_id;
  if (!customerId)
    return NextResponse.json({ error: "No subscription" }, { status: 400 });

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${getBaseUrl()}/dashboard/billing`,
  });

  return NextResponse.json({ url: session.url });
}

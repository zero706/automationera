import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendDigestEmail } from "@/lib/resend";
import { getPlanLimits } from "@/lib/plans";
import type { Lead, Profile } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

function unauthorized(request: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  const auth = request.headers.get("authorization");
  return auth !== `Bearer ${expected}`;
}

export async function GET(request: NextRequest) {
  if (unauthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: profiles, error } = await admin
    .from("profiles")
    .select("*")
    .in("notification_frequency", ["daily", "weekly"]);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 1);

  let sent = 0;
  const errors: string[] = [];

  for (const row of (profiles ?? []) as Profile[]) {
    if (!getPlanLimits(row.plan).emailAlerts) continue;

    const { data: leads } = await admin
      .from("leads")
      .select("*")
      .eq("user_id", row.id)
      .gte("created_at", since.toISOString())
      .gte("intent_score", 60)
      .neq("status", "dismissed")
      .order("intent_score", { ascending: false })
      .limit(15);

    const list = (leads ?? []) as Lead[];
    if (list.length === 0) continue;

    try {
      await sendDigestEmail(row.email, list);
      sent++;
    } catch (e) {
      errors.push(
        `${row.email}: ${e instanceof Error ? e.message : "send failed"}`,
      );
    }
  }

  return NextResponse.json({ ok: true, sent, errors });
}

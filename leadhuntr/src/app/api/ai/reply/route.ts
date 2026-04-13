import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generateReply } from "@/lib/ai";
import { getPlanLimits } from "@/lib/plans";
import { checkRateLimit } from "@/lib/rate-limit";
import type { Lead, Profile } from "@/types";

const schema = z.object({ lead_id: z.string().uuid() });

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await checkRateLimit(`ai-reply:${user.id}`);
  if (!rl.success)
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  const json = await request.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();
  const plan = (profile as Pick<Profile, "plan"> | null)?.plan ?? "free";
  if (!getPlanLimits(plan).aiReplies) {
    return NextResponse.json(
      { error: "AI replies are a Pro feature" },
      { status: 402 },
    );
  }

  const { data: lead } = await supabase
    .from("leads")
    .select("*")
    .eq("id", parsed.data.lead_id)
    .eq("user_id", user.id)
    .single();
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const row = lead as Lead;

  try {
    const reply = await generateReply(
      row.title,
      row.body ?? "",
      row.subreddit,
    );

    await supabase
      .from("leads")
      .update({ suggested_reply: reply })
      .eq("id", row.id)
      .eq("user_id", user.id);

    return NextResponse.json({ reply });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "AI failed" },
      { status: 500 },
    );
  }
}

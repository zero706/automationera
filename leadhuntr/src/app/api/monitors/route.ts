import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { canAddKeywords, canAddSubreddits, canCreateMonitor } from "@/lib/plans";
import { checkRateLimit } from "@/lib/rate-limit";
import type { Profile } from "@/types";

const monitorSchema = z.object({
  name: z.string().min(1).max(100),
  subreddits: z.array(z.string().min(1).max(50)).min(1).max(50),
  keywords: z.array(z.string().min(1).max(100)).min(1).max(100),
  negative_keywords: z.array(z.string().min(1).max(100)).max(50).optional(),
});

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("monitors")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ monitors: data ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await checkRateLimit(`monitors:${user.id}`);
  if (!rl.success)
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  const json = await request.json().catch(() => null);
  const parsed = monitorSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  const plan = (profile as Profile | null)?.plan ?? "free";

  const { count } = await supabase
    .from("monitors")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (!canCreateMonitor(plan, count ?? 0)) {
    return NextResponse.json(
      { error: "Plan limit reached for monitors" },
      { status: 402 },
    );
  }
  if (!canAddSubreddits(plan, parsed.data.subreddits.length)) {
    return NextResponse.json(
      { error: "Plan limit reached for subreddits" },
      { status: 402 },
    );
  }
  if (!canAddKeywords(plan, parsed.data.keywords.length)) {
    return NextResponse.json(
      { error: "Plan limit reached for keywords" },
      { status: 402 },
    );
  }

  const { data, error } = await supabase
    .from("monitors")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      subreddits: parsed.data.subreddits,
      keywords: parsed.data.keywords,
      negative_keywords: parsed.data.negative_keywords ?? [],
      is_active: true,
    })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ monitor: data }, { status: 201 });
}

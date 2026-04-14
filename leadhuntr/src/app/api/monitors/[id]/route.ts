import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { canAddKeywords, canAddSubreddits } from "@/lib/plans";
import type { Profile } from "@/types";

const updateSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    subreddits: z.array(z.string().min(1).max(50)).max(50).optional(),
    keywords: z.array(z.string().min(1).max(100)).max(100).optional(),
    negative_keywords: z.array(z.string().min(1).max(100)).max(50).optional(),
    is_active: z.boolean().optional(),
  })
  .strict();

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  if (parsed.data.subreddits || parsed.data.keywords) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();
    const plan = (profile as Pick<Profile, "plan"> | null)?.plan ?? "free";
    if (
      parsed.data.subreddits &&
      !canAddSubreddits(plan, parsed.data.subreddits.length)
    ) {
      return NextResponse.json(
        { error: "Plan limit reached for subreddits" },
        { status: 402 },
      );
    }
    if (
      parsed.data.keywords &&
      !canAddKeywords(plan, parsed.data.keywords.length)
    ) {
      return NextResponse.json(
        { error: "Plan limit reached for keywords" },
        { status: 402 },
      );
    }
  }

  const { data, error } = await supabase
    .from("monitors")
    .update(parsed.data)
    .eq("id", params.id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ monitor: data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("monitors")
    .delete()
    .eq("id", params.id)
    .eq("user_id", user.id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

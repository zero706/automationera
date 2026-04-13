import { createClient } from "@/lib/supabase/server";
import { MonitorsClient } from "./MonitorsClient";
import { getPlanLimits } from "@/lib/plans";
import type { Monitor, Profile } from "@/types";

export const dynamic = "force-dynamic";

export default async function MonitorsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: monitors } = await supabase
    .from("monitors")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const limits = getPlanLimits((profile as Profile)?.plan ?? "free");
  const safeNumber = (n: number) => (isFinite(n) ? n : 9999);

  return (
    <MonitorsClient
      initialMonitors={(monitors ?? []) as Monitor[]}
      limits={{
        maxMonitors: safeNumber(limits.maxMonitors),
        maxSubreddits: safeNumber(limits.maxSubreddits),
        maxKeywords: safeNumber(limits.maxKeywords),
      }}
    />
  );
}

import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./SettingsForm";
import type { Profile } from "@/types";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
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

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold font-display">Settings</h1>
        <p className="text-sm text-text-secondary">
          Manage your profile and notification preferences.
        </p>
      </div>
      <SettingsForm profile={profile as Profile} />
    </div>
  );
}

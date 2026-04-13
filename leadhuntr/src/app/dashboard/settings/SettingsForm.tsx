"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import type { NotificationFrequency, Profile } from "@/types";

const FREQUENCIES: { value: NotificationFrequency; label: string }[] = [
  { value: "realtime", label: "Realtime (hot leads only)" },
  { value: "daily", label: "Daily digest (8am UTC)" },
  { value: "weekly", label: "Weekly digest" },
  { value: "off", label: "Off" },
];

export function SettingsForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [frequency, setFrequency] = useState<NotificationFrequency>(
    profile.notification_frequency,
  );
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        notification_frequency: frequency,
      })
      .eq("id", profile.id);
    setSaving(false);
    if (error) {
      toast(error.message, "error");
      return;
    }
    toast("Settings saved", "success");
    router.refresh();
  }

  async function deleteAccount() {
    if (
      !confirm(
        "This will permanently delete your account and all data. Continue?",
      )
    )
      return;
    const res = await fetch("/api/account", { method: "DELETE" });
    if (!res.ok) {
      toast("Failed to delete account", "error");
      return;
    }
    window.location.href = "/";
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-base font-semibold font-display">Profile</h2>
        <Input label="Email" value={profile.email} disabled />
        <Input
          label="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      <div className="glass-card p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold font-display">Notifications</h2>
          <p className="text-xs text-text-secondary mt-1">
            How often should we email you about new leads?
          </p>
        </div>
        <div className="space-y-2">
          {FREQUENCIES.map((f) => (
            <label
              key={f.value}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/40 cursor-pointer transition-colors"
            >
              <input
                type="radio"
                name="frequency"
                value={f.value}
                checked={frequency === f.value}
                onChange={() => setFrequency(f.value)}
                className="accent-primary"
              />
              <span className="text-sm text-text-primary">{f.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button onClick={save} loading={saving}>
          Save changes
        </Button>
      </div>

      <div className="glass-card p-6 border-danger/30">
        <h2 className="text-base font-semibold font-display text-danger">
          Danger zone
        </h2>
        <p className="text-xs text-text-secondary mt-1 mb-4">
          Permanently delete your account and all associated data.
        </p>
        <Button variant="danger" onClick={deleteAccount}>
          Delete account
        </Button>
      </div>
    </div>
  );
}

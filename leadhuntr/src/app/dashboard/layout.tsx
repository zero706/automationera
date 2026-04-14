import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: initial, error: selectError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (selectError) {
    console.error("[dashboard/layout] profiles select failed:", selectError);
  }

  let profile = initial;

  // Self-heal: the handle_new_user trigger should create a profile row on
  // signup, but if the migration was applied after the account existed (or
  // the trigger failed) we insert it now. RLS allows this because
  // auth.uid() = user.id.
  if (!profile) {
    const fullName =
      (user.user_metadata?.full_name as string | undefined) ??
      (user.email ? user.email.split("@")[0] : "User");

    const { data: created, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email ?? "",
        full_name: fullName,
      })
      .select()
      .single();

    if (insertError) {
      console.error(
        "[dashboard/layout] profile self-heal insert failed:",
        insertError,
      );
      return (
        <main className="min-h-screen flex items-center justify-center p-6 mesh-bg">
          <div className="max-w-md glass-card p-6 space-y-4 text-center">
            <h1 className="text-lg font-bold font-display text-red-300">
              Profile setup failed
            </h1>
            <p className="text-sm text-text-secondary">
              We couldn&apos;t create your profile. Make sure the SQL
              migration{" "}
              <code className="font-mono text-xs">
                supabase/migrations/0001_initial_schema.sql
              </code>{" "}
              has been applied to your Supabase project.
            </p>
            <pre className="text-[10px] text-red-300/80 bg-black/40 p-2 rounded overflow-auto text-left whitespace-pre-wrap">
              {insertError.message}
            </pre>
            <a
              href="/auth/signout"
              className="inline-block text-xs text-text-tertiary underline hover:text-text-primary"
            >
              Sign out
            </a>
          </div>
        </main>
      );
    }
    profile = created;
  }

  if (!profile) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 mesh-bg">
        <div className="max-w-md glass-card p-6 space-y-4 text-center">
          <h1 className="text-lg font-bold font-display text-red-300">
            Profile unavailable
          </h1>
          <p className="text-sm text-text-secondary">
            Unable to load your profile. Please try signing out and back in.
          </p>
          <a
            href="/auth/signout"
            className="inline-block text-xs text-text-tertiary underline hover:text-text-primary"
          >
            Sign out
          </a>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="md:pl-60">
        <Header profile={profile as Profile} />
        <main className="p-6 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}

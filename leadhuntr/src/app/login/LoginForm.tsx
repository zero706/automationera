"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";
  const urlError = searchParams.get("error");

  const [mode, setMode] = useState<"password" | "magic">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    try {
      if (mode === "password") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast("Signed in", "success");
        router.push(redirect);
        router.refresh();
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
          },
        });
        if (error) throw error;
        toast("Check your email for the magic link", "success");
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : "Sign in failed", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {urlError && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
          {urlError}
        </div>
      )}
      <Input
        type="email"
        label="Email"
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />
      {mode === "password" && (
        <Input
          type="password"
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      )}
      <Button type="submit" loading={loading} fullWidth>
        {mode === "password" ? "Sign in" : "Send magic link"}
      </Button>
      <button
        type="button"
        onClick={() => setMode(mode === "password" ? "magic" : "password")}
        className="w-full text-center text-xs text-text-secondary hover:text-text-primary transition-colors"
      >
        {mode === "password" ? "Use magic link instead" : "Use password instead"}
      </button>
    </form>
  );
}

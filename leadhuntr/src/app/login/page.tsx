import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 mesh-bg">
      <div className="w-full max-w-md">
        <Link href="/" className="flex justify-center mb-8">
          <span className="text-xl font-bold font-display text-gradient">
            LeadHuntr
          </span>
        </Link>
        <div className="glass-card p-8">
          <h1 className="text-2xl font-bold font-display mb-1">Welcome back</h1>
          <p className="text-sm text-text-secondary mb-6">
            Sign in to your account to continue
          </p>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
          <p className="mt-6 text-center text-sm text-text-secondary">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-primary-300 hover:text-primary-200 font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

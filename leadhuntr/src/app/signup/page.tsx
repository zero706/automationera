import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = {
  title: "Create account",
};

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 mesh-bg">
      <div className="w-full max-w-md">
        <Link href="/" className="flex justify-center mb-8">
          <span className="text-xl font-bold font-display text-gradient">
            LeadHuntr
          </span>
        </Link>
        <div className="glass-card p-8">
          <h1 className="text-2xl font-bold font-display mb-1">
            Start finding leads
          </h1>
          <p className="text-sm text-text-secondary mb-6">
            Free forever. No credit card required.
          </p>
          <SignupForm />
          <p className="mt-6 text-center text-sm text-text-secondary">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary-300 hover:text-primary-200 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

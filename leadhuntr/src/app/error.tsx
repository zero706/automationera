"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 mesh-bg">
      <div className="glass-card p-8 max-w-md text-center">
        <h1 className="text-2xl font-bold font-display mb-2">
          Something went wrong
        </h1>
        <p className="text-sm text-text-secondary mb-5">
          {error.message || "An unexpected error occurred."}
        </p>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={reset}
            className="bg-primary hover:bg-primary-600 text-white font-medium px-5 h-10 rounded-lg shadow-glow"
          >
            Try again
          </button>
          <Link
            href="/"
            className="bg-surface hover:bg-border text-text-primary font-medium px-5 h-10 rounded-lg border border-border"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}

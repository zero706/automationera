import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 mesh-bg opacity-80 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 md:pt-32 md:pb-32">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface/80 border border-border text-xs text-text-secondary mb-6 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Now monitoring 1,200+ subreddits
          </div>

          <h1 className="font-display font-bold text-5xl md:text-7xl tracking-tight leading-[1.05] max-w-4xl animate-fade-in-up">
            Stop Scrolling Reddit.
            <br />
            <span className="text-gradient">Start Closing Deals.</span>
          </h1>

          <p
            className="mt-6 max-w-2xl text-lg md:text-xl text-text-secondary leading-relaxed animate-fade-in-up"
            style={{ animationDelay: "100ms" }}
          >
            LeadHuntr monitors Reddit 24/7 and finds people actively looking for
            tools like yours. AI-scored leads delivered straight to your
            dashboard.
          </p>

          <div
            className="mt-9 flex flex-col sm:flex-row items-center gap-3 animate-fade-in-up"
            style={{ animationDelay: "200ms" }}
          >
            <Link
              href="/signup"
              className="bg-primary hover:bg-primary-600 text-white font-medium px-6 h-12 rounded-lg flex items-center shadow-glow hover:shadow-glow-lg transition-all duration-200"
            >
              Start Free — No Credit Card
            </Link>
            <a
              href="#how"
              className="text-text-secondary hover:text-text-primary font-medium px-6 h-12 rounded-lg flex items-center transition-colors"
            >
              See how it works →
            </a>
          </div>

          <div
            className="mt-8 flex items-center gap-6 text-xs text-text-tertiary animate-fade-in-up"
            style={{ animationDelay: "300ms" }}
          >
            <div className="flex items-center gap-1.5">
              <CheckIcon /> Free forever plan
            </div>
            <div className="flex items-center gap-1.5">
              <CheckIcon /> Setup in 60 seconds
            </div>
            <div className="flex items-center gap-1.5">
              <CheckIcon /> Cancel anytime
            </div>
          </div>
        </div>

        <DashboardPreview />
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 text-success"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function DashboardPreview() {
  return (
    <div
      className="mt-16 max-w-5xl mx-auto animate-fade-in-up"
      style={{ animationDelay: "400ms" }}
    >
      <div className="relative rounded-2xl border border-border bg-surface/50 backdrop-blur-xl p-3 shadow-glow-lg">
        <div className="flex items-center gap-1.5 px-2 py-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-danger/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-warning/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-success/70" />
        </div>
        <div className="rounded-xl border border-border bg-background/60 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
            {[
              { label: "Leads today", value: "47", trend: "+12%" },
              { label: "Hot leads", value: "8", trend: "+3" },
              { label: "Response rate", value: "62%" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-lg border border-border bg-surface/40 p-4"
              >
                <div className="text-[10px] uppercase tracking-wider text-text-tertiary">
                  {s.label}
                </div>
                <div className="text-2xl font-bold font-mono mt-1">
                  {s.value}
                  {s.trend && (
                    <span className="ml-2 text-xs text-success font-normal">
                      {s.trend}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {[
              {
                sub: "SaaS",
                title: "Looking for a Hubspot alternative under $50/mo",
                score: 94,
                color: "#22c55e",
              },
              {
                sub: "startups",
                title: "Hate using Salesforce — what do you use instead?",
                score: 87,
                color: "#22c55e",
              },
              {
                sub: "smallbusiness",
                title: "Need CRM that doesn't suck for solopreneurs",
                score: 76,
                color: "#f59e0b",
              },
            ].map((l) => (
              <div
                key={l.title}
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-surface/30"
              >
                <span className="text-[10px] font-semibold uppercase text-primary-300 w-20">
                  r/{l.sub}
                </span>
                <span className="text-sm flex-1 truncate text-text-primary">
                  {l.title}
                </span>
                <span
                  className="font-mono text-sm font-bold"
                  style={{ color: l.color }}
                >
                  {l.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const steps = [
  {
    n: "01",
    title: "Set your keywords",
    body: "Tell LeadHuntr which subreddits to watch and which problems your product solves. Setup takes 60 seconds.",
    icon: GearIcon,
  },
  {
    n: "02",
    title: "AI scans Reddit 24/7",
    body: "Our AI reads thousands of new posts every hour and scores them by buying intent — so you don't have to.",
    icon: ScanIcon,
  },
  {
    n: "03",
    title: "Get scored leads with replies",
    body: "Hot leads delivered to your dashboard with a suggested, helpful reply you can edit and post.",
    icon: BoltIcon,
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-24 border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block text-xs uppercase tracking-wider text-primary-300 font-semibold mb-3">
            How it works
          </div>
          <h2 className="text-3xl md:text-5xl font-bold font-display">
            Three steps to your first lead
          </h2>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.n}
                className="relative glass-card p-8 hover:border-primary/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 ring-1 ring-primary/30 text-primary-300 flex items-center justify-center mb-4">
                  <Icon />
                </div>
                <div className="text-xs font-mono text-text-tertiary mb-2">
                  {s.n}
                </div>
                <h3 className="text-xl font-bold font-display mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {s.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function GearIcon() {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="12" cy="12" r="3" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3h.1A1.7 1.7 0 009 3.1V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9v.1a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"
      />
    </svg>
  );
}
function ScanIcon() {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}
function BoltIcon() {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"
      />
    </svg>
  );
}

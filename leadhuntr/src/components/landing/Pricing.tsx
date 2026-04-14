import Link from "next/link";

const tiers = [
  {
    name: "Free",
    price: 0,
    description: "Perfect for trying LeadHuntr",
    features: [
      "1 monitor",
      "3 subreddits max",
      "5 keywords max",
      "10 leads per day",
      "Scan every 6 hours",
    ],
    cta: "Start free",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Pro",
    price: 29,
    description: "For founders ready to scale",
    features: [
      "5 monitors",
      "15 subreddits max",
      "25 keywords max",
      "100 leads per day",
      "Scan every hour",
      "AI-suggested replies",
      "Email alerts (realtime)",
      "Export CSV",
    ],
    cta: "Start free trial",
    href: "/signup?plan=pro",
    highlight: true,
  },
  {
    name: "Business",
    price: 79,
    description: "For agencies & growing teams",
    features: [
      "20 monitors",
      "Unlimited subreddits",
      "Unlimited keywords",
      "Unlimited leads",
      "Scan every 30 min",
      "Everything in Pro",
      "API access",
      "Priority support",
    ],
    cta: "Start free trial",
    href: "/signup?plan=business",
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block text-xs uppercase tracking-wider text-primary-300 font-semibold mb-3">
            Pricing
          </div>
          <h2 className="text-3xl md:text-5xl font-bold font-display">
            Simple pricing. Pay for results.
          </h2>
          <p className="mt-4 text-text-secondary text-lg">
            Cancel anytime. No setup fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative glass-card p-7 transition-all duration-300 hover:-translate-y-1 ${
                tier.highlight
                  ? "ring-2 ring-primary/60 shadow-glow border-primary/30"
                  : ""
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-white text-[11px] font-semibold uppercase tracking-wider">
                  Most popular
                </div>
              )}
              <h3 className="text-xl font-bold font-display">{tier.name}</h3>
              <p className="text-sm text-text-secondary mt-1">
                {tier.description}
              </p>
              <div className="mt-5 mb-6">
                <span className="text-5xl font-bold font-mono">
                  ${tier.price}
                </span>
                <span className="text-text-secondary text-sm">/month</span>
              </div>
              <Link
                href={tier.href}
                className={`block w-full text-center font-medium px-6 h-11 rounded-lg leading-[44px] transition-all ${
                  tier.highlight
                    ? "bg-primary hover:bg-primary-600 text-white shadow-glow"
                    : "bg-surface hover:bg-border text-text-primary border border-border"
                }`}
              >
                {tier.cta}
              </Link>
              <ul className="mt-6 space-y-2.5">
                {tier.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-text-secondary"
                  >
                    <svg
                      className="w-4 h-4 mt-0.5 flex-shrink-0 text-success"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

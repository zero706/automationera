import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

function Testimonials() {
  const testimonials = [
    {
      quote:
        "Booked 3 demos in the first week. LeadHuntr finds conversations my SDRs would have missed.",
      name: "Sarah Chen",
      role: "Founder, Pulse Analytics",
    },
    {
      quote:
        "The AI replies are eerily on-brand. I edit one or two words and post — that's it.",
      name: "Marcus Webb",
      role: "Solopreneur",
    },
    {
      quote:
        "Finally, lead gen that doesn't feel like spam. We're closing 1 deal a week from Reddit alone.",
      name: "Priya Shah",
      role: "Growth Lead, Forge",
    },
  ];

  return (
    <section className="py-20 border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-block text-xs uppercase tracking-wider text-primary-300 font-semibold mb-3">
            Loved by founders
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-display">
            Real leads. Real revenue.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="glass-card p-6 hover:border-primary/30 transition-all"
            >
              <svg
                className="w-6 h-6 text-primary-300 mb-3"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9 7h-2a4 4 0 00-4 4v6h6v-6h-2a2 2 0 012-2v-2zm10 0h-2a4 4 0 00-4 4v6h6v-6h-2a2 2 0 012-2v-2z" />
              </svg>
              <p className="text-text-primary text-sm leading-relaxed mb-4">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <div className="text-sm font-semibold text-text-primary">
                  {t.name}
                </div>
                <div className="text-xs text-text-tertiary">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-24 border-t border-border">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-bold font-display mb-5">
          Your next customer is on Reddit right now.
        </h2>
        <p className="text-text-secondary text-lg mb-8">
          Start finding them in 60 seconds — no credit card required.
        </p>
        <a
          href="/signup"
          className="inline-flex items-center bg-primary hover:bg-primary-600 text-white font-medium px-8 h-12 rounded-lg shadow-glow hover:shadow-glow-lg transition-all"
        >
          Start free →
        </a>
      </div>
    </section>
  );
}

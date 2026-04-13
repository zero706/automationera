"use client";

import { useState } from "react";

const faqs = [
  {
    q: "How does LeadHuntr find leads on Reddit?",
    a: "We continuously poll Reddit's official API for new posts in the subreddits you choose, then run each post through Google Gemini to score it for buying intent. Posts that don't match your keywords or have low intent never reach your dashboard.",
  },
  {
    q: "Will my replies get marked as spam?",
    a: "No — LeadHuntr only suggests replies, you post them yourself. Our AI is trained to write helpful, non-promotional comments that mention your product subtly when relevant. We never automate posting on Reddit.",
  },
  {
    q: "How accurate is the AI scoring?",
    a: "Our scoring model is calibrated against thousands of real B2B SaaS conversations. Posts scoring 80+ are nearly always genuine buying signals. You can adjust the minimum score threshold in your dashboard.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Subscriptions are month-to-month with no contracts. You can cancel from the billing portal in one click and your access continues until the end of the current period.",
  },
  {
    q: "Do you offer a free plan?",
    a: "Yes — the Free plan includes 1 monitor, 3 subreddits, and 10 leads per day, forever. No credit card required to sign up.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 border-t border-border">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-block text-xs uppercase tracking-wider text-primary-300 font-semibold mb-3">
            FAQ
          </div>
          <h2 className="text-3xl md:text-5xl font-bold font-display">
            Frequently asked questions
          </h2>
        </div>

        <div className="space-y-2">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <button
                key={f.q}
                onClick={() => setOpen(isOpen ? null : i)}
                className="block w-full text-left glass-card p-5 hover:border-primary/30 transition-all"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold text-text-primary font-display">
                    {f.q}
                  </h3>
                  <span
                    className={`text-2xl text-text-secondary transition-transform ${isOpen ? "rotate-45" : ""}`}
                  >
                    +
                  </span>
                </div>
                {isOpen && (
                  <p className="text-sm text-text-secondary mt-3 leading-relaxed">
                    {f.a}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

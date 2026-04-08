'use client';

import { useState } from 'react';

const faqs = [
  {
    q: 'Is PocketWise a bank?',
    a: 'No. PocketWise is a smart wallet powered by Anchor BaaS, which holds a CBN license. Your money is held in a regulated environment — we just make it smarter.',
  },
  {
    q: 'Is my money real?',
    a: 'Yes, completely. PocketWise uses real money from day one. No simulated balances. Every deposit and transfer is a real financial transaction.',
  },
  {
    q: 'Can I change the 50/30/10/10 split?',
    a: 'Not in the free tier. The default split is intentional — it works. PocketWise Pro (coming soon) will allow custom split percentages for users who want more control.',
  },
  {
    q: "What\\'s the minimum amount I can deposit?",
    a: '₦100. PocketWise is built for how Nigerian youth actually transact — not around foreign minimums.',
  },
  {
    q: "What's the Emergency wallet lock?",
    a: 'Your Emergency wallet is locked by default. To access it, you go through a confirmation step that makes you pause and confirm you genuinely need it. It\'s friction by design.',
  },
  {
    q: 'Is PocketWise free?',
    a: 'Yes — PocketWise launches completely free. We earn a small transaction fee (0.5–1%) on transfers above ₦1,000. No hidden charges.',
  },
  {
    q: 'Who is PocketWise for?',
    a: 'Nigerian youth aged 18–25 — students, young professionals, side-hustlers, and first-time earners who want to build real financial discipline without the lectures.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section id="faq" className="bg-white py-20 sm:py-28">
      <div className="max-w-3xl mx-auto px-5 sm:px-8">

        {/* Header */}
        <div className="text-center mb-12 reveal">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold font-jakarta uppercase tracking-widest px-4 py-1.5 rounded-full mb-4"
            style={{ background: '#EDE9FF', color: '#5B4FCF' }}
          >
            FAQ
          </span>
          <h2
            className="font-jakarta font-bold text-foreground"
            style={{ fontSize: 'clamp(26px, 4vw, 40px)', letterSpacing: '-0.5px' }}
          >
            Frequently Asked Questions
          </h2>
        </div>

        {/* Accordion */}
        <div className="flex flex-col gap-3 reveal reveal-delay-100">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="card-hover border border-gray-100 rounded-2xl overflow-hidden bg-background"
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-jakarta font-semibold text-foreground text-sm sm:text-base pr-4">
                    {faq.q}
                  </span>
                  <span
                    className={`faq-chevron shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white transition-transform ${isOpen ? 'open' : ''}`}
                    style={{ background: '#5B4FCF' }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </button>
                <div className={`faq-content ${isOpen ? 'open' : ''}`}>
                  <p className="px-6 pb-5 text-secondary text-sm leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
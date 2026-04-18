"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";

const faqs = [
  {
    q: "Is PocketWise a bank?",
    a: "No. PocketWise is a smart wallet powered by Anchor BaaS, which holds a CBN license. Your money is held in a regulated environment — we just make it smarter.",
  },
  {
    q: "What happens to my money if PocketWise shuts down?",
    a: "Your money is held directly by Anchor, a CBN-licensed bank — not by PocketWise. If PocketWise shuts down tomorrow, your funds remain safe in your Anchor account and you can withdraw them in full.",
  },
  {
    q: "Is my money real?",
    a: "Yes, completely. PocketWise uses real money from day one. No simulated balances. Every deposit and transfer is a real financial transaction.",
  },
  {
    q: "Can I change the 50/30/10/10 split?",
    a: "Not in the free tier. The default split is intentional — it works. PocketWise Pro (coming soon) will allow custom split percentages for users who want more control.",
  },
  {
    q: "What's the minimum amount I can deposit?",
    a: "₦100. PocketWise is built for how Nigerian youth actually transact — not around foreign minimums.",
  },
  {
    q: "What's the Emergency wallet lock?",
    a: "Your Emergency wallet is locked by default. To access it, you go through a confirmation step that makes you pause and confirm you genuinely need it. It's friction by design.",
  },
  {
    q: "Is PocketWise free?",
    a: "Yes — PocketWise launches completely free. We earn a small transaction fee (0.5–1%) on transfers above ₦1,000. No hidden charges.",
  },
  {
    q: "Who is PocketWise for?",
    a: "Nigerian youth aged 18–25 — students, young professionals, side-hustlers, and first-time earners who want to build real financial discipline without the lectures.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section
      id="faq"
      className="bg-white py-20 sm:py-28 relative overflow-hidden"
    >
      {/* Decorative elements */}
      <div
        className="absolute top-40 left-0 w-48 h-48 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(91,79,207,0.06) 0%, transparent 70%)",
          filter: "blur(30px)",
        }}
      />
      <div
        className="absolute bottom-40 right-0 w-56 h-56 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="max-w-3xl mx-auto px-5 sm:px-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <span
            className="inline-flex items-center gap-2 text-xs font-semibold font-jakarta uppercase tracking-widest px-4 py-1.5 rounded-full mb-4"
            style={{ background: "#EDE9FF", color: "#5B4FCF" }}
          >
            <Sparkles size={14} />
            FAQ
          </span>
          <h2
            className="font-jakarta font-bold text-foreground"
            style={{
              fontSize: "clamp(26px, 4vw, 40px)",
              letterSpacing: "-0.5px",
            }}
          >
            Frequently Asked Questions
          </h2>
        </motion.div>

        {/* Accordion */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="flex flex-col gap-3"
        >
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                variants={itemVariants}
                layout
                className="border border-gray-100 rounded-2xl overflow-hidden bg-white"
              >
                <motion.button
                  onClick={() => toggle(i)}
                  whileTap={{ scale: 0.995 }}
                  className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="font-jakarta font-semibold text-foreground text-sm sm:text-base pr-4">
                    {faq.q}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: "#5B4FCF" }}
                  >
                    <ChevronDown
                      size={16}
                      className="text-white"
                      strokeWidth={2.5}
                    />
                  </motion.span>
                </motion.button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5">
                        <motion.p
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.1, duration: 0.3 }}
                          className="text-secondary text-sm leading-relaxed"
                        >
                          {faq.a}
                        </motion.p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

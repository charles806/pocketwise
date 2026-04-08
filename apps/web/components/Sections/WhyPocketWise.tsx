"use client";

import { motion } from "framer-motion";
import { Bot, Brain, Lock, BarChart3 } from "lucide-react";

const cards = [
  {
    icon: Bot,
    title: "Automated Discipline",
    body: "No spreadsheets. No manual budgeting. Money is split automatically the second it lands — before you can spend it wrong.",
    color: "#5B4FCF",
    bgLight: "#EDE9FF",
    delay: 0,
  },
  {
    icon: Brain,
    title: "AI Money Coach",
    body: "Weekly spending insights, behavior warnings, and celebrations. Your coach celebrates wins and flags problems before they grow.",
    color: "#7C3AED",
    bgLight: "#F3E8FF",
    delay: 0.1,
  },
  {
    icon: Lock,
    title: "Emergency Wallet Lock",
    body: "Your emergency fund is locked by default. Accessing it requires friction — a confirmation step that makes you pause before dipping in.",
    color: "#059669",
    bgLight: "#D1FAE5",
    delay: 0.2,
  },
  {
    icon: BarChart3,
    title: "Built for Nigerian Reality",
    body: "Supports ₦100 minimum transactions. Works with bank transfer and USSD. No dollar cards or foreign infrastructure needed.",
    color: "#DC2626",
    bgLight: "#FEE2E2",
    delay: 0.3,
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

export default function WhySection() {
  return (
    <section
      id="why"
      className="py-20 sm:py-28 relative overflow-hidden"
      style={{ background: "#EDE9FF" }}
    >
      {/* Decorative */}
      <div
        className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(91,79,207,0.12) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(91,79,207,0.08) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div className="max-w-6xl mx-auto px-5 sm:px-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14"
        >
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold font-jakarta uppercase tracking-widest px-4 py-1.5 rounded-full mb-4"
            style={{ background: "rgba(91,79,207,0.15)", color: "#5B4FCF" }}
          >
            Why PocketWise
          </span>
          <h2
            className="font-jakarta font-bold text-foreground mb-4"
            style={{
              fontSize: "clamp(28px, 4vw, 42px)",
              letterSpacing: "-0.5px",
            }}
          >
            Why PocketWise?
          </h2>
          <p
            className="text-secondary max-w-2xl mx-auto leading-relaxed"
            style={{ fontSize: "17px" }}
          >
            Nigerian youth aren&apos;t bad with money. They just never had a
            tool that made discipline effortless.
          </p>
        </motion.div>

        {/* 2×2 bento grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          {cards?.map((card) => (
            <motion.div
              key={card?.title}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group relative bg-white rounded-3xl p-7 sm:p-8 shadow-card cursor-pointer"
            >
              {/* Hover gradient overlay */}
              <div
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(135deg, ${card.bgLight}40 0%, transparent 60%)`,
                }}
              />

              <div className="relative z-10">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
                  style={{ background: card.bgLight }}
                >
                  <card.icon
                    size={28}
                    style={{ color: card.color }}
                    strokeWidth={1.5}
                  />
                </motion.div>
                <h3 className="font-jakarta font-bold text-foreground text-lg mb-3 group-hover:text-[#5B4FCF] transition-colors">
                  {card?.title}
                </h3>
                <p className="text-secondary text-sm leading-relaxed group-hover:text-foreground/80 transition-colors">
                  {card?.body}
                </p>
              </div>

              {/* Animated border gradient */}
              <div
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"
                style={{
                  background: `linear-gradient(135deg, ${card.color}20 0%, ${card.color}05 100%)`,
                  border: `1px solid ${card.color}30`,
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

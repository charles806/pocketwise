"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Wallet, PiggyBank, Shield, Sparkles } from "lucide-react";

const wallets = [
  {
    label: "Spend",
    pct: "50%",
    amount: "₦25,000",
    color: "#F97316",
    bg: "#FFF7ED",
    icon: Wallet,
  },
  {
    label: "Savings",
    pct: "30%",
    amount: "₦15,000",
    color: "#22C55E",
    bg: "#F0FDF4",
    icon: PiggyBank,
  },
  {
    label: "Emergency",
    pct: "10%",
    amount: "₦5,000",
    color: "#EF4444",
    bg: "#FEF2F2",
    icon: Shield,
  },
  {
    label: "Flex",
    pct: "10%",
    amount: "₦5,000",
    color: "#3B82F6",
    bg: "#EFF6FF",
    icon: Sparkles,
  },
];

const donutSegments = [
  { color: "#F97316", percent: 50, delay: 0 },
  { color: "#22C55E", percent: 30, delay: 0.2 },
  { color: "#EF4444", percent: 10, delay: 0.4 },
  { color: "#3B82F6", percent: 10, delay: 0.5 },
];

export default function MoneySplitViz() {
  const sectionRef = useRef<HTMLElement>(null);
  const [animated, setAnimated] = useState(false);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      setAnimated(true);
    }
  }, [isInView]);

  // Calculate SVG circle segments
  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  return (
    <section
      id="features"
      ref={sectionRef}
      className="py-20 sm:py-28"
      style={{ background: "#FAFAFA" }}
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-xs font-semibold font-jakarta uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 bg-violet-50 text-violet-700 border border-violet-200">
            How It Works
          </span>
          <h2
            className="font-jakarta font-bold text-gray-900 mb-4"
            style={{ fontSize: "clamp(26px, 4vw, 38px)" }}
          >
            One Deposit. Four Wallets. Zero Effort.
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Deposit ₦50,000 and watch it split automatically.
          </p>
        </motion.div>

        {/* Donut chart + breakdown cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Animated donut */}
          <div className="flex justify-center">
            <div className="relative w-56 h-56">
              <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90">
                {donutSegments.map((seg, i) => {
                  const offset = cumulativePercent;
                  const length = (seg.percent / 100) * circumference;
                  cumulativePercent += seg.percent;

                  return (
                    <motion.circle
                      key={seg.color}
                      cx="90"
                      cy="90"
                      r={radius}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="20"
                      strokeDasharray={length}
                      strokeDashoffset={-offset * (circumference / 100)}
                      initial={{ strokeDashoffset: circumference }}
                      animate={
                        animated
                          ? {
                              strokeDashoffset: -offset * (circumference / 100),
                            }
                          : {}
                      }
                      transition={{
                        duration: 1,
                        delay: seg.delay,
                        ease: "easeOut",
                      }}
                      className="origin-center"
                    />
                  );
                })}
              </svg>

              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-gray-900 font-bold text-3xl font-jakarta">
                  ₦50k
                </span>
                <span className="text-gray-500 text-sm">deposit</span>
              </div>
            </div>
          </div>

          {/* Breakdown cards - 2x2 grid */}
          <div className="grid grid-cols-2 gap-4">
            {wallets.map((w, i) => (
              <motion.div
                key={w.label}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.15 + 0.3 }}
                className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100"
                style={{ backgroundColor: w.bg }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${w.color}20` }}
                >
                  <w.icon className="w-5 h-5" style={{ color: w.color }} />
                </div>
                <div>
                  <p className="font-jakarta font-bold text-gray-900">
                    {w.label}
                  </p>
                  <p className="text-sm" style={{ color: w.color }}>
                    {w.pct} · {w.amount}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

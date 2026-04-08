"use client";

import { useRef, useState } from "react";
import {
  // ArrowRight,
  Wallet,
  GitBranch,
  Target,
  CheckCircle2,
  Shield,
} from "lucide-react";
import { motion, useInView } from "framer-motion";

const steps = [
  {
    number: "01",
    icon: Wallet,
    title: "Deposit",
    description: "Send money via bank transfer or USSD. Any amount, anytime.",
  },
  {
    number: "02",
    icon: GitBranch,
    title: "Auto-Split",
    description:
      "Your money splits instantly — 50% Spend, 30% Save, 10% Emergency, 10% Flex.",
  },
  {
    number: "03",
    icon: Target,
    title: "Spend with Purpose",
    description:
      "Every transfer needs a reason. Your Emergency fund stays locked.",
  },
];

function StepCard({
  step,
  index,
}: {
  step: (typeof steps)[0];
  index: number;
  isLast: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="relative flex flex-col items-center">
      {/* Desktop: horizontal stepper with connecting line */}
      <div className="hidden md:flex flex-col items-center">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.8, delay: index * 0.3, ease: "easeOut" }}
          className="absolute left-1/2 top-16 w-[calc(100%+4rem)] h-0.5 origin-left"
          style={{ background: "linear-gradient(90deg, #8B5CF6, #A78BFA)" }}
        />

        {/* Step card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: index * 0.2 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative flex flex-col items-center text-center p-6 pt-12 rounded-3xl border border-gray-100 bg-white w-64 cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-violet-200"
          style={{
            transform: isHovered ? "translateY(-8px)" : "translateY(0)",
          }}
        >
          {/* Number badge */}
          <div className="absolute -top-6 w-12 h-12 rounded-full bg-linear-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-600/30">
            <span className="text-white font-jakarta font-bold text-sm">
              {step.number}
            </span>
          </div>

          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
            <step.icon className="w-7 h-7 text-violet-600" />
          </div>

          <h3 className="font-jakarta font-bold text-gray-900 text-lg mb-2">
            {step.title}
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            {step.description}
          </p>
        </motion.div>
      </div>

      {/* Mobile: vertical timeline */}
      <div className="md:hidden flex items-start gap-4 w-full">
        {/* Timeline line */}
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ scaleY: 0 }}
            animate={isInView ? { scaleY: 1 } : {}}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className="w-0.5 h-16 bg-violet-200 origin-top"
          />
          <motion.div
            initial={{ scaleY: 0 }}
            animate={isInView ? { scaleY: 1 } : {}}
            transition={{ duration: 0.6, delay: index * 0.2 + 0.3 }}
            className="w-0.5 flex-1 bg-violet-200 origin-top"
          />
        </div>

        {/* Number badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ type: "spring", delay: index * 0.2 }}
          className="shrink-0 w-10 h-10 rounded-full bg-linear-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg"
        >
          <span className="text-white font-jakarta font-bold text-xs">
            {step.number}
          </span>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.4, delay: index * 0.2 + 0.1 }}
          className="flex-1 pb-8"
        >
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center mb-3">
            <step.icon className="w-5 h-5 text-violet-600" />
          </div>
          <h3 className="font-jakarta font-bold text-gray-900 text-base mb-1">
            {step.title}
          </h3>
          <p className="text-gray-500 text-sm">{step.description}</p>
        </motion.div>
      </div>
    </div>
  );
}

export default function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="py-20 sm:py-28 relative"
      style={{ background: "#F8FAFC" }}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
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
            style={{
              fontSize: "clamp(28px, 4vw, 42px)",
              letterSpacing: "-0.5px",
            }}
          >
            Three steps to financial control
          </h2>
          <p
            className="text-gray-500 max-w-lg mx-auto"
            style={{ fontSize: "17px" }}
          >
            No willpower needed. Just deposit and let your wallet do the work.
          </p>
        </motion.div>

        {/* Steps - Desktop horizontal */}
        <div className="hidden md:flex justify-center items-start gap-4">
          {steps.map((step, i) => (
            <StepCard
              key={step.number}
              step={step}
              index={i}
              isLast={i === steps.length - 1}
            />
          ))}
        </div>

        {/* Steps - Mobile vertical */}
        <div className="md:hidden">
          {steps.map((step, i) => (
            <StepCard
              key={step.number}
              step={step}
              index={i}
              isLast={i === steps.length - 1}
            />
          ))}
        </div>

        {/* Anchor note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-12 flex justify-center"
        >
          <div className="inline-flex items-center gap-3 text-sm font-medium px-6 py-3 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <Shield className="w-4 h-4 text-violet-600" />
            <span className="text-gray-600">
              Powered by <strong className="text-gray-900">Anchor BaaS</strong>{" "}
              — CBN licensed. Your money is real and protected.
            </span>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

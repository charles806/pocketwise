"use client";
import React from "react";
import logo from "../../../icon.png";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  // Loader2,
  TrendingUp,
  Target,
  BarChart3,
} from "lucide-react";

interface StepTwoProps {
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

const StepTwo = ({ onNext, onPrev, onSkip }: StepTwoProps) => {
  const shouldReduceMotion = useReducedMotion();

  const benefitTags = [
    {
      icon: <TrendingUp className="size-4" />,
      text: "Real-time alerts",
      color: "bg-emerald-500",
      light: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    {
      icon: <Target className="size-4" />,
      text: "Category limits",
      color: "bg-[var(--primary)]",
      light:
        "bg-[var(--primary-light)] text-[var(--primary)] border-indigo-100",
    },
    {
      icon: <BarChart3 className="size-4" />,
      text: "Monthly reports",
      color: "bg-amber-500",
      light: "bg-amber-50 text-amber-700 border-amber-100",
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row w-full max-w-7xl min-h-150 lg:min-h-175 bg-white lg:rounded-4xl shadow-2xl overflow-hidden border border-slate-100 ring-1 ring-black/5">
      <div className="flex flex-col w-full lg:w-[55%] p-8 lg:p-16 justify-between bg-white">
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-12 lg:mb-0"
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white rounded-xl border cursor-pointer border-slate-200 shadow-sm">
              <Image
                src={logo}
                alt="PocketWise Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
            </div>
            <span className="text-slate-900 font-sans text-xl font-bold tracking-tight">
              PocketWise
            </span>
          </div>
          <motion.button
            whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
            onClick={onSkip}
            className="text-slate-500 hover:text-slate-700 cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-lg font-medium text-sm transition-colors outline-none"
          >
            Skip
          </motion.button>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-8 max-w-lg mx-auto lg:mx-0"
        >
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex w-fit items-center bg-(--primary-light) border border-indigo-100 rounded-full px-4 py-1 gap-2"
          >
            <div className="size-1.5 bg-(--primary) rounded-full" />
            <span className="text-(--primary) font-sans text-[10px] font-bold tracking-widest uppercase">
              Step 2 of 3
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="text-slate-900 font-sans text-4xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
              Your budget, <br />
              <span className="text-(--primary)">
                always under control.
              </span>
            </h1>
            <p className="text-slate-500 font-sans text-lg lg:text-xl leading-relaxed">
              Create smart budgets for every category. PocketWise tracks your
              spending in real-time and alerts you before you overshoot.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center gap-3"
          >
            {benefitTags.map((tag, i) => (
              <div
                key={i}
                className={`flex items-center ${tag.light} border rounded-full px-3 py-1.5 gap-2`}
              >
                <div
                  className={`size-5 flex items-center justify-center ${tag.color} text-white rounded-full`}
                >
                  {tag.icon}
                </div>
                <span className="text-[13px] font-semibold">{tag.text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex w-full justify-between items-center mt-12 lg:mt-0"
        >
          <button
            onClick={onPrev}
            className="flex items-center cursor-pointer text-slate-500 hover:text-slate-700 font-medium text-sm transition-colors"
          >
            <ArrowLeft className="size-4 mr-2" />
            Back
          </button>

          <div className="flex items-center gap-1.5">
            <div className="size-1.5 bg-(--primary) rounded-full" />
            <div className="size-1.5 bg-(--primary) rounded-full" />
            <div className="size-1.5 bg-slate-200 rounded-full" />
          </div>

          <motion.button
            whileHover={shouldReduceMotion ? undefined : { scale: 1.02, x: 5 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            onClick={onNext}
            className="flex items-center bg-(--primary) hover:bg-(--primary-dark) cursor-pointer text-white shadow-xl shadow-indigo-200 rounded-2xl px-8 py-4 gap-3 transition-colors group"
            aria-label="Continue to next step"
          >
            <span className="font-bold text-base cursor-pointer">Next</span>
            <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>

      <div className="hidden lg:flex relative w-[45%] bg-[linear-gradient(135deg,#ecfdf5_0%,#e0e7ff_50%,#f5f3ff_100%)] items-center justify-center p-12 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm"
        >
          <div className="bg-white rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  Monthly Budget
                </span>
                <div className="text-slate-900 text-3xl font-black mt-1">
                  ₦850,000
                </div>
              </div>
              <div className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
                32% left
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <div className="size-2 bg-amber-500 rounded-full" />
                    Food & Dining
                  </span>
                  <span className="text-slate-500">₦180k / ₦200k</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "90%" }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="h-full bg-amber-500 rounded-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <div className="size-2 bg-emerald-500 rounded-full" />
                    Transport
                  </span>
                  <span className="text-slate-500">₦85k / ₦150k</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "57%" }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <div className="size-2 bg-(--primary) rounded-full" />
                    Entertainment
                  </span>
                  <span className="text-slate-500">₦45k / ₦100k</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "45%" }}
                    transition={{ duration: 1, delay: 0.7 }}
                    className="h-full bg-(--primary) rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="absolute -top-4 -right-4 bg-white rounded-xl px-4 py-3 shadow-xl flex items-center gap-3"
          >
            <div className="size-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="size-5" />
            </div>
            <div>
              <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                Food Budget
              </span>
              <div className="text-amber-600 text-sm font-bold">90% used</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-8 -left-4 bg-white rounded-xl px-4 py-3 shadow-xl flex items-center gap-3"
          >
            <div className="size-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
              <Target className="size-5" />
            </div>
            <div>
              <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                Transport
              </span>
              <div className="text-emerald-600 text-sm font-bold">On track</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default StepTwo;

"use client";
import React, { useState } from "react";
import logo from "../../../icon.png";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Shield, Zap, Gift, ArrowRight, Loader2 } from "lucide-react";
import { StepOneVisual } from "../StepOneVisual";

interface StepOneProps {
  onNext: () => Promise<void> | void;
  onSkip: () => void;
}

const StepOne = ({ onNext, onSkip }: StepOneProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
        delayChildren: shouldReduceMotion ? 0 : 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const benefitTags = [
    {
      icon: <Zap className="size-4" />,
      text: "Instant splits",
      color: "bg-emerald-500",
      light: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    {
      icon: <Shield className="size-4" />,
      text: "Custom rules",
      color: "bg-indigo-500",
      light: "bg-indigo-50 text-indigo-700 border-indigo-100",
    },
    {
      icon: <Gift className="size-4" />,
      text: "Zero fees",
      color: "bg-amber-500",
      light: "bg-amber-50 text-amber-700 border-amber-100",
    },
  ];

  const handleNext = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await onNext();
    } catch (error) {
      // Handle error gracefully
      console.error("Navigation failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full max-w-7xl min-h-150 lg:min-h-175 bg-white lg:rounded-4xl shadow-2xl overflow-hidden border border-slate-100 ring-1 ring-black/5">
      {/* Left Side - Content */}
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
            className="text-slate-500 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-lg font-medium text-sm transition-colors outline-none cursor-pointer"
          >
            Skip
          </motion.button>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-8 max-w-lg mx-auto lg:mx-0"
        >
          <motion.div
            variants={itemVariants}
            className="flex w-fit items-center bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1 gap-2"
          >
            <div className="size-1.5 bg-indigo-600 rounded-full" />
            <span className="text-indigo-600 font-sans text-[10px] font-bold tracking-widest uppercase">
              Step 1 of 3
            </span>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <h1 className="text-slate-900 font-sans text-4xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
              Every naira gets a job. <br />
              <span className="text-indigo-600">Automatically.</span>
            </h1>
            <p className="text-slate-500 font-sans text-lg lg:text-xl leading-relaxed">
              PocketWise splits every deposit into your wallets the moment it
              arrives.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
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
          transition={{ delay: shouldReduceMotion ? 0 : 0.8 }}
          className="flex w-full justify-between items-center mt-12 lg:mt-0"
        >
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-1.5 bg-indigo-600 rounded-full" />
            <div className="size-1.5 bg-slate-200 rounded-full" />
            <div className="size-1.5 bg-slate-200 rounded-full" />
          </div>

          <motion.button
            whileHover={shouldReduceMotion ? undefined : { scale: 1.02, x: 5 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            onClick={handleNext}
            disabled={isLoading}
            className="flex items-center bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed text-white shadow-xl cursor-pointer shadow-indigo-200 rounded-2xl px-8 py-4 gap-3 transition-colors group"
            aria-label="Continue to next step"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                <span className="font-bold text-base">Loading...</span>
              </>
            ) : (
              <>
                <span className="font-bold cursor-pointer text-base">Next</span>
                <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </motion.button>
        </motion.div>
      </div>

      {/* Right Side - Visuals */}
      <StepOneVisual />
    </div>
  );
};

export default StepOne;

import React, { useState } from "react";
import logo from "../../../../public/logo.png";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Users,
  Shield,
  Banknote,
  Target,
  Brain,
  Sparkles,
} from "lucide-react";

interface StepThreeProps {
  onComplete: (goal: string | null) => void;
  onPrev: () => void;
  onSkip: () => void;
}

type Goal = {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
  text: string;
};

const goalsList: Goal[] = [
  {
    id: "save_more",
    label: "Save more every month",
    description: "Build consistent savings habits automatically",
    icon: <Target className="w-5 h-5" />,
    color: "bg-emerald-500 text-white",
    bg: "border-emerald-500 bg-emerald-50/30",
    border: "border-emerald-500",
    text: "text-emerald-700",
  },
  {
    id: "emergency_fund",
    label: "Build emergency fund",
    description: "Have money ready when life surprises you",
    icon: <Shield className="w-5 h-5" />,
    color: "bg-amber-500 text-white",
    bg: "border-amber-500 bg-amber-50/30",
    border: "border-amber-500",
    text: "text-amber-700",
  },
  {
    id: "spend_mindfully",
    label: "Spend more mindfully",
    description: "Know where every naira goes before it disappears",
    icon: <Brain className="w-5 h-5" />,
    color: "bg-indigo-500 text-white",
    bg: "border-indigo-500 bg-indigo-50/30",
    border: "border-indigo-500",
    text: "text-indigo-700",
  },
  {
    id: "all",
    label: "All of the above",
    description: "Build complete financial discipline from day one",
    icon: <Sparkles className="w-5 h-5" />,
    color: "bg-pink-500 text-white",
    bg: "border-pink-500 bg-pink-50/30",
    border: "border-pink-500",
    text: "text-pink-700",
  },
];

const StepThree = ({ onComplete, onPrev, onSkip }: StepThreeProps) => {
  const shouldReduceMotion = useReducedMotion();
  const [selectedGoal, setSelectedGoal] = useState<string | null>("all");

  return (
    <div className="flex flex-col lg:flex-row w-full max-w-7xl min-h-150 lg:min-h-175 bg-white lg:rounded-4xl shadow-2xl overflow-hidden border border-slate-100 ring-1 ring-black/5">
      <div className="flex flex-col w-full lg:w-[55%] p-8 lg:p-12 justify-between bg-white">
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8 lg:mb-0"
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
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6 max-w-lg mx-auto lg:mx-0 w-full"
        >
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex w-fit items-center bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1 gap-2"
          >
            <div className="size-1.5 bg-indigo-600 rounded-full" />
            <span className="text-indigo-600 font-sans text-[10px] font-bold tracking-widest uppercase">
              Step 3 of 4
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <h1 className="text-slate-900 font-sans text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight">
              What's your #1{" "}
              <span className="text-indigo-600">money goal?</span>
            </h1>
            <p className="text-slate-500 font-sans text-sm lg:text-base leading-relaxed">
              Your AI coach will personalise tips and splits based on this.
            </p>
          </motion.div>

          {/* Goal Cards Grid */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full"
          >
            {goalsList.map((goal) => {
              const isSelected = selectedGoal === goal.id;
              return (
                <button
                  key={goal.id}
                  onClick={() => setSelectedGoal(goal.id)}
                  className={`flex flex-col p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? goal.bg
                      : "border-slate-100 hover:border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`p-2 rounded-xl ${isSelected ? goal.color : "bg-slate-50 text-slate-500"}`}
                    >
                      {goal.icon}
                    </div>
                    <span
                      className={`font-bold font-sans text-sm ${isSelected ? goal.text : "text-slate-800"}`}
                    >
                      {goal.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans">
                    {goal.description}
                  </p>
                </button>
              );
            })}
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
            <div className="size-1.5 bg-indigo-600 rounded-full" />
            <div className="size-1.5 bg-indigo-600 rounded-full" />
            <div className="size-1.5 bg-indigo-600 rounded-full" />
            <div className="size-1.5 bg-slate-200 rounded-full" />
          </div>

          <motion.button
            whileHover={shouldReduceMotion ? undefined : { scale: 1.02, x: 5 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            onClick={() => onComplete(selectedGoal)}
            className="flex items-center bg-indigo-600 hover:bg-indigo-700 cursor-pointer text-white shadow-xl shadow-indigo-200 rounded-2xl px-8 py-4 gap-3 transition-colors group"
            aria-label="Get started"
          >
            <span className="font-bold text-base cursor-pointer">
              Get Started
            </span>
            <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>

      <div className="hidden lg:flex relative w-[45%] bg-[linear-gradient(135deg,#f5f3ff_0%,#ede9fe_100%)] items-center justify-center p-12 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative w-full max-w-sm"
        >
          <div className="absolute inset-0">
            {!shouldReduceMotion && (
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-10%] right-[-10%] size-64 bg-(--primary)/20 blur-[100px] rounded-full"
              />
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative bg-white rounded-3xl p-8 shadow-2xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="size-14 bg-(--primary) rounded-2xl flex items-center justify-center">
                <Banknote className="size-7 text-white" />
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  Total Saved
                </span>
                <div className="text-slate-900 text-3xl font-black">₦2.5M+</div>
              </div>
            </div>

            <div className="space-y-3">
              {[
                {
                  icon: <Shield className="size-4" />,
                  label: "Bank-grade security",
                  color: "bg-emerald-500",
                },
                {
                  icon: <Check className="size-4" />,
                  label: "NDPC Licensed",
                  color: "bg-[var(--primary)]",
                },
                {
                  icon: <Users className="size-4" />,
                  label: "AI budgeting insights",
                  color: "bg-amber-500",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div
                    className={`size-8 ${item.color} text-white rounded-lg flex items-center justify-center`}
                  >
                    {item.icon}
                  </div>
                  <span className="text-slate-700 font-medium text-sm">
                    {item.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute -top-6 -right-6 bg-white rounded-2xl p-4 shadow-xl"
          >
            <div className="flex items-center gap-3">
              <div className="size-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                <Check className="size-6" />
              </div>
              <div>
                <div className="text-slate-900 font-bold text-sm">
                  All wallets secured
                </div>
                <div className="text-slate-500 text-xs">
                  FDIC Insured up to ₦5M
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default StepThree;

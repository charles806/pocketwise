"use client";
import React, { useState, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Wallet,
  PiggyBank,
  Shield,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import logo from "../../../icon.png";
import { useAuth } from "../../../../context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

const SPLIT_KEYS = [
  "spendPercent",
  "savingsPercent",
  "emergencyPercent",
  "flexPercent",
] as const;

type SplitKey = (typeof SPLIT_KEYS)[number];

interface SplitValues {
  spendPercent: number;
  savingsPercent: number;
  emergencyPercent: number;
  flexPercent: number;
}

const BOUNDS: Record<SplitKey, { min: number; max: number }> = {
  spendPercent: { min: 50, max: 75 },
  savingsPercent: { min: 10, max: 30 },
  emergencyPercent: { min: 0.01, max: 10 },
  flexPercent: { min: 0, max: 10 },
};

const WALLET_META: Record<
  SplitKey,
  {
    label: string;
    color: string;
    bgLight: string;
    icon: React.ReactNode;
    desc: string;
  }
> = {
  spendPercent: {
    label: "Spend",
    color: "#4f46e5",
    bgLight: "#eef2ff",
    icon: <Wallet className="size-4" />,
    desc: "Everyday spending",
  },
  savingsPercent: {
    label: "Savings",
    color: "#059669",
    bgLight: "#ecfdf5",
    icon: <PiggyBank className="size-4" />,
    desc: "Locked until goal",
  },
  emergencyPercent: {
    label: "Emergency",
    color: "#d97706",
    bgLight: "#fffbeb",
    icon: <Shield className="size-4" />,
    desc: "Rainy day fund",
  },
  flexPercent: {
    label: "Flex",
    color: "#db2777",
    bgLight: "#fdf2f8",
    icon: <Sparkles className="size-4" />,
    desc: "Guilt-free money",
  },
};

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function redistribute(
  values: SplitValues,
  changedKey: SplitKey,
  newValue: number,
): SplitValues {
  const clamped = Math.min(
    BOUNDS[changedKey].max,
    Math.max(BOUNDS[changedKey].min, round(newValue)),
  );

  const result = { ...values, [changedKey]: clamped };
  const others = SPLIT_KEYS.filter((k) => k !== changedKey);

  let remaining = round(100 - clamped);

  for (let attempt = 0; attempt < 10; attempt++) {
    const otherTotal = others.reduce((s, k) => s + result[k], 0);

    if (otherTotal === 0) {
      const share = round(remaining / others.length);
      others.forEach((k, i) => {
        result[k] = i === others.length - 1 ? remaining : share;
        remaining = round(remaining - result[k]);
      });
      break;
    }

    let distributed = 0;
    const lastIndex = others.length - 1;
    others.forEach((k, i) => {
      const isLast = i === lastIndex;
      const rawValue = (result[k]! / otherTotal) * remaining;
      const val = isLast ? round(remaining - distributed) : round(rawValue);
      result[k] = val;
      distributed += val;
    });

    let needsReattempt = false;
    for (const k of others) {
      const prev = result[k]!;
      result[k] = Math.min(BOUNDS[k].max, Math.max(BOUNDS[k].min, result[k]!));
      const diff = round(prev - result[k]!);
      if (diff !== 0) {
        remaining = round(remaining + diff);
        needsReattempt = true;
      }
    }

    if (!needsReattempt) break;
  }

  const total = SPLIT_KEYS.reduce((s, k) => s + result[k]!, 0);
  const drift = round(100 - total);
  if (Math.abs(drift) > 0.01) {
    for (const k of others) {
      const candidate = round(result[k]! + drift);
      if (candidate >= BOUNDS[k].min && candidate <= BOUNDS[k].max) {
        result[k] = candidate;
        break;
      }
    }
  }

  return result;
}

const DEFAULT_SPLITS: SplitValues = {
  spendPercent: 50,
  savingsPercent: 30,
  emergencyPercent: 10,
  flexPercent: 10,
};

interface StepFourProps {
  onComplete: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

const StepFour = ({ onComplete, onPrev, onSkip }: StepFourProps) => {
  const { accessToken } = useAuth();
  const [splits, setSplits] = useState<SplitValues>(DEFAULT_SPLITS);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const total = SPLIT_KEYS.reduce((s, k) => s + splits[k], 0);
  const isValid = Math.abs(total - 100) < 0.01;
  const totalPercent = round(total);

  const handleSliderChange = useCallback(
    (key: SplitKey, rawValue: number) => {
      if (error) setError("");
      setSplits((prev) => redistribute(prev, key, rawValue));
    },
    [error],
  );

  const handleSave = async () => {
    if (!isValid || isSaving || !accessToken) return;
    setIsSaving(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/v1/wallet-split`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(splits),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to save split configuration");
        return;
      }

      onComplete();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
        delayChildren: shouldReduceMotion ? 0 : 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <div className="flex flex-col lg:flex-row w-full max-w-7xl min-h-150 lg:min-h-175 bg-white lg:rounded-4xl shadow-2xl overflow-hidden border border-slate-100 ring-1 ring-black/5">
      {/* ─── Left Side — Content ─── */}
      <div className="flex flex-col w-full lg:w-[55%] p-8 lg:p-12 justify-between bg-white">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-6 lg:mb-0"
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white rounded-xl border border-slate-200 shadow-sm">
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

        {/* Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6 max-w-lg mx-auto lg:mx-0 w-full"
        >
          {/* Step badge */}
          <motion.div
            variants={itemVariants}
            className="flex w-fit items-center bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1 gap-2"
          >
            <div className="size-1.5 bg-indigo-600 rounded-full" />
            <span className="text-indigo-600 font-sans text-[10px] font-bold tracking-widest uppercase">
              Step 4 of 4
            </span>
          </motion.div>

          {/* Title */}
          <motion.div variants={itemVariants} className="space-y-2">
            <h1 className="text-slate-900 font-sans text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight">
              How should we split
              <br />
              <span className="text-indigo-600">your money?</span>
            </h1>
            <p className="text-slate-500 font-sans text-sm lg:text-base leading-relaxed">
              Drag the sliders to set what percentage of every deposit goes to
              each wallet.
            </p>
          </motion.div>

          {/* Sliders */}
          <motion.div variants={itemVariants} className="flex flex-col gap-4">
            {SPLIT_KEYS.map((key) => {
              const meta = WALLET_META[key];
              const val = splits[key];
              return (
                <div key={key} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="size-3 rounded-full shadow-sm"
                        style={{ backgroundColor: meta.color }}
                      />
                      <span className="text-slate-800 font-semibold text-sm">
                        {meta.label}
                      </span>
                    </div>
                    <span
                      className="font-bold text-sm tabular-nums"
                      style={{ color: meta.color }}
                    >
                      {val}%
                    </span>
                  </div>
                  <input
                    type="range"
                    className="split-slider"
                    min={BOUNDS[key].min}
                    max={BOUNDS[key].max}
                    step={
                      key === "emergencyPercent" || key === "flexPercent"
                        ? 0.5
                        : 1
                    }
                    value={val}
                    onChange={(e) =>
                      handleSliderChange(key, Number(e.target.value))
                    }
                    style={
                      {
                        "--slider-fill": meta.color,
                        "--slider-pct": `${((val - BOUNDS[key].min) / (BOUNDS[key].max - BOUNDS[key].min)) * 100}%`,
                      } as React.CSSProperties
                    }
                  />
                </div>
              );
            })}
          </motion.div>

          {/* Total indicator */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-between rounded-xl border px-4 py-3"
            style={{
              borderColor: isValid
                ? "rgb(187, 247, 208)"
                : "rgb(254, 202, 202)",
              backgroundColor: isValid
                ? "rgb(240, 253, 244)"
                : "rgb(254, 242, 242)",
            }}
          >
            <div className="flex items-center gap-2">
              {isValid ? (
                <CheckCircle2 className="size-4 text-emerald-600" />
              ) : (
                <AlertCircle className="size-4 text-red-500" />
              )}
              <span
                className="text-sm font-semibold"
                style={{
                  color: isValid ? "rgb(22, 163, 74)" : "rgb(220, 38, 38)",
                }}
              >
                Total: {totalPercent}%
              </span>
            </div>
            {!isValid && (
              <span className="text-xs text-red-600 font-medium">
                Must equal 100%
              </span>
            )}
            {isValid && (
              <span className="text-xs text-emerald-600 font-medium">
                Ready to save
              </span>
            )}
          </motion.div>

          {/* Error banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </motion.div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex w-full justify-between items-center mt-6 lg:mt-0"
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
            <div className="size-1.5 bg-indigo-600 rounded-full" />
          </div>

          <motion.button
            whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            onClick={handleSave}
            disabled={!isValid || isSaving}
            className="flex items-center bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white shadow-xl shadow-indigo-200 rounded-2xl px-6 py-3.5 gap-2.5 transition-all group text-sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span className="font-bold">Saving...</span>
              </>
            ) : (
              <>
                <span className="font-bold">Save & Continue</span>
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </motion.button>
        </motion.div>
      </div>

      {/* ─── Right Side — Visual Preview ─── */}
      <div className="hidden lg:flex relative w-[45%] bg-[linear-gradient(135deg,#eef2ff_0%,#ecfdf5_25%,#fffbeb_50%,#fdf2f8_75%,#eef2ff_100%)] items-center justify-center p-12 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-sm"
        >
          {/* Ambient glow */}
          {!shouldReduceMotion && (
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.25, 0.45, 0.25],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -top-[10%] -right-[10%] size-64 bg-indigo-500/15 blur-[100px] rounded-full"
            />
          )}

          {/* Label */}
          <div className="text-center mb-6 relative">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              On a ₦500,000 deposit
            </span>
          </div>

          {/* Wallet preview cards */}
          <div className="relative flex flex-col gap-3">
            {SPLIT_KEYS.map((key, i) => {
              const meta = WALLET_META[key];
              const pct = splits[key];
              const amount = ((pct / 100) * 500000).toLocaleString("en-US", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              });

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  className="flex items-center bg-white/90 backdrop-blur-sm rounded-2xl px-5 py-4 gap-4 shadow-lg border border-white/60"
                >
                  <div
                    className="size-11 rounded-xl flex items-center justify-center shadow-lg shrink-0"
                    style={{ backgroundColor: meta.color, color: "white" }}
                  >
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-900 font-bold text-sm">
                        {meta.label}
                      </span>
                      <span
                        className="font-black text-sm tabular-nums"
                        style={{ color: meta.color }}
                      >
                        {pct}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-slate-400 text-xs">
                        {meta.desc}
                      </span>
                      <span className="text-slate-500 text-xs font-semibold tabular-nums">
                        ₦{amount}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StepFour;

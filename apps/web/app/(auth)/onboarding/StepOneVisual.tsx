"use client";
import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Shield, Zap, Gift, ArrowRight } from "lucide-react";

export const StepOneVisual = () => {
  const shouldReduceMotion = useReducedMotion();

  // Animation configs that respect reduced motion preference
  const floatAnimation = shouldReduceMotion
    ? {}
    : {
        y: [0, -12, 0],
        transition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
      };

  const floatDownAnimation = shouldReduceMotion
    ? {}
    : {
        y: [0, 15, 0],
        transition: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
      };

  const scaleMoveAnimation = shouldReduceMotion
    ? {}
    : {
        scale: [1, 1.05, 1],
        x: [0, 10, 0],
        transition: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 },
      };

  return (
    <div
      className="hidden lg:flex relative w-[45%] bg-slate-50 lg:bg-[linear-gradient(135deg,_#f5f3ff_0%,_#ede9fe_100%)] items-center justify-center p-12 overflow-hidden"
      aria-hidden="true" // Decorative only
    >
      {/* Animated backgrounds - reduced motion safe */}
      <div className="absolute inset-0 overflow-hidden">
        {!shouldReduceMotion && (
          <>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -top-[10%] -right-[10%] size-[500px] bg-indigo-200/30 blur-[100px] rounded-full"
            />
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: 1 }}
              className="absolute -bottom-[10%] -left-[10%] size-[400px] bg-blue-200/20 blur-[80px] rounded-full"
            />
          </>
        )}
      </div>

      {/* Floating Cards */}
      <div className="relative w-full h-full flex items-center justify-center scale-90 xxl:scale-100">
        {/* Main Deposit Card */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: shouldReduceMotion ? 0 : 0.4 }}
          className="z-20 w-[340px] glass-card shadow-2xl rounded-[32px] p-8 space-y-6 border border-white/50"
        >
          <div className="flex items-center gap-4">
            <div className="size-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
              <Check className="size-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Incoming
              </span>
              <span className="text-slate-900 font-bold text-sm">
                Salary Deposit
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-900 text-5xl font-black tracking-tight">
              Incoming Transfer
            </span>
            <div className="flex items-center gap-2 pt-2">
              <div className="size-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-slate-500 text-xs font-medium italic">
                Auto-splitting enabled
              </span>
            </div>
          </div>

          <div className="h-px w-full bg-slate-100/50" />

          <div className="flex justify-between items-center text-[11px] font-bold text-indigo-600">
            <span>VIEW LOGS</span>
            <ArrowRight className="size-3" />
          </div>
        </motion.div>

        {/* Rent Wallet Card */}
        <motion.div animate={floatAnimation} className="absolute -top-16 right-0 z-30">
          <WalletCard
            icon={<Shield className="size-5" />}
            bgColor="bg-indigo-600"
            shadowColor="shadow-indigo-100"
            label="Rent"
            value="25% allocation"
          />
        </motion.div>

        {/* Savings Wallet Card */}
        <motion.div animate={floatDownAnimation} className="absolute -bottom-10 left-0 z-30">
          <WalletCard
            icon={<Zap className="size-5" />}
            bgColor="bg-emerald-500"
            shadowColor="shadow-emerald-100"
            label="Savings"
            value="50% allocation"
          />
        </motion.div>

        {/* Shopping Wallet Card */}
        <motion.div animate={scaleMoveAnimation} className="absolute bottom-16 -right-8 z-30">
          <WalletCard
            icon={<Gift className="size-5" />}
            bgColor="bg-amber-500"
            shadowColor="shadow-amber-100"
            label="Shopping"
            value="25% allocation"
          />
        </motion.div>

        {/* Connecting Lines (Dashed Decor) - removed if motion reduced */}
        {!shouldReduceMotion && (
          <svg
            className="absolute inset-0 size-full pointer-events-none opacity-20"
            viewBox="0 0 400 400"
          >
            <motion.path
              d="M200,200 L300,100"
              stroke="#4318d1"
              strokeWidth="2"
              strokeDasharray="4,4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 1 }}
            />
            <motion.path
              d="M200,200 L100,300"
              stroke="#059669"
              strokeWidth="2"
              strokeDasharray="4,4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 1.2 }}
            />
          </svg>
        )}
      </div>
    </div>
  );
};

// Helper component for wallet cards
const WalletCard = ({
  icon,
  bgColor,
  shadowColor,
  label,
  value,
}: {
  icon: React.ReactNode;
  bgColor: string;
  shadowColor: string;
  label: string;
  value: string;
}) => (
  <div className="flex items-center bg-white shadow-xl rounded-2xl px-4 py-3 gap-3 border border-slate-50">
    <div
      className={`size-10 ${bgColor} text-white rounded-xl flex items-center justify-center shadow-lg ${shadowColor}`}
    >
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">
        {label}
      </span>
      <span className="text-slate-900 text-sm font-black">{value}</span>
    </div>
  </div>
);
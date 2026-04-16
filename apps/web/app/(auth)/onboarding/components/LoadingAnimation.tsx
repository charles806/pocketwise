"use client";
import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, Shield, PiggyBank, Wallet, Sparkles } from "lucide-react";

export default function LoadingAnimation() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <main className="relative min-h-screen w-full overflow-hidden hero-mesh flex items-center justify-center">
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/20 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-12 p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <h1 className="text-slate-900 text-3xl lg:text-4xl font-extrabold tracking-tight mb-4">
            Setting up your wallet
          </h1>
          <p className="text-slate-500 text-lg">
            Watch how your money gets split automatically
          </p>
        </motion.div>

        <div className="relative w-full max-w-md h-80 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute top-0 z-30"
          >
            <div className="bg-white shadow-2xl rounded-2xl p-6 border border-slate-100 min-w-64">
              <div className="flex items-center gap-3 mb-3">
                <div className="size-10 bg-(--primary) text-white rounded-xl flex items-center justify-center">
                  <ArrowDown className="size-5" />
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
              <div className="text-slate-900 text-3xl font-black">₦500,000</div>
            </div>
          </motion.div>

          {!shouldReduceMotion && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="absolute top-24"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <ArrowDown className="size-6 text-slate-300" />
              </motion.div>
            </motion.div>
          )}

          <div className="absolute bottom-8 flex gap-3">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 }}
            >
              <WalletCard
                icon={<Wallet className="size-4" />}
                bgColor="bg-[#4f46e5]"
                label="Spend"
                value="₦250,000"
                percentage="50%"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
            >
              <WalletCard
                icon={<PiggyBank className="size-4" />}
                bgColor="bg-[#059669]"
                label="Savings"
                value="₦150,000"
                percentage="30%"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.8 }}
            >
              <WalletCard
                icon={<Shield className="size-4" />}
                bgColor="bg-[#d97706]"
                label="Emergency"
                value="₦50,000"
                percentage="10%"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.6 }}
            >
              <WalletCard
                icon={<Sparkles className="size-4" />}
                bgColor="bg-[#db2777]"
                label="Flex"
                value="₦50,000"
                percentage="10%"
              />
            </motion.div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-(--primary) rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-(--primary) rounded-full animate-pulse delay-100" />
          <div className="w-2 h-2 bg-(--primary) rounded-full animate-pulse delay-200" />
        </div>
      </div>
    </main>
  );
}

function WalletCard({
  icon,
  bgColor,
  label,
  value,
  percentage,
}: {
  icon: React.ReactNode;
  bgColor: string;
  label: string;
  value: string;
  percentage: string;
}) {
  return (
    <div className="flex items-center bg-white shadow-xl rounded-2xl px-4 py-3 gap-3 border border-slate-50">
      <div
        className={`size-10 ${bgColor} text-white rounded-xl flex items-center justify-center shadow-lg`}
      >
        {icon}
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">
            {label}
          </span>
          <div className="size-1.5 bg-emerald-500 rounded-full" />
        </div>
        <span className="text-slate-900 text-sm font-black">{value}</span>
        <span className="text-[10px] text-slate-400">{percentage}</span>
      </div>
    </div>
  );
}

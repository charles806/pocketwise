"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Wallet, Sparkles } from "lucide-react";

const wallets = [
  { label: "Spend", pct: "50%", color: "#F97316" },
  { label: "Savings", pct: "30%", color: "#22C55E" },
  { label: "Emergency", pct: "10%", color: "#EF4444" },
  { label: "Flex", pct: "10%", color: "#3B82F6" },
];

export default function WalletCard() {
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  const rotateXSpring = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const rotateYSpring = useSpring(rotateY, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Main card */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: rotateXSpring,
          rotateY: rotateYSpring,
        }}
        className="relative w-[320px] h-[190px] rounded-2xl overflow-hidden cursor-pointer"
      >
        {/* Card background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700" />

        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />

        {/* Shimmer on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.6 }}
        />

        {/* Card content */}
        <div className="relative h-full p-5 flex flex-col justify-between">
          {/* Top row */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-jakarta font-bold text-sm">
                PocketWise
              </span>
            </div>
            <div className="px-2 py-1 rounded-md bg-white/20">
              <span className="text-white text-xs font-semibold font-jakarta">
                SPEND
              </span>
            </div>
          </div>

          {/* Center - masked number */}
          <div className="flex items-center justify-center">
            <span className="text-white/80 font-mono text-lg tracking-widest">
              •••• •••• •••• 4821
            </span>
          </div>

          {/* Bottom row */}
          <div className="flex justify-between items-end">
            <div>
              <p className="text-white/60 text-xs mb-0.5">Cardholder</p>
              <p className="text-white font-semibold font-jakarta text-sm">
                CHUCK S
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-xs mb-0.5">Balance</p>
              <p className="text-white font-bold font-jakarta">₦25,000</p>
            </div>
          </div>

          {/* Mastercard logo */}
          <div className="absolute bottom-4 right-4 flex items-center">
            <div className="w-10 h-6 rounded bg-orange-500/80" />
            <div className="-ml-3 w-6 h-6 rounded-full bg-red-500/80" />
          </div>
        </div>

        {/* Shadow */}
        <div className="absolute inset-0 rounded-2xl shadow-[0_25px_50px_-12px_rgba(91,79,207,0.5)] pointer-events-none" />
      </motion.div>

      {/* 4 mini wallet tiles */}
      <div className="flex flex-wrap justify-center gap-3">
        {wallets.map((w) => (
          <div
            key={w.label}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-100 shadow-sm"
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: w.color }}
            />
            <span className="text-gray-700 font-jakarta text-sm font-medium">
              {w.label}
            </span>
            <span className="text-gray-400 font-jakarta text-xs">{w.pct}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

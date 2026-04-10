"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Loader2,
  Check,
  Sparkles,
  ArrowRight,
  Lock,
  Shield,
  Clock,
} from "lucide-react";

const benefits = [
  { icon: Lock, text: "₦100 welcome credit on launch" },
  { icon: Sparkles, text: "Early access before public launch" },
  { icon: Shield, text: "Priority support for founding members" },
];

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === "loading") return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/waitlist`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(10000),
          body: JSON.stringify({ email }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else if (res.status === 409) {
        setStatus("error");
        setErrorMsg("You're already on the waitlist! We'll be in touch soon.");
      } else {
        setStatus("error");
        setErrorMsg(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("success");
      setEmail("");
    }
  };

  return (
    <section className="relative min-h-[calc(100vh-72px)] flex items-center justify-center px-6 py-24 bg-gradient-to-b from-white to-[#f6f7ff] overflow-hidden">
      {/* Background Effects */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <motion.div
          className="absolute top-0 left-1/4 w-150 h-150 bg-purple-400/15 blur-[120px] rounded-full"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-0 w-125 h-125 bg-indigo-400/10 blur-[100px] rounded-full"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        />
      </div>

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center text-center gap-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 cursor-pointer group"
          >
              <Image
                src="/logo.png"
                alt="PocketWise Logo"
                width={44}
                height={44}
                className="rounded-xl group-hover:scale-105 transition-transform"
              />
            <span className="text-xl font-bold text-gray-900 tracking-tight group-hover:text-[#5B4FCF] transition-colors">
              PocketWise
            </span>
          </Link>
        </motion.div>

        {/* Headline */}
        <motion.div
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          <h1 className="text-gray-950 text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-[-1.5px]">
            Be among the first to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5B4FCF] to-[#8B5CF6]">
              sort your money
            </span>{" "}
            automatically.
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed max-w-lg mx-auto">
            PocketWise launches soon. Join the founding members and get
            exclusive early access + ₦100 wallet credit.
          </p>
        </motion.div>

        {/* Benefits */}
        <motion.div
          className="flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {benefits.map((benefit, i) => (
            <div
              key={benefit.text}
              className="flex items-center gap-2 px-4 py-2 bg-white/60 border border-gray-100 rounded-full text-sm text-gray-600"
            >
              <benefit.icon size={16} className="text-[#5B4FCF]" />
              {benefit.text}
            </div>
          ))}
        </motion.div>

        {/* Form / Success */}
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center gap-4 bg-white border border-gray-100 rounded-3xl px-8 py-10 shadow-lg"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                  className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center"
                >
                  <Check
                    size={32}
                    className="text-emerald-500"
                    strokeWidth={3}
                  />
                </motion.div>
                <h2 className="text-gray-900 text-xl font-bold">
                  You&apos;re on the list! 🎉
                </h2>
                <p className="text-gray-500 text-sm text-center">
                  We&apos;ll notify you when PocketWise launches. Check your
                  inbox for a confirmation email.
                </p>
                <Link
                  href="/"
                  className="flex items-center gap-2 text-[#5B4FCF] font-medium text-sm hover:gap-3 transition-all cursor-pointer"
                >
                  Back to home <ArrowRight size={16} />
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col sm:flex-row gap-3 w-full"
                >
                  <div className="relative flex-1">
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (status === "error") {
                          setStatus("idle");
                          setErrorMsg("");
                        }
                      }}
                      placeholder="Enter your email address"
                      required
                      aria-label="Email address for waitlist"
                      className="w-full pl-11 pr-4 py-4 rounded-xl border border-gray-200 bg-white text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B4FCF]/20 focus:border-[#5B4FCF] transition-all duration-200 shadow-sm"
                    />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={status === "loading"}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex justify-center items-center bg-[#5B4FCF] rounded-xl px-6 py-4 gap-2 cursor-pointer text-white text-base font-semibold shadow-lg hover:shadow-xl hover:bg-[#4a3eb8] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Joining...</span>
                      </>
                    ) : (
                      <>
                        Reserve My Spot
                        <ArrowRight size={18} />
                      </>
                    )}
                  </motion.button>
                </form>

                {status === "error" && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-3 text-center"
                  >
                    {errorMsg}
                  </motion.p>
                )}

                <motion.p
                  className="text-gray-400 text-xs text-center mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Lock size={12} className="inline mr-1" />
                  No spam. Your data is protected. Unsubscribe anytime.
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Social proof */}
        <motion.div
          className="flex items-center gap-2 text-gray-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        ></motion.div>
      </div>
    </section>
  );
}

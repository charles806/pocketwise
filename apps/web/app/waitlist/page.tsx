"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === "loading") return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/v1/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else if (res.status === 409) {
        setStatus("error");
        setErrorMsg("You're already on the waitlist! We'll be in touch soon.");
      } else {
        setStatus("error");
        setErrorMsg("Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please check your connection and try again.");
    }
  };

  return (
    <section className="relative min-h-[calc(100vh-72px)] flex items-center justify-center px-6 py-24 bg-linear-to-b from-white to-[#f6f7ff] overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-150 h-150 bg-purple-400/15 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-0 w-125 h-125 bg-indigo-400/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center text-center gap-8">
        {/* Logo Mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Back to homepage">
            <div className="size-10 flex justify-center items-center bg-[#5b4fcf] rounded-xl">
              <svg
                className="size-5 text-white"
                stroke="currentColor"
                fill="none"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">PocketWise</span>
          </Link>
        </motion.div>

        {/* Headline */}
        <motion.div
          className="flex flex-col gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
        >
          <h1 className="text-gray-950 text-4xl sm:text-5xl font-extrabold leading-[1.1] tracking-[-1.5px]">
            Be among the first to sort your money{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-violet-500">
              automatically.
            </span>
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed mt-2">
            PocketWise launches soon. Join the founding members and get exclusive
            early access.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          className="w-full flex flex-col gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {status === "success" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-6 py-8"
            >
              <span className="text-4xl" aria-hidden="true">🎉</span>
              <h2 className="text-emerald-800 text-xl font-bold">
                You&apos;re on the list!
              </h2>
              <p className="text-emerald-600 text-sm">
                We&apos;ll notify you when PocketWise launches.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                aria-label="Email address for waitlist"
                className="flex-1 px-5 py-4 rounded-xl border border-gray-200 bg-white text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5b4fcf] focus:border-transparent transition-all duration-200 shadow-sm"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                aria-label="Reserve your spot on the PocketWise waitlist"
                className="flex justify-center items-center bg-[#5b4fcf] rounded-xl px-8 py-4 gap-2 cursor-pointer text-white text-base font-bold shadow-[0px_4px_20px_rgba(91,79,207,0.3)] hover:brightness-110 active:scale-95 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {status === "loading" ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Reserving…
                  </span>
                ) : (
                  "Reserve My Spot →"
                )}
              </button>
            </form>
          )}

          {status === "error" && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm font-medium"
            >
              {errorMsg}
            </motion.p>
          )}
        </motion.div>

        {/* Trust line */}
        <motion.p
          className="text-gray-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          No spam. No fees. Cancel anytime. Your data is protected.
        </motion.p>
      </div>
    </section>
  );
}

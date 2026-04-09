"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Rocket,
  Smartphone,
  Building2,
  Globe2,
  Check,
  Mail,
  Loader2,
} from "lucide-react";

export default function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === "loading") return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/waitlist`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(10000),
          body: JSON.stringify({ email }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(
          data.message || "Something went wrong. Please try again.",
        );
      }
    } catch {
      setStatus("success");
    }
  };

  const socialPills = [
    { icon: Smartphone, text: "Mobile App — Coming Soon" },
    { icon: Building2, text: "Real Money via Anchor BaaS" },
    { icon: Globe2, text: "Built in Nigeria, for Nigeria" },
  ];

  return (
    <section
      id="waitlist"
      className="relative py-24 sm:py-32 overflow-hidden"
      style={{ background: "#1E1B4B", position: "relative" }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-75 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(91,79,207,0.25) 0%, transparent 70%)",
          filter: "blur(60px)",
          top: "-80px",
          zIndex: 1,
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
          filter: "blur(50px)",
          zIndex: 1,
        }}
      />

      <div className="max-w-2xl mx-auto px-5 sm:px-8 text-center relative z-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <span
            className="inline-flex items-center gap-2 text-sm font-semibold font-jakarta px-4 py-2 rounded-full cursor-default"
            style={{
              background: "rgba(91,79,207,0.35)",
              color: "#c4baff",
              border: "1px solid rgba(91,79,207,0.4)",
            }}
          >
            <Rocket size={16} />
            <span>Launching Soon</span>
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-jakarta font-bold text-white mb-5"
          style={{ fontSize: "clamp(32px, 5vw, 52px)", letterSpacing: "-1px" }}
        >
          Be First. Build the
          <br />
          Habit Early.
        </motion.h2>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-white/60 leading-relaxed mb-10 max-w-lg mx-auto"
          style={{ fontSize: "17px" }}
        >
          PocketWise is almost ready. Join the waitlist and get early access
          before the public launch — plus{" "}
          <span className="text-white font-semibold">₦100 wallet credit</span>{" "}
          when you sign up on launch day.
        </motion.p>

        {/* Form / Success state */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {status !== "success" ? (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <div className="relative flex-1">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === "error") {
                      setStatus("idle");
                      setErrorMessage("");
                    }
                  }}
                  placeholder="Enter your email address"
                  className="w-full pl-11 pr-4 py-4 text-sm font-medium text-black bg-white/10 border border-white/15 placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#5B4FCF]/60 focus:border-[#5B4FCF]/60 transition-all rounded-2xl"
                />
              </div>
              <motion.button
                type="submit"
                disabled={status === "loading"}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary font-jakarta font-semibold text-sm px-6 py-4 rounded-2xl whitespace-nowrap shrink-0 disabled:opacity-70 cursor-pointer flex items-center justify-center gap-2"
                style={{ background: "#5B4FCF" }}
              >
                {status === "loading" ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Joining...</span>
                  </>
                ) : (
                  "Claim My Early Access →"
                )}
              </motion.button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-4"
            >
              <div
                className="flex items-center justify-center w-16 h-16 rounded-full"
                style={{
                  background: "rgba(34,197,94,0.2)",
                  border: "2px solid #22C55E",
                }}
              >
                <Check size={32} className="text-[#22C55E]" strokeWidth={3} />
              </div>
              <p className="font-jakarta font-bold text-white text-xl">
                You&apos;re on the list!
              </p>
              <p className="text-white/60 text-sm">
                Watch your inbox for your launch-day invite + ₦100 credit.
              </p>
            </motion.div>
          )}

          {status === "error" && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-red-400 text-sm"
            >
              {errorMessage}
            </motion.p>
          )}

          {status !== "success" && (
            <p className="mt-4 text-white/40 text-xs">
              ✓ No spam. Just your launch-day invite.
            </p>
          )}
        </motion.div>

        {/* Social proof pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-3 mt-12"
        >
          {socialPills.map((pill) => (
            <span
              key={pill.text}
              className="text-xs font-medium font-jakarta px-4 py-2 rounded-full cursor-default"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              <pill.icon size={14} className="inline mr-2" />
              {pill.text}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

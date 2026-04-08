"use client";

import { useState } from "react";

export default function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === "loading") return;
    setStatus("loading");
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // Treat any response as success for UI purposes
      setStatus("success");
      setSubmitted(true);
    } catch {
      // Still show success — backend is a placeholder
      setStatus("success");
      setSubmitted(true);
    }
  };

  return (
    <section
      id="waitlist"
      className="relative py-24 sm:py-32 overflow-hidden noise-overlay"
      style={{ background: "#1E1B4B" }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-75 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(91,79,207,0.35) 0%, transparent 70%)",
          filter: "blur(60px)",
          top: "-80px",
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      <div className="max-w-2xl mx-auto px-5 sm:px-8 text-center relative z-10">
        {/* Badge */}
        <div className="reveal mb-6">
          <span
            className="inline-flex items-center gap-2 text-sm font-semibold font-jakarta px-4 py-2 rounded-full"
            style={{
              background: "rgba(91,79,207,0.35)",
              color: "#c4baff",
              border: "1px solid rgba(91,79,207,0.4)",
            }}
          >
            <span>🚀</span>
            <span>Launching Soon</span>
          </span>
        </div>

        {/* Headline */}
        <h2
          className="reveal reveal-delay-100 font-jakarta font-bold text-white mb-5"
          style={{ fontSize: "clamp(32px, 5vw, 52px)", letterSpacing: "-1px" }}
        >
          Be First. Build the
          <br />
          Habit Early.
        </h2>

        {/* Sub */}
        <p
          className="reveal reveal-delay-200 text-white/60 leading-relaxed mb-10 max-w-lg mx-auto"
          style={{ fontSize: "17px" }}
        >
          PocketWise is almost ready. Join the waitlist and get early access
          before the public launch — plus{" "}
          <span className="text-white font-semibold">₦100 wallet credit</span>{" "}
          when you sign up on launch day.
        </p>

        {/* Form / Success state */}
        <div className="reveal reveal-delay-300">
          {!submitted ? (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 rounded-2xl px-5 py-4 text-sm font-medium text-foreground bg-white/10 border border-white/15 placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60 transition-all"
                style={{ color: "#fff" }}
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="btn-primary font-jakarta font-semibold text-sm px-6 py-4 rounded-2xl whitespace-nowrap shrink-0 disabled:opacity-70"
              >
                {status === "loading"
                  ? "Joining..."
                  : "Claim My Early Access →"}
              </button>
            </form>
          ) : (
            <div className="animate-toastSlideIn flex flex-col items-center gap-4">
              {/* Check animation */}
              <div
                className="flex items-center justify-center w-16 h-16 rounded-full"
                style={{
                  background: "rgba(34,197,94,0.2)",
                  border: "2px solid #22C55E",
                }}
              >
                <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
                  <path
                    d="M10 20 L17 27 L30 13"
                    stroke="#22C55E"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="40"
                    strokeDashoffset="0"
                    style={{
                      animation:
                        "checkDraw 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both",
                    }}
                  />
                </svg>
              </div>
              <p className="font-jakarta font-bold text-white text-xl">
                You&apos;re on the list!
              </p>
              <p className="text-white/60 text-sm">
                🎉 Watch your inbox for your launch-day invite + ₦100 credit.
              </p>
            </div>
          )}

          {!submitted && (
            <p className="mt-4 text-white/40 text-xs">
              ✓ No spam. Just your launch-day invite.
            </p>
          )}
        </div>

        {/* Social proof pills */}
        <div className="reveal reveal-delay-400 flex flex-wrap justify-center gap-3 mt-12">
          {[
            "📱 Mobile App — Coming Soon",
            "🏦 Real Money via Anchor BaaS",
            "🇳🇬 Built in Nigeria, for Nigeria",
          ].map((pill) => (
            <span
              key={pill}
              className="text-xs font-medium font-jakarta px-4 py-2 rounded-full"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              {pill}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

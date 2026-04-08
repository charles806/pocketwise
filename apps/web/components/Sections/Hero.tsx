"use client";

import { useEffect, useRef, useState } from "react";
import {
  // Wallet,
  Shield,
  Sparkles,
  ArrowDown,
  // CheckCircle2,
} from "lucide-react";

const wallets = [
  {
    label: "Spend",
    amount: 25000,
    pct: "50%",
    color: "#5B4FCF",
    sublabel: "50% of deposits",
  },
  {
    label: "Savings",
    amount: 15000,
    pct: "30%",
    color: "#10B981",
    sublabel: "30% of deposits",
  },
  {
    label: "Emergency",
    amount: 5000,
    pct: "10%",
    color: "#F59E0B",
    sublabel: "10% of deposits",
  },
  {
    label: "Flex",
    amount: 5000,
    pct: "10%",
    color: "#EC4899",
    sublabel: "10% of deposits",
  },
];

function formatNaira(n: number) {
  return "₦" + n.toLocaleString("en-NG");
}

function WonderWalletCard() {
  const [displayAmounts, setDisplayAmounts] = useState(wallets.map(() => 0));
  const [mounted, setMounted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
    const duration = 1400;
    const startDelay = 800;

    wallets.forEach((w, i) => {
      setTimeout(
        () => {
          const startTime = performance.now();
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setDisplayAmounts((prev) => {
              const next = [...prev];
              next[i] = Math.floor(ease * w.amount);
              return next;
            });
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        },
        startDelay + i * 150,
      );
    });
  }, []);

  // Continuous subtle floating + tilt on mouse move
  useEffect(() => {
    let animationFrame: number;
    let time = 0;

    const animate = () => {
      time += 0.02;
      if (!cardRef.current) return;

      // Subtle floating motion
      const floatX = Math.sin(time) * 2;
      const floatY = Math.cos(time * 0.7) * 2;

      // Combine with mouse tilt
      cardRef.current.style.transform = `perspective(1000px) rotateX(${tilt.x + floatX}deg) rotateY(${tilt.y + floatY}deg) scale(1)`;
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [tilt]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setTilt({
      x: (y - centerY) / 40,
      y: (centerX - x) / 40,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="flex flex-col bg-white border-t border-b border-l border-r shadow-2xl rounded-3xl p-8 gap-6 border-[#f0f0f5] w-full max-w-175 cursor-pointer mx-auto lg:mx-0 transition-transform duration-200 ease-out"
      style={{
        transformStyle: "preserve-3d",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)",
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <span className="text-[#6b7280] font-sans text-sm">
            Good morning,
          </span>
          <span className="text-[#0f0f1a] font-sans text-xl font-bold">
            Charles 👋
          </span>
        </div>
        <div className="flex items-center bg-primary-light rounded-xl px-4 py-2">
          <span className="text-primary font-sans text-base font-semibold">
            ₦50,000
          </span>
        </div>
      </div>

      {/* Wallet rows */}
      <div className="flex flex-col gap-3">
        {wallets.map((w, i) => (
          <div
            key={w.label}
            className="flex justify-between items-center rounded-2xl p-4 transition-all duration-300 hover:bg-gray-50"
            // style={{
            //   borderLeft: `3px solid ${w.color}`,
            // }}
          >
            <div className="flex items-center gap-3">
              <div
                className="size-3 rounded-full"
                style={{ backgroundColor: w.color }}
              />
              <div className="flex flex-col">
                <span className="text-[#0f0f1a] font-sans text-sm font-semibold">
                  {w.label}
                </span>
                <span className="text-[#6b7280] font-sans text-xs">
                  {w.sublabel}
                </span>
              </div>
            </div>
            <span
              className="font-sans text-sm font-bold"
              style={{ color: w.color }}
            >
              {mounted ? formatNaira(displayAmounts[i] ?? 0) : "₦0"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Hero() {
  const [visible, setVisible] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState<number | undefined>(
    undefined,
  );
  const [countLoaded, setCountLoaded] = useState(false);

  useEffect(() => {
    setVisible(true);

    const fetchCount = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/waitlist/count`,
        );
        const data = await res.json();
        if (data.data?.count !== undefined) {
          setWaitlistCount(data.data.count);
        }
        setCountLoaded(true);
      } catch {
        setCountLoaded(true);
      }
    };

    fetchCount();
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center  pb-16 overflow-hidden"
      style={{ background: "#FAFAFA" }}
    >
      {/* Subtle gradient mesh - muted */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(139,92,246,0.06) 0%, transparent 50%)",
        }}
      />

      <div className="max-w-6xl mx-auto px-5 sm:px-8 w-full relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column */}
          <div className="flex flex-col items-start">
            {/* Eyebrow */}
            <div
              className={`transform transition-all duration-700 ${
                visible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "0ms" }}
            >
              <span className="inline-flex items-center gap-2 text-xs font-semibold font-jakarta uppercase tracking-widest px-4 py-1.5 rounded-full border border-violet-200 text-violet-700 bg-violet-50">
                <Sparkles className="w-3 h-3" />
                Smart Wallet for Nigerians who want control
              </span>
            </div>

            {/* Headline */}
            <h1
              className={`font-jakarta font-bold text-gray-900 mt-6 mb-5 leading-tight transform transition-all duration-700 ${
                visible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
              style={{
                fontSize: "clamp(32px, 4.5vw, 52px)",
                letterSpacing: "-0.5px",
                lineHeight: 1.1,
              }}
            >
              Your money splits itself
              <br />
              the moment it enters.
            </h1>

            {/* Subheadline */}
            <p
              className={`text-gray-500 leading-relaxed mb-6 transform transition-all duration-700 ${
                visible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
              style={{ fontSize: "18px", lineHeight: 1.6 }}
            >
              Spend, save, and stay disciplined — automatically.
            </p>

            {/* Split breakdown */}
            <div
              className={`flex flex-wrap gap-x-4 gap-y-2 mb-8 text-sm transform transition-all duration-700 ${
                visible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <span className="flex items-center gap-1.5 text-gray-600">
                <span className="w-2 h-2 rounded-full bg-violet-600" />
                50% Spend
              </span>
              <span className="flex items-center gap-1.5 text-gray-600">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                30% Save
              </span>
              <span className="flex items-center gap-1.5 text-gray-600">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                10% Emergency
              </span>
              <span className="flex items-center gap-1.5 text-gray-600">
                <span className="w-2 h-2 rounded-full bg-pink-500" />
                10% Flex
              </span>
            </div>

            {/* Stress-free note */}
            <p
              className={`text-lg text-gray-700 font-medium mb-8 transform transition-all duration-700 ${
                visible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              No stress. No overspending.
              <br />
              No self-control needed.
            </p>

            {/* CTA group */}
            <div
              className={`flex flex-wrap gap-4 mb-6 transform transition-all duration-700 ${
                visible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <a
                href="#waitlist"
                className="inline-flex items-center gap-2 font-jakarta font-semibold text-base px-8 py-4 rounded-2xl text-white bg-primary hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Sparkles className="w-4 h-4" />
                Join the Waitlist
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 font-jakarta font-semibold text-base px-6 py-4 rounded-2xl text-gray-600 hover:text-gray-900 transition-colors"
              >
                See how it works
                <ArrowDown className="w-4 h-4" />
              </a>
            </div>

            {/* Social proof */}
            <div
              className={`transform transition-all duration-700 ${
                visible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <p className="flex items-center gap-2 text-sm text-gray-500">
                <span className="text-lg">🚀</span>
                <span>
                  <strong
                    id="waitlistCount"
                    className="text-gray-900 font-semibold"
                  >
                    {countLoaded && waitlistCount != null
                      ? waitlistCount.toLocaleString()
                      : "..."}
                  </strong>{" "}
                  people joined the waitlist
                </span>
              </p>
              <p className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                <Shield className="w-4 h-4" />
                Bank-level security. Your money is safe.
              </p>
            </div>
          </div>

          {/* Right column - Wallet card */}
          <div
            className={`transform transition-all duration-1000 ${
              visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <WonderWalletCard />
          </div>
        </div>
      </div>
    </section>
  );
}

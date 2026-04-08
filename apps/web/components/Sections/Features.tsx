"use client";

import { useEffect, useRef } from "react";

/* ── Sub-components (inline feature cards) ── */

function WalletSplitCard() {
  return (
    <div className="bg-white rounded-3xl shadow-card p-6 border border-gray-100">
      <p className="text-xs font-semibold font-jakarta uppercase tracking-widest text-secondary mb-4">
        Auto-Split Preview
      </p>
      <table className="w-full text-sm feature-table">
        <thead>
          <tr>
            <th className="text-left pb-3 text-secondary font-medium text-xs">
              Wallet
            </th>
            <th className="text-center pb-3 text-secondary font-medium text-xs">
              %
            </th>
            <th className="text-right pb-3 text-secondary font-medium text-xs">
              Purpose
            </th>
          </tr>
        </thead>
        <tbody>
          {[
            {
              emoji: "🟠",
              name: "Spend",
              pct: "50%",
              purpose: "Day-to-day",
              color: "#F97316",
            },
            {
              emoji: "🟢",
              name: "Savings",
              pct: "30%",
              purpose: "Long-term",
              color: "#22C55E",
            },
            {
              emoji: "🔴",
              name: "Emergency",
              pct: "10%",
              purpose: "Safety net 🔒",
              color: "#EF4444",
            },
            {
              emoji: "🔵",
              name: "Flex",
              pct: "10%",
              purpose: "Treats",
              color: "#3B82F6",
            },
          ].map((row) => (
            <tr key={row.name}>
              <td className="py-3 font-medium font-jakarta text-foreground flex items-center gap-2">
                <span>{row.emoji}</span> {row.name}
              </td>
              <td className="py-3 text-center">
                <span
                  className="text-xs font-bold font-jakarta px-2 py-0.5 rounded-full text-white"
                  style={{ background: row.color }}
                >
                  {row.pct}
                </span>
              </td>
              <td className="py-3 text-right text-xs text-secondary">
                {row.purpose}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TransferCard() {
  return (
    <div className="bg-white rounded-3xl shadow-card p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold"
          style={{ background: "#5B4FCF" }}
        >
          ₦
        </div>
        <div>
          <p className="font-jakarta font-semibold text-foreground text-sm">
            Transfer ₦5,000
          </p>
          <p className="text-xs text-secondary">From: Spend Wallet</p>
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 p-3 mb-3">
        <p className="text-xs text-secondary mb-1 font-medium">
          Reason for this transfer
        </p>
        <p className="text-sm text-foreground font-medium">
          Bought groceries at Shoprite 🛒
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs text-secondary">
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: "#22C55E" }}
        />
        Reason logged · Spend tracked
      </div>
    </div>
  );
}

function GoalCard() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && barRef.current) {
          barRef.current.style.width = "36%";
        }
      },
      { threshold: 0.5 },
    );
    if (barRef.current) observer.observe(barRef.current.parentElement!);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-white rounded-3xl shadow-card p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-jakarta font-bold text-foreground text-sm">
            MacBook Pro
          </p>
          <p className="text-xs text-secondary mt-0.5">Goal: ₦120,000</p>
        </div>
        <span
          className="text-xs font-bold font-jakarta px-3 py-1 rounded-full text-white"
          style={{ background: "#5B4FCF" }}
        >
          36%
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
        <div
          ref={barRef}
          className="progress-bar h-full rounded-full"
          style={{ width: "0%" }}
        />
      </div>
      <div className="flex justify-between text-xs text-secondary">
        <span>₦43,500 saved</span>
        <span>₦76,500 to go</span>
      </div>
      <p className="text-xs text-secondary mt-3">
        📅 On track · Est. completion: Aug 2026
      </p>
    </div>
  );
}

function WeeklySummaryCard() {
  return (
    <div className="bg-white rounded-3xl shadow-card p-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">📊</span>
        <div>
          <p className="font-jakarta font-bold text-foreground text-sm">
            Weekly Pulse
          </p>
          <p className="text-xs text-secondary">Week of Apr 1 – 7, 2026</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {[
          {
            label: "Spent",
            value: "₦12,400",
            icon: "🟠",
            sub: "49.6% of Spend wallet",
          },
          {
            label: "Saved",
            value: "₦7,500",
            icon: "🟢",
            sub: "Toward MacBook goal",
          },
          {
            label: "AI Note",
            value: "Food spend down 18%",
            icon: "🧠",
            sub: "🎉 Great week!",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-xl px-3 py-2.5"
            style={{ background: "#F9F9FB" }}
          >
            <div className="flex items-center gap-2">
              <span>{item.icon}</span>
              <div>
                <p className="text-xs font-semibold text-foreground">
                  {item.label}
                </p>
                <p className="text-xs text-secondary">{item.sub}</p>
              </div>
            </div>
            <span className="text-xs font-bold font-jakarta text-foreground">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Feature rows data ── */
const features = [
  {
    id: "split",
    eyebrow: "The Smart Split",
    title: "The 50/30/10/10 Split",
    body: "Inspired by time-tested wealth allocation principles, every naira you deposit is automatically divided into four wallets. Spend 50% freely, save 30% consistently, protect 10% in Emergency, and treat yourself with 10% in Flex — guilt-free.",
    card: <WalletSplitCard />,
    textLeft: true,
  },
  {
    id: "transfer",
    eyebrow: "Intentional Spending",
    title: "Spend With Intention",
    body: "Every transfer out of your wallets requires a stated reason. Not to judge you — to make you pause. That 3-second reflection is where better financial decisions are born.",
    card: <TransferCard />,
    textLeft: false,
  },
  {
    id: "goals",
    eyebrow: "Savings Goals",
    title: "Set Goals. Auto-Track Progress.",
    body: "Create savings goals with a target amount and deadline. PocketWise automatically tracks your weekly contributions from your Savings wallet and shows you exactly where you stand.",
    card: <GoalCard />,
    textLeft: true,
  },
  {
    id: "weekly",
    eyebrow: "Weekly Summary",
    title: "Your Weekly Financial Pulse",
    body: "Every week, PocketWise sends you a summary of how you spent, what you saved, and what your AI coach noticed. No surprises. Just clarity.",
    card: <WeeklySummaryCard />,
    textLeft: false,
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-background py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="text-center mb-16 reveal">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold font-jakarta uppercase tracking-widest px-4 py-1.5 rounded-full mb-4"
            style={{ background: "#EDE9FF", color: "#5B4FCF" }}
          >
            Features
          </span>
          <h2
            className="font-jakarta font-bold text-foreground mb-4"
            style={{
              fontSize: "clamp(28px, 4vw, 42px)",
              letterSpacing: "-0.5px",
            }}
          >
            Everything You Need to Build
            <br className="hidden sm:block" /> Real Financial Habits
          </h2>
        </div>

        {/* Feature rows */}
        <div className="flex flex-col gap-20 sm:gap-24">
          {features.map((f) => (
            <div
              key={f.id}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center ${
                !f.textLeft
                  ? "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1"
                  : ""
              }`}
            >
              {/* Text */}
              <div className="reveal flex flex-col">
                <span
                  className="inline-flex text-xs font-semibold font-jakarta uppercase tracking-widest mb-3"
                  style={{ color: "#5B4FCF" }}
                >
                  {f.eyebrow}
                </span>
                <h3
                  className="font-jakarta font-bold text-foreground mb-4"
                  style={{
                    fontSize: "clamp(22px, 3vw, 30px)",
                    letterSpacing: "-0.3px",
                  }}
                >
                  {f.title}
                </h3>
                <p
                  className="text-secondary leading-relaxed"
                  style={{ fontSize: "16px" }}
                >
                  {f.body}
                </p>
              </div>

              {/* Card */}
              <div className="reveal reveal-delay-200">{f.card}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

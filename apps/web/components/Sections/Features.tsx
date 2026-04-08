"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  // Wallet,
  PiggyBank,
  Shield,
  Zap,
  ArrowRightLeft,
  Target,
  TrendingDown,
  Sparkles,
  // ChevronRight,
  Calculator,
  Clock,
  Lock,
  CreditCard,
  BarChart3,
  Sparkles as SparklesIcon,
  // CheckCircle2,
  DollarSign,
  ShoppingCart,
} from "lucide-react";

function InteractiveDepositCard() {
  const [amount, setAmount] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const splits = [
    {
      label: "Spend",
      pct: 50,
      color: "#F97316",
      bgLight: "#FED7AA",
      icon: CreditCard,
    },
    {
      label: "Savings",
      pct: 30,
      color: "#22C55E",
      bgLight: "#BBF7D0",
      icon: PiggyBank,
    },
    {
      label: "Emergency",
      pct: 10,
      color: "#EF4444",
      bgLight: "#FECACA",
      icon: Lock,
    },
    { label: "Flex", pct: 10, color: "#3B82F6", bgLight: "#BFDBFE", icon: Zap },
  ];

  const handleDeposit = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      setShowResults(true);
    }, 1500);
  };

  const formatAmount = (val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return "₦0";
    return `₦${num.toLocaleString("en-NG")}`;
  };

  return (
    <div className="bg-white rounded-3xl shadow-card p-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-5 cursor-pointer">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "#EDE9FF" }}
        >
          <Calculator size={18} style={{ color: "#5B4FCF" }} />
        </div>
        <p className="font-jakarta font-bold text-foreground text-sm">
          Try the Split Calculator
        </p>
      </div>

      {/* Input section */}
      {!showResults ? (
        <div className="space-y-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary font-jakarta font-medium">
              ₦
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 font-jakarta text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B4FCF]/20 focus:border-[#5B4FCF] transition-all"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDeposit}
            disabled={!amount || parseFloat(amount) <= 0}
            className="w-full py-3 rounded-xl font-jakarta font-semibold cursor-pointer text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "#5B4FCF" }}
          >
            Split My Money
          </motion.button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Animate the splits appearing */}
          {splits.map((split, index) => {
            const value = (parseFloat(amount || "0") * split.pct) / 100;
            return (
              <motion.div
                key={split.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 }}
                className="flex items-center justify-between p-3 rounded-xl cursor-pointer"
                style={{ background: split.bgLight }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "white" }}
                  >
                    <split.icon size={16} style={{ color: split.color }} />
                  </div>
                  <div>
                    <p className="font-jakarta font-semibold text-foreground text-sm">
                      {split.label}
                    </p>
                    <p className="text-xs text-secondary">{split.pct}%</p>
                  </div>
                </div>
                <span
                  className="font-jakarta font-bold"
                  style={{ color: split.color }}
                >
                  {formatAmount(String(value))}
                </span>
              </motion.div>
            );
          })}

          <button
            onClick={() => {
              setShowResults(false);
              setAmount("");
            }}
            className="w-full py-2 text-sm text-secondary hover:text-foreground font-jakarta transition-colors cursor-pointer"
          >
            Try another amount
          </button>
        </div>
      )}

      {/* Animation overlay */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/90 rounded-3xl flex items-center justify-center z-10"
          >
            <div className="flex gap-2">
              {splits.map((split, i) => (
                <motion.div
                  key={split.label}
                  initial={{ scale: 0, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{
                    delay: i * 0.1,
                    type: "spring",
                    stiffness: 400,
                    damping: 15,
                  }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: split.color }}
                >
                  <split.icon size={18} className="text-white" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WalletSplitCard() {
  const splits = [
    {
      name: "Spend",
      pct: "50%",
      purpose: "Day-to-day",
      color: "#F97316",
      icon: CreditCard,
    },
    {
      name: "Savings",
      pct: "30%",
      purpose: "Long-term",
      color: "#22C55E",
      icon: PiggyBank,
    },
    {
      name: "Emergency",
      pct: "10%",
      purpose: "Safety net",
      color: "#EF4444",
      icon: Shield,
    },
    {
      name: "Flex",
      pct: "10%",
      purpose: "Treats",
      color: "#3B82F6",
      icon: Zap,
    },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-card p-6 border border-gray-100 cursor-pointer">
      <p className="text-xs font-semibold font-jakarta uppercase tracking-widest text-secondary mb-4">
        Auto-Split Preview
      </p>
      <div className="space-y-3">
        {splits.map((row) => (
          <div
            key={row.name}
            className="flex items-center justify-between p-3 rounded-xl cursor-pointer"
            style={{ background: `${row.color}10` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: row.color }}
              >
                <row.icon size={14} className="text-white" />
              </div>
              <div>
                <p className="font-jakarta font-semibold text-foreground text-sm">
                  {row.name}
                </p>
                <p className="text-xs text-secondary">{row.purpose}</p>
              </div>
            </div>
            <span
              className="text-xs font-bold font-jakarta px-2 py-1 rounded-full text-white"
              style={{ background: row.color }}
            >
              {row.pct}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TransferCard() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="bg-white rounded-3xl shadow-card p-6 border border-gray-100 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        animate={{ x: isHovered ? 4 : 0 }}
        className="flex items-center gap-3 mb-5"
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold"
          style={{ background: "#5B4FCF" }}
        >
          <DollarSign size={20} />
        </motion.div>
        <div>
          <p className="font-jakarta font-semibold text-foreground text-sm">
            Transfer ₦5,000
          </p>
          <p className="text-xs text-secondary">From: Spend Wallet</p>
        </div>
        <motion.div
          animate={{ x: isHovered ? 4 : 0, opacity: isHovered ? 1 : 0.5 }}
          className="ml-auto"
        >
          <ArrowRightLeft size={16} className="text-[#5B4FCF]" />
        </motion.div>
      </motion.div>
      <motion.div
        whileHover={{ borderColor: "#5B4FCF40" }}
        className="rounded-xl border border-gray-200 p-3 mb-3 transition-colors"
      >
        <p className="text-xs text-secondary mb-1 font-medium">
          Reason for this transfer
        </p>
        <p className="text-sm text-foreground font-medium flex items-center gap-2">
          Bought groceries at Shoprite
          <ShoppingCart size={16} className="text-[#5B4FCF]" />
        </p>
      </motion.div>
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
  const [progress, setProgress] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setProgress(36), 300);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  return (
    <div className="bg-white rounded-3xl shadow-card p-6 border border-gray-100 cursor-pointer">
      <div className="flex items-center justify-between mb-4 cursor-pointer">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer"
            style={{ background: "#EDE9FF" }}
          >
            <Target size={20} style={{ color: "#5B4FCF" }} />
          </div>
          <div>
            <p className="font-jakarta font-bold text-foreground text-sm">
              MacBook Pro
            </p>
            <p className="text-xs text-secondary mt-0.5">Goal: ₦120,000</p>
          </div>
        </div>
        <span
          className="text-xs font-bold font-jakarta px-3 py-1 rounded-full cursor-pointer text-white"
          style={{ background: "#5B4FCF" }}
        >
          {progress}%
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
        <motion.div
          ref={ref}
          className="h-full rounded-full"
          style={{ background: "#5B4FCF" }}
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between text-xs text-secondary">
        <span>₦43,500 saved</span>
        <span>₦76,500 to go</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-secondary mt-3">
        <Clock size={12} />
        <span>On track · Est. completion: Aug 2026</span>
      </div>
    </div>
  );
}

function WeeklySummaryCard() {
  const items = [
    {
      label: "Spent",
      value: "₦12,400",
      sub: "49.6% of Spend wallet",
      color: "#F97316",
      icon: TrendingDown,
    },
    {
      label: "Saved",
      value: "₦7,500",
      sub: "Toward MacBook goal",
      color: "#22C55E",
      icon: PiggyBank,
    },
    {
      label: "AI Note",
      value: "Food spend down 18%",
      sub: "Great week!",
      color: "#8B5CF6",
      icon: Sparkles,
    },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-card p-6 border border-gray-100 cursor-pointer">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "#EDE9FF" }}
        >
          <BarChart3 size={20} style={{ color: "#5B4FCF" }} />
        </div>
        <div>
          <p className="font-jakarta font-bold text-foreground text-sm">
            Weekly Pulse
          </p>
          <p className="text-xs text-secondary">Week of Apr 1 – 7, 2026</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <motion.div
            key={item.label}
            whileHover={{ scale: 1.02 }}
            className="flex items-center justify-between rounded-xl px-3 py-2.5 cursor-pointer transition-all"
            style={{ background: "#F9F9FB" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `${item.color}20` }}
              >
                <item.icon size={14} style={{ color: item.color }} />
              </div>
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
          </motion.div>
        ))}
      </div>
    </div>
  );
}

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
    id: "calculator",
    eyebrow: "Try It Now",
    title: "See Your Money Split Instantly",
    body: "Type any amount and watch PocketWise instantly divide it into your four wallets. No math needed — just pure clarity on where every naira goes.",
    card: <InteractiveDepositCard />,
    textLeft: false,
  },
  {
    id: "transfer",
    eyebrow: "Intentional Spending",
    title: "Spend With Intention",
    body: "Every transfer out of your wallets requires a stated reason. Not to judge you — to make you pause. That 3-second reflection is where better financial decisions are born.",
    card: <TransferCard />,
    textLeft: true,
  },
  {
    id: "goals",
    eyebrow: "Savings Goals",
    title: "Set Goals. Auto-Track Progress.",
    body: "Create savings goals with a target amount and deadline. PocketWise automatically tracks your weekly contributions from your Savings wallet and shows you exactly where you stand.",
    card: <GoalCard />,
    textLeft: false,
  },
  {
    id: "weekly",
    eyebrow: "Weekly Summary",
    title: "Your Weekly Financial Pulse",
    body: "Every week, PocketWise sends you a summary of how you spent, what you saved, and what your AI coach noticed. No surprises. Just clarity.",
    card: <WeeklySummaryCard />,
    textLeft: true,
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

function FeatureRow({ feature }: { feature: (typeof features)[0] }) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center ${
        !feature.textLeft
          ? "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1"
          : ""
      }`}
    >
      <motion.div variants={itemVariants} className="flex flex-col">
        <motion.span
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 text-xs font-semibold font-jakarta uppercase tracking-widest mb-3"
          style={{ color: "#5B4FCF" }}
        >
          <SparklesIcon size={14} />
          {feature.eyebrow}
        </motion.span>
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-jakarta font-bold text-foreground mb-4"
          style={{
            fontSize: "clamp(22px, 3vw, 30px)",
            letterSpacing: "-0.3px",
          }}
        >
          {feature.title}
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-secondary leading-relaxed"
          style={{ fontSize: "16px" }}
        >
          {feature.body}
        </motion.p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
      >
        {feature.card}
      </motion.div>
    </motion.div>
  );
}

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="bg-background py-20 sm:py-28 relative overflow-hidden"
    >
      {/* Decorative elements */}
      <div
        className="absolute top-20 left-0 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(91,79,207,0.08) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute bottom-20 right-0 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      <div className="max-w-6xl mx-auto px-5 sm:px-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span
            className="inline-flex items-center gap-2 text-xs font-semibold font-jakarta uppercase tracking-widest px-4 py-1.5 rounded-full mb-4"
            style={{ background: "#EDE9FF", color: "#5B4FCF" }}
          >
            <SparklesIcon size={14} />
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
        </motion.div>

        {/* Feature rows */}
        <div className="flex flex-col gap-16 sm:gap-20">
          {features.map((f) => (
            <FeatureRow key={f.id} feature={f} />
          ))}
        </div>
      </div>
    </section>
  );
}

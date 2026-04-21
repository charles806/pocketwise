"use client";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Info, AlertTriangle, AlertCircle } from "lucide-react";
import { CheckCircle } from "lucide-react";
import {
  useToast,
  type Toast,
  type ToastType,
} from "../../context/ToastContext";

// ─── Config ──────────────────────────────────────────────────────────────────

const AUTO_DISMISS_MS: Record<ToastType, number | null> = {
  info: 4000,
  warning: 7000,
  error: null, // persistent — user must dismiss
};

const TOAST_META = {
  info: {
    icon: Info,
    bg: "bg-white",
    border: "border-slate-200",
    iconColor: "text-blue-500",
    title: "Info",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-white",
    border: "border-yellow-300",
    iconColor: "text-yellow-500",
    title: "Warning",
  },
  error: {
    icon: AlertCircle,
    bg: "bg-white",
    border: "border-red-300",
    iconColor: "text-red-500",
    title: "Error",
  },
  success: {
    icon: CheckCircle,
    bg: "bg-white",
    border: "border-green-300",
    iconColor: "text-green-500",
    title: "Success",
  },
};

// ─── Spring config (as specified) ────────────────────────────────────────────

const SPRING = { type: "spring" as const, damping: 20, stiffness: 180 };

// ─── Single Toast Item ────────────────────────────────────────────────────────

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const { type, message, title, id } = toast;
  const meta = TOAST_META[type];
  const Icon = meta.icon;
  const dismissAfter = AUTO_DISMISS_MS[type];
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (dismissAfter !== null) {
      timerRef.current = setTimeout(() => onDismiss(id), dismissAfter);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [id, dismissAfter, onDismiss]);

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleMouseLeave = () => {
    if (dismissAfter !== null) {
      timerRef.current = setTimeout(() => onDismiss(id), dismissAfter);
    }
  };

  return (
    <motion.li
      layout
      drag="x"
      dragConstraints={{ left: 0, right: 120 }}
      dragElastic={0.2}
      onDragEnd={(_, info) => {
        if (info.offset.x > 80) {
          onDismiss(id);
        }
      }}
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95, transition: { duration: 0.2 } }}
      transition={SPRING}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        flex items-start gap-3 w-full max-w-sm
        ${meta.bg} ${meta.border}
        border rounded-xl px-4 py-3 shadow-lg
        pointer-events-auto select-none touch-pan-y
      `}
      role="alert"
      aria-live={type === "error" ? "assertive" : "polite"}
    >
      {/* Icon */}
      <div className="mt-0.5 shrink-0">
        <Icon className={`w-5 h-5 ${meta.iconColor}`} strokeWidth={2} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-0.5">
          {title ?? meta.title}
        </p>
        <p className="text-sm font-medium text-slate-800 leading-snug">
          {message}
        </p>

        {/* Progress bar */}
        {dismissAfter !== null && (
          <motion.div
            className={`mt-2 h-1 rounded-full ${
              {
                info: "bg-blue-400",
                warning: "bg-yellow-400",
                error: "bg-red-400",
                success: "bg-green-400",
              }[type]
            } origin-left`}
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: dismissAfter / 1000, ease: "linear" }}
          />
        )}
      </div>

      {/* Close button */}
      <button
        onClick={() => onDismiss(id)}
        className="shrink-0 mt-0.5 text-slate-400 hover:text-slate-700 transition-colors rounded-md p-0.5 focus:outline-none focus:ring-2 focus:ring-slate-300"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.li>
  );
}

// ─── Toaster (portal-like fixed container) ────────────────────────────────────

export function Toaster() {
  const { toasts, dismissToast } = useToast();

  return (
    <>
      {/* Desktop: bottom-right */}
      <motion.ul
        layout
        className="
          fixed z-9999 flex flex-col gap-2 pointer-events-none
          bottom-6 right-6 sm:flex
        "
        aria-label="Notifications"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismissToast} />
          ))}
        </AnimatePresence>
      </motion.ul>

      {/* Mobile: top-center */}
      <motion.ul
        layout
        className="
          fixed z-9999 flex flex-col gap-2 pointer-events-none
          top-4 left-4 right-4
          sm:hidden
        "
        aria-label="Notifications"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismissToast} />
          ))}
        </AnimatePresence>
      </motion.ul>
    </>
  );
}

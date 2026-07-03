"use client";

import { useEffect, useState } from "react";
import {
  X,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Copy,
  Check,
} from "lucide-react";
import { useToast } from "../context/ToastContext";

type Direction = "sent" | "received" | "deposit";

interface Transaction {
  id: string;
  type: string;
  direction: Direction;
  amount: number;
  reason: string | null;
  status: string;
  createdAt: string;
  counterpartyName: string | null;
}

interface Props {
  transaction: Transaction;
  onClose: () => void;
}

function formatDateFull(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function directionConfig(direction: Direction) {
  switch (direction) {
    case "sent":
      return {
        icon: ArrowUpRight,
        bg: "bg-rose-100",
        color: "text-rose-600",
        amountColor: "text-rose-600",
        prefix: "-",
        label: "Sent",
      };
    case "received":
      return {
        icon: ArrowDownLeft,
        bg: "bg-emerald-100",
        color: "text-emerald-600",
        amountColor: "text-emerald-600",
        prefix: "+",
        label: "Received",
      };
    case "deposit":
      return {
        icon: Wallet,
        bg: "bg-indigo-100",
        color: "text-indigo-600",
        amountColor: "text-emerald-600",
        prefix: "+",
        label: "Deposit",
      };
  }
}

function statusConfig(status: string) {
  switch (status) {
    case "success":
      return {
        label: "Successful",
        classes: "bg-emerald-100 text-emerald-700",
      };
    case "pending":
      return {
        label: "Pending",
        classes: "bg-amber-100 text-amber-700",
      };
    case "failed":
      return {
        label: "Failed",
        classes: "bg-rose-100 text-rose-700",
      };
    default:
      return {
        label: status,
        classes: "bg-slate-100 text-slate-600",
      };
  }
}

const TransactionDetailModal = ({ transaction, onClose }: Props) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const cfg = directionConfig(transaction.direction);
  const Icon = cfg.icon;
  const status = statusConfig(transaction.status);

  const counterpartyLabel = (() => {
    if (transaction.counterpartyName) return transaction.counterpartyName;
    if (transaction.direction === "deposit") return "Deposit via Anchor";
    if (transaction.direction === "sent") return "PocketWise User";
    if (transaction.direction === "received") return "PocketWise User";
    return "-";
  })();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transaction.id);
      setCopied(true);
      toast("Copied!", { type: "success" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("Failed to copy", { type: "error" });
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div className="relative flex flex-col items-center px-6 pb-6 pt-8">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-all duration-200 hover:bg-gray-200 active:scale-95"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>

            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full ${cfg.bg}`}
            >
              <Icon className={`h-6 w-6 ${cfg.color}`} />
            </div>

            <p className={`mt-3 text-2xl font-bold ${cfg.amountColor}`}>
              {cfg.prefix}
              {formatNaira(Math.abs(transaction.amount)).replace("NGN", "₦")}
            </p>

            <span
              className={`mt-2 rounded-full px-3 py-1 text-xs font-semibold ${status.classes}`}
            >
              {status.label}
            </span>
          </div>

          <div className="divide-y divide-slate-100 border-t border-slate-100 px-6 py-4">
            <div className="flex items-center justify-between py-3">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Counterparty
              </span>
              <span className="text-sm font-semibold text-slate-900">
                {counterpartyLabel}
              </span>
            </div>

            <div className="flex items-center justify-between py-3">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Date & Time
              </span>
              <span className="text-sm text-slate-700">
                {formatDateFull(transaction.createdAt)}
              </span>
            </div>

            <div className="flex items-center justify-between py-3">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Reference
              </span>
              <div className="flex items-center gap-2">
                <span className="max-w-[160px] truncate font-mono text-xs text-slate-500">
                  {transaction.id}
                </span>
                <button
                  onClick={handleCopy}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 active:scale-95"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {transaction.reason && (
              <div className="flex items-center justify-between py-3">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Reason
                </span>
                <span className="max-w-[200px] truncate text-right text-sm text-slate-700">
                  {transaction.reason}
                </span>
              </div>
            )}
          </div>

          <div className="px-6 pb-6">
            <button
              onClick={onClose}
              className="w-full rounded-2xl bg-[#4f46e5] py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#4338ca] active:scale-[0.98]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TransactionDetailModal;

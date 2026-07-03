"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatNaira } from "../libs/utils";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

interface ContributeToGoalModalProps {
  goal: { id: string; title: string };
  unallocatedSavings: number;
  onClose: () => void;
  onSuccess: () => void;
}

const ContributeToGoalModal = ({
  goal,
  unallocatedSavings,
  onClose,
  onSuccess,
}: ContributeToGoalModalProps) => {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [submitting, onClose]);

  const numericAmount = Number(amount) || 0;
  const exceedsAvailable = numericAmount > unallocatedSavings;
  const isValid = numericAmount > 0 && !exceedsAvailable;

  const handleSubmit = async () => {
    if (!accessToken || !isValid) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/v1/savings-goals/${goal.id}/contribute`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
          body: JSON.stringify({ amount: numericAmount }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        toast(data.message || "Failed to add money", { type: "error" });
        return;
      }
      toast(
        `${formatNaira(numericAmount).replace("NGN", "₦")} added to ${goal.title}`,
        { type: "success" },
      );
      onSuccess();
    } catch {
      toast("Network error. Please try again.", { type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={(e) => {
          e.stopPropagation();
          if (!submitting) onClose();
        }}
      />
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative">
          <button
            onClick={onClose}
            disabled={submitting}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-all duration-200 disabled:opacity-50"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>

          <div className="p-6">
            <h2 className="text-lg font-bold text-[#0f172a] leading-tight mb-1">
              Add to {goal.title}
            </h2>
            <p className="text-sm text-[#475569] mb-6">
              You have {formatNaira(unallocatedSavings).replace("NGN", "₦")}{" "}
              available in unallocated savings
            </p>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-700">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium">
                  ₦
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  max={unallocatedSavings}
                  step="0.01"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pl-8 text-sm transition-all placeholder:text-slate-400 focus:border-[#4f46e5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/10"
                  autoFocus
                />
              </div>
              {exceedsAvailable && (
                <p className="text-xs text-red-500">
                  Amount exceeds what&apos;s available
                </p>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!isValid || submitting}
              className="mt-6 w-full py-3.5 rounded-2xl bg-[#4f46e5] text-white font-semibold text-sm hover:bg-[#4338ca] transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting
                ? "Adding..."
                : `Add ${formatNaira(numericAmount).replace("NGN", "₦")}`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContributeToGoalModal;

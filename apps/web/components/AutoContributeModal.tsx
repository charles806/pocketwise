"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

interface AutoContributeModalProps {
  goal: {
    id: string;
    title: string;
    autoContribute: boolean;
    weeklyAmount: string | null;
  };
  onClose: () => void;
  onSuccess: () => void;
}

const AutoContributeModal = ({
  goal,
  onClose,
  onSuccess,
}: AutoContributeModalProps) => {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const [autoContribute, setAutoContribute] = useState(goal.autoContribute);
  const [weeklyAmount, setWeeklyAmount] = useState(goal.weeklyAmount ?? "");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [submitting, onClose]);

  const weeklyAmountNum = Number(weeklyAmount) || 0;
  const isValid = !autoContribute || weeklyAmountNum > 0;

  const handleSave = async () => {
    if (!accessToken || !isValid) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/savings-goals/${goal.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify({
          autoContribute,
          ...(autoContribute && weeklyAmountNum > 0
            ? { weeklyAmount: weeklyAmountNum }
            : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.message || "Failed to update auto-save settings", {
          type: "error",
        });
        return;
      }
      toast("Auto-save settings updated", { type: "success" });
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
              Auto-save: {goal.title}
            </h2>
            <p className="text-sm text-[#475569] mb-6">
              Automatically move money into this goal every week from your
              unallocated savings
            </p>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 mb-5">
              <span className="text-sm font-semibold text-slate-900">
                Auto-save weekly
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={autoContribute}
                onClick={() => {
                  setAutoContribute(!autoContribute);
                  if (autoContribute) setWeeklyAmount("");
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${autoContribute ? "bg-[#4f46e5]" : "bg-slate-300"}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${autoContribute ? "translate-x-6" : "translate-x-1"}`}
                />
              </button>
            </div>

            {autoContribute && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-700">
                  Weekly Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium">
                    ₦
                  </span>
                  <input
                    type="number"
                    value={weeklyAmount}
                    onChange={(e) => setWeeklyAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pl-8 text-sm transition-all placeholder:text-slate-400 focus:border-[#4f46e5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/10"
                    autoFocus
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                disabled={submitting}
                className="flex-1 rounded-xl border border-slate-200 px-3 py-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 active:scale-95 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!isValid || submitting}
                className="flex-1 rounded-xl bg-[#4f46e5] px-3 py-3 text-xs font-semibold text-white transition-colors hover:bg-[#4338ca] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AutoContributeModal;

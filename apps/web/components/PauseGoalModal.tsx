"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

interface PauseGoalModalProps {
  goal: {
    id: string;
    title: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

const PauseGoalModal = ({ goal, onClose, onSuccess }: PauseGoalModalProps) => {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [submitting, onClose]);

  const handlePause = async () => {
    if (!accessToken) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/savings-goals/${goal.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify({ status: "PAUSED" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.message || "Failed to pause goal", { type: "error" });
        return;
      }
      toast("Goal paused", { type: "success" });
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
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-all duration-200 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>

          <div className="p-6">
            <h2 className="text-lg font-bold text-[#0f172a] leading-tight mb-6">
              Are you sure you want to pause this goal: {goal.title}?
            </h2>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={submitting}
                className="flex-1 rounded-xl border border-slate-200 px-3 py-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 active:scale-95 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                No, don&apos;t pause
              </button>
              <button
                onClick={handlePause}
                disabled={submitting}
                className="flex-1 rounded-xl bg-[#4f46e5] px-3 py-3 text-xs font-semibold text-white transition-colors hover:bg-[#4338ca] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? "Pausing..." : "Yes, pause"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PauseGoalModal;
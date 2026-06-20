"use client";
import { useState, useEffect } from "react";
import { X, ShieldAlert, Unlock, Loader2 } from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import { useToast } from "../../../../context/ToastContext";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

interface EmergencyUnlockModalProps {
  onDone: () => void;
  onClose: () => void;
}

const EmergencyUnlockModal = ({
  onDone,
  onClose,
}: EmergencyUnlockModalProps) => {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedReason, setSubmittedReason] = useState("");

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [submitting, onClose]);

  const isValidReason = reason.trim().length >= 10;

  const handleBackdrop = () => {
    if (!submitting) onClose();
  };

  const handleSubmit = async () => {
    if (!accessToken || !isValidReason) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/v1/wallets/emergency-unlock/request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
          body: JSON.stringify({ reason: reason.trim() }),
        },
      );

      if (res.ok) {
        setSubmittedReason(reason.trim());
        setStep(4);
        return;
      }

      if (res.status === 409) {
        const statusRes = await fetch(
          `${API_BASE}/api/v1/wallets/emergency-unlock/status`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            credentials: "include",
          },
        );
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (statusData.isUnlocked) {
            setSubmittedReason(reason.trim());
            setStep(4);
            return;
          }
        }
        const body = await res.json();
        toast(body.message || "Unlock already requested", { type: "error" });
        return;
      }

      const errorData = await res.json();
      toast(errorData.message || "Failed to request unlock", { type: "error" });
    } catch {
      toast("Network error. Please try again.", { type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const canShowClose = step < 4 && !submitting;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={(e) => {
          e.stopPropagation();
          handleBackdrop();
        }}
      />
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-slideUp relative"
          style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.15)" }}
        >
          {canShowClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-all duration-200"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}

          {step === 1 && (
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center mb-4">
                <ShieldAlert className="w-7 h-7 text-rose-500" />
              </div>
              <h2 className="text-lg font-bold text-[#0f172a] leading-tight mb-2">
                Unlock Emergency Wallet
              </h2>
              <p className="text-sm text-[#475569] leading-relaxed mb-6">
                This money is meant for real emergencies. You&apos;ll need to
                tell us why before you can access it.
              </p>
              <button
                onClick={() => setStep(2)}
                className="w-full py-3.5 rounded-2xl bg-[#4f46e5] text-white font-semibold text-sm hover:bg-[#4338ca] transition-all duration-200 active:scale-[0.98]"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="p-6">
              <h2 className="text-lg font-bold text-[#0f172a] leading-tight mb-4">
                What&apos;s the emergency?
              </h2>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                placeholder="Briefly describe what happened..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-[#4f46e5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/10 resize-none"
              />
              {reason.trim().length > 0 && reason.trim().length < 10 && (
                <p className="text-xs text-red-500 mt-1.5">
                  Please enter at least 10 characters
                </p>
              )}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3.5 rounded-2xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all duration-200 active:scale-[0.98]"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!isValidReason}
                  className="flex-1 py-3.5 rounded-2xl bg-[#4f46e5] text-white font-semibold text-sm hover:bg-[#4338ca] transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="p-6">
              <h2 className="text-lg font-bold text-[#0f172a] leading-tight mb-4">
                Confirm Unlock
              </h2>
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 mb-4">
                <p className="text-sm text-slate-700">{reason.trim()}</p>
              </div>
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 mb-6">
                <p className="text-xs text-amber-800">
                  Unlocking gives you one withdrawal from this wallet. It will
                  lock again automatically after you use it.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  disabled={submitting}
                  className="flex-1 py-3.5 rounded-2xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-3.5 rounded-2xl bg-[#4f46e5] text-white font-semibold text-sm hover:bg-[#4338ca] transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? "Unlocking..." : "Confirm & Unlock"}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <div className="animate-scaleIn">
                  <Unlock className="w-7 h-7 text-green-600" />
                </div>
              </div>
              <h2 className="text-lg font-bold text-[#0f172a] leading-tight mb-1">
                Emergency Wallet Unlocked
              </h2>
              <p className="text-sm text-[#475569] mb-4">
                You can now transfer from this wallet.
              </p>
              <div className="w-full text-left mb-6">
                <p className="text-xs uppercase tracking-wide text-slate-400 mb-1.5">
                  Your reason
                </p>
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                  <p className="text-sm text-slate-700">{submittedReason}</p>
                </div>
              </div>
              <button
                onClick={onDone}
                className="w-full py-3.5 rounded-2xl bg-[#4f46e5] text-white font-semibold text-sm hover:bg-[#4338ca] transition-all duration-200 active:scale-[0.98]"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EmergencyUnlockModal;

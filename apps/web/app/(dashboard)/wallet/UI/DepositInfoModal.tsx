"use client";
import { useState } from "react";
import { Copy, Check, X, Landmark } from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";

interface DepositInfoModalProps {
  open: boolean;
  onClose: () => void;
}

export const DepositInfoModal = ({ open, onClose }: DepositInfoModalProps) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const copyNumber = async () => {
    if (!user?.accountNumber) return;
    try {
      await navigator.clipboard.writeText(user.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — ignore
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0">
        <div
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-slideUp"
          style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.15)" }}
        >
          <div className="flex items-start justify-between p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#eef2ff] flex items-center justify-center">
                <Landmark className="w-5 h-5 text-[#4f46e5]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0f172a] leading-tight">
                  Add Money
                </h2>
                <p className="text-sm text-[#475569] mt-1">
                  Transfer to this account to fund your wallet.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 pb-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">
                  Bank Name
                </p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">
                  {user?.bankName || "PocketWise"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">
                  Account Name
                </p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">
                  {user?.accountName ||
                    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ||
                    "—"}
                </p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">
                    Account Number
                  </p>
                  <p className="text-sm font-semibold font-mono tracking-wider text-slate-900 mt-0.5">
                    {user?.accountNumber}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={copyNumber}
                  className="inline-flex items-center gap-1.5 shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 pt-4">
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm text-white transition-all duration-200 active:scale-[0.98]"
              style={{ backgroundColor: "#4f46e5" }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

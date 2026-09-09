"use client";
import { useState, useEffect } from "react";
import { CheckCircle2, Copy, Check, X, Loader2 } from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

export const AccountReadyModal = () => {
  const { user, accessToken, isLoading, refreshUser } = useAuth();
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    if (
      !isLoading &&
      user &&
      user.showAccountModal &&
      user.accountNumber
    ) {
      const timer = setTimeout(() => setVisible(true), 400);
      return () => clearTimeout(timer);
    }
  }, [user, isLoading]);

  if (!visible) return null;

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

  const handleDismiss = async () => {
    if (dismissing) return;
    setDismissing(true);
    try {
      await fetch(`${API_BASE}/api/v1/kyc/dismiss-account-modal`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });
      await refreshUser();
    } catch {
      // best-effort — modal can still be closed
    } finally {
      setVisible(false);
      setDismissing(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={handleDismiss}
      />
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0">
        <div
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-slideUp"
          style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.15)" }}
        >
          <div className="p-6 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-lg font-bold text-[#0f172a] leading-tight">
              Your account is ready
            </h2>
            <p className="text-sm text-[#475569] mt-1">
              Your identity has been verified. Use these details to receive
              money into your PocketWise wallet.
            </p>
          </div>

          <div className="px-6 pb-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">
                  Bank Name
                </p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">
                  {user?.bankName || user?.accountName
                    ? user?.bankName || "PocketWise"
                    : "PocketWise"}
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
              onClick={handleDismiss}
              disabled={dismissing}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ backgroundColor: "#4f46e5" }}
            >
              {dismissing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
              {dismissing ? "Closing..." : "Done"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

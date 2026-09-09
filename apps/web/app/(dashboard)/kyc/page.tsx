"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { WalletHeader } from "../wallet/UI/Header";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import {
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Copy,
  Check,
  ArrowRight,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

const KycContent = () => {
  const router = useRouter();
  const { user, accessToken, refreshUser } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const fromDeposit = searchParams.get("from") === "deposit";

  const [bvn, setBvn] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [bvnError, setBvnError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [approved, setApproved] = useState(false);
  const [accountData, setAccountData] = useState<{
    accountNumber?: string;
    bankName?: string;
    accountName?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const kycTier = (user as any)?.kycTier ?? 0;

  if (kycTier >= 1) {
    return (
      <>
        <WalletHeader />
        <main
          className="min-h-screen mt-5! flex flex-col gap-5 sm:gap-8 pb-10 sm:pb-16"
          style={{ backgroundColor: "#f8fafc" }}
        >
          <div className="max-w-md mx-auto w-full px-4">
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_4px_24px_rgba(15,23,42,0.06)] p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-9 h-9 text-emerald-600" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">
                Identity Verified
              </h1>
              <p className="text-sm text-slate-500 mt-2">
                Your identity has been verified successfully. You now have full
                access to all PocketWise features.
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  const handleBvnChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    setBvn(digits);
    if (digits.length === 11) setBvnError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (bvn.length !== 11) {
      setBvnError("BVN must be exactly 11 digits");
      return;
    }
    if (!dateOfBirth) {
      toast("Please select your date of birth", { type: "error" });
      return;
    }
    if (!gender) {
      toast("Please select your gender", { type: "error" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/kyc/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify({ bvn, dateOfBirth, gender }),
      });

      const body = await res.json();

      if (!res.ok) {
        toast(body.message || "Verification failed. Please try again later.", {
          type: "error",
        });
        return;
      }

      setSubmitted(true);

      // If Anchor approved within the poll window, the response includes the
      // account details — reveal them immediately.
      if (body.data?.kycTier >= 1) {
        setApproved(true);
        setAccountData({
          accountNumber: body.data.accountNumber,
          bankName: body.data.bankName,
          accountName: body.data.accountName,
        });
      }

      await refreshUser();
    } catch {
      toast("Verification failed. Please try again later.", {
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyNumber = async () => {
    if (!accountData?.accountNumber) return;
    try {
      await navigator.clipboard.writeText(accountData.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — ignore
    }
  };

  return (
    <>
      <WalletHeader />
      <main
        className="min-h-screen mt-5! flex flex-col gap-5 sm:gap-8 pb-10 sm:pb-16"
        style={{ backgroundColor: "#f8fafc" }}
      >
        <div className="max-w-md mx-auto w-full px-4">
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_4px_24px_rgba(15,23,42,0.06)] p-6 sm:p-8">
            <h1 className="text-xl font-bold text-slate-900">
              Verify Your Identity
            </h1>
            <p className="text-sm text-slate-500 mt-1 mb-6">
              {fromDeposit
                ? "Verify your identity to start depositing money"
                : searchParams.get("from") === "transfer"
                  ? "Verify your identity to start sending money"
                  : "Confirm your details to unlock full access"}
            </p>

            {approved ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-700 flex gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
                  <p>
                    Your identity has been verified successfully. Money can now
                    be moved in and out of your wallet.
                  </p>
                </div>

                {accountData?.accountNumber && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase">
                        Bank Name
                      </p>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5">
                        {accountData.bankName || "PocketWise"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase">
                        Account Name
                      </p>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5">
                        {accountData.accountName ||
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
                          {accountData.accountNumber}
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
                )}

                <button
                  onClick={() => router.push("/wallet")}
                  className="w-full flex items-center justify-center gap-2 bg-[#4f46e5] text-white rounded-xl py-3 font-semibold text-sm transition-all hover:bg-[#4338ca] active:scale-[0.99]"
                >
                  Go to Wallet
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : submitted ? (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-700 flex gap-3">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
                <p>
                  Verification submitted. We'll notify you once your identity
                  is confirmed — this usually takes a few minutes.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    BVN
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="11-digit BVN"
                    value={bvn}
                    onChange={(e) => handleBvnChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm tracking-widest transition-all placeholder:text-slate-400 focus:border-[#4f46e5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/10"
                  />
                  {bvnError && (
                    <p className="text-xs text-red-600 mt-1">{bvnError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    max={today}
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all placeholder:text-slate-400 focus:border-[#4f46e5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-[#4f46e5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/10 cursor-pointer"
                  >
                    <option value="" disabled>
                      Select gender
                    </option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex gap-3">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Your full name and phone number must exactly match the
                    details on your BVN record. Mismatches will cause
                    verification to fail.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#4f46e5] text-white rounded-xl py-3 font-semibold text-sm transition-all hover:bg-[#4338ca] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading
                    ? "Verifying... this may take a few seconds"
                    : "Submit for Verification"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

const Kyc = () => (
  <Suspense
    fallback={
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#f8fafc" }}
      >
        <Loader2 className="h-6 w-6 animate-spin text-[#4f46e5]" />
      </main>
    }
  >
    <KycContent />
  </Suspense>
);

export default Kyc;

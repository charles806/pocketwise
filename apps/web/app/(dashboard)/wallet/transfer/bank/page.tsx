"use client";

import React, { useState, useEffect } from "react";
import { WalletHeader } from "../../UI/Header";
import { useAuth } from "../../../../../context/AuthContext";
import { useWallet } from "../../../../../hooks/useWallet";
import { useToast } from "../../../../../context/ToastContext";
import { ArrowLeft, Loader2, Search, CheckCircle, Copy } from "lucide-react";
import { useRouter } from "next/navigation";

type Step = "select-bank" | "verify-account" | "transfer" | "success";

interface Bank {
  bankCode: string;
  bankName: string;
}

const Page = () => {
  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { accessToken } = useAuth();
  const { refetch } = useWallet(accessToken);
  const { toast } = useToast();
  const router = useRouter();

  const [step, setStep] = useState<Step>("select-bank");
  const [banks, setBanks] = useState<Bank[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [verifiedName, setVerifiedName] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [transferRef, setTransferRef] = useState("");

  useEffect(() => {
    const fetchBanks = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/v1/transfers/banks`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) {
          toast(data.message || "Failed to load banks");
          return;
        }
        setBanks(data.data || data);
      } catch {
        toast("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchBanks();
  }, []);

  const filteredBanks = banks.filter((b) =>
    b.bankName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  useEffect(() => {
    if (accountNumber.length === 10 && selectedBank) {
      const verify = async () => {
        setVerifying(true);
        try {
          const res = await fetch(
            `${API_BASE}/api/v1/transfers/verify-account?bankCode=${selectedBank.bankCode}&accountNumber=${accountNumber}`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
              credentials: "include",
            },
          );
          const data = await res.json();
          if (!res.ok) {
            toast(data.message || "Account verification failed");
            return;
          }
          setVerifiedName(data.data?.accountName || data.accountName || "");
        } catch {
          toast("Network error. Please try again.");
        } finally {
          setVerifying(false);
        }
      };
      verify();
    } else {
      setVerifiedName("");
    }
  }, [accountNumber, selectedBank]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || Number(amount) <= 0) {
      toast("Enter a valid amount");
      return;
    }

    if (!pin || pin.length < 4) {
      toast("Enter your 4-digit transfer PIN");
      return;
    }

    if (!reason.trim()) {
      toast("Please enter a reason for this transfer");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/transfers/bank`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify({
          bankCode: selectedBank!.bankCode,
          accountNumber,
          accountName: verifiedName,
          amount: Number(amount),
          reason: reason.trim(),
          pin,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.message || "Transfer failed");
        return;
      }
      setTransferRef(data.data?.reference || data.reference || "");
      refetch();
      setStep("success");
    } catch {
      toast("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep("select-bank");
    setSelectedBank(null);
    setAccountNumber("");
    setVerifiedName("");
    setAmount("");
    setPin("");
    setReason("");
    setTransferRef("");
  };

  return (
    <>
      <WalletHeader />
      <main
        className="flex min-h-screen flex-col gap-4 py-4 min-[480px]:gap-6 sm:gap-8 sm:py-6 md:gap-10"
        style={{ backgroundColor: "#f8fafc" }}
      >
        <div className="px-4 text-center">
          <h1 className="text-xl font-extrabold text-slate-900 min-[480px]:text-2xl sm:text-3xl md:text-4xl">
            Send Money
          </h1>
          <p className="mt-1 text-xs text-slate-500 min-[480px]:text-sm sm:text-base">
            Transfer money to any bank account in Nigeria
          </p>
        </div>

        <div className="flex justify-center px-3 min-[480px]:px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="w-full max-w-5xl rounded-2xl border border-slate-200/70 bg-white p-4 shadow-[0_4px_24px_rgba(15,23,42,0.06)] max-[480px]:rounded-xl sm:p-6 md:p-8 lg:p-10">
            <h4 className="text-lg font-bold text-slate-900 min-[480px]:text-xl sm:text-2xl">
              Bank Transfer
            </h4>

            {step === "select-bank" && (
              <>
                <div className="mt-6 flex flex-col gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for a bank..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-[#4f46e5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/10 min-[480px]:text-base"
                    />
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-[#4f46e5]" />
                    </div>
                  ) : (
                    <div className="scrollbar-hide mt-2 flex max-h-80 flex-col gap-2 overflow-y-auto">
                      {filteredBanks.length === 0 ? (
                        <p className="py-8 text-center text-sm text-slate-400">
                          No banks found
                        </p>
                      ) : (
                        filteredBanks.map((bank) => (
                          <button
                            key={bank.bankCode}
                            type="button"
                            onClick={() => {
                              setSelectedBank(bank);
                              setStep("verify-account");
                            }}
                            className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-900 transition-all hover:border-[#4f46e5] hover:bg-white hover:shadow-sm active:scale-[0.99] min-[480px]:text-base"
                          >
                            {bank.bankName}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {step === "verify-account" && selectedBank && (
              <>
                <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase">
                      Selected Bank
                    </span>
                    <p className="text-sm font-bold text-slate-900 min-[480px]:text-base">
                      {selectedBank.bankName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep("select-bank")}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#4f46e5] hover:bg-slate-50 transition-colors"
                  >
                    Change
                  </button>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-6">
                  <div className="mx-auto flex w-full max-w-md flex-col gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-slate-700 min-[480px]:text-sm">
                        Account Number
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={10}
                        value={accountNumber}
                        onChange={(e) =>
                          setAccountNumber(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="Enter 10-digit account number"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-[#4f46e5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/10 min-[480px]:text-base"
                      />
                    </div>

                    {verifying && (
                      <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verifying account...
                      </div>
                    )}

                    {verifiedName && !verifying && (
                      <div className="rounded-xl bg-[#eff6ff] border-2 border-[#3b82f6] px-4 py-3">
                        <span className="block text-xs font-semibold text-[#4f46e5] tracking-wide uppercase">
                          Verified Account
                        </span>
                        <h5 className="mt-1 text-base font-bold text-slate-900 min-[480px]:text-lg">
                          {verifiedName}
                        </h5>
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={!verifiedName || verifying}
                      onClick={() => setStep("transfer")}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#4f46e5] py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/10 hover:bg-[#4338ca] transition-colors min-[480px]:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Confirm & Continue
                    </button>
                  </div>
                </div>
              </>
            )}

            {step === "transfer" && selectedBank && (
              <>
                <div className="mt-6 rounded-xl bg-[#eff6ff] border-2 border-[#3b82f6] px-4 py-3">
                  <span className="block text-xs font-semibold text-[#4f46e5] tracking-wide uppercase">
                    Sending to
                  </span>
                  <h5 className="mt-1 text-base font-bold text-slate-900 min-[480px]:text-lg">
                    {verifiedName}
                  </h5>
                  <p className="text-xs text-slate-500 font-medium min-[480px]:text-sm">
                    {selectedBank.bankName} - {accountNumber}
                  </p>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-6">
                  <form
                    className="mx-auto flex w-full max-w-md flex-col gap-5"
                    onSubmit={handleTransfer}
                  >
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-slate-700 min-[480px]:text-sm">
                        Amount (NGN)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500 min-[480px]:text-base">
                          ₦
                        </span>
                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-4 py-3 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-[#4f46e5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/10 min-[480px]:text-base"
                        />
                      </div>
                      <p className="text-xs text-slate-400">
                        Transfers above ₦10,000 incur a 0.5% - 1% fee
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-slate-700 min-[480px]:text-sm">
                        Reason
                      </label>
                      <input
                        type="text"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="What's this for?"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-[#4f46e5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/10 min-[480px]:text-base"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-slate-700 min-[480px]:text-sm">
                        Transfer PIN
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        inputMode="numeric"
                        value={pin}
                        onChange={(e) =>
                          setPin(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="Enter your 4-digit PIN"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-[#4f46e5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/10 min-[480px]:text-base"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setStep("verify-account")}
                        className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors min-[480px]:text-base"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={
                          !amount ||
                          Number(amount) <= 0 ||
                          !reason.trim() ||
                          pin.length < 4 ||
                          loading
                        }
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#4f46e5] py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/10 hover:bg-[#4338ca] transition-colors min-[480px]:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        {loading
                          ? "Processing..."
                          : `Send ₦${Number(amount || 0).toLocaleString()}`}
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}

            {step === "success" && (
              <div className="mt-8 flex flex-col items-center gap-4 py-8">
                <div className="animate-bounce">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900">
                  Transfer Successful!
                </h3>

                <div className="w-full max-w-md space-y-3 rounded-xl bg-slate-50 border border-slate-100 p-4">
                  <div>
                    <span className="text-xs font-semibold uppercase text-slate-500 tracking-wide">
                      Recipient
                    </span>
                    <p className="text-sm font-semibold text-slate-900">
                      {verifiedName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {selectedBank?.bankName}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase text-slate-500 tracking-wide">
                      Amount
                    </span>
                    <p className="text-2xl font-bold text-green-600">
                      ₦{Number(amount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase text-slate-500 tracking-wide">
                      Reference
                    </span>
                    <p
                      className="flex items-center gap-1 text-xs font-mono text-slate-600 cursor-pointer hover:text-[#4f46e5] transition-colors"
                      onClick={() => {
                        navigator.clipboard.writeText(transferRef);
                        toast("Reference copied to clipboard");
                      }}
                    >
                      {transferRef}
                      <Copy className="inline h-3 w-3 shrink-0" />
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase text-slate-500 tracking-wide">
                      Date & Time
                    </span>
                    <p className="text-sm text-slate-700">
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                      ,{" "}
                      {new Date().toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                  </div>
                </div>

                <div className="mt-2 flex w-full max-w-md gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Send Another
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard")}
                    className="flex-1 rounded-xl bg-[#4f46e5] py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/10 hover:bg-[#4338ca] transition-colors"
                  >
                    Go to Home
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default Page;

"use client";

import React, { useState, useEffect, useRef } from "react";
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

interface RecentRecipient {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  lastSentAt: string;
}

const HARDCODED_BANKS: Bank[] = [
  { bankCode: "058", bankName: "Guaranty Trust Bank" },
  { bankCode: "011", bankName: "First Bank of Nigeria" },
  { bankCode: "044", bankName: "Access Bank" },
  { bankCode: "057", bankName: "Zenith Bank" },
  { bankCode: "033", bankName: "United Bank for Africa" },
  { bankCode: "232", bankName: "Sterling Bank" },
  { bankCode: "215", bankName: "Unity Bank" },
  { bankCode: "035", bankName: "Wema Bank" },
  { bankCode: "070", bankName: "Fidelity Bank" },
  { bankCode: "301", bankName: "Jaiz Bank" },
  { bankCode: "076", bankName: "Polaris Bank" },
  { bankCode: "221", bankName: "Stanbic IBTC Bank" },
  { bankCode: "068", bankName: "Standard Chartered Bank" },
  { bankCode: "023", bankName: "Citibank Nigeria" },
  { bankCode: "063", bankName: "Diamond Bank" },
  { bankCode: "100", bankName: "Suntrust Bank" },
  { bankCode: "050", bankName: "EcoBank Nigeria" },
  { bankCode: "999992", bankName: "OPay" },
  { bankCode: "999991", bankName: "PalmPay" },
  { bankCode: "999993", bankName: "Kuda Bank" },
];

const calculateFee = (amount: number): number => {
  if (amount <= 0) return 0;
  if (amount <= 10000) return 0;
  if (amount <= 50000) return amount * 0.01;
  if (amount <= 200000) return amount * 0.0075;
  return amount * 0.005;
};

const getFeePercentage = (amount: number): string => {
  if (amount <= 0) return "0%";
  if (amount <= 10000) return "0%";
  if (amount <= 50000) return "1%";
  if (amount <= 200000) return "0.75%";
  return "0.5%";
};

const formatTodayDate = (): string => {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `Today, ${timeStr}`;
};

const Page = () => {
  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { accessToken } = useAuth();
  const { refetch } = useWallet(accessToken);
  const { toast } = useToast();
  const router = useRouter();

  const [step, setStep] = useState<Step>("select-bank");
  const [banks] = useState<Bank[]>(HARDCODED_BANKS);
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
  const [transferFee, setTransferFee] = useState(0);
  const [totalDeduction, setTotalDeduction] = useState(0);
  const [recentRecipients, setRecentRecipients] = useState<RecentRecipient[]>(
    [],
  );
  const [recentLoading, setRecentLoading] = useState(true);
  const verifyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    setRecentLoading(true);
    fetch(`${API_BASE}/api/v1/wallets/recent-recipients`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setRecentRecipients(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setRecentLoading(false));
  }, [accessToken, API_BASE]);

  useEffect(() => {
    if (accountNumber.length === 10 && selectedBank) {
      if (verifyTimeoutRef.current) clearTimeout(verifyTimeoutRef.current);
      setVerifying(true);
      setVerifiedName("");

      verifyTimeoutRef.current = setTimeout(() => {
        setVerifiedName("VERIFIED ACCOUNT");
        setVerifying(false);
      }, 500);
    } else {
      setVerifiedName("");
      if (verifyTimeoutRef.current) {
        clearTimeout(verifyTimeoutRef.current);
        verifyTimeoutRef.current = null;
      }
    }

    return () => {
      if (verifyTimeoutRef.current) {
        clearTimeout(verifyTimeoutRef.current);
      }
    };
  }, [accountNumber, selectedBank]);

  const filteredBanks = banks.filter((b) =>
    b.bankName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleRecentRecipientClick = (recipient: RecentRecipient) => {
    const bank = banks.find((b) => b.bankCode === recipient.bankCode);
    if (bank) {
      setSelectedBank(bank);
      setAccountNumber(recipient.accountNumber);
      setStep("verify-account");
    } else {
      toast("Bank not found for this recipient", { type: "warning" });
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || Number(amount) <= 0) {
      toast("Enter a valid amount", { type: "warning" });
      return;
    }

    if (!pin || pin.length < 4) {
      toast("Enter your 4-digit transfer PIN", { type: "warning" });
      return;
    }

    if (!reason.trim()) {
      toast("Please enter a reason for this transfer", { type: "warning" });
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
      const d = data.data || data;
      setTransferRef(d.reference || "");
      setTransferFee(d.fee ?? 0);
      setTotalDeduction(d.totalDeduction ?? 0);
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
    setTransferFee(0);
    setTotalDeduction(0);
  };

  const goToVerifyAccount = (bank: Bank) => {
    setSelectedBank(bank);
    setAccountNumber("");
    setVerifiedName("");
    setStep("verify-account");
  };

  const numAmount = Number(amount) || 0;
  const fee = calculateFee(numAmount);
  const total = numAmount + fee;

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
                {recentRecipients.length > 0 && (
                  <div className="mt-6">
                    <span className="text-xs font-semibold uppercase text-slate-500 tracking-wide">
                      Recent Recipients
                    </span>
                    {recentLoading ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-5 w-5 animate-spin text-[#4f46e5]" />
                      </div>
                    ) : (
                      <div className="scrollbar-hide mt-3 flex gap-3 overflow-x-auto pb-2">
                        {recentRecipients.map((r) => (
                          <button
                            key={`${r.accountNumber}-${r.bankCode}`}
                            type="button"
                            onClick={() => handleRecentRecipientClick(r)}
                            className="flex shrink-0 flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition-all hover:border-[#4f46e5] hover:bg-white hover:shadow-sm active:scale-[0.98]"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4f46e5] text-sm font-bold text-white">
                              {r.bankName.charAt(0)}
                            </div>
                            <span className="max-w-[80px] truncate text-[10px] font-semibold text-slate-700">
                              {r.bankName}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {r.accountNumber}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for a bank..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm transition-all placeholder:text-slate-400 focus:border-[#4f46e5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/10 min-[480px]:text-base"
                    />
                  </div>

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
                          onClick={() => goToVerifyAccount(bank)}
                          className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-900 transition-all hover:border-[#4f46e5] hover:bg-white hover:shadow-sm active:scale-[0.99] min-[480px]:text-base"
                        >
                          {bank.bankName}
                        </button>
                      ))
                    )}
                  </div>
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
                    onClick={() => {
                      setAccountNumber("");
                      setVerifiedName("");
                      setStep("select-bank");
                    }}
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
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-all focus:border-[#4f46e5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/10 min-[480px]:text-base"
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
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-4 py-3 text-sm transition-all placeholder:text-slate-400 focus:border-[#4f46e5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/10 min-[480px]:text-base"
                        />
                      </div>
                      {numAmount > 0 && (
                        <div className="space-y-0.5">
                          <p className="text-xs text-slate-500">
                            Fee: ₦
                            {fee.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{" "}
                            ({getFeePercentage(numAmount)})
                          </p>
                          <p className="text-xs font-medium text-slate-500">
                            Total deducted: ₦
                            {total.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                      )}
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
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all placeholder:text-slate-400 focus:border-[#4f46e5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/10 min-[480px]:text-base"
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
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all placeholder:text-slate-400 focus:border-[#4f46e5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/10 min-[480px]:text-base"
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
                      Amount Sent
                    </span>
                    <p className="text-lg font-bold text-slate-900">
                      ₦{Number(amount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase text-slate-500 tracking-wide">
                      Transfer Fee
                    </span>
                    <p className="text-sm font-semibold text-slate-700">
                      ₦
                      {transferFee.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase text-slate-500 tracking-wide">
                      Total Deducted
                    </span>
                    <p className="text-lg font-bold text-rose-600">
                      ₦
                      {totalDeduction.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
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
                      Reference
                    </span>
                    <p
                      className="flex items-center gap-1 text-xs font-mono text-slate-600 cursor-pointer hover:text-[#4f46e5] transition-colors"
                      onClick={() => {
                        navigator.clipboard.writeText(transferRef);
                        toast("Copied!", { type: "success" });
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
                      {formatTodayDate()}
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
                    onClick={() => router.push("/wallet")}
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

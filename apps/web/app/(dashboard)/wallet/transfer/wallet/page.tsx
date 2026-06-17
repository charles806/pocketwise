"use client";

import React, { useState, useEffect } from "react";
import { WalletHeader } from "../../UI/Header";
import { useAuth } from "../../../../../context/AuthContext";
import { useToast } from "../../../../../context/ToastContext";
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  Copy,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

type Step = "select" | "amount" | "success";

interface Wallet {
  id: string;
  type: string;
  balance: number;
}

const WALLET_META: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  spend: {
    label: "Spend Wallet",
    color: "#4f46e5",
    bg: "bg-[#4f46e5]",
  },
  savings: {
    label: "Savings Wallet",
    color: "#10b981",
    bg: "bg-[#10b981]",
  },
  emergency: {
    label: "Emergency Wallet",
    color: "#f43f5e",
    bg: "bg-[#f43f5e]",
  },
  flex: {
    label: "Flex Wallet",
    color: "#f59e0b",
    bg: "bg-[#f59e0b]",
  },
};

const Page = () => {
  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [step, setStep] = useState<Step>("select");
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [sourceWallet, setSourceWallet] = useState<Wallet | null>(null);
  const [destWallet, setDestWallet] = useState<Wallet | null>(null);
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [transferRef, setTransferRef] = useState("");

  useEffect(() => {
    const fetchWallets = async () => {
      setFetching(true);
      try {
        const res = await fetch(`${API_BASE}/api/v1/wallets`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) {
          toast(data.message || "Failed to load wallets");
          return;
        }
        setWallets(data.data?.wallets || data.wallets || data);
      } catch {
        toast("Network error. Please try again.");
      } finally {
        setFetching(false);
      }
    };
    fetchWallets();
  }, []);

  const handleWalletClick = (wallet: Wallet) => {
    if (!sourceWallet) {
      setSourceWallet(wallet);
      return;
    }

    if (sourceWallet && !destWallet) {
      if (wallet.id === sourceWallet.id) {
        toast("Source and destination wallets must be different");
        return;
      }
      setDestWallet(wallet);
    }
  };

  const handleResetSelection = () => {
    setSourceWallet(null);
    setDestWallet(null);
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || Number(amount) <= 0) {
      toast("Enter a valid amount");
      return;
    }

    if (Number(amount) < 1000) {
      toast("Minimum transfer amount is ₦1,000");
      return;
    }

    if (sourceWallet && Number(amount) > sourceWallet.balance) {
      toast("Insufficient balance");
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
      const res = await fetch(`${API_BASE}/api/v1/wallets/internal-transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify({
          fromType: sourceWallet!.type,
          toType: destWallet!.type,
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
      setStep("success");
    } catch {
      toast("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep("select");
    setSourceWallet(null);
    setDestWallet(null);
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
            Inter Wallet Transfer
          </h1>
          <p className="mt-1 text-xs text-slate-500 min-[480px]:text-sm sm:text-base">
            Move money between your wallets
          </p>
        </div>

        <div className="flex justify-center px-3 min-[480px]:px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="w-full max-w-5xl rounded-2xl border border-slate-200/70 bg-white p-4 shadow-[0_4px_24px_rgba(15,23,42,0.06)] max-[480px]:rounded-xl sm:p-6 md:p-8 lg:p-10">
            <h4 className="text-lg font-bold text-slate-900 min-[480px]:text-xl sm:text-2xl">
              {step === "select"
                ? "Select Wallets"
                : step === "amount"
                  ? "Enter Amount"
                  : "Transfer Complete"}
            </h4>

            {step === "select" && (
              <>
                {sourceWallet && !destWallet && (
                  <p className="mt-3 text-xs text-slate-500">
                    Select destination wallet
                  </p>
                )}
                {!sourceWallet && (
                  <p className="mt-3 text-xs text-slate-500">
                    Select source wallet
                  </p>
                )}

                {fetching ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-[#4f46e5]" />
                  </div>
                ) : (
                  <div className="mt-4 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2">
                    {wallets.map((wallet) => {
                      const meta = WALLET_META[wallet.type] || {
                        label: "Wallet",
                        color: "#6b7280",
                        bg: "bg-slate-500",
                      };
                      const isSource = sourceWallet?.id === wallet.id;
                      const isDest = destWallet?.id === wallet.id;
                      const selected = isSource || isDest;

                      return (
                        <button
                          key={wallet.id}
                          type="button"
                          onClick={() => handleWalletClick(wallet)}
                          disabled={
                            (!!sourceWallet && !!destWallet) ||
                            (!!sourceWallet && !destWallet && isSource)
                          }
                          className={`relative flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all active:scale-[0.98] ${
                            selected
                              ? `border-2 shadow-md`
                              : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                          } ${
                            isDest
                              ? "border-[#4f46e5] bg-primary-light"
                              : isSource
                                ? "border-slate-900 bg-slate-100"
                                : ""
                          } disabled:opacity-60 disabled:cursor-not-allowed`}
                        >
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-lg text-white text-xs font-bold ${meta.bg}`}
                          >
                            {wallet.type.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900">
                              {meta.label}
                            </span>
                            <span className="text-xs text-slate-500">
                              ₦{Number(wallet.balance).toLocaleString()}
                            </span>
                          </div>
                          {isSource && (
                            <span className="absolute right-3 top-3 rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                              SOURCE
                            </span>
                          )}
                          {isDest && (
                            <span className="absolute right-3 top-3 rounded-md bg-[#4f46e5] px-2 py-0.5 text-[10px] font-semibold text-white">
                              DEST
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {sourceWallet && destWallet && (
                  <div className="mt-6 border-t border-slate-100 pt-6">
                    <button
                      type="button"
                      onClick={() => setStep("amount")}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4f46e5] py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/10 hover:bg-[#4338ca] transition-colors min-[480px]:text-base"
                    >
                      Continue
                    </button>
                  </div>
                )}
              </>
            )}

            {step === "amount" && sourceWallet && destWallet && (
              <>
                <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-500 uppercase">
                      From
                    </span>
                    <p className="text-sm font-bold text-slate-900">
                      {WALLET_META[sourceWallet.type]?.label || "Wallet"}
                    </p>
                    <p className="text-xs text-slate-500">
                      Balance: ₦{Number(sourceWallet.balance).toLocaleString()}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400 shrink-0 mx-2" />
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-semibold text-slate-500 uppercase">
                      To
                    </span>
                    <p className="text-sm font-bold text-slate-900">
                      {WALLET_META[destWallet.type]?.label || "Wallet"}
                    </p>
                  </div>
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
                      {Number(amount) > sourceWallet.balance && (
                        <p className="text-xs text-red-500">
                          Amount exceeds your available balance
                        </p>
                      )}
                      {sourceWallet.type === "emergency" && (
                        <p className="text-xs text-rose-500">
                          Removing money from Emergency wallet requires 3
                          confirmations
                        </p>
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
                        onClick={handleResetSelection}
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
                          Number(amount) > sourceWallet.balance ||
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
                          : `Transfer ₦${Number(amount || 0).toLocaleString()}`}
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
                      Destination
                    </span>
                    <p className="text-sm font-semibold text-slate-900">
                      {destWallet
                        ? WALLET_META[destWallet.type]?.label || "Wallet"
                        : ""}
                    </p>
                    <p className="text-xs text-slate-500">
                      From{" "}
                      {sourceWallet
                        ? WALLET_META[sourceWallet.type]?.label || "Wallet"
                        : ""}
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

"use client";

import React, { useState, useEffect } from "react";
import { WalletHeader } from "../../UI/Header";
import { useAuth } from "../../../../../context/AuthContext";
import { useWallet } from "../../../../../hooks/useWallet";
import { CheckCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "../../../../../context/ToastContext";

type Step = "lookup" | "transfer" | "success";

interface Recipient {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
}

interface RecentRecipient {
  recipientUserId: string;
  recipientFirstName: string;
  recipientLastName: string;
  recipientUserName: string;
  lastSentAt: string;
}

const Page = () => {
  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { accessToken } = useAuth();
  const { refetch } = useWallet(accessToken);
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("lookup");
  const [activeTab, setActiveTab] = useState("account");
  const [inputValue, setInputValue] = useState("");
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [transferRef, setTransferRef] = useState("");
  const [recentRecipients, setRecentRecipients] = useState<RecentRecipient[]>(
    [],
  );
  const [recentLoading, setRecentLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    setRecentLoading(true);
    fetch(`${API_BASE}/api/v1/wallets/recent-p2p-recipients`, {
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

  const formConfig = {
    account: {
      label: "Account Number",
      type: "number",
      placeholder: "Enter Account Number",
      name: "accountNumber",
    },
    phone: {
      label: "Phone Number",
      type: "tel",
      placeholder: "Enter phone number",
      name: "phoneNumber",
    },
    username: {
      label: "Username",
      type: "text",
      placeholder: "Enter @username",
      name: "username",
    },
  };

  const currentInput =
    formConfig[activeTab as keyof typeof formConfig] || formConfig.account;

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setInputValue("");
  };

  const handleLookup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/v1/auth/lookup?type=${activeTab}&value=${encodeURIComponent(inputValue.trim())}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
        },
      );

      const data = await res.json();

      if (!res.ok) {
        toast(data.message || "Recipient not found");
        return;
      }

      setRecipient(data.data);
      setStep("transfer");
    } catch {
      toast("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent<HTMLFormElement>) => {
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
      const res = await fetch(`${API_BASE}/api/v1/wallets/transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify({
          receiverUserId: recipient!.id,
          amount: Number(amount),
          reason: reason.trim() || undefined,
          pin,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast(data.message || "Transfer failed");
        return;
      }

      setTransferRef(data.data?.reference || "");
      refetch();
      setStep("success");
    } catch {
      toast("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep("lookup");
    setInputValue("");
    setAmount("");
    setPin("");
    setReason("");
    setRecipient(null);
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
            Transfer money to other pocketwise accounts
          </p>
        </div>

        <div className="flex justify-center px-3 min-[480px]:px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="w-full max-w-5xl rounded-2xl border border-slate-200/70 bg-white p-4 shadow-[0_4px_24px_rgba(15,23,42,0.06)] max-[480px]:rounded-xl sm:p-6 md:p-8 lg:p-10">
            <h4 className="text-lg font-bold text-slate-900 min-[480px]:text-xl sm:text-2xl">
              Pocketwise to Pocketwise
            </h4>

            {step === "lookup" && (
              <>
                <div className="scrollbar-hide mt-4 flex gap-2 overflow-x-auto pb-1 max-[480px]:w-full min-[480px]:gap-3 md:justify-center md:gap-4">
                  <button
                    type="button"
                    onClick={() => handleTabChange("account")}
                    className={`active:scale-95 flex h-9 w-auto shrink-0 items-center justify-center rounded-2xl border px-3 transition-all duration-200 min-[480px]:px-4 md:h-10 md:px-5 ${
                      activeTab === "account"
                        ? "bg-[#4f46e5] border-[#4f46e5] text-white"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span className="whitespace-nowrap text-center text-xs font-medium min-[480px]:text-sm md:text-base">
                      Account Number
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabChange("phone")}
                    className={`active:scale-95 flex h-9 w-auto shrink-0 items-center justify-center rounded-2xl border px-3 transition-all duration-200 min-[480px]:px-4 md:h-10 md:px-5 ${
                      activeTab === "phone"
                        ? "bg-[#4f46e5] border-[#4f46e5] text-white"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span className="whitespace-nowrap text-center text-xs font-medium min-[480px]:text-sm md:text-base">
                      Phone Number
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabChange("username")}
                    className={`active:scale-95 flex h-9 w-auto shrink-0 items-center justify-center rounded-2xl border px-3 transition-all duration-200 min-[480px]:px-4 md:h-10 md:px-5 ${
                      activeTab === "username"
                        ? "bg-[#4f46e5] border-[#4f46e5] text-white"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span className="whitespace-nowrap text-center text-xs font-medium min-[480px]:text-sm md:text-base">
                      @username
                    </span>
                  </button>
                </div>

                <div className="mt-8 border-t border-slate-100 pt-6">
                  <form
                    className="mx-auto flex w-full max-w-md flex-col gap-5"
                    onSubmit={handleLookup}
                  >
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-slate-700 min-[480px]:text-sm">
                        {currentInput.label}
                      </label>
                      <input
                        type={currentInput.type}
                        name={currentInput.name}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={currentInput.placeholder}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all placeholder:text-slate-400 focus:border-[#4f46e5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/10 min-[480px]:text-base"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={inputValue.trim() === "" || loading}
                      className="mt-2 flex items-center justify-center gap-2 w-full rounded-xl bg-[#4f46e5] py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/10 hover:bg-[#4338ca] transition-colors min-[480px]:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                      {loading ? "Searching..." : "Continue"}
                    </button>
                  </form>
                </div>
              </>
            )}

            {step === "transfer" && recipient && (
              <>
                <div className="mt-6 rounded-xl bg-[#eff6ff] border-2 border-[#3b82f6] px-4 py-3">
                  <span className="block text-xs font-semibold text-[#4f46e5] tracking-wide uppercase">
                    Sending to
                  </span>
                  <h5 className="mt-1 text-base font-bold text-slate-900 min-[480px]:text-lg">
                    {recipient.firstName} {recipient.lastName}
                  </h5>
                  <p className="text-xs text-slate-500 font-medium min-[480px]:text-sm">
                    @{recipient.userName}
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
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all placeholder:text-slate-400 focus:border-[#4f46e5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/10 min-[480px]:text-base"
                      />
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
                        onClick={() => setStep("lookup")}
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
                <CheckCircle className="h-16 w-16 text-green-500" />
                <h3 className="text-xl font-bold text-slate-900">
                  Transfer Successful!
                </h3>
                {recipient && (
                  <p className="text-sm text-slate-500">
                    Sent to {recipient.firstName} {recipient.lastName}
                  </p>
                )}
                {transferRef && (
                  <p className="text-xs text-slate-400 font-mono">
                    Ref: {transferRef}
                  </p>
                )}
                <button
                  type="button"
                  onClick={resetForm}
                  className="mt-4 rounded-xl bg-[#4f46e5] px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#4338ca] transition-colors"
                >
                  Send Another Payment
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default Page;



"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { WalletHeader } from "../../wallet/UI/Header";
import { useAuth } from "../../../../context/AuthContext";
import { useToast } from "../../../../context/ToastContext";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

const Page = () => {
  const router = useRouter();
  const { accessToken } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [autoContribute, setAutoContribute] = useState(false);
  const [weeklyAmount, setWeeklyAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const minDate = new Date(Date.now() + 7 * 86400000)
    .toISOString()
    .split("T")[0];
  const maxDate = new Date(Date.now() + 365 * 86400000)
    .toISOString()
    .split("T")[0];

  const weeklyAmountNum = Number(weeklyAmount) || 0;
  const targetAmountNum = Number(targetAmount) || 0;
  const weeklyExceedsTarget =
    autoContribute && weeklyAmountNum > targetAmountNum && targetAmountNum > 0;
  const weeklyAmountValid = !autoContribute || weeklyAmountNum > 0;

  const canSubmit =
    title.trim().length > 0 &&
    targetAmountNum >= 1000 &&
    deadline !== "" &&
    weeklyAmountValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !accessToken) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/savings-goals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          targetAmount: targetAmountNum,
          deadline: new Date(deadline).toISOString(),
          autoContribute,
          ...(autoContribute && weeklyAmountNum > 0
            ? { weeklyAmount: weeklyAmountNum }
            : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast(data.message || "Failed to create goal", { type: "error" });
        return;
      }

      toast("Goal created!", { type: "success" });
      router.push("/goals");
    } catch {
      toast("Network error. Please try again.", { type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <WalletHeader />
      <main
        className="min-h-screen px-4 py-4 sm:px-6 sm:py-6"
        style={{ backgroundColor: "#f8fafc" }}
      >
        <div className="mx-auto max-w-md">
          <button
            onClick={() => router.push("/goals")}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors mb-6"
          >
            <ArrowLeft size={18} />
            Back to Goals
          </button>

          <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-[0_4px_24px_rgba(15,23,42,0.06)] sm:p-8">
            <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
              New Savings Goal
            </h1>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-700">
                  Goal Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. New Laptop, Rent, Emergency Trip"
                  maxLength={50}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all placeholder:text-slate-400 focus:border-[#4f46e5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/10"
                />
                <span className="self-end text-xs text-slate-400">
                  {title.length}/50
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-700">
                  Target Amount (NGN)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium">
                    ₦
                  </span>
                  <input
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="0.00"
                    min="1000"
                    step="0.01"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pl-8 text-sm transition-all placeholder:text-slate-400 focus:border-[#4f46e5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/10"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-700">
                  Deadline
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={minDate}
                  max={maxDate}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all text-slate-900 focus:border-[#4f46e5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/10"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-900">
                    Auto-save weekly
                  </span>
                  <span className="text-xs text-slate-500">
                    Automatically move money into this goal every week from your
                    unallocated savings
                  </span>
                </div>
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
                    />
                  </div>
                  {weeklyExceedsTarget && (
                    <p className="text-xs text-amber-600">
                      This is more than your target amount
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className="mt-2 flex items-center justify-center gap-2 w-full rounded-xl bg-[#4f46e5] py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/10 hover:bg-[#4338ca] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? "Creating..." : "Create Goal"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
};

export default Page;

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Target, Plus, CheckCircle, Loader2, Repeat, Pause, X } from "lucide-react";
import { WalletHeader } from "../wallet/UI/Header";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { formatNaira } from "../../../libs/utils";
import ContributeToGoalModal from "../../../components/ContributeToGoalModal";
import ConfirmCompleteModal from "../../../components/ConfirmCompleteModal";
import AutoContributeModal from "../../../components/AutoContributeModal";
import PauseGoalModal from "../../../components/PauseGoalModal";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

interface Goal {
  id: string;
  title: string;
  targetAmount: string;
  currentAmount: string;
  deadline: string | null;
  status: string;
  isCompleted: boolean;
  daysRemaining: number | null;
  progress: number;
  autoContribute: boolean;
  weeklyAmount: string | null;
}

function GoalBadge({ goal }: { goal: Goal }) {
  if (goal.isCompleted) {
    return (
      <span className="inline-flex items-center gap-1 shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
        <CheckCircle size={14} />
        Completed
      </span>
    );
  }

  if (goal.daysRemaining === null) return null;

  if (goal.daysRemaining > 7) {
    return (
      <span className="inline-flex items-center shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
        {goal.daysRemaining} days left
      </span>
    );
  }

  if (goal.daysRemaining > 0) {
    return (
      <span className="inline-flex items-center shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
        {goal.daysRemaining} days left
      </span>
    );
  }

  return (
    <span className="inline-flex items-center shrink-0 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-600">
      Overdue
    </span>
  );
}

function GoalCard({
  goal,
  onAddMoney,
  onComplete,
  onAutoContribute,
  onPause,
  onCancel,
  completing,
}: {
  goal: Goal;
  onAddMoney: () => void;
  onComplete: () => void;
  onAutoContribute: () => void;
  onPause: () => void;
  onCancel: () => void;
  completing: boolean;
}) {
  const current = Number(goal.currentAmount);
  const target = Number(goal.targetAmount);
  const progress = goal.progress;

  const isPaused = goal.status === "paused";

  return (
    <div className="relative rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_4px_24px_rgba(15,23,42,0.06)]">
      {isPaused && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-[1px]">
          <div className="flex flex-col items-center gap-1.5 rounded-xl bg-slate-900/80 px-4 py-3">
            <Pause size={20} className="text-white" />
            <span className="text-xs font-semibold text-white">Paused</span>
          </div>
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <h3 className="truncate text-lg font-bold text-slate-900">
          {goal.title}
        </h3>
        <div className="flex items-center gap-2 shrink-0">
          {!goal.isCompleted && (
            <>
              <button
                onClick={onAutoContribute}
                title={goal.autoContribute ? "Auto-save: ON" : "Auto-save: OFF"}
                className={`cursor-pointer rounded-lg p-1.5 transition-colors active:scale-95 ${
                  goal.autoContribute
                    ? "text-[#4f46e5] bg-indigo-50 hover:bg-indigo-100"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Repeat size={16} />
              </button>
              <button
                onClick={onPause}
                title={goal.status === "paused" ? "Resume goal" : "Pause goal"}
                className={`cursor-pointer rounded-lg p-1.5 transition-colors active:scale-95 ${
                  goal.status === "paused"
                    ? "text-amber-600 bg-amber-50 hover:bg-amber-100"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Pause size={16} />
              </button>
              <button
                onClick={onCancel}
                title="Cancel goal"
                className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:text-rose-600 hover:bg-rose-50 active:scale-95"
              >
                <X size={16} />
              </button>
            </>
          )}
          <GoalBadge goal={goal} />
        </div>
      </div>

      <div className="mt-4">
        <div className="h-2 rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-[#4f46e5] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {formatNaira(current).replace("NGN", "₦")} of{" "}
            {formatNaira(target).replace("NGN", "₦")}
          </span>
          <span className="text-xs text-slate-500">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {!goal.isCompleted && (
        <div className="mt-4 flex items-start gap-2">
          <button
            onClick={onAddMoney}
            className="cursor-pointer flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 active:scale-95"
          >
            Add Money
          </button>
          {current > 0 && progress >= 80 && (
            <button
              onClick={onComplete}
              disabled={completing}
              className="flex-1 rounded-xl border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {completing ? (
                <span className="flex items-center justify-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Completing...
                </span>
              ) : (
                "Complete"
              )}
            </button>
          )}
          {current > 0 && progress < 80 && (
            <div className="flex-1">
              <button
                disabled
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-400 cursor-not-allowed opacity-60"
              >
                Complete
              </button>
              <p className="mt-1 text-[10px] text-slate-400 text-center leading-tight">
                Reach 80% to complete (currently {Math.floor(progress)}%)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const Page = () => {
  const router = useRouter();
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [unallocatedSavings, setUnallocatedSavings] = useState(0);
  const [contributingGoal, setContributingGoal] = useState<Goal | null>(null);
  const [confirmGoal, setConfirmGoal] = useState<Goal | null>(null);
  const [autoContributeGoal, setAutoContributeGoal] = useState<Goal | null>(
    null,
  );
  const [pauseGoal, setPauseGoal] = useState<Goal | null>(null);
  const [cancelGoal, setCancelGoal] = useState<Goal | null>(null);
  const [completingIds] = useState<Set<string>>(new Set());

  const activeGoals = goals.filter((g) => g.status !== "paused");
  const pausedGoals = goals.filter((g) => g.status === "paused");

  const fetchGoals = useCallback(() => {
    if (!accessToken) return;
    fetch(`${API_BASE}/api/v1/savings-goals`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setGoals(data.data);
        } else {
          toast(data.message || "Failed to load goals", { type: "error" });
        }
      })
      .catch(() => toast("Failed to load savings goals", { type: "error" }));
  }, [accessToken, toast]);

  const fetchUnallocated = useCallback(() => {
    if (!accessToken) return;
    fetch(`${API_BASE}/api/v1/savings-goals/unallocated`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && typeof data.data?.unallocatedSavings === "number") {
          setUnallocatedSavings(data.data.unallocatedSavings);
        }
      })
      .catch(() => {});
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/api/v1/savings-goals`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      }).then((r) => r.json()),
      fetch(`${API_BASE}/api/v1/savings-goals/unallocated`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      }).then((r) => r.json()),
    ])
      .then(([goalsData, unallocatedData]) => {
        if (goalsData.success && Array.isArray(goalsData.data)) {
          setGoals(goalsData.data);
        } else {
          toast(goalsData.message || "Failed to load goals", {
            type: "error",
          });
        }
        if (
          unallocatedData.success &&
          typeof unallocatedData.data?.unallocatedSavings === "number"
        ) {
          setUnallocatedSavings(unallocatedData.data.unallocatedSavings);
        }
      })
      .catch(() => toast("Failed to load savings goals", { type: "error" }))
      .finally(() => setLoading(false));
  }, [accessToken, toast]);

  const handleRefresh = () => {
    fetchGoals();
    fetchUnallocated();
  };

  const handleComplete = (goal: Goal) => {
    setConfirmGoal(goal);
  };

  return (
    <>
      <WalletHeader />
      <main
        className="min-h-screen px-4 py-4 sm:px-6 sm:py-6"
        style={{ backgroundColor: "#f8fafc" }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
                Savings Goals
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Track what you&apos;re saving toward
              </p>
            </div>
            <button
              onClick={() => router.push("/goals/create")}
              className="flex items-center gap-2 rounded-xl bg-[#4f46e5] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/10 hover:bg-[#4338ca] transition-colors active:scale-95"
            >
              <Plus size={18} />
              New Goal
            </button>
          </div>

          {!loading && (
            <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-slate-700">
              {unallocatedSavings > 0
                ? `${formatNaira(unallocatedSavings).replace("NGN", "₦")} available to allocate to your goals`
                : "No unallocated savings available"}
            </div>
          )}

          <div className="mt-4">
            {loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-slate-100 animate-pulse h-40"
                  />
                ))}
              </div>
            ) : goals.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/70 bg-white px-4 py-16 shadow-[0_4px_24px_rgba(15,23,42,0.06)]">
                <div className="relative mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-linear-to-br from-slate-50 to-slate-100">
                    <Target className="h-7 w-7 text-slate-400" />
                  </div>
                  <div className="absolute inset-0 animate-ping rounded-2xl border-2 border-slate-200 opacity-30" />
                </div>
                <h4 className="mb-1.5 text-base font-semibold text-slate-900 sm:text-lg">
                  No savings goals yet
                </h4>
                <p className="max-w-xs text-center text-sm leading-relaxed text-slate-400">
                  Create your first goal and start tracking your progress
                </p>
                <button
                  onClick={() => router.push("/goals/create")}
                  className="mt-6 rounded-xl bg-[#4f46e5] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/10 hover:bg-[#4338ca] transition-colors active:scale-95"
                >
                  Create Goal
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {activeGoals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onAddMoney={() => {
                        fetchUnallocated();
                        setContributingGoal(goal);
                      }}
                      onComplete={() => handleComplete(goal)}
                      onAutoContribute={() => setAutoContributeGoal(goal)}
                      onPause={() => setPauseGoal(goal)}
                      onCancel={() => setCancelGoal(goal)}
                      completing={completingIds.has(goal.id)}
                    />
                  ))}
                </div>

                {pausedGoals.length > 0 && (
                  <div className="mt-8">
                    <h2 className="mb-3 text-sm font-bold text-slate-500">
                      Paused
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {pausedGoals.map((goal) => (
                        <GoalCard
                          key={goal.id}
                          goal={goal}
                          onAddMoney={() => {
                            fetchUnallocated();
                            setContributingGoal(goal);
                          }}
                          onComplete={() => handleComplete(goal)}
                          onAutoContribute={() => setAutoContributeGoal(goal)}
                          onPause={() => setPauseGoal(goal)}
                          onCancel={() => setCancelGoal(goal)}
                          completing={completingIds.has(goal.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {contributingGoal && (
        <ContributeToGoalModal
          goal={{ id: contributingGoal.id, title: contributingGoal.title }}
          unallocatedSavings={unallocatedSavings}
          onClose={() => setContributingGoal(null)}
          onSuccess={() => {
            setContributingGoal(null);
            handleRefresh();
          }}
        />
      )}

      {confirmGoal && (
        <ConfirmCompleteModal
          goal={{
            id: confirmGoal.id,
            title: confirmGoal.title,
            currentAmount: confirmGoal.currentAmount,
          }}
          onClose={() => setConfirmGoal(null)}
          onSuccess={() => {
            setConfirmGoal(null);
            handleRefresh();
          }}
        />
      )}

      {autoContributeGoal && (
        <AutoContributeModal
          goal={{
            id: autoContributeGoal.id,
            title: autoContributeGoal.title,
            autoContribute: autoContributeGoal.autoContribute,
            weeklyAmount: autoContributeGoal.weeklyAmount,
          }}
          onClose={() => setAutoContributeGoal(null)}
          onSuccess={() => {
            setAutoContributeGoal(null);
            handleRefresh();
          }}
        />
      )}

      {pauseGoal && (
        <PauseGoalModal
          goal={{ id: pauseGoal.id, title: pauseGoal.title }}
          onClose={() => setPauseGoal(null)}
          onSuccess={() => {
            setPauseGoal(null);
            handleRefresh();
          }}
        />
      )}

    </>
  );
};

export default Page;
"use client";
import { useState, useEffect } from "react";
import { X, Target, Shield, Brain, Sparkles } from "lucide-react";

type Goal = {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
};

const goals: Goal[] = [
  {
    id: "save_more",
    label: "Save more every month",
    description: "Build consistent savings habits automatically",
    icon: <Target className="w-5 h-5" />,
    color: "#059669",
    bg: "#ecfdf5",
  },
  {
    id: "emergency_fund",
    label: "Build an emergency fund",
    description: "Have money ready when life surprises you",
    icon: <Shield className="w-5 h-5" />,
    color: "#d97706",
    bg: "#fffbeb",
  },
  {
    id: "spend_mindfully",
    label: "Spend more mindfully",
    description: "Know where every naira goes before it disappears",
    icon: <Brain className="w-5 h-5" />,
    color: "#4f46e5",
    bg: "#eef2ff",
  },
  {
    id: "all",
    label: "All of the above",
    description: "Build complete financial discipline from day one",
    icon: <Sparkles className="w-5 h-5" />,
    color: "#db2777",
    bg: "#fdf2f8",
  },
];

import { useAuth } from "../../../../context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

export const GoalModal = () => {
  const { user, accessToken, isLoading, refreshSession } = useAuth();
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Show if user is logged in, loading is finished, and onboarding is NOT complete
  useEffect(() => {
    if (!isLoading && user && !user.onboardingComplete) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [user, isLoading]);

  const saveGoal = async (goalValue: string | null) => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/goal`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ goal: goalValue }),
      });

      if (response.ok) {
        // Refresh session to update global user state with new goal/onboarding status
        await refreshSession();
        setVisible(false);
      }
    } catch (error) {
      console.error("Failed to save goal:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirm = () => {
    if (!selected) return;
    saveGoal(selected);
  };

  const handleSkip = () => {
    saveGoal(null);
  };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0">
        <div
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-slideUp"
          style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.15)" }}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-4">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[#eef2ff] flex items-center justify-center mb-3">
                <Target className="w-5 h-5 text-[#4f46e5]" />
              </div>
              <h2 className="text-lg font-bold text-[#0f172a] leading-tight">
                What's your #1 money goal?
              </h2>
              <p className="text-sm text-[#475569] mt-1">
                Your AI coach will personalise tips based on this.
              </p>
            </div>
            <button
              onClick={handleSkip}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-all duration-200 shrink-0 ml-3 mt-1"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Goal options */}
          <div className="px-6 flex flex-col gap-2.5">
            {goals.map((goal) => {
              const isSelected = selected === goal.id;
              return (
                <button
                  key={goal.id}
                  onClick={() => setSelected(goal.id)}
                  className="flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.98]"
                  style={{
                    borderColor: isSelected ? goal.color : "#e2e8f0",
                    backgroundColor: isSelected ? goal.bg : "#ffffff",
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200"
                    style={{
                      backgroundColor: isSelected ? goal.color : "#f1f5f9",
                      color: isSelected ? "#ffffff" : goal.color,
                    }}
                  >
                    {goal.icon}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold leading-tight"
                      style={{
                        color: isSelected ? goal.color : "#0f172a",
                      }}
                    >
                      {goal.label}
                    </p>
                    <p className="text-xs text-[#475569] mt-0.5 leading-relaxed">
                      {goal.description}
                    </p>
                  </div>

                  {/* Selection dot */}
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200"
                    style={{
                      borderColor: isSelected ? goal.color : "#cbd5e1",
                      backgroundColor: isSelected ? goal.color : "transparent",
                    }}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-6 pt-4 flex flex-col gap-2">
            <button
              onClick={handleConfirm}
              disabled={!selected || saving}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: selected ? "#4f46e5" : "#94a3b8",
              }}
            >
              {saving ? "Saving..." : "Set My Goal →"}
            </button>
            <button
              onClick={handleSkip}
              className="w-full py-2.5 text-sm text-[#475569] font-medium hover:text-[#0f172a] transition-colors duration-200"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
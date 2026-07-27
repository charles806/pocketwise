import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Target,
  Plus,
  CheckCircle,
  Repeat,
  Pause as PauseIcon,
  X,
} from "lucide-react-native";
import {
  useGoals,
  useContributeToGoal,
  useCompleteGoal,
  useAutoContributeGoal,
  usePauseGoal,
} from "@/hooks/useGoals";
import { ContributeToGoalModal } from "@/components/ContributeToGoalModal";
import { ConfirmCompleteModal } from "@/components/ConfirmCompleteModal";
import { AutoContributeModal } from "@/components/AutoContributeModal";
import { PauseGoalModal } from "@/components/PauseGoalModal";

function formatNaira(amount: number) {
  return `₦${(amount ?? 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

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
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          backgroundColor: "#d1fae5",
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 999,
        }}
      >
        <CheckCircle size={12} color="#047857" />
        <Text style={{ fontSize: 11, fontWeight: "600", color: "#047857" }}>
          Completed
        </Text>
      </View>
    );
  }
  if (goal.daysRemaining === null) return null;
  if (goal.daysRemaining > 7) {
    return (
      <View
        style={{
          backgroundColor: "#f1f5f9",
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 999,
        }}
      >
        <Text style={{ fontSize: 11, fontWeight: "600", color: "#475569" }}>
          {goal.daysRemaining} days left
        </Text>
      </View>
    );
  }
  if (goal.daysRemaining > 0) {
    return (
      <View
        style={{
          backgroundColor: "#fef3c7",
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 999,
        }}
      >
        <Text style={{ fontSize: 11, fontWeight: "600", color: "#b45309" }}>
          {goal.daysRemaining} days left
        </Text>
      </View>
    );
  }
  return (
    <View
      style={{
        backgroundColor: "#ffe4e6",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
      }}
    >
      <Text style={{ fontSize: 11, fontWeight: "600", color: "#be123c" }}>
        Overdue
      </Text>
    </View>
  );
}

function GoalCard({
  goal,
  onAddMoney,
  onComplete,
  onAutoContribute,
  onPause,
  completing,
}: {
  goal: Goal;
  onAddMoney: () => void;
  onComplete: () => void;
  onAutoContribute: () => void;
  onPause: () => void;
  completing: boolean;
}) {
  const current = Number(goal.currentAmount);
  const target = Number(goal.targetAmount);
  const progress = goal.progress;
  const isPaused = goal.status === "paused";

  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        padding: 20,
        position: "relative",
      }}
    >
      {isPaused && (
        <View
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            backgroundColor: "rgba(255,255,255,0.7)",
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "rgba(15,23,42,0.8)",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: "center",
              gap: 6,
            }}
          >
            <PauseIcon size={20} color="#fff" />
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#fff" }}>
              Paused
            </Text>
          </View>
        </View>
      )}

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Text
          style={{ fontSize: 16, fontWeight: "700", color: "#0f172a", flex: 1 }}
          numberOfLines={1}
        >
          {goal.title}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          {!goal.isCompleted && (
            <>
              <TouchableOpacity
                onPress={onAutoContribute}
                style={{ padding: 6 }}
              >
                <Repeat
                  size={14}
                  color={goal.autoContribute ? "#4f46e5" : "#94a3b8"}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={onPause} style={{ padding: 6 }}>
                <PauseIcon
                  size={14}
                  color={goal.status === "paused" ? "#d97706" : "#94a3b8"}
                />
              </TouchableOpacity>
            </>
          )}
          <GoalBadge goal={goal} />
        </View>
      </View>

      <View style={{ marginTop: 16 }}>
        <View
          style={{
            height: 8,
            backgroundColor: "#f1f5f9",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              height: "100%",
              backgroundColor: "#4f46e5",
              borderRadius: 999,
              width: `${Math.min(progress, 100)}%`,
            }}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 6,
          }}
        >
          <Text style={{ fontSize: 11, color: "#64748b" }}>
            {formatNaira(current)} of {formatNaira(target)}
          </Text>
          <Text style={{ fontSize: 11, color: "#64748b" }}>
            {Math.round(progress)}%
          </Text>
        </View>
      </View>

      {!goal.isCompleted && (
        <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
          <TouchableOpacity
            onPress={onAddMoney}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: "#e2e8f0",
              borderRadius: 12,
              paddingVertical: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#334155" }}>
              Add Money
            </Text>
          </TouchableOpacity>
          {current > 0 && progress >= 80 ? (
            <TouchableOpacity
              onPress={onComplete}
              disabled={completing}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: "#a7f3d0",
                borderRadius: 12,
                paddingVertical: 10,
                alignItems: "center",
                backgroundColor: completing ? "#f1f5f9" : "transparent",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: completing ? "#94a3b8" : "#059669",
                }}
              >
                {completing ? "Completing..." : "Complete"}
              </Text>
            </TouchableOpacity>
          ) : current > 0 && progress < 80 ? (
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                disabled
                style={{
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#e2e8f0",
                  paddingVertical: 10,
                  alignItems: "center",
                  opacity: 0.6,
                }}
              >
                <Text
                  style={{ fontSize: 12, fontWeight: "600", color: "#94a3b8" }}
                >
                  Complete
                </Text>
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: 10,
                  color: "#94a3b8",
                  textAlign: "center",
                  marginTop: 4,
                }}
              >
                Reach 80% to complete (currently {Math.floor(progress)}%)
              </Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

const Page = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { goals, unallocatedSavings, loading, refetch } = useGoals();
  const contributeMutation = useContributeToGoal();
  const completeMutation = useCompleteGoal();
  const autoContributeMutation = useAutoContributeGoal();
  const pauseMutation = usePauseGoal();

  const [contributingGoal, setContributingGoal] = useState<Goal | null>(null);
  const [confirmGoal, setConfirmGoal] = useState<Goal | null>(null);
  const [autoContributeGoal, setAutoContributeGoal] = useState<Goal | null>(
    null,
  );
  const [pauseGoal, setPauseGoal] = useState<Goal | null>(null);
  const [completingIds] = useState<Set<string>>(new Set());

  const activeGoals = goals.filter((g: Goal) => g.status !== "paused");
  const pausedGoals = goals.filter((g: Goal) => g.status === "paused");

  return (
    <View
      style={{ flex: 1, backgroundColor: "#f8fafc", paddingTop: insets.top }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <View>
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#0f172a" }}>
            Savings Goals
          </Text>
          <Text style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
            Track what you're saving toward
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/goals/create" as any)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            backgroundColor: "#4f46e5",
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 12,
          }}
        >
          <Plus size={16} color="#fff" />
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#fff" }}>
            New Goal
          </Text>
        </TouchableOpacity>
      </View>

      {!loading && (
        <View
          style={{
            marginHorizontal: 16,
            marginBottom: 12,
            backgroundColor: "#eef2ff",
            borderWidth: 1,
            borderColor: "#c7d2fe",
            borderRadius: 12,
            padding: 12,
          }}
        >
          <Text style={{ fontSize: 13, color: "#334155" }}>
            {unallocatedSavings > 0
              ? `${formatNaira(unallocatedSavings)} available to allocate to your goals`
              : "No unallocated savings available"}
          </Text>
        </View>
      )}

      {loading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color="#4f46e5" size="large" />
        </View>
      ) : goals.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 32,
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              backgroundColor: "#f1f5f9",
              borderWidth: 1,
              borderColor: "#e2e8f0",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Target size={28} color="#94a3b8" />
          </View>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#0f172a",
              marginBottom: 4,
            }}
          >
            No savings goals yet
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: "#94a3b8",
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            Create your first goal and start tracking your progress
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/goals/create" as any)}
            style={{
              backgroundColor: "#4f46e5",
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 12,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#fff" }}>
              Create Goal
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 100,
            gap: 12,
          }}
        >
          {activeGoals.map((goal: Goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onAddMoney={() => setContributingGoal(goal)}
              onComplete={() => setConfirmGoal(goal)}
              onAutoContribute={() => setAutoContributeGoal(goal)}
              onPause={() => setPauseGoal(goal)}
              completing={completingIds.has(goal.id)}
            />
          ))}

          {pausedGoals.length > 0 && (
            <>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: "#64748b",
                  marginTop: 16,
                  marginBottom: 8,
                }}
              >
                Paused
              </Text>
              {pausedGoals.map((goal: Goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onAddMoney={() => setContributingGoal(goal)}
                  onComplete={() => setConfirmGoal(goal)}
                  onAutoContribute={() => setAutoContributeGoal(goal)}
                  onPause={() => setPauseGoal(goal)}
                  completing={false}
                />
              ))}
            </>
          )}
        </ScrollView>
      )}

      {contributingGoal && (
        <ContributeToGoalModal
          goal={{ id: contributingGoal.id, title: contributingGoal.title }}
          unallocatedSavings={unallocatedSavings}
          onClose={() => setContributingGoal(null)}
          onSuccess={(amount) => {
            contributeMutation.mutate({ goalId: contributingGoal.id, amount });
            setContributingGoal(null);
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
          onConfirm={async () => {
            await completeMutation.mutateAsync(confirmGoal.id);
            setConfirmGoal(null);
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
          onSave={async (autoContribute, weeklyAmount) => {
            await autoContributeMutation.mutateAsync({
              goalId: autoContributeGoal.id,
              autoContribute,
              weeklyAmount,
            });
            setAutoContributeGoal(null);
          }}
        />
      )}

      {pauseGoal && (
        <PauseGoalModal
          goal={{ id: pauseGoal.id, title: pauseGoal.title }}
          onClose={() => setPauseGoal(null)}
          onConfirm={async () => {
            await pauseMutation.mutateAsync(pauseGoal.id);
            setPauseGoal(null);
          }}
        />
      )}
    </View>
  );
};

export default Page;

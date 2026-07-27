import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useCreateGoal } from "@/hooks/useGoals";

const Page = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const createGoal = useCreateGoal();

  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [autoContribute, setAutoContribute] = useState(false);
  const [weeklyAmount, setWeeklyAmount] = useState("");

  const targetAmountNum = Number(targetAmount) || 0;
  const weeklyAmountNum = Number(weeklyAmount) || 0;
  const weeklyExceedsTarget =
    autoContribute && weeklyAmountNum > targetAmountNum && targetAmountNum > 0;
  const weeklyAmountValid = !autoContribute || weeklyAmountNum > 0;

  const canSubmit =
    title.trim().length > 0 &&
    targetAmountNum >= 1000 &&
    deadline !== "" &&
    weeklyAmountValid;

  const minDate = new Date(Date.now() + 7 * 86400000)
    .toISOString()
    .split("T")[0];
  const maxDate = new Date(Date.now() + 365 * 86400000)
    .toISOString()
    .split("T")[0];

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await createGoal.mutateAsync({
      title: title.trim(),
      targetAmount: targetAmountNum,
      deadline: new Date(deadline).toISOString(),
      autoContribute,
      ...(autoContribute && weeklyAmountNum > 0
        ? { weeklyAmount: weeklyAmountNum }
        : {}),
    });
    router.back();
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: "#f8fafc", paddingTop: insets.top }}
    >
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginBottom: 24,
          }}
        >
          <ArrowLeft size={18} color="#475569" />
          <Text style={{ fontSize: 13, fontWeight: "500", color: "#475569" }}>
            Back to Goals
          </Text>
        </TouchableOpacity>

        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#e2e8f0",
            padding: 24,
          }}
        >
          <Text
            style={{
              fontSize: 22,
              fontWeight: "800",
              color: "#0f172a",
              marginBottom: 24,
            }}
          >
            New Savings Goal
          </Text>

          <View style={{ gap: 20 }}>
            <View style={{ gap: 6 }}>
              <Text
                style={{ fontSize: 12, fontWeight: "600", color: "#334155" }}
              >
                Goal Title
              </Text>
              <TextInput
                style={{
                  backgroundColor: "#f8fafc",
                  borderWidth: 1,
                  borderColor: "#e2e8f0",
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 14,
                  color: "#0f172a",
                }}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. New Laptop, Rent, Emergency Trip"
                placeholderTextColor="#94a3b8"
                maxLength={50}
              />
              <Text
                style={{ fontSize: 11, color: "#94a3b8", textAlign: "right" }}
              >
                {title.length}/50
              </Text>
            </View>

            <View style={{ gap: 6 }}>
              <Text
                style={{ fontSize: 12, fontWeight: "600", color: "#334155" }}
              >
                Target Amount (NGN)
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#f8fafc",
                  borderWidth: 1,
                  borderColor: "#e2e8f0",
                  borderRadius: 14,
                  paddingHorizontal: 16,
                }}
              >
                <Text
                  style={{ fontSize: 14, color: "#64748b", marginRight: 4 }}
                >
                  ₦
                </Text>
                <TextInput
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    fontSize: 14,
                    color: "#0f172a",
                  }}
                  value={targetAmount}
                  onChangeText={setTargetAmount}
                  placeholder="0.00"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={{ gap: 6 }}>
              <Text
                style={{ fontSize: 12, fontWeight: "600", color: "#334155" }}
              >
                Deadline
              </Text>
              <TextInput
                style={{
                  backgroundColor: "#f8fafc",
                  borderWidth: 1,
                  borderColor: "#e2e8f0",
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 14,
                  color: "#0f172a",
                }}
                value={deadline}
                onChangeText={setDeadline}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94a3b8"
              />
              <Text style={{ fontSize: 11, color: "#94a3b8" }}>
                Min: {minDate} — Max: {maxDate}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#f8fafc",
                borderWidth: 1,
                borderColor: "#e2e8f0",
                borderRadius: 14,
                paddingHorizontal: 16,
                paddingVertical: 12,
              }}
            >
              <View>
                <Text
                  style={{ fontSize: 13, fontWeight: "600", color: "#0f172a" }}
                >
                  Auto-save weekly
                </Text>
                <Text style={{ fontSize: 11, color: "#64748b" }}>
                  Automatically move money into this goal every week
                </Text>
              </View>
              <Switch
                value={autoContribute}
                onValueChange={(v) => {
                  setAutoContribute(v);
                  if (!v) setWeeklyAmount("");
                }}
                trackColor={{ false: "#cbd5e1", true: "#4f46e5" }}
                thumbColor="#fff"
              />
            </View>

            {autoContribute && (
              <View style={{ gap: 6 }}>
                <Text
                  style={{ fontSize: 12, fontWeight: "600", color: "#334155" }}
                >
                  Weekly Amount
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#f8fafc",
                    borderWidth: 1,
                    borderColor: "#e2e8f0",
                    borderRadius: 14,
                    paddingHorizontal: 16,
                  }}
                >
                  <Text
                    style={{ fontSize: 14, color: "#64748b", marginRight: 4 }}
                  >
                    ₦
                  </Text>
                  <TextInput
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      fontSize: 14,
                      color: "#0f172a",
                    }}
                    value={weeklyAmount}
                    onChangeText={setWeeklyAmount}
                    placeholder="0.00"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                  />
                </View>
                {weeklyExceedsTarget && (
                  <Text style={{ fontSize: 11, color: "#d97706" }}>
                    This is more than your target amount
                  </Text>
                )}
              </View>
            )}

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!canSubmit || createGoal.isPending}
              style={{
                backgroundColor: canSubmit ? "#4f46e5" : "#94a3b8",
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
                marginTop: 8,
              }}
            >
              {createGoal.isPending && (
                <ActivityIndicator color="#fff" size="small" />
              )}
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>
                {createGoal.isPending ? "Creating..." : "Create Goal"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Page;

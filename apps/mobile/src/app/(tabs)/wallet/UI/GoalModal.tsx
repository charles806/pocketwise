import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { Target, Shield, Brain, Sparkles, X } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { SlideUpContainer } from "@/components/SlideUpContainer";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

const goals = [
  {
    id: "save_more",
    label: "Save more every month",
    description: "Build consistent savings habits automatically",
    color: "#059669",
    bg: "#ecfdf5",
  },
  {
    id: "emergency_fund",
    label: "Build an emergency fund",
    description: "Have money ready when life surprises you",
    color: "#d97706",
    bg: "#fffbeb",
  },
  {
    id: "spend_mindfully",
    label: "Spend more mindfully",
    description: "Know where every naira goes before it disappears",
    color: "#4f46e5",
    bg: "#eef2ff",
  },
  {
    id: "all",
    label: "All of the above",
    description: "Build complete financial discipline from day one",
    color: "#db2777",
    bg: "#fdf2f8",
  },
];

const goalIcons: Record<string, React.ReactNode> = {
  save_more: <Target size={20} color="#fff" />,
  emergency_fund: <Shield size={20} color="#fff" />,
  spend_mindfully: <Brain size={20} color="#fff" />,
  all: <Sparkles size={20} color="#fff" />,
};

export const GoalModal = () => {
  const { user, accessToken, isLoading, refreshSession } = useAuth();
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && user && !(user as any).onboardingComplete) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [user, isLoading]);

  const handleConfirm = async () => {
    if (!selected || !accessToken) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/goal`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ goal: selected }),
      });
      if (res.ok) {
        await refreshSession();
        setVisible(false);
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => setVisible(false);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleSkip}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "flex-end",
        }}
      >
        <SlideUpContainer>
          <View
            style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
            }}
          >
            <View style={{ padding: 24, paddingBottom: 8 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 16,
                      backgroundColor: "#eef2ff",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 12,
                    }}
                  >
                    <Target size={20} color="#4f46e5" />
                  </View>
                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: "800",
                      color: "#0f172a",
                    }}
                  >
                    What's your #1 money goal?
                  </Text>
                  <Text
                    style={{ fontSize: 13, color: "#475569", marginTop: 4 }}
                  >
                    Your AI coach will personalise tips based on this.
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleSkip}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: "#f1f5f9",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X size={16} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ paddingHorizontal: 24, gap: 10 }}>
              {goals.map((goal) => {
                const isSelected = selected === goal.id;
                return (
                  <TouchableOpacity
                    key={goal.id}
                    onPress={() => setSelected(goal.id)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      padding: 14,
                      borderRadius: 16,
                      borderWidth: 2,
                      borderColor: isSelected ? goal.color : "#e2e8f0",
                      backgroundColor: isSelected ? goal.bg : "#fff",
                    }}
                  >
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 12,
                        backgroundColor: isSelected ? goal.color : "#f1f5f9",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {goalIcons[goal.id]}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "600",
                          color: isSelected ? goal.color : "#0f172a",
                        }}
                      >
                        {goal.label}
                      </Text>
                      <Text
                        style={{ fontSize: 11, color: "#475569", marginTop: 2 }}
                      >
                        {goal.description}
                      </Text>
                    </View>
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: isSelected ? goal.color : "#cbd5e1",
                        backgroundColor: isSelected
                          ? goal.color
                          : "transparent",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {isSelected && (
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: "#fff",
                          }}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={{ padding: 24, gap: 8 }}>
              <TouchableOpacity
                onPress={handleConfirm}
                disabled={!selected || saving}
                style={{
                  backgroundColor: selected ? "#4f46e5" : "#94a3b8",
                  borderRadius: 16,
                  paddingVertical: 14,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {saving && <ActivityIndicator color="#fff" size="small" />}
                <Text
                  style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}
                >
                  {saving ? "Saving..." : "Set My Goal →"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSkip}
                style={{ paddingVertical: 8, alignItems: "center" }}
              >
                <Text
                  style={{ fontSize: 13, color: "#475569", fontWeight: "500" }}
                >
                  Skip for now
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SlideUpContainer>
      </View>
    </Modal>
  );
};

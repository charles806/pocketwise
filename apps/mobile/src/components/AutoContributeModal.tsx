import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
  Switch,
} from "react-native";
import { X } from "lucide-react-native";
import { useState } from "react";
import { SlideUpContainer } from "./SlideUpContainer";

interface Props {
  goal: {
    id: string;
    title: string;
    autoContribute: boolean;
    weeklyAmount: string | null;
  };
  onClose: () => void;
  onSave: (autoContribute: boolean, weeklyAmount: number) => Promise<void>;
}

export const AutoContributeModal = ({ goal, onClose, onSave }: Props) => {
  const [autoContribute, setAutoContribute] = useState(goal.autoContribute);
  const [weeklyAmount, setWeeklyAmount] = useState(goal.weeklyAmount ?? "");
  const [submitting, setSubmitting] = useState(false);

  const weeklyAmountNum = Number(weeklyAmount) || 0;
  const isValid = !autoContribute || weeklyAmountNum > 0;

  const handleSave = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      await onSave(autoContribute, weeklyAmountNum);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "flex-end",
        }}
        onPress={onClose}
      >
        <SlideUpContainer>
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
            }}
          >
            <View style={{ padding: 24 }}>
              <TouchableOpacity
                onPress={onClose}
                disabled={submitting}
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#f1f5f9",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                }}
              >
                <X size={16} color="#64748b" />
              </TouchableOpacity>

              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "800",
                  color: "#0f172a",
                  marginBottom: 4,
                }}
              >
                Auto-save: {goal.title}
              </Text>
              <Text
                style={{ fontSize: 13, color: "#475569", marginBottom: 24 }}
              >
                Automatically move money into this goal every week from your
                unallocated savings
              </Text>

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
                  marginBottom: 20,
                }}
              >
                <Text
                  style={{ fontSize: 13, fontWeight: "600", color: "#0f172a" }}
                >
                  Auto-save weekly
                </Text>
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
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: "#334155",
                    }}
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
                      style={{ fontSize: 15, color: "#64748b", marginRight: 4 }}
                    >
                      ₦
                    </Text>
                    <TextInput
                      style={{
                        flex: 1,
                        paddingVertical: 12,
                        fontSize: 15,
                        color: "#0f172a",
                      }}
                      value={weeklyAmount}
                      onChangeText={setWeeklyAmount}
                      placeholder="0.00"
                      placeholderTextColor="#94a3b8"
                      keyboardType="numeric"
                      autoFocus
                    />
                  </View>
                </View>
              )}

              <View style={{ flexDirection: "row", gap: 12, marginTop: 24 }}>
                <TouchableOpacity
                  onPress={onClose}
                  disabled={submitting}
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: "#e2e8f0",
                    borderRadius: 14,
                    paddingVertical: 12,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: "#334155",
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={!isValid || submitting}
                  style={{
                    flex: 1,
                    backgroundColor: isValid ? "#4f46e5" : "#94a3b8",
                    borderRadius: 14,
                    paddingVertical: 12,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{ fontSize: 12, fontWeight: "600", color: "#fff" }}
                  >
                    {submitting ? "Saving..." : "Save"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </SlideUpContainer>
      </Pressable>
    </Modal>
  );
};

export default AutoContributeModal;
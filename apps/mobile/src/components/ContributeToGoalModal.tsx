import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { X } from "lucide-react-native";
import { useState } from "react";
import { SlideUpContainer } from "./SlideUpContainer";

interface Props {
  goal: { id: string; title: string };
  unallocatedSavings: number;
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

function formatNaira(amount: number) {
  return `₦${(amount ?? 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export const ContributeToGoalModal = ({
  goal,
  unallocatedSavings,
  onClose,
  onSuccess,
}: Props) => {
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const numericAmount = Number(amount) || 0;
  const exceedsAvailable = numericAmount > unallocatedSavings;
  const isValid = numericAmount > 0 && !exceedsAvailable;

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      onSuccess(numericAmount);
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
                Add to {goal.title}
              </Text>
              <Text
                style={{ fontSize: 13, color: "#475569", marginBottom: 24 }}
              >
                You have {formatNaira(unallocatedSavings)} available in
                unallocated savings
              </Text>

              <View style={{ gap: 6 }}>
                <Text
                  style={{ fontSize: 12, fontWeight: "600", color: "#334155" }}
                >
                  Amount
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
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    autoFocus
                  />
                </View>
                {exceedsAvailable && (
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#ef4444",
                      fontWeight: "500",
                    }}
                  >
                    Amount exceeds what&apos;s available
                  </Text>
                )}
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!isValid || submitting}
                style={{
                  marginTop: 24,
                  backgroundColor: isValid ? "#4f46e5" : "#94a3b8",
                  paddingVertical: 14,
                  borderRadius: 16,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}
                >
                  {submitting
                    ? "Adding..."
                    : `Add ${formatNaira(numericAmount)}`}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </SlideUpContainer>
      </Pressable>
    </Modal>
  );
};

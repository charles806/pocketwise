import { View, Text, TouchableOpacity, Modal, Pressable } from "react-native";
import { CheckCircle } from "lucide-react-native";
import { SlideUpContainer } from "./SlideUpContainer";

interface Props {
  goal: { id: string; title: string; currentAmount: string };
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

function formatNaira(amount: number) {
  return `₦${(amount ?? 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export const ConfirmCompleteModal = ({ goal, onClose, onConfirm }: Props) => {
  const currentAmount = Number(goal.currentAmount);

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
            <View style={{ padding: 24, alignItems: "center" }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: "#d1fae5",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <CheckCircle size={28} color="#059669" />
              </View>

              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "800",
                  color: "#0f172a",
                  textAlign: "center",
                }}
              >
                Complete {goal.title}?
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: "#475569",
                  textAlign: "center",
                  marginTop: 8,
                  marginBottom: 24,
                }}
              >
                Move {formatNaira(currentAmount)} to your Spend wallet and mark
                this goal as completed.
              </Text>

              <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
                <TouchableOpacity
                  onPress={onClose}
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
                  onPress={onConfirm}
                  style={{
                    flex: 1,
                    backgroundColor: "#059669",
                    borderRadius: 14,
                    paddingVertical: 12,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{ fontSize: 12, fontWeight: "600", color: "#fff" }}
                  >
                    Confirm
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

export default ConfirmCompleteModal;
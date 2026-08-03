import { View, Text, TouchableOpacity, Modal, Pressable } from "react-native";
import { SlideUpContainer } from "./SlideUpContainer";

interface Props {
  goal: { id: string; title: string };
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const PauseGoalModal = ({ goal, onClose, onConfirm }: Props) => {
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
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "800",
                  color: "#0f172a",
                  marginBottom: 24,
                }}
              >
                Are you sure you want to pause this goal: {goal.title}?
              </Text>

              <View style={{ flexDirection: "row", gap: 12 }}>
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
                    No, don&apos;t pause
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onConfirm}
                  style={{
                    flex: 1,
                    backgroundColor: "#4f46e5",
                    borderRadius: 14,
                    paddingVertical: 12,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{ fontSize: 12, fontWeight: "600", color: "#fff" }}
                  >
                    Yes, pause
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

export default PauseGoalModal;
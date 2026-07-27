import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { X, ShieldAlert, Unlock } from "lucide-react-native";
import { SlideUpContainer } from "@/components/SlideUpContainer";

interface Props {
  visible: boolean;
  onDone: () => void;
  onClose: () => void;
}

export const EmergencyUnlockModal = ({ visible, onDone, onClose }: Props) => {
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedReason, setSubmittedReason] = useState("");

  const isValidReason = reason.trim().length >= 10;
  const canShowClose = step < 4 && !submitting;

  const reset = () => {
    setStep(1);
    setReason("");
    setSubmitting(false);
    setSubmittedReason("");
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const handleSubmit = () => {
    if (!isValidReason) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmittedReason(reason.trim());
      setSubmitting(false);
      setStep(4);
    }, 600);
  };

  const handleDone = () => {
    reset();
    onDone();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
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
              padding: 24,
              position: "relative",
            }}
          >
            {canShowClose && (
              <TouchableOpacity
                onPress={handleClose}
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  zIndex: 10,
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: "#f1f5f9",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={16} color="#64748b" />
              </TouchableOpacity>
            )}

            {step === 1 && (
              <View style={{ alignItems: "center", paddingTop: 8 }}>
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: "#ffe4e6",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 14,
                  }}
                >
                  <ShieldAlert size={28} color="#f43f5e" />
                </View>
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "800",
                    color: "#0f172a",
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  Unlock Emergency Wallet
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: "#475569",
                    textAlign: "center",
                    lineHeight: 19,
                    marginBottom: 20,
                  }}
                >
                  This money is meant for real emergencies. You'll need to tell
                  us why before you can access it.
                </Text>
                <TouchableOpacity
                  onPress={() => setStep(2)}
                  style={{
                    width: "100%",
                    backgroundColor: "#4f46e5",
                    borderRadius: 16,
                    paddingVertical: 14,
                    alignItems: "center",
                  }}
                  activeOpacity={0.85}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}
                  >
                    Continue
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {step === 2 && (
              <View>
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "800",
                    color: "#0f172a",
                    marginBottom: 14,
                  }}
                >
                  What's the emergency?
                </Text>
                <TextInput
                  value={reason}
                  onChangeText={setReason}
                  multiline
                  numberOfLines={4}
                  placeholder="Briefly describe what happened..."
                  placeholderTextColor="#94a3b8"
                  style={{
                    borderWidth: 1,
                    borderColor: "#e2e8f0",
                    backgroundColor: "#f8fafc",
                    borderRadius: 14,
                    padding: 14,
                    fontSize: 14,
                    color: "#0f172a",
                    minHeight: 100,
                    textAlignVertical: "top",
                  }}
                />
                {reason.trim().length > 0 && reason.trim().length < 10 && (
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#ef4444",
                      marginTop: 6,
                      fontWeight: "600",
                    }}
                  >
                    Please enter at least 10 characters
                  </Text>
                )}
                <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
                  <TouchableOpacity
                    onPress={() => setStep(1)}
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      borderColor: "#e2e8f0",
                      borderRadius: 16,
                      paddingVertical: 14,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#334155",
                        fontSize: 14,
                        fontWeight: "700",
                      }}
                    >
                      Back
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setStep(3)}
                    disabled={!isValidReason}
                    style={{
                      flex: 1,
                      backgroundColor: "#4f46e5",
                      borderRadius: 16,
                      paddingVertical: 14,
                      alignItems: "center",
                      opacity: isValidReason ? 1 : 0.5,
                    }}
                  >
                    <Text
                      style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}
                    >
                      Continue
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {step === 3 && (
              <View>
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "800",
                    color: "#0f172a",
                    marginBottom: 14,
                  }}
                >
                  Confirm Unlock
                </Text>
                <View
                  style={{
                    backgroundColor: "#f8fafc",
                    borderWidth: 1,
                    borderColor: "#f1f5f9",
                    borderRadius: 14,
                    padding: 14,
                    marginBottom: 14,
                  }}
                >
                  <Text style={{ fontSize: 13, color: "#334155" }}>
                    {reason.trim()}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: "#fffbeb",
                    borderWidth: 1,
                    borderColor: "#fde68a",
                    borderRadius: 14,
                    padding: 12,
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{ fontSize: 11, color: "#92400e", lineHeight: 16 }}
                  >
                    Unlocking gives you one withdrawal from this wallet. It will
                    lock again automatically after you use it.
                  </Text>
                </View>
                <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
                  <TouchableOpacity
                    onPress={() => setStep(2)}
                    disabled={submitting}
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      borderColor: "#e2e8f0",
                      borderRadius: 16,
                      paddingVertical: 14,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#334155",
                        fontSize: 14,
                        fontWeight: "700",
                      }}
                    >
                      Back
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={submitting}
                    style={{
                      flex: 1,
                      backgroundColor: "#4f46e5",
                      borderRadius: 16,
                      paddingVertical: 14,
                      alignItems: "center",
                      flexDirection: "row",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    {submitting && (
                      <ActivityIndicator color="#fff" size="small" />
                    )}
                    <Text
                      style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}
                    >
                      {submitting ? "Unlocking..." : "Confirm & Unlock"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {step === 4 && (
              <View style={{ alignItems: "center", paddingTop: 8 }}>
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: "#d1fae5",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 14,
                  }}
                >
                  <Unlock size={28} color="#059669" />
                </View>
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "800",
                    color: "#0f172a",
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  Emergency Wallet Unlocked
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: "#475569",
                    textAlign: "center",
                    marginBottom: 20,
                  }}
                >
                  You can now transfer from this wallet.
                </Text>
                <View style={{ width: "100%", marginBottom: 20 }}>
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      marginBottom: 6,
                    }}
                  >
                    Your reason
                  </Text>
                  <View
                    style={{
                      backgroundColor: "#f8fafc",
                      borderWidth: 1,
                      borderColor: "#f1f5f9",
                      borderRadius: 14,
                      padding: 14,
                    }}
                  >
                    <Text style={{ fontSize: 13, color: "#334155" }}>
                      {submittedReason}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={handleDone}
                  style={{
                    width: "100%",
                    backgroundColor: "#4f46e5",
                    borderRadius: 16,
                    paddingVertical: 14,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}
                  >
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </SlideUpContainer>
      </View>
    </Modal>
  );
};

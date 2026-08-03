import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { SlideUpContainer } from "../SlideUpContainer";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

const WEAK_PINS = new Set([
  "0000",
  "1111",
  "2222",
  "3333",
  "4444",
  "5555",
  "6666",
  "7777",
  "8888",
  "9999",
  "1234",
  "2345",
  "3456",
  "4567",
  "5678",
  "6789",
  "4321",
  "5432",
  "6543",
  "7654",
  "8765",
  "9876",
]);

export const PinSetupModal = () => {
  const { user, accessToken, isLoading, refreshSession } = useAuth();
  const [visible, setVisible] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && user && (user as any).requiresPinSetup) {
      const timer = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, [user, isLoading]);

  const handleSubmit = async () => {
    setError("");

    if (pin.length !== 4) {
      setError("PIN must be exactly 4 digits");
      return;
    }

    if (WEAK_PINS.has(pin)) {
      setError("PIN too simple, choose something stronger");
      setPin("");
      setConfirmPin("");
      return;
    }

    if (pin !== confirmPin) {
      setError("PINs do not match");
      setConfirmPin("");
      return;
    }

    if (!accessToken) return;

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/setup-pin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ pin, confirmPin }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to set PIN");
        return;
      }

      await refreshSession();
      setVisible(false);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
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
                  width: 40,
                  height: 40,
                  borderRadius: 16,
                  backgroundColor: "#eef2ff",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <Lock size={20} color="#4f46e5" />
              </View>
              <Text
                style={{ fontSize: 17, fontWeight: "800", color: "#0f172a" }}
              >
                Set Your Transfer PIN
              </Text>
              <Text style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>
                This PIN secures every transfer. You&apos;ll need it to send money.
              </Text>
            </View>

            <View style={{ paddingHorizontal: 24, gap: 16 }}>
              <View style={{ gap: 6 }}>
                <Text
                  style={{ fontSize: 12, fontWeight: "600", color: "#334155" }}
                >
                  Enter PIN
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#f8f7fb",
                    borderWidth: 1.5,
                    borderColor: "#e2e8f0",
                    borderRadius: 14,
                    paddingHorizontal: 16,
                  }}
                >
                  <TextInput
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      fontSize: 20,
                      color: "#0f172a",
                      textAlign: "center",
                      letterSpacing: 8,
                      fontWeight: "700",
                    }}
                    value={pin}
                    onChangeText={(t) => setPin(t.replace(/\D/g, ""))}
                    secureTextEntry={!showPin}
                    keyboardType="number-pad"
                    maxLength={4}
                    placeholder="••••"
                    placeholderTextColor="#94a3b8"
                    autoFocus
                  />
                  <TouchableOpacity
                    onPress={() => setShowPin(!showPin)}
                    style={{ padding: 4 }}
                  >
                    {showPin ? (
                      <EyeOff size={20} color="#94a3b8" />
                    ) : (
                      <Eye size={20} color="#94a3b8" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ gap: 6 }}>
                <Text
                  style={{ fontSize: 12, fontWeight: "600", color: "#334155" }}
                >
                  Confirm PIN
                </Text>
                <TextInput
                  style={{
                    backgroundColor: "#f8f7fb",
                    borderWidth: 1.5,
                    borderColor: "#e2e8f0",
                    borderRadius: 14,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    fontSize: 20,
                    color: "#0f172a",
                    textAlign: "center",
                    letterSpacing: 8,
                    fontWeight: "700",
                  }}
                  value={confirmPin}
                  onChangeText={(t) => setConfirmPin(t.replace(/\D/g, ""))}
                  secureTextEntry={!showPin}
                  keyboardType="number-pad"
                  maxLength={4}
                  placeholder="••••"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <CheckCircle
                  size={14}
                  color={
                    pin.length === 4 && pin === confirmPin
                      ? "#059669"
                      : "#cbd5e1"
                  }
                />
                <Text style={{ fontSize: 11, color: "#64748b" }}>
                  PINs must match and be exactly 4 digits
                </Text>
              </View>

              {error ? (
                <View
                  style={{
                    backgroundColor: "#fef2f2",
                    borderWidth: 1,
                    borderColor: "#fecaca",
                    borderRadius: 14,
                    padding: 12,
                  }}
                >
                  <Text style={{ fontSize: 13, color: "#b91c1c" }}>
                    {error}
                  </Text>
                </View>
              ) : null}
            </View>

            <View style={{ padding: 24, gap: 8 }}>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={pin.length !== 4 || confirmPin.length !== 4 || saving}
                style={{
                  backgroundColor:
                    pin.length === 4 && confirmPin.length === 4
                      ? "#4f46e5"
                      : "#94a3b8",
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
                  {saving ? "Setting PIN..." : "Set PIN →"}
                </Text>
              </TouchableOpacity>
              <Text
                style={{ fontSize: 11, color: "#94a3b8", textAlign: "center" }}
              >
                You won&apos;t be able to send money without a transfer PIN
              </Text>
            </View>
          </View>
        </SlideUpContainer>
      </View>
    </Modal>
  );
};

export default PinSetupModal;
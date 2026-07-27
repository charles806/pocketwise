import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Eye, EyeOff, CheckCircle } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";

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

const Page = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { accessToken } = useAuth();

  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");

    if (newPin.length !== 4) {
      setError("New PIN must be exactly 4 digits");
      return;
    }
    if (WEAK_PINS.has(newPin)) {
      setError("PIN too simple, choose something stronger");
      setNewPin("");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/change-pin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ currentPin, newPin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to change PIN");
        return;
      }
      router.back();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: "#f8fafc", paddingTop: insets.top }}
    >
      <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
        >
          <ArrowLeft size={18} color="#475569" />
          <Text style={{ fontSize: 13, fontWeight: "500", color: "#475569" }}>
            Back
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
              fontSize: 20,
              fontWeight: "800",
              color: "#0f172a",
              marginBottom: 24,
            }}
          >
            Change Transfer PIN
          </Text>

          <View style={{ gap: 16 }}>
            <View style={{ gap: 6 }}>
              <Text
                style={{ fontSize: 12, fontWeight: "600", color: "#334155" }}
              >
                Current PIN
              </Text>
              <TextInput
                style={{
                  backgroundColor: "#f8fafc",
                  borderWidth: 1,
                  borderColor: "#e2e8f0",
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: "#0f172a",
                  textAlign: "center",
                  letterSpacing: 8,
                }}
                value={currentPin}
                onChangeText={(t) => setCurrentPin(t.replace(/\D/g, ""))}
                secureTextEntry={!showPin}
                keyboardType="number-pad"
                maxLength={4}
                placeholder="••••"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={{ gap: 6 }}>
              <Text
                style={{ fontSize: 12, fontWeight: "600", color: "#334155" }}
              >
                New PIN
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
                <TextInput
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: "#0f172a",
                    textAlign: "center",
                    letterSpacing: 8,
                  }}
                  value={newPin}
                  onChangeText={(t) => setNewPin(t.replace(/\D/g, ""))}
                  secureTextEntry={!showPin}
                  keyboardType="number-pad"
                  maxLength={4}
                  placeholder="••••"
                  placeholderTextColor="#94a3b8"
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

            {error && (
              <View
                style={{
                  backgroundColor: "#fef2f2",
                  borderWidth: 1,
                  borderColor: "#fecaca",
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <Text style={{ fontSize: 13, color: "#b91c1c" }}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={
                currentPin.length !== 4 || newPin.length !== 4 || saving
              }
              style={{
                backgroundColor:
                  currentPin.length === 4 && newPin.length === 4
                    ? "#4f46e5"
                    : "#94a3b8",
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>
                {saving ? "Changing..." : "Change PIN"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Page;

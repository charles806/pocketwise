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
import { ArrowLeft, Eye, EyeOff } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

const Page = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { accessToken } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/forgot-pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        toast("Check your email for PIN reset instructions", {
          type: "info",
          title: "Email Sent",
        });
        router.back();
      } else {
        toast(data.message || "Failed to send reset email", { type: "error" });
      }
    } catch {
      toast("Network error. Please try again.", { type: "error" });
    } finally {
      setSending(false);
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
              marginBottom: 8,
            }}
          >
            Forgot PIN
          </Text>
          <Text style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>
            Enter your email address and we'll send you instructions to reset
            your transfer PIN.
          </Text>

          <View style={{ gap: 16 }}>
            <View style={{ gap: 6 }}>
              <Text
                style={{ fontSize: 12, fontWeight: "600", color: "#334155" }}
              >
                Email address
              </Text>
              <TextInput
                style={{
                  backgroundColor: "#f8fafc",
                  borderWidth: 1,
                  borderColor: "#e2e8f0",
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 15,
                  color: "#0f172a",
                }}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="you@example.com"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!email.trim() || sending}
              style={{
                backgroundColor: email.trim() ? "#4f46e5" : "#94a3b8",
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>
                {sending ? "Sending..." : "Send Reset Instructions"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Page;

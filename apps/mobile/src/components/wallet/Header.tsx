import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Bell, Settings } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning,";
  if (hour < 18) return "Good afternoon,";
  return "Good evening,";
};

export const WalletHeader = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, accessToken } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!accessToken) return;
    fetch(`${API_BASE}/api/v1/notifications`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => {
        const notifs = body?.data || [];
        setUnreadCount(notifs.filter((n: any) => !n.isRead).length);
      })
      .catch(() => {});
  }, [accessToken]);

  const greeting = getGreeting();
  const initial = user?.firstName?.charAt(0)?.toUpperCase() || "?";

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
        paddingTop: insets.top * 1.75,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#4f46e5",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>
            {initial}
          </Text>
        </View>
        <View>
          <Text style={{ fontSize: 12, color: "#6b7280" }}>{greeting}</Text>
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827" }}>
            {user?.firstName || "User"} 👋
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View>
          <TouchableOpacity
            onPress={() => router.push("/notifications" as any)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: "#e2e8f0",
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.8}
          >
            <Bell size={19} color="#475569" />
          </TouchableOpacity>
          {unreadCount > 0 && (
            <View
              style={{
                position: "absolute",
                top: -2,
                right: -2,
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: "#ef4444",
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 3,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 9, fontWeight: "700" }}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={() => router.push("/profile" as any)}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: "#e2e8f0",
            alignItems: "center",
            justifyContent: "center",
          }}
          activeOpacity={0.8}
        >
          <Settings size={19} color="#475569" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WalletHeader;
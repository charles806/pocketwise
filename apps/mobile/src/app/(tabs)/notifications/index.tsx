import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Bell, Target, ArrowLeftRight, Loader } from "lucide-react-native";
import { useNotifications, Notification } from "@/hooks/useNotifications";

function formatTimeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function getDateLabel(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);

  if (date.toDateString() === now.toDateString()) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getDateKey(dateStr: string) {
  return new Date(dateStr).toDateString();
}

function groupByDate(
  notifications: Notification[],
): [string, Notification[]][] {
  const groups = new Map<string, { label: string; items: Notification[] }>();

  for (const n of notifications) {
    const key = getDateKey(n.createdAt);
    const label = getDateLabel(n.createdAt);
    if (!groups.has(key)) groups.set(key, { label, items: [] });
    groups.get(key)!.items.push(n);
  }

  const todayKey = getDateKey(new Date().toISOString());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = getDateKey(yesterday.toISOString());

  const sorted = Array.from(groups.entries()).sort(([aKey], [bKey]) => {
    if (aKey === todayKey) return -1;
    if (bKey === todayKey) return 1;
    if (aKey === yesterdayKey) return -1;
    if (bKey === yesterdayKey) return 1;
    return new Date(bKey).getTime() - new Date(aKey).getTime();
  });

  return sorted.map(
    ([, group]) => [group.label, group.items] as [string, Notification[]],
  );
}

function categoryConfig(category: string) {
  switch (category) {
    case "GOAL":
      return { icon: Target, bg: "#eef2ff", color: "#4f46e5" };
    case "TRANSACTION":
      return { icon: ArrowLeftRight, bg: "#d1fae5", color: "#059669" };
    default:
      return { icon: Bell, bg: "#f1f5f9", color: "#475569" };
  }
}

const SkeletonRow = () => (
  <View
    style={{
      height: 64,
      backgroundColor: "#f1f5f9",
      borderRadius: 12,
      marginBottom: 8,
    }}
  />
);

const Page = () => {
  const insets = useSafeAreaInsets();
  const {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    markingAll,
    refetch,
  } = useNotifications();

  const groups = useMemo(() => groupByDate(notifications), [notifications]);

  return (
    <View
      style={{ flex: 1, backgroundColor: "#f8fafc", paddingTop: insets.top }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <View>
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#0f172a" }}>
            Notifications
          </Text>
          <Text style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
            Stay updated on your activity
          </Text>
        </View>
        {unreadCount > 0 && !markingAll && (
          <TouchableOpacity
            onPress={markAllAsRead}
            style={{
              backgroundColor: "#4f46e5",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 12,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#fff" }}>
              Mark all as read
            </Text>
          </TouchableOpacity>
        )}
        {markingAll && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: "#4f46e5",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 12,
            }}
          >
            <ActivityIndicator color="#fff" size="small" />
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#fff" }}>
              Marking...
            </Text>
          </View>
        )}
      </View>

      {loading ? (
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonRow key={i} />
          ))}
        </View>
      ) : notifications.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 32,
          }}
        >
          <Bell size={48} color="#cbd5e1" />
          <Text
            style={{
              fontSize: 15,
              fontWeight: "500",
              color: "#64748b",
              marginTop: 16,
              marginBottom: 4,
            }}
          >
            No notifications yet
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: "#94a3b8",
              textAlign: "center",
              maxWidth: 280,
            }}
          >
            We'll notify you about transfers, goal progress, and more
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 100,
            gap: 20,
          }}
        >
          {groups.map(([label, notifs]) => (
            <View key={label}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  marginBottom: 8,
                }}
              >
                {label}
              </Text>
              <View style={{ gap: 8 }}>
                {notifs.map((n) => {
                  const cfg = categoryConfig(n.category);
                  const Icon = cfg.icon;
                  return (
                    <TouchableOpacity
                      key={n.id}
                      onPress={() => {
                        if (!n.isRead) markAsRead(n.id);
                      }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                        padding: 16,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: "#f1f5f9",
                        backgroundColor: n.isRead ? "#f8fafc" : "#fff",
                        borderLeftWidth: 4,
                        borderLeftColor: n.isRead ? "transparent" : "#4f46e5",
                      }}
                    >
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: cfg.bg,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon size={20} color={cfg.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "600",
                            color: "#0f172a",
                          }}
                          numberOfLines={1}
                        >
                          {n.title}
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#64748b",
                            marginTop: 2,
                          }}
                          numberOfLines={2}
                        >
                          {n.message}
                        </Text>
                      </View>
                      <View style={{ alignItems: "flex-end", gap: 4 }}>
                        <Text style={{ fontSize: 11, color: "#94a3b8" }}>
                          {formatTimeAgo(n.createdAt)}
                        </Text>
                        {!n.isRead && (
                          <View
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: "#4f46e5",
                            }}
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default Page;

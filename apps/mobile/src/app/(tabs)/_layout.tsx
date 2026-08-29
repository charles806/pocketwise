import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Wallet,
  ArrowLeftRight,
  Target,
  Bell,
  User,
} from "lucide-react-native";

const ACTIVE_COLOR = "#7c3aed";
const INACTIVE_COLOR = "#94a3b8";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        lazy: false,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "#f1f5f9",
          height: 75 + insets.bottom,
          paddingBottom: insets.bottom + 8,
          paddingTop: 10,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: { fontSize: 10.5, fontWeight: "600", marginTop: 2 },
        ...Platform.select({
          android: { tabBarItemStyle: { overflow: "hidden" } },
        }),
      }}
    >
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Wallet color={color} size={22} strokeWidth={focused ? 2.4 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <ArrowLeftRight
                color={color}
                size={22}
                strokeWidth={focused ? 2.4 : 2}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: "Goals",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Target color={color} size={22} strokeWidth={focused ? 2.4 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Bell color={color} size={22} strokeWidth={focused ? 2.4 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <User color={color} size={22} strokeWidth={focused ? 2.4 : 2} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="goals/create"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile/change-pin"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile/forgot-pin"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 40,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: { backgroundColor: "#f5f3ff" },
});

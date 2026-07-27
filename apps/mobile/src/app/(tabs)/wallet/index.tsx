import React, { useState, useEffect } from "react";
import { View, ScrollView } from "react-native";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from "@/context/AuthContext";
import { WalletHeader } from "./UI/Header";
import { PinSetupModal } from "./UI/PinSetupModal";
import { GoalModal } from "./UI/GoalModal";
import { BalanceCard } from "./UI/BalanceCard";
import { WalletCards } from "./UI/WalletCard";
import { RecentTransactions } from "./UI/RecentTransactions";
import { SpendingOverview } from "./UI/SpendingOverview";
import { EmergencyUnlockModal } from "./UI/EmergencyUnlockModal";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

const Wallet = () => {
  const { accessToken, isLoading: authLoading } = useAuth();
  const { data } = useWallet(accessToken);
  const [splitConfig, setSplitConfig] = useState<any>(null);
  const [emergencyModalVisible, setEmergencyModalVisible] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    fetch(`${API_BASE}/api/v1/wallet-split`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) setSplitConfig(d.data);
      })
      .catch(() => {});
  }, [accessToken]);

  const balance = data?.totalBalance;
  const wallets = data?.wallets;

  if (authLoading || !data) {
    return (
      <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
        <WalletHeader />
        <PinSetupModal />
        <GoalModal />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingTop: 32, gap: 24 }}
        >
          <View
            style={{
              height: 200,
              borderRadius: 28,
              backgroundColor: "#e2e8f0",
            }}
          />
          <View
            style={{
              height: 250,
              borderRadius: 24,
              backgroundColor: "#e2e8f0",
            }}
          />
          <View
            style={{
              height: 300,
              borderRadius: 24,
              backgroundColor: "#e2e8f0",
            }}
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <WalletHeader />
      <PinSetupModal />
      <GoalModal />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 48, gap: 20 }}
      >
        <BalanceCard totalBalance={balance ?? 0} />

        <WalletCards
          wallets={wallets}
          splitConfig={splitConfig}
          onOpenEmergencyModal={() => setEmergencyModalVisible(true)}
        />

        <SpendingOverview />

        <RecentTransactions />
      </ScrollView>

      <EmergencyUnlockModal
        visible={emergencyModalVisible}
        onDone={() => setEmergencyModalVisible(false)}
        onClose={() => setEmergencyModalVisible(false)}
      />
    </View>
  );
};

export default Wallet;

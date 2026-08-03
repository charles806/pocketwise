import { View, Text } from "react-native";

interface SpendingItemProps {
  label: string;
  amount: string;
  progress: number;
  color: string;
}

const SpendingItem = ({
  label,
  amount,
  progress,
  color,
}: SpendingItemProps) => (
  <View style={{ gap: 8 }}>
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 17, fontWeight: "600", color: "#0f172a" }}>
        {label}
      </Text>
      <Text style={{ fontSize: 17, fontWeight: "500", color: "#94a3b8" }}>
        {amount}
      </Text>
    </View>
    <View
      style={{
        height: 6,
        backgroundColor: "#f1f5f9",
        borderRadius: 999,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          height: "100%",
          borderRadius: 999,
          backgroundColor: color,
          width: `${progress}%`,
        }}
      />
    </View>
  </View>
);

export const SpendingOverview = () => (
  <View
    style={{
      backgroundColor: "#fff",
      borderRadius: 24,
      padding: 20,
      borderWidth: 1,
      borderColor: "#f1f5f9",
      marginHorizontal: 16,
    }}
  >
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "800", color: "#0f172a" }}>
        Spending Overview
      </Text>
      <Text style={{ fontSize: 18, fontWeight: "600", color: "#94a3b8" }}>
        This Week
      </Text>
    </View>
    <View style={{ gap: 20 }}>
      <SpendingItem
        label="Food & Drinks"
        amount="₦15,700"
        progress={75}
        color="#6366f1"
      />
      <SpendingItem
        label="Transport"
        amount="₦8,200"
        progress={40}
        color="#10b981"
      />
      <SpendingItem
        label="Airtime & Data"
        amount="₦5,000"
        progress={25}
        color="#f59e0b"
      />
      <SpendingItem
        label="Shopping"
        amount="₦5,500"
        progress={30}
        color="#f43f5e"
      />
    </View>
  </View>
);

export default SpendingOverview;
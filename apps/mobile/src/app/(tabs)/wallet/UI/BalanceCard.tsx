import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Send, Download, Plus } from "lucide-react-native";

interface Props {
  totalBalance: number;
  onSend?: () => void;
  onReceive?: () => void;
  onTopUp?: () => void;
}

function formatNaira(amount: number) {
  return `₦${(amount ?? 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export const BalanceCard = ({
  totalBalance,
  onSend,
  onReceive,
  onTopUp,
}: Props) => (
  <LinearGradient
    colors={["#4f46e5", "#4338ca"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={{
      borderRadius: 28,
      padding: 24,
      gap: 22,
      marginHorizontal: 16,
    }}
  >
    <View style={{ gap: 4 }}>
      <Text
        style={{
          color: "#c7d2fe",
          fontSize: 12,
          fontWeight: "700",
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        Total Balance
      </Text>
      <Text style={{ color: "#fff", fontSize: 32, fontWeight: "800" }}>
        {formatNaira(totalBalance)}
      </Text>
    </View>

    <View style={{ flexDirection: "row", gap: 12 }}>
      {[
        { icon: Send, label: "Send", onPress: onSend },
        { icon: Download, label: "Receive", onPress: onReceive },
        { icon: Plus, label: "Top Up", onPress: onTopUp },
      ].map(({ icon: Icon, label, onPress }) => (
        <TouchableOpacity
          key={label}
          onPress={onPress}
          activeOpacity={0.8}
          style={{
            flex: 1,
            backgroundColor: "rgba(255,255,255,0.12)",
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: "center",
            gap: 6,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <Icon size={18} color="#c7d2fe" />
          <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </LinearGradient>
);

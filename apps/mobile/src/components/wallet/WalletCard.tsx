import { View, Text, Pressable } from "react-native";
import { Lock } from "lucide-react-native";

export interface WalletData {
  type: string;
  balance: number;
  percent: number;
}

interface WalletItemProps {
  label: string;
  percentage: string;
  balance: string;
  dotColor: string;
  balanceColor: string;
  onPress?: () => void;
  badge?: React.ReactNode;
}

interface WalletCardsProps {
  wallets: WalletData[] | null;
  splitConfig?: {
    spendPercent: number;
    savingsPercent: number;
    emergencyPercent: number;
    flexPercent: number;
  } | null;
  onOpenEmergencyModal?: () => void;
}

function formatNaira(amount: number) {
  return `₦${(amount ?? 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const WalletItem = ({
  label,
  percentage,
  balance,
  dotColor,
  balanceColor,
  onPress,
  badge,
}: WalletItemProps) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => ({
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
      backgroundColor: "#f8fafc",
      borderRadius: 18,
      borderWidth: 1,
      borderColor: "#f1f5f9",
      opacity: pressed ? 0.85 : 1,
    })}
  >
    <View style={{ flex: 1, position: "relative" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: dotColor,
          }}
        />
        <View>
          <Text style={{ fontSize: 17, fontWeight: "700", color: "#0f172a" }}>
            {label}
          </Text>
          <Text style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
            {percentage} of deposits
          </Text>
        </View>
      </View>
      {badge}
    </View>
    <Text
      style={{
        fontSize: 18,
        fontWeight: "700",
        color: balanceColor,
        marginLeft: 12,
      }}
    >
      {balance}
    </Text>
  </Pressable>
);

export const WalletCards = ({
  wallets,
  splitConfig,
  onOpenEmergencyModal,
}: WalletCardsProps) => {
  const getBalance = (type: string) => {
    if (!wallets) return "₦0.00";
    const wallet = wallets.find((w) => w.type === type);
    return formatNaira(wallet ? wallet.balance : 0);
  };

  return (
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
      <Text
        style={{
          fontSize: 24,
          fontWeight: "800",
          color: "#0f172a",
          marginBottom: 16,
        }}
      >
        My Wallets
      </Text>
      <View style={{ gap: 10 }}>
        <WalletItem
          label="Spend"
          percentage={`${splitConfig?.spendPercent ?? 50}%`}
          balance={getBalance("spend")}
          dotColor="#4f46e5"
          balanceColor="#4f46e5"
        />
        <WalletItem
          label="Savings"
          percentage={`${splitConfig?.savingsPercent ?? 30}%`}
          balance={getBalance("savings")}
          dotColor="#059669"
          balanceColor="#059669"
        />
        <WalletItem
          label="Emergency"
          percentage={`${splitConfig?.emergencyPercent ?? 10}%`}
          balance={getBalance("emergency")}
          dotColor="#d97706"
          balanceColor="#d97706"
          onPress={onOpenEmergencyModal}
          badge={
            <View
              style={{
                position: "absolute",
                top: -6,
                left: -6,
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: "#d97706",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Lock size={11} color="#fff" />
            </View>
          }
        />
        <WalletItem
          label="Flex"
          percentage={`${splitConfig?.flexPercent ?? 10}%`}
          balance={getBalance("flex")}
          dotColor="#db2777"
          balanceColor="#db2777"
        />
      </View>
    </View>
  );
};

export default WalletCards;
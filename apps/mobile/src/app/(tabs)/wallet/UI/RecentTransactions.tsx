import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import {
  ShoppingBag,
  CreditCard,
  ArrowDownLeft,
  ReceiptText,
  ArrowRight,
} from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

function formatNaira(amount: number) {
  return `₦${(amount ?? 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

interface TransactionItemProps {
  title: string;
  time: string;
  amount: string;
  type: "income" | "expense";
  icon: React.ReactNode;
  iconBg: string;
}

const TransactionItem = ({
  title,
  time,
  amount,
  type,
  icon,
  iconBg,
}: TransactionItemProps) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: "#f8fafc",
    }}
  >
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 16,
          backgroundColor: iconBg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </View>
      <View>
        <Text style={{ fontSize: 17, fontWeight: "700", color: "#0f172a" }}>
          {title}
        </Text>
        <Text style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
          {time}
        </Text>
      </View>
    </View>
    <Text
      style={{
        fontSize: 17,
        fontWeight: "700",
        color: type === "income" ? "#10b981" : "#f43f5e",
      }}
    >
      {type === "income" ? `+${amount}` : `-${amount}`}
    </Text>
  </View>
);

interface Transaction {
  id: string;
  type: string;
  direction: string;
  amount: number;
  reason: string | null;
  createdAt: string;
}

export const RecentTransactions = () => {
  const { accessToken } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    fetch(`${API_BASE}/api/v1/transactions`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => {
        setTransactions(body?.data?.transactions?.slice(0, 5) || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accessToken]);

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
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: "800", color: "#0f172a" }}>
          Recent Transactions
        </Text>
        <TouchableOpacity>
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#4f46e5" }}>
            See all
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ alignItems: "center", paddingVertical: 30 }}>
          <ActivityIndicator color="#4f46e5" />
        </View>
      ) : transactions.length === 0 ? (
        <View style={{ alignItems: "center", paddingVertical: 30 }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              backgroundColor: "#f1f5f9",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
            }}
          >
            <ReceiptText size={26} color="#94a3b8" />
          </View>
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#0f172a" }}>
            No transactions yet
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: "#94a3b8",
              textAlign: "center",
              marginTop: 4,
              marginBottom: 18,
              maxWidth: 260,
            }}
          >
            Add money to your wallet to get started. Your activity will appear
            here automatically.
          </Text>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: "#4f46e5",
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 14,
            }}
            activeOpacity={0.85}
          >
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>
              Add Money
            </Text>
            <ArrowRight size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        transactions.map((tx, idx) => {
          const isIncome =
            tx.type === "deposit" ||
            tx.type === "split_credit" ||
            tx.type === "referral_credit";
          const date = new Date(tx.createdAt);
          const timeStr = date.toLocaleDateString("en-NG", {
            weekday: "short",
            hour: "numeric",
            minute: "2-digit",
          });
          let icon = <ShoppingBag size={20} color="#d97706" />;
          let iconBg = "#fef3c7";
          if (isIncome) {
            icon = <CreditCard size={20} color="#4f46e5" />;
            iconBg = "#eef2ff";
          } else if (tx.type === "withdrawal" || tx.type === "transfer") {
            icon = <ArrowDownLeft size={20} color="#059669" />;
            iconBg = "#d1fae5";
          }
          return (
            <TransactionItem
              key={tx.id || idx}
              title={tx.reason || (isIncome ? "Credit" : "Debit")}
              time={timeStr}
              amount={formatNaira(tx.amount)}
              type={isIncome ? "income" : "expense"}
              icon={icon}
              iconBg={iconBg}
            />
          );
        })
      )}
    </View>
  );
};

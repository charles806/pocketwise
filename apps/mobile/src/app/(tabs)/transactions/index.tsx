import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  ChevronDown,
  Receipt,
} from "lucide-react-native";
import { useTransactions, Transaction } from "@/hooks/useTransactions";
import { TransactionDetailModal } from "@/components/TransactionDetailModal";

type FilterTab = "all" | "sent" | "received" | "deposit";

const FILTERS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "sent", label: "Sent" },
  { key: "received", label: "Received" },
  { key: "deposit", label: "Deposits" },
];

function formatNaira(amount: number) {
  return `₦${(amount ?? 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatMonthKey(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-NG", { month: "long", year: "numeric" });
}

function directionConfig(direction: string) {
  switch (direction) {
    case "sent":
      return {
        icon: ArrowUpRight,
        bg: "#ffe4e6",
        color: "#e11d48",
        prefix: "-",
        amountColor: "#e11d48",
      };
    case "received":
      return {
        icon: ArrowDownLeft,
        bg: "#d1fae5",
        color: "#059669",
        prefix: "+",
        amountColor: "#059669",
      };
    case "deposit":
      return {
        icon: Wallet,
        bg: "#eef2ff",
        color: "#4f46e5",
        prefix: "+",
        amountColor: "#059669",
      };
    default:
      return {
        icon: ArrowDownLeft,
        bg: "#f1f5f9",
        color: "#64748b",
        prefix: "",
        amountColor: "#64748b",
      };
  }
}

function getFallbackLabel(direction: string, type: string) {
  if (direction === "sent") return "Transfer Out";
  if (direction === "received") return "Transfer In";
  if (direction === "deposit") return "Deposit";
  return type;
}

interface MonthGroup {
  key: string;
  label: string;
  transactions: Transaction[];
  totalIn: number;
  totalOut: number;
}

const Page = () => {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [page, setPage] = useState(1);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading } = useTransactions(activeFilter, page, true);

  React.useEffect(() => {
    if (data?.transactions) {
      if (page === 1) {
        setAllTransactions(data.transactions);
      } else {
        setAllTransactions((prev) => [...prev, ...data.transactions]);
      }
    }
  }, [data, page]);

  React.useEffect(() => {
    setPage(1);
    setAllTransactions([]);
  }, [activeFilter]);

  React.useEffect(() => {
    if (allTransactions.length > 0) {
      const mostRecent = formatMonthKey(allTransactions[0].createdAt);
      setExpandedMonths(new Set([mostRecent]));
    }
  }, [allTransactions]);

  const toggleMonth = (key: string) => {
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const loadMore = () => {
    if (data?.hasMore && !isLoading) {
      setPage((p) => p + 1);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    setAllTransactions([]);
    setRefreshing(false);
  }, []);

  const monthGroups: MonthGroup[] = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    for (const tx of allTransactions) {
      const key = formatMonthKey(tx.createdAt);
      if (!groups[key]) groups[key] = [];
      groups[key].push(tx);
    }
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, txs]) => {
        const totalIn = txs
          .filter((t) => t.direction !== "sent")
          .reduce((s, t) => s + Math.abs(t.amount), 0);
        const totalOut = txs
          .filter((t) => t.direction === "sent")
          .reduce((s, t) => s + Math.abs(t.amount), 0);
        return {
          key,
          label: formatMonthLabel(txs[0].createdAt),
          transactions: txs,
          totalIn,
          totalOut,
        };
      });
  }, [allTransactions]);

  if (isLoading && page === 1) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#f8fafc",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color="#4f46e5" size="large" />
      </View>
    );
  }

  const renderTransaction = (tx: Transaction) => {
    const cfg = directionConfig(tx.direction);
    const Icon = cfg.icon;
    return (
      <TouchableOpacity
        key={tx.id}
        onPress={() => setSelectedTx(tx)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          padding: 12,
          borderRadius: 12,
        }}
        activeOpacity={0.7}
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
            style={{ fontSize: 13, fontWeight: "600", color: "#0f172a" }}
            numberOfLines={1}
          >
            {tx.counterpartyName || getFallbackLabel(tx.direction, tx.type)}
          </Text>
          <Text style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
            {formatDate(tx.createdAt)}
          </Text>
        </View>
        <Text
          style={{ fontSize: 13, fontWeight: "700", color: cfg.amountColor }}
        >
          {cfg.prefix}
          {formatNaira(Math.abs(tx.amount))}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: "#f8fafc", paddingTop: insets.top }}
    >
      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "800",
            color: "#0f172a",
            textAlign: "center",
          }}
        >
          Transaction History
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: "#64748b",
            textAlign: "center",
            marginTop: 2,
          }}
        >
          View and manage all your transactions
        </Text>
      </View>

      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setActiveFilter(f.key)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 16,
                backgroundColor: activeFilter === f.key ? "#4f46e5" : "#f8fafc",
                borderWidth: 1,
                borderColor: activeFilter === f.key ? "#4f46e5" : "#e2e8f0",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: activeFilter === f.key ? "#fff" : "#64748b",
                }}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {allTransactions.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 32,
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              backgroundColor: "#f1f5f9",
              borderWidth: 1,
              borderColor: "#e2e8f0",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Receipt size={28} color="#94a3b8" />
          </View>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#0f172a",
              marginBottom: 4,
            }}
          >
            No transactions yet
          </Text>
          <Text style={{ fontSize: 13, color: "#94a3b8", textAlign: "center" }}>
            Your transaction history will show up here
          </Text>
        </View>
      ) : (
        <FlatList
          data={monthGroups}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#4f46e5"
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          renderItem={({ item: group }) => {
            const isExpanded = expandedMonths.has(group.key);
            return (
              <View
                style={{
                  marginHorizontal: 16,
                  marginBottom: 8,
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "#e2e8f0",
                  overflow: "hidden",
                }}
              >
                <TouchableOpacity
                  onPress={() => toggleMonth(group.key)}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 16,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: "#334155",
                      }}
                    >
                      {group.label}
                    </Text>
                    <Text style={{ fontSize: 11, color: "#94a3b8" }}>
                      +{formatNaira(group.totalIn)} / -
                      {formatNaira(group.totalOut)}
                    </Text>
                  </View>
                  <ChevronDown
                    size={16}
                    color="#94a3b8"
                    style={{
                      transform: [{ rotate: isExpanded ? "180deg" : "0deg" }],
                    }}
                  />
                </TouchableOpacity>
                {isExpanded && (
                  <View
                    style={{
                      borderTopWidth: 1,
                      borderTopColor: "#f1f5f9",
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                    }}
                  >
                    {group.transactions.map((tx) => renderTransaction(tx))}
                  </View>
                )}
              </View>
            );
          }}
          ListFooterComponent={() =>
            isLoading && page > 1 ? (
              <View style={{ padding: 16, alignItems: "center" }}>
                <ActivityIndicator color="#4f46e5" />
              </View>
            ) : null
          }
        />
      )}

      {selectedTx && (
        <TransactionDetailModal
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
        />
      )}
    </View>
  );
};

export default Page;

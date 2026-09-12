import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from "react-native";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Wallet as WalletIcon,
  ChevronDown,
  Receipt,
} from "lucide-react-native";
import { TransactionDetailModal } from "@/components/TransactionDetailModal";
import { useTransactions } from "@/hooks/useTransactions";

type Direction = "sent" | "received" | "deposit";
type FilterTab = "all" | "sent" | "received" | "deposit";

interface Transaction {
  id: string;
  type: string;
  direction: Direction;
  amount: number;
  reason: string | null;
  status: string;
  createdAt: string;
  counterpartyName: string | null;
}

interface MonthGroup {
  key: string;
  label: string;
  transactions: Transaction[];
  totalIn: number;
  totalOut: number;
}

const filters: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "sent", label: "Sent" },
  { key: "received", label: "Received" },
  { key: "deposit", label: "Deposits" },
];

const formatNaira = (amount: number) =>
  `₦${Math.abs(amount).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatMonthKey = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const formatMonthLabel = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-NG", { month: "long", year: "numeric" });
};

const directionConfig = (direction: Direction) => {
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
        icon: WalletIcon,
        bg: "#e0e7ff",
        color: "#4f46e5",
        prefix: "+",
        amountColor: "#059669",
      };
  }
};

const getFallbackLabel = (direction: Direction, type: string) => {
  if (direction === "sent") return "Transfer Out";
  if (direction === "received") return "Transfer In";
  if (direction === "deposit") return "Deposit";
  return type;
};

const FilterTabs = ({
  active,
  onChange,
}: {
  active: FilterTab;
  onChange: (f: FilterTab) => void;
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterRow}
    >
      {filters.map((f) => {
        const isActive = active === f.key;
        return (
          <TouchableOpacity
            key={f.key}
            onPress={() => onChange(f.key)}
            activeOpacity={0.85}
            style={[styles.filterChip, isActive && styles.filterChipActive]}
          >
            <Text
              style={[
                styles.filterChipText,
                isActive && styles.filterChipTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const TransactionRow = ({
  tx,
  onPress,
}: {
  tx: Transaction;
  onPress: () => void;
}) => {
  const cfg = directionConfig(tx.direction);
  const Icon = cfg.icon;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.txnRow, pressed && { opacity: 0.7 }]}
    >
      <View style={[styles.txnIconWrap, { backgroundColor: cfg.bg }]}>
        <Icon size={19} color={cfg.color} />
      </View>
      <View style={styles.txnTextWrap}>
        <Text style={styles.txnTitle} numberOfLines={1}>
          {tx.counterpartyName || getFallbackLabel(tx.direction, tx.type)}
        </Text>
        <Text style={styles.txnDate}>{formatDate(tx.createdAt)}</Text>
      </View>
      <Text style={[styles.txnAmount, { color: cfg.amountColor }]}>
        {cfg.prefix}
        {formatNaira(tx.amount)}
      </Text>
    </Pressable>
  );
};

const MonthGroupCard = ({
  group,
  expanded,
  onToggle,
  onSelectTx,
}: {
  group: MonthGroup;
  expanded: boolean;
  onToggle: () => void;
  onSelectTx: (tx: Transaction) => void;
}) => {
  return (
    <View style={styles.monthCard}>
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.8}
        style={styles.monthHeader}
      >
        <View style={styles.monthHeaderLeft}>
          <Text style={styles.monthLabel}>{group.label}</Text>
          <Text style={styles.monthTotals}>
            +{formatNaira(group.totalIn)} / -{formatNaira(group.totalOut)}
          </Text>
        </View>
        <ChevronDown
          size={16}
          color="#94a3b8"
          style={{ transform: [{ rotate: expanded ? "180deg" : "0deg" }] }}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.monthBody}>
          {group.transactions.map((tx) => (
            <TransactionRow
              key={tx.id}
              tx={tx}
              onPress={() => onSelectTx(tx)}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const Page = () => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const { data, isLoading } = useTransactions(activeFilter, 1, true);
  const transactions = React.useMemo(
    () => data?.transactions ?? [],
    [data?.transactions],
  );

  const monthGroups: MonthGroup[] = React.useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    for (const tx of transactions) {
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
          label: formatMonthLabel(txs[0]!.createdAt),
          transactions: txs,
          totalIn,
          totalOut,
        };
      });
  }, [transactions]);

  const toggleMonth = (key: string) => {
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.screenContent}
      >
        <View style={styles.titleWrap}>
          <Text style={styles.title}>Transaction History</Text>
          <Text style={styles.subtitle}>
            View and manage all your transactions
          </Text>
        </View>

        <FilterTabs
          active={activeFilter}
          onChange={(filter) => {
            setActiveFilter(filter);
            setSelectedTx(null);
          }}
        />

        {isLoading ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Receipt size={26} color="#94a3b8" />
            </View>
            <Text style={styles.emptyTitle}>Loading transactions…</Text>
            <Text style={styles.emptySubtitle}>
              Fetching your latest activity.
            </Text>
          </View>
        ) : transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Receipt size={26} color="#94a3b8" />
            </View>
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptySubtitle}>
              Your transaction history will show up here
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {monthGroups.map((group) => (
              <MonthGroupCard
                key={group.key}
                group={group}
                expanded={expandedMonths.has(group.key)}
                onToggle={() => toggleMonth(group.key)}
                onSelectTx={setSelectedTx}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <TransactionDetailModal
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
      />
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },

  screen: { flex: 1 },
  screenContent: { padding: 20, paddingTop: 24, paddingBottom: 48, gap: 18 },

  titleWrap: { alignItems: "flex-start", marginBottom: 2 },
  title: { fontSize: 27, fontWeight: "800", color: "#0f172a" },
  subtitle: { fontSize: 14, color: "#64748b", marginTop: 6 },

  filterRow: {
    gap: 8,
    paddingVertical: 2,
    flexGrow: 1,
    justifyContent: "flex-start",
  },
  filterChip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  filterChipActive: {
    backgroundColor: "#312e81",
    borderColor: "#312e81",
  },
  filterChipText: { fontSize: 13, fontWeight: "600", color: "#475569" },
  filterChipTextActive: { color: "#fff" },

  emptyState: {
    alignItems: "center",
    paddingVertical: 56,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  emptySubtitle: {
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 6,
    maxWidth: 260,
  },

  monthCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  monthHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  monthLabel: { fontSize: 15, fontWeight: "800", color: "#1e293b" },
  monthTotals: { fontSize: 11, color: "#94a3b8" },
  monthBody: {
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingHorizontal: 8,
  },

  txnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  txnIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  txnTextWrap: { flex: 1 },
  txnTitle: { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  txnDate: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  txnAmount: { fontSize: 14, fontWeight: "700" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    position: "relative",
  },
  modalCloseBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  modalStep: { alignItems: "center", paddingTop: 8, marginBottom: 20 },
  modalIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  modalAmount: { fontSize: 24, fontWeight: "800" },
  modalSubtitle: { fontSize: 14, color: "#64748b", marginTop: 4 },
  modalDetailList: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  modalDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalDetailLabel: { fontSize: 13, color: "#94a3b8", fontWeight: "600" },
  modalDetailValue: {
    fontSize: 13,
    color: "#0f172a",
    fontWeight: "700",
    textTransform: "capitalize",
  },
  modalPrimaryBtn: {
    backgroundColor: "#4f46e5",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  modalPrimaryBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});

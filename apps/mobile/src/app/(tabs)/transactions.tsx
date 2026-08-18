import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Wallet as WalletIcon,
  ChevronDown,
  Receipt,
  Bell,
  Settings,
  X,
} from "lucide-react-native";

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

const defaultTransactions: Transaction[] = [];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning,";
  if (hour < 18) return "Good afternoon,";
  return "Good evening,";
};

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

const TransactionsHeader = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const greeting = getGreeting();
  const unreadCount = 0;

  return (
    <View style={[styles.header, { paddingTop: insets.top * 1.75 }]}>
      <View style={styles.headerLeft}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>?</Text>
        </View>
        <View>
          <Text style={styles.greetingText}>{greeting}</Text>
          <Text style={styles.greetingName}>Charles 👋</Text>
        </View>
      </View>

      <View style={styles.headerRight}>
        <View>
          <TouchableOpacity
            onPress={() => router.push("/notifications" as any)}
            style={styles.headerIconBtn}
            activeOpacity={0.8}
          >
            <Bell size={19} color="#475569" />
          </TouchableOpacity>
          {unreadCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={() => router.push("/profile" as any)}
          style={styles.headerIconBtn}
          activeOpacity={0.8}
        >
          <Settings size={19} color="#475569" />
        </TouchableOpacity>
      </View>
    </View>
  );
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

const TransactionDetailModal = ({
  transaction,
  onClose,
}: {
  transaction: Transaction | null;
  onClose: () => void;
}) => {
  if (!transaction) return null;
  const cfg = directionConfig(transaction.direction);
  const Icon = cfg.icon;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
            <X size={16} color="#64748b" />
          </TouchableOpacity>

          <View style={styles.modalStep}>
            <View style={[styles.modalIconWrap, { backgroundColor: cfg.bg }]}>
              <Icon size={26} color={cfg.color} />
            </View>
            <Text style={[styles.modalAmount, { color: cfg.amountColor }]}>
              {cfg.prefix}
              {formatNaira(transaction.amount)}
            </Text>
            <Text style={styles.modalSubtitle}>
              {transaction.counterpartyName ||
                getFallbackLabel(transaction.direction, transaction.type)}
            </Text>
          </View>

          <View style={styles.modalDetailList}>
            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailLabel}>Status</Text>
              <Text style={styles.modalDetailValue}>
                {transaction.status}
              </Text>
            </View>
            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailLabel}>Date</Text>
              <Text style={styles.modalDetailValue}>
                {formatDate(transaction.createdAt)}
              </Text>
            </View>
            {!!transaction.reason && (
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Note</Text>
                <Text style={styles.modalDetailValue}>
                  {transaction.reason}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={onClose}
            style={styles.modalPrimaryBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.modalPrimaryBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const TransactionsScreen = () => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(
    new Set(),
  );
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const transactions = defaultTransactions;

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
      <TransactionsHeader />

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

        <FilterTabs active={activeFilter} onChange={setActiveFilter} />

        {transactions.length === 0 ? (
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

export default TransactionsScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4f46e5",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  greetingText: { fontSize: 12, color: "#6b7280" },
  greetingName: { fontSize: 15, fontWeight: "700", color: "#111827" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  headerBadge: {
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
  },
  headerBadgeText: { color: "#fff", fontSize: 9, fontWeight: "700" },

  screen: { flex: 1 },
  screenContent: { padding: 20, paddingBottom: 48, gap: 20 },

  titleWrap: { alignItems: "center", marginTop: 8 },
  title: { fontSize: 22, fontWeight: "800", color: "#0f172a" },
  subtitle: { fontSize: 13, color: "#64748b", marginTop: 4 },

  filterRow: {
    gap: 8,
    paddingVertical: 2,
    flexGrow: 1,
    justifyContent: "center",
  },
  filterChip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
  },
  filterChipActive: {
    backgroundColor: "#4f46e5",
    borderColor: "#4f46e5",
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
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    overflow: "hidden",
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  monthHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  monthLabel: { fontSize: 14, fontWeight: "700", color: "#334155" },
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
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
  },
  txnIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Send,
  Download,
  Plus,
  Lock,
  ShieldAlert,
  Unlock,
  X,
  ShoppingBag,
  CreditCard,
  ReceiptText,
  ArrowRight,
  Bell,
  Settings,
} from "lucide-react-native";

const formatNaira = (amount: number) =>
  `₦${(amount ?? 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const defaultBalance = 0;

const defaultWallets = [
  { type: "spend", balance: 0, percent: 50 },
  { type: "savings", balance: 0, percent: 30 },
  { type: "emergency", balance: 0, percent: 10 },
  { type: "flex", balance: 0, percent: 10 },
];

const defaultTransactions: {
  id: string;
  title: string;
  time: string;
  amount: number;
  type: "income" | "expense";
}[] = [];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning,";
  if (hour < 18) return "Good afternoon,";
  return "Good evening,";
};

const BalanceCard = ({
  totalBalance,
  onSend,
  onReceive,
  onTopUp,
}: {
  totalBalance: number;
  onSend?: () => void;
  onReceive?: () => void;
  onTopUp?: () => void;
}) => {
  return (
    <LinearGradient
      colors={["#4f46e5", "#4338ca"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.balanceCard}
    >
      <Text style={styles.balanceLabel}>Total Balance</Text>
      <Text style={styles.balanceAmount}>{formatNaira(totalBalance)}</Text>

      <View style={styles.actionRow}>
        <TouchableOpacity
          onPress={onSend}
          activeOpacity={0.8}
          style={styles.actionButton}
        >
          <Send size={18} color="#c7d2fe" />
          <Text style={styles.actionLabel}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onReceive}
          activeOpacity={0.8}
          style={styles.actionButton}
        >
          <Download size={18} color="#c7d2fe" />
          <Text style={styles.actionLabel}>Receive</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onTopUp}
          activeOpacity={0.8}
          style={styles.actionButton}
        >
          <Plus size={18} color="#c7d2fe" />
          <Text style={styles.actionLabel}>Top Up</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const WalletItem = ({
  label,
  percentage,
  balance,
  dotColor,
  balanceColor,
  onPress,
  badge,
}: {
  label: string;
  percentage: string;
  balance: string;
  dotColor: string;
  balanceColor: string;
  onPress?: () => void;
  badge?: React.ReactNode;
}) => {
  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.walletItem}>
      <View style={styles.walletItemLeft}>
        <View style={styles.walletItemLeftRow}>
          <View style={[styles.dot, { backgroundColor: dotColor }]} />
          <View>
            <Text style={styles.walletLabel}>{label}</Text>
            <Text style={styles.walletSub}>{percentage} of deposits</Text>
          </View>
        </View>
      </View>
      <View style={styles.walletBalanceWrap}>
        <Text style={[styles.walletBalance, { color: balanceColor }]}>
          {balance}
        </Text>
        {badge}
      </View>
    </TouchableOpacity>
  );
};

const WalletCards = ({
  onOpenEmergencyModal,
}: {
  onOpenEmergencyModal: () => void;
}) => {
  const getBalance = (type: string) => {
    const wallet = defaultWallets.find((w) => w.type === type);
    return formatNaira(wallet ? wallet.balance : 0);
  };
  const getPercent = (type: string) => {
    const wallet = defaultWallets.find((w) => w.type === type);
    return `${wallet ? wallet.percent : 0}%`;
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>My Wallets</Text>
      <View style={{ gap: 14 }}>
        <WalletItem
          label="Spend"
          percentage={getPercent("spend")}
          balance={getBalance("spend")}
          dotColor="#4f46e5"
          balanceColor="#4f46e5"
        />
        <WalletItem
          label="Savings"
          percentage={getPercent("savings")}
          balance={getBalance("savings")}
          dotColor="#059669"
          balanceColor="#059669"
        />
        <WalletItem
          label="Emergency"
          percentage={getPercent("emergency")}
          balance={getBalance("emergency")}
          dotColor="#d97706"
          balanceColor="#d97706"
          onPress={onOpenEmergencyModal}
          badge={
            <View style={styles.lockBadge}>
              <Lock size={11} color="#fff" />
            </View>
          }
        />
        <WalletItem
          label="Flex"
          percentage={getPercent("flex")}
          balance={getBalance("flex")}
          dotColor="#db2777"
          balanceColor="#db2777"
        />
      </View>
    </View>
  );
};

const TransactionItem = ({
  title,
  time,
  amount,
  type,
  icon,
  iconBg,
}: {
  title: string;
  time: string;
  amount: string;
  type: "income" | "expense";
  icon: React.ReactNode;
  iconBg: string;
}) => {
  return (
    <View style={styles.txnItem}>
      <View style={styles.txnLeft}>
        <View style={[styles.txnIconWrap, { backgroundColor: iconBg }]}>
          {icon}
        </View>
        <View>
          <Text style={styles.txnTitle}>{title}</Text>
          <Text style={styles.txnTime}>{time}</Text>
        </View>
      </View>
      <Text
        style={[
          styles.txnAmount,
          { color: type === "income" ? "#10b981" : "#f43f5e" },
        ]}
      >
        {type === "income" ? `+${amount}` : `-${amount}`}
      </Text>
    </View>
  );
};

const RecentTransactions = () => {
  const transactions = defaultTransactions;

  return (
    <View style={styles.card}>
      <View style={styles.txnHeader}>
        <Text style={styles.cardTitle}>Recent Transactions</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      {transactions.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <ReceiptText size={26} color="#94a3b8" />
          </View>
          <Text style={styles.emptyTitle}>No transactions yet</Text>
          <Text style={styles.emptySubtitle}>
            Add money to your wallet to get started. Your activity will appear
            here automatically.
          </Text>
          <TouchableOpacity style={styles.emptyCta} activeOpacity={0.85}>
            <Text style={styles.emptyCtaText}>Add Money</Text>
            <ArrowRight size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        transactions.map((tx) => {
          const isIncome = tx.type === "income";
          let icon = <ShoppingBag size={20} color="#d97706" />;
          let iconBg = "#fef3c7";

          if (isIncome) {
            icon = <CreditCard size={20} color="#4f46e5" />;
            iconBg = "#eef2ff";
          }

          return (
            <TransactionItem
              key={tx.id}
              title={tx.title}
              time={tx.time}
              amount={formatNaira(tx.amount)}
              type={tx.type}
              icon={icon}
              iconBg={iconBg}
            />
          );
        })
      )}
    </View>
  );
};

const EmergencyUnlockModal = ({
  visible,
  onDone,
  onClose,
}: {
  visible: boolean;
  onDone: () => void;
  onClose: () => void;
}) => {
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedReason, setSubmittedReason] = useState("");

  const isValidReason = reason.trim().length >= 10;
  const canShowClose = step < 4 && !submitting;

  const reset = () => {
    setStep(1);
    setReason("");
    setSubmitting(false);
    setSubmittedReason("");
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const handleSubmit = () => {
    if (!isValidReason) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmittedReason(reason.trim());
      setSubmitting(false);
      setStep(4);
    }, 600);
  };

  const handleDone = () => {
    reset();
    onDone();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {canShowClose && (
            <TouchableOpacity
              onPress={handleClose}
              style={styles.modalCloseBtn}
            >
              <X size={16} color="#64748b" />
            </TouchableOpacity>
          )}

          {step === 1 && (
            <View style={styles.modalStep}>
              <View style={styles.modalIconWrap}>
                <ShieldAlert size={28} color="#f43f5e" />
              </View>
              <Text style={styles.modalTitle}>Unlock Emergency Wallet</Text>
              <Text style={styles.modalBody}>
                This money is meant for real emergencies. You'll need to tell us
                why before you can access it.
              </Text>
              <TouchableOpacity
                onPress={() => setStep(2)}
                style={styles.modalPrimaryBtn}
                activeOpacity={0.85}
              >
                <Text style={styles.modalPrimaryBtnText}>Continue</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 2 && (
            <View>
              <Text style={styles.modalTitleLeft}>What's the emergency?</Text>
              <TextInput
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={4}
                placeholder="Briefly describe what happened..."
                placeholderTextColor="#94a3b8"
                style={styles.modalTextarea}
              />
              {reason.trim().length > 0 && reason.trim().length < 10 && (
                <Text style={styles.modalError}>
                  Please enter at least 10 characters
                </Text>
              )}
              <View style={styles.modalRow}>
                <TouchableOpacity
                  onPress={() => setStep(1)}
                  style={styles.modalSecondaryBtn}
                >
                  <Text style={styles.modalSecondaryBtnText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setStep(3)}
                  disabled={!isValidReason}
                  style={[
                    styles.modalPrimaryBtn,
                    { flex: 1 },
                    !isValidReason && { opacity: 0.5 },
                  ]}
                >
                  <Text style={styles.modalPrimaryBtnText}>Continue</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {step === 3 && (
            <View>
              <Text style={styles.modalTitleLeft}>Confirm Unlock</Text>
              <View style={styles.modalReasonBox}>
                <Text style={styles.modalReasonText}>{reason.trim()}</Text>
              </View>
              <View style={styles.modalWarningBox}>
                <Text style={styles.modalWarningText}>
                  Unlocking gives you one withdrawal from this wallet. It will
                  lock again automatically after you use it.
                </Text>
              </View>
              <View style={styles.modalRow}>
                <TouchableOpacity
                  onPress={() => setStep(2)}
                  disabled={submitting}
                  style={styles.modalSecondaryBtn}
                >
                  <Text style={styles.modalSecondaryBtnText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={submitting}
                  style={[
                    styles.modalPrimaryBtn,
                    { flex: 1, flexDirection: "row", gap: 8 },
                  ]}
                >
                  {submitting && (
                    <ActivityIndicator color="#fff" size="small" />
                  )}
                  <Text style={styles.modalPrimaryBtnText}>
                    {submitting ? "Unlocking..." : "Confirm & Unlock"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {step === 4 && (
            <View style={styles.modalStep}>
              <View
                style={[styles.modalIconWrap, { backgroundColor: "#d1fae5" }]}
              >
                <Unlock size={28} color="#059669" />
              </View>
              <Text style={styles.modalTitle}>Emergency Wallet Unlocked</Text>
              <Text style={styles.modalBody}>
                You can now transfer from this wallet.
              </Text>
              <View style={{ width: "100%", marginBottom: 20 }}>
                <Text style={styles.modalReasonLabel}>Your reason</Text>
                <View style={styles.modalReasonBox}>
                  <Text style={styles.modalReasonText}>{submittedReason}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleDone}
                style={[styles.modalPrimaryBtn, { width: "100%" }]}
              >
                <Text style={styles.modalPrimaryBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const WalletHeader = () => {
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

const Wallet = () => {
  const router = useRouter();
  const [emergencyModalVisible, setEmergencyModalVisible] = useState(false);

  return (
    <View style={styles.root}>
      <WalletHeader />

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.screenContent}
      >
        <BalanceCard
          totalBalance={defaultBalance}
          onSend={() => router.push("/transfer" as any)}
        />

        <WalletCards
          onOpenEmergencyModal={() => setEmergencyModalVisible(true)}
        />

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

  screen: { flex: 1, backgroundColor: "#f8fafc" },
  screenContent: { padding: 20, paddingTop: 32, paddingBottom: 48, gap: 24 },

  balanceCard: {
    borderRadius: 28,
    padding: 24,
    gap: 22,
  },
  balanceLabel: {
    color: "#c7d2fe",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  balanceAmount: {
    color: "#fff",
    fontSize: 50,
    fontWeight: "800",
    marginTop: 4,
    letterSpacing: 0.25,
  },
  actionRow: { flexDirection: "row", gap: 12 },
  actionButton: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  actionLabel: { color: "#fff", fontSize: 12, fontWeight: "600" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 16,
  },

  walletItem: {
    display: "flex",
    flexDirection: "row",
  },
  walletItemLeft: {
    justifyContent: "center",
    backgroundColor: "#fff",
    flex: 1,
  },
  walletItemLeftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  dot: { width: 12, height: 12, borderRadius: 6 },
  walletLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  walletSub: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 3,
  },
  walletBalanceWrap: {
    justifyContent: "center",
  },
  walletBalance: {
    fontSize: 15,
    fontWeight: "700",
    flexShrink: 0,
    marginLeft: 12,
    textAlign: "right",
  },
  lockBadge: {
    position: "absolute",
    top: -6,
    right: -15,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#d97706",
    alignItems: "center",
    justifyContent: "center",
  },

  txnHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAll: { fontSize: 13, fontWeight: "700", color: "#4f46e5" },
  txnItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
  },
  txnLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  txnIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  txnTitle: { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  txnTime: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  txnAmount: { fontSize: 14, fontWeight: "700" },

  emptyState: { alignItems: "center", paddingVertical: 30 },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: { fontSize: 15, fontWeight: "700", color: "#0f172a" },
  emptySubtitle: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 18,
    maxWidth: 260,
  },
  emptyCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#4f46e5",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyCtaText: { color: "#fff", fontSize: 13, fontWeight: "700" },

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
  modalStep: { alignItems: "center", paddingTop: 8 },
  modalIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ffe4e6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
    marginBottom: 8,
  },
  modalTitleLeft: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 14,
  },
  modalBody: {
    fontSize: 13,
    color: "#475569",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 20,
  },
  modalTextarea: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: "#0f172a",
    minHeight: 100,
    textAlignVertical: "top",
  },
  modalError: {
    fontSize: 11,
    color: "#ef4444",
    marginTop: 6,
    fontWeight: "600",
  },
  modalRow: { flexDirection: "row", gap: 12, marginTop: 20 },
  modalPrimaryBtn: {
    backgroundColor: "#4f46e5",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  modalPrimaryBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  modalSecondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSecondaryBtnText: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "700",
  },
  modalReasonBox: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  modalReasonText: { fontSize: 13, color: "#334155" },
  modalReasonLabel: {
    fontSize: 11,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  modalWarningBox: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  modalWarningText: { fontSize: 11, color: "#92400e", lineHeight: 16 },
});

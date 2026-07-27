import { View, Text, TouchableOpacity, Modal, Pressable } from "react-native";
import {
  X,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Copy,
  Check,
} from "lucide-react-native";
import { useState } from "react";
import { SlideUpContainer } from "./SlideUpContainer";

type Direction = "sent" | "received" | "deposit";

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

interface Props {
  transaction: Transaction;
  onClose: () => void;
}

function formatDateFull(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatNaira(amount: number) {
  return `₦${(amount ?? 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function directionConfig(direction: Direction) {
  switch (direction) {
    case "sent":
      return {
        icon: ArrowUpRight,
        bg: "#ffe4e6",
        color: "#e11d48",
        amountColor: "#e11d48",
        prefix: "-",
        label: "Sent",
      };
    case "received":
      return {
        icon: ArrowDownLeft,
        bg: "#d1fae5",
        color: "#059669",
        amountColor: "#059669",
        prefix: "+",
        label: "Received",
      };
    case "deposit":
      return {
        icon: Wallet,
        bg: "#eef2ff",
        color: "#4f46e5",
        amountColor: "#059669",
        prefix: "+",
        label: "Deposit",
      };
  }
}

function statusConfig(status: string) {
  switch (status) {
    case "success":
      return { label: "Successful", bg: "#d1fae5", color: "#047857" };
    case "pending":
      return { label: "Pending", bg: "#fef3c7", color: "#b45309" };
    case "failed":
      return { label: "Failed", bg: "#ffe4e6", color: "#be123c" };
    default:
      return { label: status, bg: "#f1f5f9", color: "#475569" };
  }
}

export const TransactionDetailModal = ({ transaction, onClose }: Props) => {
  const [copied, setCopied] = useState(false);
  const cfg = directionConfig(transaction.direction);
  const Icon = cfg.icon;
  const status = statusConfig(transaction.status);

  const counterpartyLabel = (() => {
    if (transaction.counterpartyName) return transaction.counterpartyName;
    if (transaction.direction === "deposit") return "Deposit via Anchor";
    if (transaction.direction === "sent") return "PocketWise User";
    if (transaction.direction === "received") return "PocketWise User";
    return "-";
  })();

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "flex-end",
        }}
        onPress={onClose}
      >
        <SlideUpContainer>
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
            }}
          >
            <View style={{ padding: 24, paddingBottom: 32 }}>
              <TouchableOpacity
                onPress={onClose}
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#f1f5f9",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                }}
              >
                <X size={16} color="#64748b" />
              </TouchableOpacity>

              <View style={{ alignItems: "center", paddingTop: 16 }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: cfg.bg,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={24} color={cfg.color} />
                </View>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "700",
                    color: cfg.amountColor,
                    marginTop: 12,
                  }}
                >
                  {cfg.prefix}
                  {formatNaira(Math.abs(transaction.amount))}
                </Text>
                <View
                  style={{
                    marginTop: 8,
                    backgroundColor: status.bg,
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 999,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: status.color,
                    }}
                  >
                    {status.label}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  borderTopWidth: 1,
                  borderTopColor: "#f1f5f9",
                  marginTop: 20,
                  paddingTop: 12,
                }}
              >
                {[
                  { label: "Counterparty", value: counterpartyLabel },
                  {
                    label: "Date & Time",
                    value: formatDateFull(transaction.createdAt),
                  },
                  { label: "Reference", value: transaction.id, copy: true },
                  ...(transaction.reason
                    ? [{ label: "Reason", value: transaction.reason }]
                    : []),
                ].map((row, idx) => (
                  <View
                    key={idx}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingVertical: 12,
                      borderBottomWidth: idx < 3 ? 1 : 0,
                      borderBottomColor: "#f1f5f9",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "500",
                        color: "#94a3b8",
                        textTransform: "uppercase",
                      }}
                    >
                      {row.label}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "600",
                          color: "#0f172a",
                          maxWidth: 180,
                        }}
                        numberOfLines={1}
                      >
                        {row.value}
                      </Text>
                      {row.copy && (
                        <TouchableOpacity
                          onPress={handleCopy}
                          style={{ padding: 4 }}
                        >
                          {copied ? (
                            <Check size={14} color="#059669" />
                          ) : (
                            <Copy size={14} color="#94a3b8" />
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                onPress={onClose}
                style={{
                  marginTop: 20,
                  backgroundColor: "#4f46e5",
                  paddingVertical: 14,
                  borderRadius: 16,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}
                >
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </SlideUpContainer>
      </Pressable>
    </Modal>
  );
};

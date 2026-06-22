"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  ChevronDown,
  Loader2,
  Receipt,
} from "lucide-react";
import { WalletHeader } from "../wallet/UI/Header";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import TransactionDetailModal from "../../../components/TransactionDetailModal";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

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

const FILTERS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "sent", label: "Sent" },
  { key: "received", label: "Received" },
  { key: "deposit", label: "Deposits" },
];

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

function formatMonthKey(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-NG", { month: "long", year: "numeric" });
}

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function directionConfig(direction: Direction) {
  switch (direction) {
    case "sent":
      return {
        icon: ArrowUpRight,
        bg: "bg-rose-100",
        color: "text-rose-600",
        prefix: "-",
        amountColor: "text-rose-600",
      };
    case "received":
      return {
        icon: ArrowDownLeft,
        bg: "bg-emerald-100",
        color: "text-emerald-600",
        prefix: "+",
        amountColor: "text-emerald-600",
      };
    case "deposit":
      return {
        icon: Wallet,
        bg: "bg-indigo-100",
        color: "text-indigo-600",
        prefix: "+",
        amountColor: "text-emerald-600",
      };
  }
}

function getFallbackLabel(direction: Direction, type: string) {
  if (direction === "sent") return "Transfer Out";
  if (direction === "received") return "Transfer In";
  if (direction === "deposit") return "Deposit";
  return type;
}

const Page = () => {
  const { accessToken } = useAuth();
  const { toast } = useToast();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const fetchedRef = useRef<string>("");

  const fetchKey = `${activeFilter}:${page}`;

  const fetchTransactions = useCallback(
    async (pageNum: number, filter: FilterTab, append: boolean) => {
      if (!accessToken) return;
      const isInitial = pageNum === 1;
      if (isInitial) setLoading(true);
      else setLoadingMore(true);

      try {
        const params = new URLSearchParams({ page: String(pageNum) });
        if (filter !== "all") params.set("type", filter);

        const res = await fetch(`${API_BASE}/api/v1/transactions?${params}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          credentials: "include",
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          toast(data.message || "Failed to load transactions", {
            type: "error",
          });
          return;
        }

        const body = await res.json();
        const result = body.data;

        if (append) {
          setTransactions((prev) => [...prev, ...(result.transactions || [])]);
        } else {
          setTransactions(result.transactions || []);
        }
        setHasMore(result.hasMore ?? false);
        setPage(pageNum);
      } catch {
        toast("Failed to load transactions", { type: "error" });
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [accessToken, toast],
  );

  useEffect(() => {
    if (!accessToken) return;
    const key = `init:${activeFilter}`;
    if (fetchedRef.current === key) return;
    fetchedRef.current = key;
    setTransactions([]);
    setPage(1);
    setHasMore(false);
    setLoading(true);
    fetchTransactions(1, activeFilter, false);
  }, [activeFilter, accessToken, fetchTransactions]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loadingMore) {
          const nextPage = page + 1;
          fetchTransactions(nextPage, activeFilter, true);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, page, activeFilter, fetchTransactions]);

  const handleFilterChange = (filter: FilterTab) => {
    if (filter === activeFilter) return;
    setActiveFilter(filter);
    fetchedRef.current = "";
  };

  useEffect(() => {
    if (transactions.length > 0) {
      const firstDate = transactions[0]!.createdAt;
      const mostRecent = formatMonthKey(firstDate);
      setExpandedMonths(new Set([mostRecent]));
    }
  }, [transactions]);

  const toggleMonth = (key: string) => {
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

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

  return (
    <>
      <WalletHeader />
      <main
        className="flex min-h-screen flex-col gap-4 py-4 sm:gap-6 sm:py-6"
        style={{ backgroundColor: "#f8fafc" }}
      >
        <div className="px-4 text-center">
          <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl md:text-3xl">
            Transaction History
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            View and manage all your transactions
          </p>
        </div>

        <div className="flex justify-center px-4">
          <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => handleFilterChange(f.key)}
                className={`active:scale-95 flex h-9 w-auto shrink-0 items-center justify-center rounded-2xl border px-4 transition-all duration-200 ${
                  activeFilter === f.key
                    ? "bg-[#4f46e5] border-[#4f46e5] text-white"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span className="whitespace-nowrap text-center text-xs font-medium sm:text-sm">
                  {f.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-center px-4 pb-6 sm:px-6 lg:px-8">
          <div className="w-full max-w-2xl">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/70 bg-white px-4 py-16 shadow-[0_4px_24px_rgba(15,23,42,0.06)]">
                <div className="relative mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100">
                    <Receipt className="h-7 w-7 text-slate-400" />
                  </div>
                  <div className="absolute inset-0 animate-ping rounded-2xl border-2 border-slate-200 opacity-30" />
                </div>
                <h4 className="mb-1.5 text-base font-semibold text-slate-900 sm:text-lg">
                  No transactions yet
                </h4>
                <p className="max-w-xs text-center text-sm leading-relaxed text-slate-400">
                  Your transaction history will show up here
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {monthGroups.map((group) => {
                  const isExpanded = expandedMonths.has(group.key);
                  return (
                    <div
                      key={group.key}
                      className="rounded-2xl border border-slate-200/70 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.06)]"
                    >
                      <button
                        onClick={() => toggleMonth(group.key)}
                        className="flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-700">
                            {group.label}
                          </span>
                          <span className="text-xs text-slate-400">
                            +{formatNaira(group.totalIn).replace("NGN", "₦")} /
                            -{formatNaira(group.totalOut).replace("NGN", "₦")}
                          </span>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          isExpanded
                            ? "max-h-[9999px] opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="divide-y divide-slate-100 border-t border-slate-100 px-3">
                          {group.transactions.map((tx) => {
                            const cfg = directionConfig(tx.direction);
                            const Icon = cfg.icon;
                            return (
                              <div
                                key={tx.id}
                                onClick={() => setSelectedTx(tx)}
                                className="flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-colors hover:bg-slate-50"
                              >
                                <div
                                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${cfg.bg}`}
                                >
                                  <Icon className={`h-5 w-5 ${cfg.color}`} />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-semibold text-slate-900">
                                    {tx.counterpartyName ||
                                      getFallbackLabel(tx.direction, tx.type)}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    {formatDate(tx.createdAt)}
                                  </p>
                                </div>

                                <span
                                  className={`shrink-0 text-sm font-bold ${cfg.amountColor}`}
                                >
                                  {cfg.prefix}
                                  {formatNaira(Math.abs(tx.amount)).replace(
                                    "NGN",
                                    "₦",
                                  )}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div ref={sentinelRef} className="h-4" />

                {loadingMore && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedTx && (
        <TransactionDetailModal
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
        />
      )}
    </>
  );
};

export default Page;

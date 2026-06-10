"use client";
import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  CreditCard,
  ArrowDownLeft,
  ReceiptText,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

interface TransactionProps {
  title: string;
  time: string;
  amount: string;
  type: "income" | "expense";
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

const TransactionItem = ({
  title,
  time,
  amount,
  type,
  icon,
  iconBg,
  iconColor,
}: TransactionProps) => {
  return (
    <div className="w-full flex items-center justify-between py-3 sm:py-4 border-b border-slate-50 last:border-0 group cursor-pointer transition-all hover:px-2">
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Icon Container */}
        <div
          className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
          style={{ backgroundColor: iconBg }}
        >
          <div className="scale-75 sm:scale-100" style={{ color: iconColor }}>
            {icon}
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col">
          <span className="text-[#0f172a] font-bold text-sm sm:text-[17px] tracking-tight leading-tight">
            {title}
          </span>
          <span className="text-[#94a3b8] font-medium text-xs sm:text-sm mt-0.5 sm:mt-1">
            {time}
          </span>
        </div>
      </div>

      {/* Amount */}
      <div className="text-right">
        <span
          className={`font-bold text-sm sm:text-[17px] tracking-tight ${
            type === "income" ? "text-[#10b981]" : "text-[#f43f5e]"
          }`}
        >
          {type === "income" ? `+${amount}` : `-${amount}`}
        </span>
      </div>
    </div>
  );
};

export const RecentTransactions = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const { accessToken } = useAuth();

  useEffect(() => {
    const getTransactions = async () => {
      const url = `${API_BASE}/api/v1/transactions`;
      if (!accessToken) return;
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
        });
        if (!response.ok) {
          console.log(" No session found (401/404)");
          return;
        }

        const { data } = await response.json();
        // API returns an object containing { transaction: [...] }
        setTransactions(data.transaction || []);
      } catch (error) {
        console.error(error);
      }
    };
    getTransactions();
  }, [accessToken]);
  return (
    <section className="w-full max-w-[95%] sm:max-w-[90%] mx-auto bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-4 sm:p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h3 className="font-extrabold text-xl sm:text-2xl text-[#0f172a] tracking-tight">
          Recent Transactions
        </h3>
        <button className="text-sm sm:text-[17px] font-bold text-[#6366f1] hover:text-[#4f46e5] transition-colors">
          See all
        </button>
      </div>

      {/* Transaction List */}
      <div className="flex flex-col">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 sm:py-14 px-4 sm:px-6 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
            {/* Animated icon container */}
            <div className="relative mb-4 sm:mb-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
                <ReceiptText className="w-6 h-6 sm:w-7 sm:h-7 text-slate-400" />
              </div>
              {/* Pulse ring */}
              <div className="absolute inset-0 rounded-2xl border-2 border-slate-200 animate-ping opacity-30" />
            </div>

            {/* Text */}
            <h4 className="text-slate-900 font-semibold text-base sm:text-lg mb-1.5">
              No transactions yet
            </h4>
            <p className="text-slate-400 text-sm max-w-xs leading-relaxed mb-5 sm:mb-6">
              Add money to your wallet to get started. Your activity will appear
              here automatically.
            </p>

            {/* CTA */}
            <button className="inline-flex items-center gap-2 bg-[#4f46e5] hover:bg-[#3730a3] active:scale-95 transition-all duration-200 text-white text-sm font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-sm hover:shadow-md cursor-pointer">
              Add Money
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Helper text */}
            <p className="text-xs text-slate-300 mt-3 sm:mt-4">
              Money splits automatically the moment it arrives
            </p>
          </div>
        ) : (
          transactions.slice(0, 5).map((tx, idx) => {
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

            let icon = <ShoppingBag size={24} />;
            let iconBg = "#fef3c7";
            let iconColor = "#d97706";

            if (isIncome) {
              icon = <CreditCard size={24} />;
              iconBg = "#eef2ff";
              iconColor = "#4f46e5";
            } else if (tx.type === "withdrawal" || tx.type === "transfer") {
              icon = <ArrowDownLeft size={24} />;
              iconBg = "#d1fae5";
              iconColor = "#059669";
            }

            return (
              <TransactionItem
                key={tx.id || idx}
                title={tx.reason || (isIncome ? "Credit" : "Debit")}
                time={timeStr}
                amount={`₦${Number(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                type={isIncome ? "income" : "expense"}
                icon={icon}
                iconBg={iconBg}
                iconColor={iconColor}
              />
            );
          })
        )}
      </div>
    </section>
  );
};

export default RecentTransactions;

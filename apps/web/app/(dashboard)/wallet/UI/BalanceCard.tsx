"use client";

import React from "react";
import { Send, Download, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface BalanceCardProps {
  /** The total account balance */
  totalBalance: number;
  /** The change in balance (positive or negative) for "this month" */
  // monthlyChange: number;
  /** Currency symbol (default: ₦) */
  currencySymbol?: string;
  /** Optional click handler for Send Button */
  onSend?: () => void;
  /** Optional click handler for Receive button */
  onReceive?: () => void;
  /** Optional click handler for Top Up button */
  onTopUp?: () => void;
}

const BalanceCard: React.FC<BalanceCardProps> = ({
  totalBalance,
  // monthlyChange,
  currencySymbol = "₦",
  onReceive,
  onTopUp,
}) => {
  const router = useRouter();
  const safeLocale = "en-NG";
  const safeBalance = totalBalance ?? 0;
  const formattedTotalBalance = new Intl.NumberFormat(safeLocale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeBalance);

  // const monthlyChangeFormatted = new Intl.NumberFormat(safeLocale, {
  //     minimumFractionDigits: 2,
  //     maximumFractionDigits: 2,
  // }).format(Math.abs(monthlyChange));

  // const monthlyChangeDisplay = isMonthlyChangePositive
  //     ? `${currencySymbol}${monthlyChangeFormatted}`
  //     : `-${currencySymbol}${monthlyChangeFormatted}`;

  // const monthlyChangeColor = isMonthlyChangePositive
  //     ? 'text-emerald-300'
  //     : monthlyChange < 0
  //         ? 'text-red-300'
  //         : 'text-gray-300';

  return (
    <div
      className="sm:w-full max-w-[95%] sm:max-w-[90%] mx-auto bg-linear-to-br from-[#4f46e5] to-primary-dark rounded-4xl shadow-lg border border-white/10 cursor-pointer"
      role="region"
      aria-label="Balance card"
    >
      <div className="flex flex-col gap-5 sm:gap-7 p-5 sm:p-7">
        {/* Top Section: Total Balance and Monthly Change */}
        <div className="flex flex-col gap-2 sm:gap-4">
          <div className="space-y-0.5 sm:space-y-1">
            <p className="text-indigo-200 text-xs sm:text-sm font-semibold tracking-wider uppercase">
              Total Balance
            </p>
            <p className="text-white text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-none">
              {currencySymbol}
              {formattedTotalBalance}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-2 sm:gap-3">
          <button
            onClick={() => router.push("/wallet/transfer")}
            className="flex-1 cursor-pointer flex flex-col items-center justify-center gap-1.5 sm:gap-2 py-3 sm:py-4 bg-white/10 hover:bg-white/20 active:bg-white/10 backdrop-blur-md text-white rounded-2xl font-medium transition-all duration-200 active:scale-95 border border-white/5"
            aria-label="Send money"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-200" />
            <span className="text-xs sm:text-sm">Send</span>
          </button>
          <button
            onClick={onReceive}
            className="flex-1 cursor-pointer flex flex-col items-center justify-center gap-1.5 sm:gap-2 py-3 sm:py-4 bg-white/10 hover:bg-white/20 active:bg-white/10 backdrop-blur-md text-white rounded-2xl font-medium transition-all duration-200 active:scale-95 border border-white/5"
            aria-label="Receive money"
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-200" />
            <span className="text-xs sm:text-sm">Receive</span>
          </button>
          <button
            onClick={onTopUp}
            className="flex-1 cursor-pointer flex flex-col items-center justify-center gap-1.5 sm:gap-2 py-3 sm:py-4 bg-white/10 hover:bg-white/20 active:bg-white/10 backdrop-blur-md text-white rounded-2xl font-medium transition-all duration-200 active:scale-95 border border-white/5"
            aria-label="Top up balance"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-200" />
            <span className="text-xs sm:text-sm">Top Up</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;

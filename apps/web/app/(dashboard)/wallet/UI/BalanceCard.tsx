'use client';

import React from 'react';
import { Send, Download, Plus } from "lucide-react"

interface BalanceCardProps {
    /** The total account balance */
    totalBalance: number;
    /** The change in balance (positive or negative) for "this month" */
    monthlyChange: number;
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
    monthlyChange,
    currencySymbol = '₦',
    onSend,
    onReceive,
    onTopUp,
}) => {
    // Format the total balance with commas and two decimal places (Updated to en-NG)
    const formattedTotalBalance = new Intl.NumberFormat('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(totalBalance);

    // Determine display text and styling for monthly change
    const isMonthlyChangePositive = monthlyChange >= 0;
    const monthlyChangeFormatted = new Intl.NumberFormat('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Math.abs(monthlyChange));

    const monthlyChangeDisplay = isMonthlyChangePositive
        ? `${currencySymbol}${monthlyChangeFormatted}`
        : `-${currencySymbol}${monthlyChangeFormatted}`;

    const monthlyChangeColor = isMonthlyChangePositive
        ? 'text-emerald-300'
        : monthlyChange < 0
            ? 'text-red-300'
            : 'text-gray-300';

    return (
        <div
            className="w- sm:w-full max-w-[90%] md:max-w-[90%] mx-auto bg-gradient-to-br from-[#4f46e5] to-[#3730a3] rounded-[2rem] shadow-2xl border border-white/10 cursor-pointer"
            role="region"
            aria-label="Balance card"
        >
            <div className="flex flex-col gap-8 p-6 sm:p-8">
                {/* Top Section: Total Balance and Monthly Change */}
                <div className="flex flex-col gap-4">
                    <div className="space-y-1">
                        <p className="text-indigo-200 text-sm font-semibold tracking-wider uppercase">
                            Total Balance
                        </p>
                        <p className="text-white text-5xl sm:text-6xl font-bold tracking-tight leading-none break-words">
                            {currencySymbol}{formattedTotalBalance}
                        </p>
                    </div>

                    {/* Monthly Change Indicator */}
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 ${monthlyChangeColor}`}>
                            {monthlyChangeDisplay}
                        </span>
                        <span className="text-indigo-200 text-sm font-medium">this month</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between gap-3 sm:gap-4 mt-2">
                    <button
                        onClick={onSend}
                        className="flex-1 flex flex-col items-center justify-center gap-2 py-4 bg-white/10 hover:bg-white/20 active:bg-white/10 backdrop-blur-md text-white rounded-2xl font-medium transition-all duration-200 active:scale-95 border border-white/5 cursor-pointer"
                        aria-label="Send money"
                    >
                        <Send className="w-5 h-5 text-indigo-200" />
                        <span className="text-sm">Send</span>
                    </button>
                    <button
                        onClick={onReceive}
                        className="flex-1 flex flex-col items-center justify-center gap-2 py-4 bg-white/10 hover:bg-white/20 active:bg-white/10 backdrop-blur-md text-white rounded-2xl font-medium transition-all duration-200 active:scale-95 border border-white/5"
                        aria-label="Receive money"
                    >
                        <Download className="w-5 h-5 text-indigo-200" />
                        <span className="text-sm">Receive</span>
                    </button>
                    <button
                        onClick={onTopUp}
                        className="flex-1 flex flex-col items-center justify-center gap-2 py-4 bg-white/10 hover:bg-white/20 active:bg-white/10 backdrop-blur-md text-white rounded-2xl font-medium transition-all duration-200 active:scale-95 border border-white/5"
                        aria-label="Top up balance"
                    >
                        <Plus className="w-5 h-5 text-indigo-200" />
                        <span className="text-sm">Top Up</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BalanceCard;
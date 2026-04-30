"use client";
import React from "react";

interface WalletItemProps {
    label: string;
    percentage: string;
    balance: string;
    dotColor: string;
    balanceColor: string;
}

const WalletItem = ({ label, percentage, balance, dotColor, balanceColor }: WalletItemProps) => {
    return (
        <div className="w-full group cursor-pointer transition-all duration-200 active:scale-[0.98]">
            <div className="flex items-center justify-between p-5 bg-[#f8fafc] hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 border border-slate-100 rounded-3xl transition-all duration-300">
                <div className="flex items-center gap-4">
                    {/* Status Dot */}
                    <div
                        className="w-3.5 h-3.5 rounded-full shadow-lg"
                        style={{ backgroundColor: dotColor, boxShadow: `0 0 12px ${dotColor}40` }}
                    />

                    {/* Text Content */}
                    <div className="flex flex-col">
                        <span className="text-slate-900 font-bold text-[17px] tracking-tight leading-tight">
                            {label}
                        </span>
                        <span className="text-slate-400 font-medium text-sm mt-0.5">
                            {percentage} of deposits
                        </span>
                    </div>
                </div>

                {/* Balance */}
                <div className="text-right">
                    <span className="font-bold text-lg tracking-tight" style={{ color: balanceColor }}>
                        {balance}
                    </span>
                </div>
            </div>
        </div>
    );
};

const WalletCards = () => {
    return (
        <section className="w-full max-w-[90%] mx-auto bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-8 pt-8 pb-4">
                <h3 className="font-extrabold text-2xl text-slate-900 tracking-tight">
                    My Wallets
                </h3>
                <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors px-4 py-2 bg-indigo-50 rounded-full">
                    See all
                </button>
            </div>

            {/* Wallet List */}
            <div className="flex flex-col gap-3 px-6 pb-8">
                <WalletItem
                    label="Spend"
                    percentage="50%"
                    balance="₦75,000"
                    dotColor="#4f46e5"
                    balanceColor="#4f46e5"
                />
                <WalletItem
                    label="Savings"
                    percentage="30%"
                    balance="₦45,000"
                    dotColor="#059669"
                    balanceColor="#059669"
                />
                <WalletItem
                    label="Emergency"
                    percentage="10%"
                    balance="₦15,000"
                    dotColor="#d97706"
                    balanceColor="#d97706"
                />
                <WalletItem
                    label="Pocketwise"
                    percentage="10%"
                    balance="₦15,000"
                    dotColor="#db2777"
                    balanceColor="#db2777"
                />
            </div>
        </section>
    );
};

export default WalletCards;

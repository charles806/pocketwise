"use client";
import React from "react";
import { ShoppingBag, CreditCard, ArrowDownLeft, Phone, PlayCircle } from "lucide-react";

interface TransactionProps {
  title: string;
  time: string;
  amount: string;
  type: "income" | "expense";
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

const TransactionItem = ({ title, time, amount, type, icon, iconBg, iconColor }: TransactionProps) => {
  return (
    <div className="w-full flex items-center justify-between py-4 border-b border-slate-50 last:border-0 group cursor-pointer transition-all hover:px-2">
      <div className="flex items-center gap-4">
        {/* Icon Container */}
        <div 
          className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
          style={{ backgroundColor: iconBg }}
        >
          <div style={{ color: iconColor }}>
            {icon}
          </div>
        </div>
        
        {/* Text */}
        <div className="flex flex-col">
          <span className="text-[#0f172a] font-bold text-[17px] tracking-tight leading-tight">
            {title}
          </span>
          <span className="text-[#94a3b8] font-medium text-sm mt-1">
            {time}
          </span>
        </div>
      </div>

      {/* Amount */}
      <div className="text-right">
        <span 
          className={`font-bold text-[17px] tracking-tight ${
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
  return (
    <section className="w-full max-w-[90%] mx-auto bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-extrabold text-2xl text-[#0f172a] tracking-tight">
          Recent Transactions
        </h3>
        <button className="text-[17px] font-bold text-[#6366f1] hover:text-[#4f46e5] transition-colors">
          See all
        </button>
      </div>

      {/* Transaction List */}
      <div className="flex flex-col">
        <TransactionItem
          title="Shoprite"
          time="Today, 2:30 PM"
          amount="₦12,500"
          type="expense"
          icon={<ShoppingBag size={24} />}
          iconBg="#fef3c7"
          iconColor="#d97706"
        />
        <TransactionItem
          title="Salary Deposit"
          time="Yesterday, 9:00 AM"
          amount="₦150,000"
          type="income"
          icon={<CreditCard size={24} />}
          iconBg="#eef2ff"
          iconColor="#4f46e5"
        />
        <TransactionItem
          title="Chicken Republic"
          time="Yesterday, 1:15 PM"
          amount="₦3,200"
          type="expense"
          icon={<ArrowDownLeft size={24} />}
          iconBg="#d1fae5"
          iconColor="#059669"
        />
        <TransactionItem
          title="MTN Airtime"
          time="Mon, 5:45 PM"
          amount="₦2,000"
          type="expense"
          icon={<Phone size={24} />}
          iconBg="#fce7f3"
          iconColor="#db2777"
        />
        <TransactionItem
          title="Netflix"
          time="Sun, 12:00 PM"
          amount="₦4,900"
          type="expense"
          icon={<PlayCircle size={24} />}
          iconBg="#fef3c7"
          iconColor="#d97706"
        />
      </div>
    </section>
  );
};

export default RecentTransactions;

"use client";
import React from "react";

interface SpendingItemProps {
  label: string;
  amount: string;
  progress: number; // 0 to 100
  color: string;
}

const SpendingItem = ({ label, amount, progress, color }: SpendingItemProps) => {
  return (
    <div className="w-full flex flex-col gap-2.5">
      <div className="flex justify-between items-center">
        <span className="text-[#0f172a] font-semibold text-[17px] tracking-tight">
          {label}
        </span>
        <span className="text-[#94a3b8] font-medium text-[17px]">
          {amount}
        </span>
      </div>
      
      {/* Progress Bar Track */}
      <div className="w-full h-[7px] bg-[#f1f5f9] rounded-full overflow-hidden">
        {/* Progress Fill */}
        <div 
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ 
            width: `${progress}%`, 
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}30` 
          }}
        />
      </div>
    </div>
  );
};

export const SpendingOverview = () => {
  return (
    <section className="w-full max-w-[90%] mx-auto bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h3 className="font-extrabold text-2xl text-[#0f172a] tracking-tight">
          Spending Overview
        </h3>
        <span className="text-[#94a3b8] font-semibold text-lg">
          This Week
        </span>
      </div>

      {/* List of Spending Categories */}
      <div className="flex flex-col gap-8">
        <SpendingItem 
          label="Food & Drinks" 
          amount="₦15,700" 
          progress={75} 
          color="#6366f1" 
        />
        <SpendingItem 
          label="Transport" 
          amount="₦8,200" 
          progress={40} 
          color="#10b981" 
        />
        <SpendingItem 
          label="Airtime & Data" 
          amount="₦5,000" 
          progress={25} 
          color="#f59e0b" 
        />
        <SpendingItem 
          label="Shopping" 
          amount="₦5,500" 
          progress={30} 
          color="#f43f5e" 
        />
      </div>
    </section>
  );
};

export default SpendingOverview;

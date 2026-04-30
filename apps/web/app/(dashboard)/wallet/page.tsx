"use client"
import React from "react";
import { WalletHeader } from "./UI/Header";
import { GoalModal } from "./UI/GoalModal";
import BalanceCard from "./UI/BalanceCard";
import WalletCards from "./UI/WalletCard";
import SpendingOverview from "./UI/SpendingOverView";
import RecentTransactions from "./UI/RecentTransactions";

const Wallet = () => {
  return (
    <>
      <WalletHeader />
      <GoalModal />
      <main className="min-h-screen mt-5! flex flex-col gap-8" style={{ backgroundColor: "#f8fafc" }}>

        {/* Balance Card */}
        <div className="BalanceCaed">
          <BalanceCard totalBalance={10000} monthlyChange={20} />
        </div>

        {/* Wallet Cards */}
        <div className="walletCard">
          <WalletCards />
        </div>

        {/* Spending Overview */}
        <div className="SpendingOverview">
          <SpendingOverview />
        </div>

        {/* Recent Transactions */}
        <div className="recentTransaction">
          <RecentTransactions />
        </div>

      </main>
    </>
  );
};

export default Wallet;

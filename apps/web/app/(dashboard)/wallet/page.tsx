"use client";
import React from "react";
import { useWallet } from "../../../hooks/useWallet";
import { useAuth } from "../../../context/AuthContext";
import { WalletHeader } from "./UI/Header";
import { GoalModal } from "./UI/GoalModal";
import BalanceCard from "./UI/BalanceCard";
import WalletCards from "./UI/WalletCard";
import RecentTransactions from "./UI/RecentTransactions";
import WalletSkeleton from "./UI/WalletSkeleton";

// const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

const Wallet = () => {
  const { accessToken, isLoading: authLoading } = useAuth();

  const { data } = useWallet(accessToken);

  const balance = data?.totalBalance;
  const wallets = data?.wallets;

  if (authLoading || !data) return <WalletSkeleton />;

  return (
    <>
      <WalletHeader />
      <GoalModal />
      <main
        className="min-h-screen mt-5! flex flex-col gap-5 sm:gap-8"
        style={{ backgroundColor: "#f8fafc" }}
      >
        {/* Balance Card */}
        <div className="BalanceCaed">
          <BalanceCard totalBalance={balance} />
        </div>

        {/* Wallet Cards */}
        <div className="walletCard">
          <WalletCards wallets={wallets} />
        </div>

        {/* Recent Transactions */}
        <div className="recentTransaction pb-8 sm:pb-12">
          <RecentTransactions />
        </div>
      </main>
    </>
  );
};

export default Wallet;

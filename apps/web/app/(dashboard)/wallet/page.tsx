"use client"
import React from "react";
import { WalletHeader } from "./UI/Header";
import { GoalModal } from "./UI/GoalModal";
import  BalanceCard  from "./UI/BalanceCard";

const Wallet = () => {
  return (
    <>
      <WalletHeader />
      <GoalModal />
      <main className="min-h-screen mt-5!" style={{ backgroundColor: "#f8fafc" }}>

        {/* Balance Card */}
        <div className="walletCard">
          <BalanceCard totalBalance={0} monthlyChange={0} />
        </div>
      </main>
    </>
  );
};

export default Wallet;

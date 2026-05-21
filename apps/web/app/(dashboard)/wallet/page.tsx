"use client"
import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { WalletHeader } from "./UI/Header";
import { GoalModal } from "./UI/GoalModal";
import BalanceCard from "./UI/BalanceCard";
import WalletCards from "./UI/WalletCard";
// import SpendingOverview from "./UI/SpendingOverView";
import RecentTransactions from "./UI/RecentTransactions";


const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL

const Wallet = () => {
  const [balance, setBalance] = useState<number>(0)
  const [wallets, setWallets] = useState<any[] | null>(null)
  const { accessToken } = useAuth()

  useEffect(() => {
    const getWallet = async () => {
      if (!accessToken) return;
      const url = `${API_BASE}/api/v1/wallets`
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`
          },
          credentials: "include"
        })

        if (!response.ok) {
          console.log(" No session found (401/404)");
          return
        }

        const { data } = await response.json()
        console.log("Wallet response", data.totalBalance, data.wallets)
        setBalance(data.totalBalance)
        setWallets(data.wallets)


      } catch (error) {
        console.error("Error fetching wallets", error)
      }
    }
    getWallet()
  }, [accessToken])
  return (
    <>
      <WalletHeader />
      <GoalModal />
      <main className="min-h-screen mt-5! flex flex-col gap-8" style={{ backgroundColor: "#f8fafc" }}>

        {/* Balance Card */}
        <div className="BalanceCaed">
          <BalanceCard totalBalance={balance} />
        </div>

        {/* Wallet Cards */}
        <div className="walletCard">
          <WalletCards wallets={wallets} />
        </div>

        {/* Spending Overview */}
        {/* <div className="SpendingOverview">
          <SpendingOverview />
        </div> */}

        {/* Recent Transactions */}
        <div className="recentTransaction">
          <RecentTransactions />
        </div>

      </main>
    </>
  );
};

export default Wallet;

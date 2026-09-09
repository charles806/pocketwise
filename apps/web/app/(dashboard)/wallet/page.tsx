"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "../../../hooks/useWallet";
import { useAuth } from "../../../context/AuthContext";
import { WalletHeader } from "./UI/Header";
import { PinSetupModal } from "./UI/PinSetupModal";
import { GoalModal } from "./UI/GoalModal";
import { AccountReadyModal } from "./UI/AccountReadyModal";
import { DepositInfoModal } from "./UI/DepositInfoModal";
import BalanceCard from "./UI/BalanceCard";
import WalletCards from "./UI/WalletCard";
import RecentTransactions from "./UI/RecentTransactions";
import WalletSkeleton from "./UI/WalletSkeleton";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

const Wallet = () => {
  const router = useRouter();
  const { user, accessToken, isLoading: authLoading } = useAuth();
  const { data } = useWallet(accessToken);
  const [splitConfig, setSplitConfig] = useState(null);
  const [depositOpen, setDepositOpen] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    fetch(`${API_BASE}/api/v1/wallet-split`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) setSplitConfig(d.data);
      })
      .catch(() => {});
  }, [accessToken]);

  const balance = data?.totalBalance;
  const wallets = data?.wallets;

  const handleTopUp = () => {
    const kycTier = (user as any)?.kycTier ?? 0;
    if (kycTier === 0) {
      router.push("/kyc?from=deposit");
      return;
    }
    setDepositOpen(true);
  };

  if (authLoading || !data) return <WalletSkeleton />;

  return (
    <>
      <WalletHeader />
      <PinSetupModal />
      <GoalModal />
      <AccountReadyModal />
      <DepositInfoModal open={depositOpen} onClose={() => setDepositOpen(false)} />
      <main
        className="min-h-screen mt-5! flex flex-col gap-5 sm:gap-8 pb-10 sm:pb-16"
        style={{ backgroundColor: "#f8fafc" }}
      >
        {/* Balance Card */}
        <div className="BalanceCaed">
          <BalanceCard totalBalance={balance} onTopUp={handleTopUp} />
        </div>

        {/* Wallet Cards */}
        <div className="walletCard">
          <WalletCards wallets={wallets} splitConfig={splitConfig} />
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

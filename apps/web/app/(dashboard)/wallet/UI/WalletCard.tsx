"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Lock } from "lucide-react";
import { formatNaira } from "../../../../libs/utils";
import { useAuth } from "../../../../context/AuthContext";
import EmergencyUnlockModal from "./EmergencyUnlockModal";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

interface WalletItemProps {
  label: string;
  percentage: string;
  balance: string;
  dotColor: string;
  balanceColor: string;
}

interface SplitConfig {
  spendPercent: number;
  savingsPercent: number;
  emergencyPercent: number;
  flexPercent: number;
}

interface WalletCardsProps {
  wallets: any[] | null;
  splitConfig: SplitConfig | null;
}

const WalletItem = ({
  label,
  percentage,
  balance,
  dotColor,
  balanceColor,
}: WalletItemProps) => {
  return (
    <div className="w-full group cursor-pointer transition-all duration-200 active:scale-[0.98]">
      <div className="flex items-center justify-between p-3 sm:p-5 bg-background hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 border border-slate-100 rounded-3xl transition-all duration-300">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Status Dot */}
          <div
            className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full shadow-lg"
            style={{
              backgroundColor: dotColor,
              boxShadow: `0 0 12px ${dotColor}40`,
            }}
          />

          {/* Text Content */}
          <div className="flex flex-col">
            <span className="text-slate-900 font-bold text-sm sm:text-[17px] tracking-tight leading-tight">
              {label}
            </span>
            <span className="text-slate-400 font-medium text-xs sm:text-sm mt-0.5">
              {percentage} of deposits
            </span>
          </div>
        </div>

        {/* Balance */}
        <div className="text-right">
          <span
            className="font-bold text-base sm:text-lg tracking-tight"
            style={{ color: balanceColor }}
          >
            {balance}
          </span>
        </div>
      </div>
    </div>
  );
};

const EmergencyWalletItem = ({
  balance,
  percentage,
}: {
  balance: string;
  percentage: string;
}) => {
  const { accessToken } = useAuth();
  const [isUnlocked, setIsUnlocked] = useState<boolean | null>(null);
  const [showModal, setShowModal] = useState(false);

  const checkStatus = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(
        `${API_BASE}/api/v1/wallets/emergency-unlock/status`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          credentials: "include",
        },
      );
      if (res.ok) {
        const { data } = await res.json();
        setIsUnlocked(data.isUnlocked);
      }
    } catch {
      // fail silently
    }
  }, [accessToken]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const handleClick = () => {
    if (isUnlocked === false) setShowModal(true);
  };

  const handleModalDone = () => {
    setIsUnlocked(true);
    setShowModal(false);
    checkStatus();
  };

  const handleModalClose = () => setShowModal(false);

  return (
    <div className="relative" onClick={handleClick}>
      <WalletItem
        label="Emergency"
        percentage={percentage}
        balance={balance}
        dotColor="#d97706"
        balanceColor="#d97706"
      />
      {isUnlocked === false && (
        <div className="absolute -top-1.5 -right-1.5 z-10 w-5 h-5 rounded-full bg-emergency flex items-center justify-center shadow-md">
          <Lock className="w-3 h-3 text-white" />
        </div>
      )}
      {showModal && (
        <EmergencyUnlockModal
          onDone={handleModalDone}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

const WalletCards = ({ wallets, splitConfig }: WalletCardsProps) => {
  const getBalance = (type: string) => {
    if (!wallets) return "₦0.00";

    const wallet = wallets.find((w: any) => w.type === type);

    const balanceNum = wallet ? Number(wallet.balance) : 0;

    return formatNaira(balanceNum);
  };
  return (
    <section className="w-full max-w-[95%] sm:max-w-[90%] mx-auto bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-5 pt-5 pb-3 sm:px-8 sm:pt-8 sm:pb-4">
        <h3 className="font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight">
          My Wallets
        </h3>
      </div>

      {/* Wallet List */}
      <div className="flex flex-col gap-2 sm:gap-3 px-3 pb-5 sm:px-6 sm:pb-8">
        <WalletItem
          label="Spend"
          percentage={`${splitConfig?.spendPercent ?? 50}%`}
          balance={getBalance("spend")}
          dotColor="#4f46e5"
          balanceColor="#4f46e5"
        />
        <WalletItem
          label="Savings"
          percentage={`${splitConfig?.savingsPercent ?? 30}%`}
          balance={getBalance("savings")}
          dotColor="#059669"
          balanceColor="#059669"
        />
        <EmergencyWalletItem
          balance={getBalance("emergency")}
          percentage={`${splitConfig?.emergencyPercent ?? 10}%`}
        />
        <WalletItem
          label="Flex"
          percentage={`${splitConfig?.flexPercent ?? 10}%`}
          balance={getBalance("flex")}
          dotColor="#db2777"
          balanceColor="#db2777"
        />
      </div>
    </section>
  );
};

export default WalletCards;

import React from "react";
import { WalletHeader } from "./UI/Header";
import { GoalModal } from "./UI/GoalModal";

const Wallet = () => {
  return (
    <>
      <WalletHeader />
      <GoalModal />
      <main className="min-h-screen mt-5!" style={{ backgroundColor: "#f8fafc" }}>
        
        {/* Wallet Card */}
        <div className="walletCard bg-gradient-to-br from-[#4f46e5] to-[#3730a3] w-[85%] h-[60vh] mx-auto rounded-3xl">
          <div className="content">
            
          </div>
        </div>
      </main>
    </>
  );
};

export default Wallet;

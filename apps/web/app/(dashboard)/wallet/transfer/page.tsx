"use client";

import React from "react";
import { ArrowBigRight, ReceiptText, ArrowRight } from "lucide-react";
import { WalletHeader } from "../UI/Header";
import { useRouter } from "next/navigation";

const Transfer = () => {
  const router = useRouter();

  return (
    <>
      <WalletHeader />

      <main
        className="min-h-screen flex flex-col gap-6 sm:gap-8 py-4 sm:py-6"
        style={{ backgroundColor: "#f8fafc" }}
      >
        {/* Page Header */}
        <div className="text-center px-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Send Money
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-500">
            Transfer funds quickly and securely
          </p>
        </div>

        {/* Transfer Types */}
        <div className="flex justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-5xl bg-white border border-slate-200/70 rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-[0_4px_24px_rgba(15,23,42,0.06)]">
            <div className="divide-y divide-slate-100">
              {/* Pocketwise to Pocketwise */}
              <div
                onClick={() => router.push("/wallet/transfer/p2p")}
                className="flex items-center justify-between gap-3 sm:gap-4 py-4 sm:py-5 px-2 rounded-xl hover:bg-slate-50 transition-all duration-200 cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-slate-900">
                    Pocketwise to Pocketwise
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-slate-500 mt-1">
                    Send money to another Pocketwise user
                  </p>
                </div>

                <button className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 hover:bg-[#4f46e5] hover:border-[#4f46e5] hover:text-white active:scale-95 transition-all duration-200 cursor-pointer">
                  <ArrowBigRight className="w-5 h-5" />
                </button>
              </div>

              {/* Any Bank */}
              <div
                onClick={() => router.push("/transfer/external")}
                className="flex items-center justify-between gap-3 sm:gap-4 py-4 sm:py-5 px-2 rounded-xl hover:bg-slate-50 transition-all duration-200 cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-slate-900">
                    Send to Any Bank Account
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-slate-500 mt-1">
                    Send money to other bank accounts
                  </p>
                </div>

                <button className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 hover:bg-[#4f46e5] hover:border-[#4f46e5] hover:text-white active:scale-95 transition-all duration-200 cursor-pointer">
                  <ArrowBigRight className="w-5 h-5" />
                </button>
              </div>

              {/* Inter Wallet */}
              <div
                onClick={() => router.push("/transfer/inter-wallet")}
                className="flex items-center justify-between gap-3 sm:gap-4 py-4 sm:py-5 px-2 rounded-xl hover:bg-slate-50 transition-all duration-200 cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-slate-900">
                    Inter Wallet Transfer
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-slate-500 mt-1">
                    Send money to other wallets
                  </p>
                </div>

                <button className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 hover:bg-[#4f46e5] hover:border-[#4f46e5] hover:text-white active:scale-95 transition-all duration-200 cursor-pointer">
                  <ArrowBigRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="flex justify-center px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
          <div className="w-full max-w-5xl bg-white border border-slate-200/70 rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-[0_4px_24px_rgba(15,23,42,0.06)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="font-extrabold text-lg sm:text-xl md:text-2xl text-slate-900 tracking-tight">
                Recent Transactions
              </h3>
              <button
                className="text-sm sm:text-base font-semibold text-[#4f46e5] hover:text-primary-dark transition-colors cursor-pointer"
                onClick={() => router.push("/transactions")}
              >
                See all
              </button>
            </div>

            {/* Empty State */}
            <div className="flex flex-col items-center justify-center py-8 sm:py-10 md:py-14 px-4 sm:px-6 text-center rounded-3xl border border-slate-100 bg-linear-to-b from-white to-slate-50">
              {/* Icon */}
              <div className="relative mb-4 sm:mb-5">
                <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl bg-linear-to-br from-slate-50 to-slate-100 border border-slate-200">
                  <ReceiptText className="w-6 h-6 sm:w-7 sm:h-7 text-slate-400" />
                </div>
                <div className="absolute inset-0 rounded-2xl border-2 border-slate-200 animate-ping opacity-30" />
              </div>

              {/* Text */}
              <h4 className="text-slate-900 font-semibold text-base sm:text-lg mb-2">
                No transactions yet
              </h4>
              <p className="text-slate-400 text-sm max-w-xs leading-relaxed mb-5 sm:mb-6">
                Add money to your wallet to get started. Your activity will
                appear here automatically.
              </p>

              {/* CTA */}
              <button className="inline-flex items-center gap-2 bg-[#4f46e5] hover:bg-primary-dark hover:-translate-y-0.5 active:scale-95 transition-all duration-200 text-white text-sm font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-sm hover:shadow-md cursor-pointer">
                Add Money
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-xs text-slate-300 mt-3 sm:mt-4">
                Money splits automatically the moment it arrives
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Transfer;

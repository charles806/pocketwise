"use client";

import React, { useState } from "react";
import { WalletHeader } from "../../UI/Header";

const Page = () => {
  const [activeTab, setActiveTab] = useState("account");
  // State to hold the input value so we can check if the user typed something
  const [inputValue, setInputValue] = useState("");

  const formConfig = {
    account: {
      label: "Account Number",
      type: "number",
      placeholder: "Enter Account Number",
      name: "accountNumber",
    },
    phone: {
      label: "Phone Number",
      type: "tel",
      placeholder: "Enter phone number",
      name: "phoneNumber",
    },
    username: {
      label: "Username",
      type: "text",
      placeholder: "Enter @username",
      name: "username",
    },
  };

  const currentInput =
    formConfig[activeTab as keyof typeof formConfig] || formConfig.account;

  // Clear input when switching tabs to prevent weird mixed preview states
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setInputValue("");
  };

  return (
    <>
      <WalletHeader />
      <main
        className="flex min-h-screen flex-col gap-4 py-4 min-[480px]:gap-6 sm:gap-8 sm:py-6 md:gap-10"
        style={{ backgroundColor: "#f8fafc" }}
      >
        {/* Page Header */}
        <div className="px-4 text-center">
          <h1 className="text-xl font-extrabold text-slate-900 min-[480px]:text-2xl sm:text-3xl md:text-4xl">
            Send Money
          </h1>
          <p className="mt-1 text-xs text-slate-500 min-[480px]:text-sm sm:text-base">
            Transfer money to other pocketwise accounts
          </p>
        </div>

        {/* Main Container Wrapper */}
        <div className="flex justify-center px-3 min-[480px]:px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="w-full max-w-5xl rounded-2xl border border-slate-200/70 bg-white p-4 shadow-[0_4px_24px_rgba(15,23,42,0.06)] max-[480px]:rounded-xl sm:p-6 md:p-8 lg:p-10">
            <h4 className="text-lg font-bold text-slate-900 min-[480px]:text-xl sm:text-2xl">
              Pocketwise to Pocketwise
            </h4>

            {/* Tabs Container */}
            <div className="scrollbar-hide mt-4 flex gap-2 overflow-x-auto pb-1 max-[480px]:w-full min-[480px]:gap-3 md:justify-center md:gap-4">
              {/* Account Number Tab */}
              <button
                type="button"
                onClick={() => handleTabChange("account")}
                className={`active:scale-95 flex h-9 w-auto shrink-0 items-center justify-center rounded-2xl border px-3 transition-all duration-200 min-[480px]:px-4 md:h-10 md:px-5 ${
                  activeTab === "account"
                    ? "bg-[#4f46e5] border-[#4f46e5] text-white"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span className="whitespace-nowrap text-center text-xs font-medium min-[480px]:text-sm md:text-base">
                  Account Number
                </span>
              </button>

              {/* Phone Number Tab */}
              <button
                type="button"
                onClick={() => handleTabChange("phone")}
                className={`active:scale-95 flex h-9 w-auto shrink-0 items-center justify-center rounded-2xl border px-3 transition-all duration-200 min-[480px]:px-4 md:h-10 md:px-5 ${
                  activeTab === "phone"
                    ? "bg-[#4f46e5] border-[#4f46e5] text-white"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span className="whitespace-nowrap text-center text-xs font-medium min-[480px]:text-sm md:text-base">
                  Phone Number
                </span>
              </button>

              {/* Username Tab */}
              <button
                type="button"
                onClick={() => handleTabChange("username")}
                className={`active:scale-95 flex h-9 w-auto shrink-0 items-center justify-center rounded-2xl border px-3 transition-all duration-200 min-[480px]:px-4 md:h-10 md:px-5 ${
                  activeTab === "username"
                    ? "bg-[#4f46e5] border-[#4f46e5] text-white"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span className="whitespace-nowrap text-center text-xs font-medium min-[480px]:text-sm md:text-base">
                  @username
                </span>
              </button>
            </div>

            {/* Form & Preview Area */}
            <div className="mt-8 border-t border-slate-100 pt-6">
              <form
                className="mx-auto flex w-full max-w-md flex-col gap-5"
                onSubmit={(e) => e.preventDefault()}
              >
                {/* Input Field Group */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-700 min-[480px]:text-sm">
                    {currentInput.label}
                  </label>
                  <input
                    type={currentInput.type}
                    name={currentInput.name}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={currentInput.placeholder}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-[#4f46e5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/10 min-[480px]:text-base"
                  />
                </div>

                {/* Recipient Preview Box (Renders conditionally once input is populated) */}
                {inputValue.trim() !== "" && (
                  <div className="w-full bg-[#eff6ff] border-y-2 border-x-4 border-[#3b82f6] px-4 py-3 text-left relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] after:absolute after:right-0 after:top-0 after:bottom-0 after:w-[2px]">
                    <span className="block text-xs font-semibold text-[#4f46e5] tracking-wide uppercase min-[480px]:text-xs">
                      Recipient Preview
                    </span>
                    <h5 className="mt-1 text-base font-bold text-slate-900 min-[480px]:text-lg">
                      John Doe{" "}
                      {/* Replace with dynamic fetching name logic later */}
                    </h5>
                    <p className="text-xs text-slate-500 font-medium min-[480px]:text-sm">
                      {inputValue}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={inputValue.trim() === ""}
                  className="mt-2 w-full rounded-xl bg-[#4f46e5] py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/10 hover:bg-[#4338ca] transition-colors min-[480px]:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Page;

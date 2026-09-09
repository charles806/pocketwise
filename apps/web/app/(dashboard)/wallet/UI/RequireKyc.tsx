"use client";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import { ShieldAlert, ArrowRight } from "lucide-react";

interface RequireKycProps {
  children: ReactNode;
}

export const RequireKyc = ({ children }: RequireKycProps) => {
  const router = useRouter();
  const { user } = useAuth();

  const kycTier = (user as any)?.kycTier ?? 0;

  if (kycTier >= 1) {
    return <>{children}</>;
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ backgroundColor: "#f8fafc" }}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200/70 shadow-[0_4px_24px_rgba(15,23,42,0.06)] p-8 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-4">
          <ShieldAlert className="w-7 h-7 text-amber-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">
          Verify Your Identity
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          You need to verify your identity before you can send money.
        </p>
        <button
          onClick={() => router.push("/kyc?from=transfer")}
          className="mt-6 w-full flex items-center justify-center gap-2 bg-[#4f46e5] text-white rounded-xl py-3 font-semibold text-sm transition-all hover:bg-[#4338ca] active:scale-[0.99]"
        >
          Verify Identity
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </main>
  );
};

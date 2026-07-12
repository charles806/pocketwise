"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import { useToast } from "../../../../context/ToastContext";
import { ChevronLeft, Loader2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

type Step = "otp" | "reset";

function maskPhone(phone: string): string {
  if (phone.length >= 8) {
    return `${phone.slice(0, 3)}***${phone.slice(-4)}`;
  }
  return phone;
}

const ChangePin = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const userPhone = (user as any)?.phone || "";

  const [step, setStep] = useState<Step>("otp");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = useCallback(async () => {
    if (!userPhone) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/forgot-pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone: userPhone }),
      });
      const data = await res.json();
      if (!data.success) {
        toast(data.message || "Something went wrong", { type: "error" });
        return;
      }
      setCountdown(60);
    } catch {
      toast("Network error. Please try again.", { type: "error" });
    } finally {
      setLoading(false);
    }
  }, [userPhone, toast]);

  const handleResend = useCallback(async () => {
    if (countdown > 0) return;
    setLoading(true);
    try {
      await fetch(`${API_BASE}/api/v1/auth/forgot-pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone: userPhone }),
      });
      setCountdown(60);
    } catch {
      toast("Network error. Please try again.", { type: "error" });
    } finally {
      setLoading(false);
    }
  }, [userPhone, countdown, toast]);

  useEffect(() => {
    if (userPhone) {
      handleSendOtp();
    }
  }, [userPhone, handleSendOtp]);

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/verify-pin-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone: userPhone, otp }),
      });
      const data = await res.json();
      if (!data.success) {
        toast(data.message || "Invalid OTP", { type: "error" });
        setOtp("");
        return;
      }
      setResetToken(data.data.token);
      setStep("reset");
    } catch {
      toast("Network error. Please try again.", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPin = async () => {
    if (newPin.length !== 4 || confirmPin.length !== 4 || newPin !== confirmPin)
      return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/reset-pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          phone: userPhone,
          token: resetToken,
          newPin,
          confirmPin,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast(data.message || "Failed to change PIN", { type: "error" });
        return;
      }
      toast("Transfer PIN updated!", { type: "success" });
      setTimeout(() => router.push("/profile"), 1500);
    } catch {
      toast("Network error. Please try again.", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const pinsMatch = newPin === confirmPin;
  const pinsFilled = newPin.length === 4 && confirmPin.length === 4;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-md mx-auto px-4 py-8">
        <button
          onClick={() => router.push("/profile")}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to profile</span>
        </button>

        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_4px_24px_rgba(15,23,42,0.06)] p-6">
          {/* Step 1: OTP */}
          {step === "otp" && (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-900 mb-1">
                  Verify your identity
                </h1>
                <p className="text-sm text-slate-500">
                  We sent a 6-digit code to{" "}
                  <span className="font-semibold text-slate-900">
                    {maskPhone(userPhone)}
                  </span>
                </p>
              </div>

              <div className="mb-6">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full text-center text-2xl tracking-[0.5em] font-bold rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10 outline-none transition-all"
                />
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={otp.length !== 6 || loading}
                className="w-full rounded-xl bg-[#4f46e5] text-white font-semibold py-2.5 hover:bg-[#4338ca] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Verify Code"
                )}
              </button>

              <div className="mt-4 text-center">
                {countdown > 0 ? (
                  <span className="text-sm text-slate-400">
                    Resend in {countdown}s
                  </span>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={loading}
                    className="text-sm font-medium text-[#4f46e5] hover:text-[#4338ca] transition-colors disabled:text-slate-400"
                  >
                    Resend code
                  </button>
                )}
              </div>
            </>
          )}

          {/* Step 2: New PIN */}
          {step === "reset" && (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-900 mb-1">
                  Set new transfer PIN
                </h1>
                <p className="text-sm text-slate-500">
                  Choose a 4-digit PIN you haven&apos;t used before.
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    New PIN
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={newPin}
                    onChange={(e) =>
                      setNewPin(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="****"
                    className="w-full max-w-[160px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-center tracking-[0.5em] focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Confirm PIN
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={confirmPin}
                    onChange={(e) =>
                      setConfirmPin(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="****"
                    className="w-full max-w-[160px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-center tracking-[0.5em] focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10 outline-none transition-all"
                  />
                </div>

                {pinsFilled && !pinsMatch && (
                  <p className="text-xs text-red-500">PINs don&apos;t match</p>
                )}
              </div>

              <button
                onClick={handleResetPin}
                disabled={!pinsFilled || !pinsMatch || loading}
                className="w-full rounded-xl bg-[#4f46e5] text-white font-semibold py-2.5 hover:bg-[#4338ca] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Set PIN"
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangePin;

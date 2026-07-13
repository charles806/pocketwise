"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "../../../context/ToastContext";
import logo from "../../logo.png";
import loginImage from "../../loginImge.png";
import {
  ChevronLeft,
  Mail,
  Phone,
  Eye,
  EyeOff,
  Loader2,
  KeyRound,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

type Step = "choose" | "otp" | "reset";

function maskIdentifier(identifier: string): string {
  if (identifier.includes("@")) {
    const [local, domain] = identifier.split("@");
    if (!local || !domain) return identifier;
    return `${local[0]}***@${domain}`;
  }
  if (identifier.length >= 8) {
    return `${identifier.slice(0, 3)}***${identifier.slice(-4)}`;
  }
  return identifier;
}

const ForgotPassword = () => {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("choose");
  const [channel, setChannel] = useState<"email" | "sms" | null>(null);
  const [identifier, setIdentifier] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendCode = async () => {
    if (!channel || !identifier) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier }),
      });
      const data = await res.json();
      if (!data.success) {
        toast(data.message || "Something went wrong", { type: "error" });
        return;
      }
      setStep("otp");
      setCountdown(60);
    } catch {
      toast("Network error. Please try again.", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = useCallback(async () => {
    if (countdown > 0) return;
    setLoading(true);
    try {
      await fetch(`${API_BASE}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier }),
      });
      setCountdown(60);
    } catch {
      toast("Network error. Please try again.", { type: "error" });
    } finally {
      setLoading(false);
    }
  }, [identifier, countdown, toast]);

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier, otp }),
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

  const handleResetPassword = async () => {
    if (newPassword.length < 8 || newPassword !== confirmPassword) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          identifier,
          token: resetToken,
          newPassword,
          confirmPassword,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast(data.message || "Failed to reset password", { type: "error" });
        return;
      }
      toast("Password reset successfully!", { type: "success" });
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      toast("Network error. Please try again.", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = newPassword === confirmPassword;
  const passwordsFilled =
    newPassword.length >= 8 && confirmPassword.length >= 8;

  return (
    <main className="min-h-screen w-full bg-linear-to-br from-slate-50 to-slate-100 p-3 sm:p-4 lg:p-6 flex items-center justify-center">
      <div className="w-full max-w-360 min-h-[92vh] lg:h-[92vh] flex bg-white overflow-hidden rounded-3xl lg:rounded-4xl border border-slate-200 shadow-xl shadow-slate-200/50">
        {/* Left Side - Branding */}
        <section className="hidden lg:flex flex-col justify-between w-1/2 bg-slate-50/80 p-10 xl:p-14 relative overflow-hidden border-r border-slate-200">
          <div className="absolute top-0 right-0 w-125 h-125 bg-indigo-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-100 h-100 bg-indigo-100/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-3 w-fit group">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                <Image
                  src={logo}
                  alt="PocketWise Logo"
                  width={28}
                  height={28}
                  className="rounded-md"
                />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">
                PocketWise
              </span>
            </Link>
          </div>

          <div className="relative z-10 max-w-xl mt-6">
            <h1 className="text-4xl xl:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
              Reset Your Access
            </h1>
            <p className="text-lg text-slate-600 font-medium leading-relaxed max-w-md">
              Don&apos;t worry, even the smartest savers forget things
              sometimes. We&apos;ll help you get back to managing your wallets.
            </p>
          </div>

          <div className="relative z-10 flex-1 flex items-end justify-center pt-8">
            <div className="relative w-full max-w-sm xl:max-w-md aspect-square">
              <Image
                src={loginImage}
                alt="PocketWise App Interface"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>
        </section>

        {/* Right Side - Form */}
        <section className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-12 lg:py-16 bg-white">
          <div className="w-full max-w-md mx-auto">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8 group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back to login</span>
            </Link>

            {/* Step 1: Choose channel */}
            {step === "choose" && (
              <>
                <div className="mb-8">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                    Reset your password
                  </h1>
                  <p className="text-slate-500 font-medium text-sm sm:text-base">
                    Choose how you&apos;d like to receive your reset code
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <button
                    onClick={() => {
                      setChannel("email");
                      setIdentifier("");
                    }}
                    className={`flex-1 flex items-start gap-3 p-4 rounded-2xl text-left transition-all ${
                      channel === "email"
                        ? "border-2 border-[#4f46e5] bg-[#eef2ff]"
                        : "border border-slate-200 bg-white"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#eef2ff] flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-[#4f46e5]" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Email</p>
                      <p className="text-sm text-slate-500">
                        Get a code sent to your email address
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setChannel("sms");
                      setIdentifier("");
                    }}
                    className={`flex-1 flex items-start gap-3 p-4 rounded-2xl text-left transition-all ${
                      channel === "sms"
                        ? "border-2 border-[#4f46e5] bg-[#eef2ff]"
                        : "border border-slate-200 bg-white"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#eef2ff] flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-[#4f46e5]" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">SMS</p>
                      <p className="text-sm text-slate-500">
                        Get a code sent to your phone number
                      </p>
                    </div>
                  </button>
                </div>

                <div className="mb-6">
                  {channel === "email" && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Email address
                      </label>
                      <input
                        type="email"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10 outline-none transition-all"
                      />
                    </div>
                  )}
                  {channel === "sms" && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Phone number
                      </label>
                      <input
                        type="tel"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="Enter your phone number (e.g. 08012345678)"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10 outline-none transition-all"
                      />
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSendCode}
                  disabled={!channel || !identifier || loading}
                  className="w-full rounded-xl bg-[#4f46e5] text-white font-semibold py-3 hover:bg-[#4338ca] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Send Code"
                  )}
                </button>
              </>
            )}

            {/* Step 2: OTP */}
            {step === "otp" && (
              <>
                <div className="mb-8">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                    Enter your code
                  </h1>
                  <p className="text-slate-500 font-medium text-sm sm:text-base">
                    We sent a 6-digit code to{" "}
                    <span className="font-semibold text-slate-900">
                      {maskIdentifier(identifier)}
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
                  className="w-full rounded-xl bg-[#4f46e5] text-white font-semibold py-3 hover:bg-[#4338ca] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

            {/* Step 3: New Password */}
            {step === "reset" && (
              <>
                <div className="mb-8">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                    Set new password
                  </h1>
                  <p className="text-slate-500 font-medium text-sm sm:text-base">
                    Choose a strong password you haven&apos;t used before.
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      New password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-sm focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Confirm new password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-sm focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {passwordsFilled && !passwordsMatch && (
                    <p className="text-xs text-red-500">
                      Passwords don&apos;t match
                    </p>
                  )}
                </div>

                <button
                  onClick={handleResetPassword}
                  disabled={!passwordsFilled || !passwordsMatch || loading}
                  className="w-full rounded-xl bg-[#4f46e5] text-white font-semibold py-3 hover:bg-[#4338ca] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default ForgotPassword;

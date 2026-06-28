"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "../../../public/logo.png";
import loginImage from "../../../public/loginImge.png";
import TextField from "@mui/material/TextField";
import { ChevronLeft, Mail, Send, KeyRound, Lock } from "lucide-react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

type Step = "email" | "otp" | "password" | "success";

const ForgotPassword = () => {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");

  useEffect(() => {
    if (step === "otp") {
      otpRefs.current[0]?.focus();
    }
  }, [step]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Something went wrong");
        setLoading(false);
        return;
      }

      setStep("otp");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter the full -digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpString }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Invalid OTP");
        setLoading(false);
        return;
      }

      setResetToken(data.data.token);
      setStep("password");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token: resetToken, password }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Failed to reset password");
        setLoading(false);
        return;
      }

      setStep("success");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetOtp = () => {
    setOtp(["", "", "", "", "", ""]);
    setError("");
    handleSendOtp({ preventDefault: () => {} } as React.FormEvent);
  };

  return (
    <main className="h-screen w-full bg-linear-to-br from-slate-50 to-slate-100 p-4 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-6xl h-[95vh] flex bg-white overflow-hidden rounded-4xl border border-slate-200 shadow-sm">
        {/* Left Side - Branding */}
        <section className="hidden lg:flex flex-col justify-between w-1/2 bg-slate-50 p-12 relative overflow-hidden border-r border-slate-200">
          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-3 w-fit group">
              <Image
                src={logo}
                alt="PocketWise Logo"
                width={40}
                height={40}
                className="rounded-xl border border-slate-200 shadow-sm group-hover:scale-105 transition-transform"
              />
              <span className="text-xl font-bold text-slate-900 tracking-tighter">
                PocketWise
              </span>
            </Link>
          </div>

          <div className="relative z-10 max-w-xl">
            <h1 className="text-5xl lg:text-5xl font-extrabold text-slate-900 tracking-tighter leading-[1.1] mb-6">
              Reset Your Access
            </h1>
            <p className="text-xl text-slate-600 font-medium leading-relaxed">
              Don't worry, even the smartest savers forget things sometimes.
              We'll help you get back to managing your wallets.
            </p>
          </div>

          <div className="relative z-10 flex-1 flex items-end justify-center">
            <div className="relative w-full max-w-md aspect-square">
              <div className="absolute bottom-10 w-72 h-72 bg-indigo-100 blur-3xl opacity-30 rounded-full"></div>
              <Image
                src={loginImage}
                alt="PocketWise App Interface"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.20)]"
                priority
              />
            </div>
          </div>
        </section>

        {/* Right Side - Form */}
        <section className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-8 lg:px-16">
          <div className="max-w-md w-full mx-auto">
            {step !== "success" && (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8 group"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back to login</span>
              </Link>
            )}

            {/* Step 1: Email */}
            {step === "email" && (
              <>
                <div className="flex flex-col gap-2 mb-10">
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Forgot password?
                  </h1>
                  <p className="text-slate-600">
                    Enter the email associated with your account and we'll send
                    you a one-time code to reset your password.
                  </p>
                </div>

                <form onSubmit={handleSendOtp} className="flex flex-col gap-6">
                  <TextField
                    label="Email address"
                    variant="outlined"
                    type="email"
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={!!error}
                    helperText={error}
                    disabled={loading}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <Mail className="w-5 h-5 text-slate-400 mr-3" />
                        ),
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    disableElevation
                    className="w-full rounded-xl shadow-sm bg-[#0f172a]! !hover:bg-slate-800 disabled:bg-slate-200! disabled:text-slate-400! text-white! transition-all py-3.5 normal-case font-bold text-base mt-2"
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Send OTP"
                    )}
                  </Button>
                </form>
              </>
            )}

            {/* Step 2: OTP */}
            {step === "otp" && (
              <>
                <div className="flex flex-col gap-2 mb-10">
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Check your email
                  </h1>
                  <p className="text-slate-600">
                    We sent a 6-digit code to{" "}
                    <span className="font-semibold text-slate-900">
                      {email}
                    </span>
                    . Enter it below to continue.
                  </p>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex gap-2 justify-center">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          otpRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-12 h-14 text-center text-xl font-bold border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                      />
                    ))}
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm text-center -mt-2">
                      {error}
                    </p>
                  )}

                  <Button
                    onClick={handleVerifyOtp}
                    variant="contained"
                    disabled={loading || otp.join("").length !== 6}
                    disableElevation
                    className="w-full rounded-xl shadow-sm bg-[#0f172a]! !hover:bg-slate-800 disabled:bg-slate-200! disabled:text-slate-400! text-white! transition-all py-3.5 normal-case font-bold text-base"
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Verify Code"
                    )}
                  </Button>

                  <div className="text-center">
                    <button
                      onClick={resetOtp}
                      disabled={loading}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors disabled:text-slate-400"
                    >
                      Didn't receive the code? Resend
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Step 3: New Password */}
            {step === "password" && (
              <>
                <div className="flex flex-col gap-2 mb-10">
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Set new password
                  </h1>
                  <p className="text-slate-600">
                    Choose a strong password you haven't used before. At least 8
                    characters.
                  </p>
                </div>

                <form
                  onSubmit={handleResetPassword}
                  className="flex flex-col gap-6"
                >
                  <TextField
                    label="New password"
                    variant="outlined"
                    type="password"
                    fullWidth
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <Lock className="w-5 h-5 text-slate-400 mr-3" />
                        ),
                      },
                    }}
                  />

                  <TextField
                    label="Confirm new password"
                    variant="outlined"
                    type="password"
                    fullWidth
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={!!error}
                    helperText={error}
                    disabled={loading}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <Lock className="w-5 h-5 text-slate-400 mr-3" />
                        ),
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    disableElevation
                    className="w-full rounded-xl shadow-sm bg-[#0f172a]! !hover:bg-slate-800 disabled:bg-slate-200! disabled:text-slate-400! text-white! transition-all py-3.5 normal-case font-bold text-base mt-2"
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </form>
              </>
            )}

            {/* Step 4: Success */}
            {step === "success" && (
              <div className="text-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <KeyRound className="w-10 h-10 text-emerald-500" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-3">
                  Password reset!
                </h1>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  Your password has been successfully updated. You can now log
                  in with your new password.
                </p>
                <Link href="/login" className="w-full block">
                  <Button
                    variant="contained"
                    fullWidth
                    disableElevation
                    className="rounded-xl bg-[#0f172a]! !hover:bg-slate-800 text-white! py-3 font-bold normal-case"
                  >
                    Back to Login
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default ForgotPassword;

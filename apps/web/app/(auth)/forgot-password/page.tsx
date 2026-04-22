"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "../../../public/logo.png";
import loginImage from "../../../public/loginImge.png";
import TextField from "@mui/material/TextField";
import { ChevronLeft, Mail, Send } from "lucide-react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    
    setLoading(true);
    setError("");

    // Simulate API call for UI-only implementation
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <main className="h-screen w-full bg-linear-to-br from-slate-50 to-slate-100 p-4 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-6xl h-[95vh] flex bg-white overflow-hidden rounded-4xl border border-slate-200 shadow-sm">
        {/* Left Side - Consistent with Login */}
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
              Don't worry, even the smartest savers forget things sometimes. We'll help you get back to managing your wallets.
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
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8 group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back to login</span>
            </Link>

            {!submitted ? (
              <>
                <div className="flex flex-col gap-2 mb-10">
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Forgot password? 🔒</h1>
                  <p className="text-slate-600">
                    Enter the email associated with your account and we'll send you instructions to reset your password.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
                      "Send Reset Link"
                    )}
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Send className="w-10 h-10 text-emerald-500" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-3">Check your email</h1>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  We've sent a password reset link to <span className="font-semibold text-slate-900">{email}</span>. Please check your inbox and follow the instructions.
                </p>
                <div className="flex flex-col gap-4">
                  <Link href="/login" className="w-full">
                    <Button
                      variant="contained"
                      fullWidth
                      disableElevation
                      className="rounded-xl bg-[#0f172a]! !hover:bg-slate-800 text-white! py-3 font-bold normal-case"
                    >
                      Return to Login
                    </Button>
                  </Link>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    Didn't receive the email? Try again
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default ForgotPassword;

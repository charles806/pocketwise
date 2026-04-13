"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import loginImage from "../../../public/walletuicard.png";
import logo from "../../../public/logo.png";
import TextField from '@mui/material/TextField';
import Button from "@mui/material/Button";

const SignUp = () => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  }
  return (
    <main className="h-screen w-full flex items-center justify-center bg-slate-50 p-4 lg:p-8">

      <div className="w-full max-w-[1440px] h-[95vh] flex bg-white overflow-hidden rounded-[32px] border border-slate-200">
        {/* Left Panel*/}
        <section className="hidden lg:flex flex-col justify-between w-1/2 bg-slate-50 p-12 relative overflow-hidden border-r border-slate-200">

          {/* Brand Header */}
          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-3 w-fit group">
              <Image
                src={logo}
                alt="PocketWise Logo"
                width={40}
                height={40}
                className="rounded-xl border border-slate-200 shadow-sm group-hover:scale-105 transition-transform"
              />
              <span className="text-xl font-bold font-sans text-slate-900 tracking-tighter">
                PocketWise
              </span>
            </Link>
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-2xl mt-4">
            <h1 className="text-5xl lg:text-6xl font-extrabold font-sans text-slate-900 tracking-tighter leading-[1.05] mb-8">
              One deposit. Four wallets.<br />
              Zero effort.
            </h1>
            <p className="text-xl lg:text-2xl text-slate-600 font-medium tracking-tight mb-12 leading-relaxed max-w-[90%]">
              Join PocketWise to automatically sort, save, and grow your money the exact second it lands in your account. No math or spreadsheets required.
            </p>
          </div>

          {/* Visual/Mockup */}
          <div className="relative z-10 flex-1 flex items-end justify-center">
            <div className="relative w-full max-w-md aspect-square">
              <Image
                src={loginImage}
                alt="PocketWise App Interface"
                fill
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>
        </section>

        {/* Right Panel */}
        <section className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md">
            <div className="flex items-center justify-center flex-col gap-4 text-center">
              <h1 className="text-4xl lg:text-5xl font-extrabold font-sans text-slate-900 tracking-tighter leading-tight">
                Sign Up to Pocketwise
              </h1>
              <p className="text-slate-500 font-medium tracking-tight leading-relaxed max-w-[320px] text-sm lg:text-base">
                Create your account and start managing your money smarter today.
              </p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <TextField label="First Name" variant="outlined" className="w-full" />
                  <TextField label="Last Name" variant="outlined" className="w-full" />
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <TextField label="Username" variant="outlined" className="w-full" />
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <TextField label="Email" variant="outlined" className="w-full" />
                  <TextField label="Phone Number" variant="outlined" className="w-full" />
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <TextField label="Date of Birth" variant="outlined" className="w-full" />
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <TextField label="Password" variant="outlined" className="w-full" />
                  <TextField label="Confirm Password" variant="outlined" className="w-full" />
                </div>

                <div className="flex items-start gap-2 text-left mt-2">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="mt-1 size-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-xs lg:text-sm text-slate-500 font-medium leading-snug cursor-pointer select-none">
                    I confirm that I am at least 18 years old and I agree to the{" "}
                    <Link href="/terms" className="text-slate-900 underline underline-offset-4 hover:text-slate-700 transition-colors">Terms of Service</Link>
                    {" "}and{" "}
                    <Link href="/privacy" className="text-slate-900 underline underline-offset-4 hover:text-slate-700 transition-colors">Privacy Policy</Link>.
                  </label>
                </div>

                <Button type="submit" variant="contained" className="w-full rounded-lg shadow-sm bg-primary! hover:bg-primary-dark! transition-colors py-3 normal-case font-sans font-bold">
                  Sign Up
                </Button>
              </form>


            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default SignUp;
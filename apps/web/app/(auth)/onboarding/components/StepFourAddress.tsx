"use client";
import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, MapPin } from "lucide-react";
import Image from "next/image";
import logo from "../../../logo.png";
import { useAuth } from "../../../../context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
].sort();

interface StepFourAddressProps {
  onNext: () => void;
  onPrev: () => void;
}

const StepFourAddress = ({ onNext, onPrev }: StepFourAddressProps) => {
  const { accessToken, refreshSession } = useAuth();
  const shouldReduceMotion = useReducedMotion();
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const isValid = addressLine1.trim().length > 0 && city.trim().length > 0 && state.length > 0;

  const handleSave = async () => {
    if (!isValid || isSaving) return;
    setIsSaving(true);
    setError("");

    try {
      let token = accessToken;
      if (!token) {
        token = await refreshSession();
      }
      if (!token) {
        setError("Session expired. Please sign in again.");
        return;
      }

      const res = await fetch(`${API_BASE}/api/v1/auth/onboarding/address`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          addressLine1: addressLine1.trim(),
          addressLine2: addressLine2.trim() || undefined,
          city: city.trim(),
          state,
          postalCode: postalCode.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to save address");
        return;
      }

      onNext();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
        delayChildren: shouldReduceMotion ? 0 : 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  const inputClass =
    "w-full bg-[#f8f7fb] border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#4f46e5] focus:bg-white focus:outline-none transition-colors";

  const selectClass =
    "w-full bg-[#f8f7fb] border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:border-[#4f46e5] focus:bg-white focus:outline-none transition-colors appearance-none cursor-pointer";

  return (
    <div className="flex flex-col lg:flex-row w-full max-w-7xl min-h-150 lg:min-h-175 bg-white lg:rounded-4xl shadow-2xl overflow-hidden border border-slate-100 ring-1 ring-black/5">
      {/* Left Side — Content */}
      <div className="flex flex-col w-full lg:w-[55%] p-8 lg:p-12 justify-between bg-white">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-6 lg:mb-0"
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white rounded-xl border border-slate-200 shadow-sm">
              <Image
                src={logo}
                alt="PocketWise Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
            </div>
            <span className="text-slate-900 font-sans text-xl font-bold tracking-tight">
              PocketWise
            </span>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-5 max-w-lg mx-auto lg:mx-0 w-full"
        >
          {/* Step badge */}
          <motion.div
            variants={itemVariants}
            className="flex w-fit items-center bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1 gap-2"
          >
            <div className="size-1.5 bg-indigo-600 rounded-full" />
            <span className="text-indigo-600 font-sans text-[10px] font-bold tracking-widest uppercase">
              Step 4 of 5
            </span>
          </motion.div>

          {/* Title */}
          <motion.div variants={itemVariants} className="space-y-2">
            <h1 className="text-slate-900 font-sans text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight">
              Where do you
              <br />
              <span className="text-indigo-600">live?</span>
            </h1>
            <p className="text-slate-500 font-sans text-sm lg:text-base leading-relaxed">
              We need your address for identity verification.
            </p>
          </motion.div>

          {/* Form fields */}
          <motion.div variants={itemVariants} className="flex flex-col gap-4">
            {/* Row 1: Street address + Apt/Suite */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 ml-0.5">
                  Street address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="123 Main Street"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 ml-0.5">
                  Apartment / suite
                </label>
                <input
                  type="text"
                  placeholder="Apt 4B"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Row 2: City + State */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 ml-0.5">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Lagos"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 ml-0.5">
                  State <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className={selectClass}
                  >
                    <option value="" disabled>
                      Select a state
                    </option>
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <svg className="size-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3: Postal code */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 ml-0.5">
                  Postal code
                </label>
                <input
                  type="text"
                  placeholder="100001"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </motion.div>

          {/* Error banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </motion.div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex w-full justify-between items-center mt-6 lg:mt-0"
        >
          <button
            onClick={onPrev}
            className="flex items-center cursor-pointer text-slate-500 hover:text-slate-700 font-medium text-sm transition-colors"
          >
            <ArrowLeft className="size-4 mr-2" />
            Back
          </button>

          <div className="flex items-center gap-1.5">
            <div className="size-1.5 bg-slate-200 rounded-full" />
            <div className="size-1.5 bg-slate-200 rounded-full" />
            <div className="size-1.5 bg-slate-200 rounded-full" />
            <div className="w-8 h-1.5 bg-indigo-600 rounded-full" />
            <div className="size-1.5 bg-slate-200 rounded-full" />
          </div>

          <motion.button
            whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            onClick={handleSave}
            disabled={!isValid || isSaving}
            className="flex items-center bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white shadow-xl shadow-indigo-200 rounded-2xl px-6 py-3.5 gap-2.5 transition-all group text-sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span className="font-bold">Saving...</span>
              </>
            ) : (
              <>
                <span className="font-bold">Continue</span>
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </motion.button>
        </motion.div>
      </div>

      {/* Right Side — Visual */}
      <div className="hidden lg:flex relative w-[45%] bg-[linear-gradient(135deg,#eef2ff_0%,#f0fdf4_50%,#eef2ff_100%)] items-center justify-center p-12 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-sm"
        >
          {!shouldReduceMotion && (
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.25, 0.45, 0.25],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -top-[10%] -right-[10%] size-64 bg-indigo-500/15 blur-[100px] rounded-full"
            />
          )}

          <div className="flex flex-col items-center gap-6">
            <div className="size-24 bg-indigo-100 rounded-3xl flex items-center justify-center">
              <MapPin className="size-12 text-indigo-600" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-slate-900 font-bold text-lg">
                Your address is safe with us
              </p>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                We use it only for identity verification and to comply with
                Nigerian financial regulations.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-slate-100">
              <div className="size-2 bg-emerald-500 rounded-full" />
              <span className="text-xs font-semibold text-slate-600">
                NDPC Compliant
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StepFourAddress;

"use client";
import React, { useState } from "react";
import StepOne from "./components/StepOne";
import { motion, AnimatePresence } from "framer-motion";

const Onboarding = () => {
  const [step, setStep] = useState(1);

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <main className="relative min-h-screen w-full overflow-hidden hero-mesh">
      {/* Background blur layers */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/20 blur-[120px] rounded-full" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="relative z-10 w-full min-h-screen flex items-center justify-center p-4 lg:p-8"
        >
          <div className="w-full max-w-7xl mx-auto">
            {step === 1 && <StepOne onNext={nextStep} />}
            {step === 2 && (
              <div className="flex flex-col items-center justify-center text-center p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl">
                <h1 className="text-4xl font-bold text-slate-900">Step 2 Coming Soon</h1>
                <button
                  onClick={prevStep}
                  className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-indigo-200"
                >
                  ← Back
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </main>
  );
};

export default Onboarding;
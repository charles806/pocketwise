"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StepOne from "./components/StepOne";
import StepTwo from "./components/StepTwo";
import StepThree from "./components/StepThree";
import { motion, AnimatePresence } from "framer-motion";
import LoadingAnimation from "./components/LoadingAnimation";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);
  const router = useRouter();

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleComplete = () => {
    setIsCompleting(true);
  };

  useEffect(() => {
    if (isCompleting) {
      const timer = setTimeout(() => {
        router.push("/wallet");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isCompleting, router]);

  if (isCompleting) {
    return <LoadingAnimation />;
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden hero-mesh">
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
            {step === 1 && (
              <StepOne onNext={nextStep} onSkip={handleComplete} />
            )}
            {step === 2 && (
              <StepTwo
                onNext={nextStep}
                onPrev={prevStep}
                onSkip={handleComplete}
              />
            )}
            {step === 3 && (
              <StepThree
                onComplete={handleComplete}
                onPrev={prevStep}
                onSkip={handleComplete}
              />
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </main>
  );
};

export default Onboarding;

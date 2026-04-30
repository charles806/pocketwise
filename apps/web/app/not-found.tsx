'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Sparkles, Rocket, Clock } from 'lucide-react';

export default function NotFound() {
    const router = useRouter();

    const handleGoHome = () => {
        router.push('/');
    };

    const handleGoBack = () => {
        if (typeof window !== 'undefined') {
            window.history.back();
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] p-6 relative overflow-hidden">
            {/* Animated Background Blobs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div 
                    animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.2, 0.1],
                        x: [0, 50, 0],
                        y: [0, 30, 0]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-400 rounded-full blur-[100px]"
                />
                <motion.div 
                    animate={{ 
                        scale: [1, 1.3, 1],
                        opacity: [0.1, 0.15, 0.1],
                        x: [0, -40, 0],
                        y: [0, -50, 0]
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-400 rounded-full blur-[100px]"
                />
            </div>

            <div className="relative z-10 text-center max-w-2xl w-full">
                {/* Icon Animation */}
                <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="mb-8 flex justify-center"
                >
                    <div className="w-24 h-24 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center relative group">
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                        >
                            <Rocket className="w-12 h-12 text-indigo-600" />
                        </motion.div>
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute -top-2 -right-2"
                        >
                            <Sparkles className="w-8 h-8 text-amber-400" />
                        </motion.div>
                    </div>
                </motion.div>

                {/* Text Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h1 className="text-4xl md:text-5xl font-extrabold text-[#0f172a] mb-4 tracking-tight">
                        Coming Soon
                    </h1>
                    <p className="text-lg text-slate-500 mb-12 max-w-lg mx-auto leading-relaxed">
                        We&apos;re currently building this feature to give you the best experience possible. Stay tuned for something amazing!
                    </p>
                </motion.div>

                {/* Progress Indicator (Faux) */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mb-12 max-w-xs mx-auto"
                >
                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        <span>Development</span>
                        <span>65%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "65%" }}
                            transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
                            className="h-full bg-linear-to-r from-indigo-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                        />
                    </div>
                </motion.div>

                {/* Buttons */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <button
                        onClick={handleGoHome}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-200 transition-all duration-300 active:scale-95 group"
                    >
                        <Home className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                        Back to Home
                    </button>

                    <button
                        onClick={handleGoBack}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-slate-600 border border-slate-200 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 active:scale-95 group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Go Back
                    </button>
                </motion.div>

                {/* Footer Note */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-16 flex items-center justify-center gap-2 text-slate-400 text-sm font-medium"
                >
                    <Clock className="w-4 h-4" />
                    Estimated Launch: Q3 2026
                </motion.div>
            </div>
        </div>
    );
}
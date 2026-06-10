const SkeletonBlock = ({ className }: { className?: string }) => (
  <div className={`bg-slate-200 rounded-2xl animate-pulse ${className}`} />
);

const WalletSkeleton = () => {
  const items = Array.from({ length: 4 });

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header Skeleton */}
      <header className="flex items-center justify-between px-4 sm:px-6 h-14 sm:h-20 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2 sm:gap-3">
          <SkeletonBlock className="w-9 h-9 sm:w-11 sm:h-11 rounded-full" />
          <div className="flex flex-col gap-2">
            <SkeletonBlock className="w-20 h-3" />
            <SkeletonBlock className="w-28 h-4" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SkeletonBlock className="w-10 h-10 rounded-full" />
          <SkeletonBlock className="w-9 h-9 rounded-full" />
        </div>
      </header>

      <main className="mt-5 flex flex-col gap-5 sm:gap-8 px-4">
        {/* Balance Card Skeleton */}
        <div className="w-full max-w-[95%] sm:max-w-[90%] mx-auto bg-linear-to-br from-[#4f46e5]/70 to-primary-dark/70 rounded-4xl shadow-lg">
          <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6">
            <div className="flex flex-col gap-2 sm:gap-4">
              <div className="space-y-0.5 sm:space-y-1">
                <SkeletonBlock className="w-24 h-3 sm:h-4 bg-indigo-300/50" />
                <SkeletonBlock className="w-48 h-8 sm:h-10 bg-white/30" />
              </div>
            </div>
            <div className="flex justify-between gap-2 sm:gap-3">
              {["Send", "Receive", "Top Up"].map((_, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-1.5 sm:gap-2 py-3 sm:py-4 bg-white/10 rounded-2xl"
                >
                  <SkeletonBlock className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white/30" />
                  <SkeletonBlock className="w-10 sm:w-12 h-3 bg-white/30" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wallet Cards Skeleton */}
        <section className="w-full max-w-[95%] sm:max-w-[90%] mx-auto bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="px-5 pt-5 pb-3 sm:px-8 sm:pt-8 sm:pb-4">
            <SkeletonBlock className="w-28 sm:w-32 h-6 sm:h-7" />
          </div>
          <div className="flex flex-col gap-2 sm:gap-3 px-3 pb-5 sm:px-6 sm:pb-8">
            {items.map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 sm:p-5 bg-background rounded-3xl border border-slate-100"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <SkeletonBlock className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full" />
                  <div className="flex flex-col gap-1.5">
                    <SkeletonBlock className="w-16 sm:w-20 h-3 sm:h-4" />
                    <SkeletonBlock className="w-20 sm:w-24 h-2 sm:h-3" />
                  </div>
                </div>
                <SkeletonBlock className="w-16 sm:w-20 h-4 sm:h-5" />
              </div>
            ))}
          </div>
        </section>

        {/* Recent Transactions Skeleton */}
        <section className="w-full max-w-[95%] sm:max-w-[90%] mx-auto bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-4 sm:p-6 mb-8 sm:mb-12">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <SkeletonBlock className="w-36 sm:w-48 h-6 sm:h-7" />
            <SkeletonBlock className="w-12 sm:w-16 h-4 sm:h-5" />
          </div>
          <div className="flex flex-col">
            {items.map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 sm:py-4 border-b border-slate-50 last:border-0"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <SkeletonBlock className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl" />
                  <div className="flex flex-col gap-1.5">
                    <SkeletonBlock className="w-24 sm:w-28 h-3 sm:h-4" />
                    <SkeletonBlock className="w-16 sm:w-20 h-2 sm:h-3" />
                  </div>
                </div>
                <SkeletonBlock className="w-16 sm:w-20 h-4 sm:h-5" />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default WalletSkeleton;

import type { ReactNode } from "react";
import Link from "next/link";

const LegalDocument = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#4f46e5] hover:text-[#4338ca] transition-colors cursor-pointer"
        >
          <span aria-hidden="true">←</span>
          Back to home
        </Link>
        <div className="mt-12">{children}</div>
      </div>
    </div>
  );
};

export default LegalDocument;
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wallet,
  Menu,
  X,
  // ChevronDown,
  Shield,
  // CreditCard,
  Sparkles,
} from "lucide-react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, [menuOpen]);

  const navLinks = [
    { label: "How it Works", href: "#how-it-works" },
    { label: "Features", href: "#features" },
    { label: "Security", href: "#security" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "nav-scrolled bg-white/80 backdrop-blur-md border-b border-gray-200/50"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-linear-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/25">
                <Wallet className="w-4 h-4" />
              </span>
              <span className="font-jakarta font-bold text-lg text-gray-900 tracking-tight">
                PocketWise
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks?.map((l) => (
                <a
                  key={l?.href}
                  href={l?.href}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  {l?.label}
                </a>
              ))}
              <a
                href="#waitlist"
                className="btn-primary flex items-center gap-2 text-sm font-semibold font-jakarta px-5 py-2.5 rounded-full shadow-lg shadow-violet-600/25 hover:shadow-violet-600/40"
              >
                <Sparkles className="w-4 h-4" />
                Join Waitlist
              </a>
            </nav>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100 transition-colors"
            >
              {menuOpen ? (
                <X className="w-5 h-5 text-gray-700" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        className={`mobile-menu-overlay fixed inset-0 z-40 bg-white/98 backdrop-blur-xl flex flex-col pt-20 px-6 pb-8 md:hidden ${
          menuOpen ? "open" : "opacity-0 invisible"
        }`}
      >
        <nav className="flex flex-col gap-1">
          {navLinks?.map((l) => (
            <a
              key={l?.href}
              href={l?.href}
              onClick={() => setMenuOpen(false)}
              className="text-2xl font-jakarta font-semibold text-gray-900 py-4 border-b border-gray-100 hover:text-violet-600 transition-colors"
            >
              {l?.label}
            </a>
          ))}
        </nav>
        <div className="mt-8">
          <a
            href="#waitlist"
            onClick={() => setMenuOpen(false)}
            className="btn-primary flex items-center justify-center gap-2 text-center text-base font-semibold font-jakarta px-6 py-4 rounded-2xl shadow-lg shadow-violet-600/25"
          >
            <Sparkles className="w-4 h-4" />
            Join Waitlist →
          </a>
        </div>
        <div className="mt-auto pt-6 flex items-center justify-center gap-4 text-sm text-gray-500">
          <Shield className="w-4 h-4" />
          <span className="flex items-center gap-1">
            CBN Licensed • NDIC Insured
          </span>
        </div>
      </div>
    </>
  );
}

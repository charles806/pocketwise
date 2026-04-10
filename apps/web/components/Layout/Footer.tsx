"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

const footerLinks: Record<string, { title: string; href: string }[]> = {
  Product: [
    { title: "How it Works", href: "/#how-it-works" },
    { title: "Features", href: "/#features" },
    { title: "Why PocketWise", href: "/#why" },
    { title: "Waitlist", href: "/waitlist" },
  ],
  Company: [
    { title: "About Us", href: "/about" },
    { title: "Contact", href: "mailto:hello@getpocketwise.app" },
  ],
  Legal: [
    { title: "Privacy Policy", href: "/privacy" },
    { title: "Terms of Service", href: "/terms" },
    { title: "Cookie Policy", href: "/cookies" },
  ],
};

const socialLinks: { label: string; href: string; icon: ReactNode }[] = [
  {
    label: "X (Twitter)",
    href: "https://twitter.com/pocketwise",
    icon: (
      <svg className="size-[18px]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com/pocketwise",
    icon: (
      <svg className="size-[18px]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://tiktok.com/@pocketwise",
    icon: (
      <svg className="size-[18px]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#0f0f1a] to-black relative overflow-hidden">
      {/* Decorative elements */}
      <div
        className="absolute top-0 left-1/4 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(91,79,207,0.08) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)",
          filter: "blur(30px)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16 flex flex-col gap-12 relative z-10">
        {/* Top Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="flex flex-col lg:flex-row justify-between gap-12"
        >
          {/* Brand Block */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col gap-5 max-w-xs shrink-0"
          >
            <Link
              href="/"
              className="flex items-center gap-2.5 w-fit group cursor-pointer"
            >
              <Image
                src="/logo.png"
                alt="PocketWise Logo"
                width={40}
                height={40}
                className="rounded-xl group-hover:scale-105 transition-transform"
              />
              <span className="text-white font-bold text-xl tracking-tight">
                PocketWise
              </span>
            </Link>
            <p className="text-[#9ca3af] text-sm leading-relaxed">
              Smart money management for the next generation. Automatically sort
              every naira so you can focus on what matters.
            </p>
            <a
              href="mailto:hello@getpocketwise.app"
              className="text-[#9ca3af] text-sm hover:text-white transition-colors duration-200 flex items-center gap-2 w-fit cursor-pointer"
            >
              <Mail size={16} />
              hello@getpocketwise.app
            </a>
          </motion.div>

          {/* Link Columns */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-16"
          >
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className="flex flex-col gap-4">
                <span className="text-white text-sm font-semibold flex items-center gap-2">
                  {category === "Product" && (
                    <Sparkles size={14} className="text-[#5B4FCF]" />
                  )}
                  {category}
                </span>
                {links.map((link) => (
                  <Link
                    key={link.title}
                    href={link.href}
                    className="text-[#9ca3af] text-sm hover:text-white hover:translate-x-1 transition-all duration-200 w-fit cursor-pointer"
                  >
                    {link.title}
                  </Link>
                ))}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative rounded-2xl p-1"
          style={{
            background:
              "linear-gradient(135deg, rgba(91,79,207,0.3) 0%, rgba(139,92,246,0.3) 100%)",
          }}
        >
          <div
            className="rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6"
            style={{ background: "rgba(15,15,26,0.8)" }}
          >
            <div>
              <h3 className="text-white font-jakarta font-bold text-lg mb-2">
                Ready to build better money habits?
              </h3>
              <p className="text-[#9ca3af] text-sm">
                Join the waitlist and get ₦100 credit on launch day.
              </p>
            </div>
            <Link
              href="/waitlist"
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-jakarta font-semibold text-sm text-white whitespace-nowrap hover:scale-105 transition-transform cursor-pointer"
              style={{ background: "#5B4FCF" }}
            >
              Join Waitlist
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>

        {/* Divider */}
        <div
          className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
          aria-hidden="true"
        />

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <span className="text-[#6b7280] text-sm">
            © 2026 PocketWise. All rights reserved.
          </span>

          {/* Social Icons */}
          <div className="flex items-center gap-2">
            {socialLinks.map(({ label, href, icon }) => (
              <Link
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="size-9 flex justify-center items-center
                  bg-white/5 text-[#9ca3af] rounded-lg
                  hover:bg-[#5B4FCF]/20 hover:text-[#5B4FCF] hover:scale-110
                  transition-all duration-200 cursor-pointer"
              >
                {icon}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

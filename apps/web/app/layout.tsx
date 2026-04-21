import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import localFont from "next/font/local";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";
import { Toaster } from "../components/UI/Toaster";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title:
    "Pocketwise — Smart Wallet for Nigerian Youth | Auto-Split Money, Save & Spend Wisely",
  icons: {
    icon: [{ url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" }],
    shortcut: ["/favicon-32x32.png"],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  description:
    "Automatically split every deposit into Spend, Savings, Emergency, and Flex wallets using the Warren Buffett principle. Build financial discipline without willpower — designed for Nigerian students and young earners.",
  keywords:
    "smart wallet, Nigerian youth finance, auto-save, Warren Buffett split, money management app, PiggyVest alternative, Cowrywise alternative, save money Nigeria, student finance, emergency fund, AI money coach",
  openGraph: {
    title: "Pocketwise: Your money, automatically sorted.",
    description:
      "Stop struggling to save. Pocketwise automatically allocates your money into four purpose-driven wallets the moment it arrives. Built for Nigerian youth.",
    url: "https://getpocketwise.app",
    siteName: "Pocketwise",
    locale: "en_NG",
    type: "website",
  },
  alternates: {
    canonical: "https://getpocketwise.app",
  },
  manifest: "/manifest.json",
  authors: [{ name: "Pocketwise Team" }],
  category: "finance",
  applicationName: "Pocketwise",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  appleWebApp: {
    title: "Pocketwise",
    statusBarStyle: "default",
    capable: true,
  },
  formatDetection: {
    telephone: true,
    date: true,
    address: true,
    email: true,
    url: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        suppressHydrationWarning
      >
        <Analytics />
        {/* Skip to content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold focus:outline-none focus:ring-2 focus:ring-white"
        >
          Skip to content
        </a>

        <ToastProvider>
          <AuthProvider>
            <Toaster />
            <main id="main-content" className="">
              {children}
            </main>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

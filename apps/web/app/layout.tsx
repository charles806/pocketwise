import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import localFont from "next/font/local";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";
import { Toaster } from "../components/UI/Toaster";
import "./globals.css";
import Providers from "./providers";

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
  title: "Pocketwise: Smart Wallet & Money Manager",
  icons: {
    icon: [{ url: "/logo.png", type: "image/png", sizes: "32x32" }],
    shortcut: ["/logo.png"],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  description:
    "Automatically split deposits into Spend, Savings, and Flex wallets. Build financial discipline without willpower—designed for Nigerian youth and students.",
  keywords:
    "smart wallet, Nigerian youth finance, auto-save, Warren Buffett split, money management app, PiggyVest alternative, Cowrywise alternative, save money Nigeria, student finance, emergency fund, AI money coach",
  openGraph: {
    title: "Pocketwise: Smart Wallet & Money Manager",
    description:
      "Automatically split deposits into Spend, Savings, and Flex wallets. Build financial discipline without willpower—designed for Nigerian youth and students.",
    url: "https://pocketwise.xyz",
    siteName: "Pocketwise",
    locale: "en_NG",
    type: "website",
  },
  alternates: {
    canonical: "https://pocketwise.xyz",
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
        <Providers>
          <ToastProvider>
            <Toaster />
            <AuthProvider>
              <main id="main-content" className="">
                {children}
              </main>
            </AuthProvider>
          </ToastProvider>
        </Providers>
        <Script
          id="structured-data"
          type="application/ld+json"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Pocketwise",
              url: "https://pocketwise.xyz",
              description:
                "Automatically split deposits into Spend, Savings, and Flex wallets. Build financial discipline without willpower—designed for Nigerian youth and students.",
              applicationCategory: "FinanceApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "NGN",
              },
            }),
          }}
        />
      </body>
    </html>
  );
}

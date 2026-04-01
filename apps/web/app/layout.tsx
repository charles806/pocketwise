import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Pocketwise — Smart Wallet for Nigerian Youth | Auto-Split Money, Save & Spend Wisely",
  description: "Automatically split every deposit into Spend, Savings, Emergency, and Flex wallets using the Warren Buffett principle. Build financial discipline without willpower — designed for Nigerian students and young earners.",
  keywords: "smart wallet, Nigerian youth finance, auto-save, Warren Buffett split, money management app, PiggyVest alternative, Cowrywise alternative, save money Nigeria, student finance, emergency fund, AI money coach",
  openGraph: {
    title: "Pocketwise: Your money, automatically sorted.",
    description: "Stop struggling to save. Pocketwise automatically allocates your money into four purpose-driven wallets the moment it arrives. Built for Nigerian youth.",
    url: "https://getpocketwise.app",
    siteName: "Pocketwise",
    locale: "en_NG",
    type: "website",
  },
  alternates: {
    canonical: "https://pocketwise.app",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  manifest: "https://pocketwise.app/manifest.json", // Optional: if you have a PWA manifest
  authors: [{ name: "Pocketwise Team" }],
  category: "finance",
  applicationName: "Pocketwise",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  colorScheme: "light", // or "dark" if you support both
  themeColor: "#5B4FCF", // Primary brand color
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
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}

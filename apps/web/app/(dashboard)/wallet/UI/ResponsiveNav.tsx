"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  ChartPie,
  History,
  Goal,
  CreditCard,
} from "lucide-react";

type NavItemType = {
  icon: any;
  label: string;
  path: string;
};

const navItems: NavItemType[] = [
  { icon: Home, label: "Home", path: "/wallet" },
  { icon: ChartPie, label: "Analytics", path: "/analytics" },
  { icon: History, label: "History", path: "/history" },
  { icon: Goal, label: "Goals", path: "/goals" },
  { icon: CreditCard, label: "Card", path: "/card" },
];

export const ResponsiveNav = () => {
  const router = useRouter();
  const pathname = usePathname();

  const go = (path: string) => router.push(path);

  return (
    <>
      {/* ================= DESKTOP + TABLET ================= */}
      <div className="hidden md:flex items-center gap-4">

        {/* TABLET (icons only) */}
        <div className="lg:hidden flex items-center gap-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => go(item.path)}
                className="
                  flex items-center justify-center
                  p-2 rounded-xl
                  hover:bg-gray-100 active:scale-95
                  transition-all duration-200
                "
              >
                <Icon
                  className={`w-5 h-5 ${
                    active ? "text-[#4f46e5]" : "text-gray-600"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* DESKTOP (icon + label) */}
        <div className="hidden lg:flex items-center gap-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => go(item.path)}
                className="
                  flex items-center gap-2 px-3 py-2 rounded-xl
                  hover:bg-gray-100 active:scale-95
                  transition-all duration-200
                "
              >
                <Icon
                  className={`w-5 h-5 ${
                    active ? "text-[#4f46e5]" : "text-gray-600"
                  }`}
                />

                <span
                  className={`
                    text-sm font-medium
                    ${active ? "text-[#4f46e5]" : "text-gray-700"}
                  `}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= MOBILE ================= */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 md:hidden z-50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => go(item.path)}
              className="flex flex-col items-center gap-1"
            >
              <Icon
                className={`w-5 h-5 ${
                  active ? "text-[#4f46e5]" : "text-gray-500"
                }`}
              />
              <span
                className={`text-[10px] ${
                  active ? "text-[#4f46e5]" : "text-gray-500"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
};
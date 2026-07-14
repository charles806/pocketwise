"use client";
import { useRouter } from "next/navigation";
import { Button } from "@mui/material";
import { ResponsiveNav } from "./ResponsiveNav";
import { Bell, Settings } from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import { Greeting } from "../../../../libs/utils";
import { useFcmToken } from "../../../../hooks/useFcmToken";
import { useState, useEffect } from "react";
import Image from "next/image";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

export const WalletHeader = () => {
  const router = useRouter();
  const { user, accessToken } = useAuth();
  useFcmToken();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!accessToken) return;
    const controller = new AbortController();
    fetch(`${API_BASE}/api/v1/notifications`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: "include",
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        if (body?.data) {
          setUnreadCount(
            body.data.filter((n: { isRead: boolean }) => !n.isRead).length,
          );
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, [accessToken]);

  const greeting = Greeting();

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 h-16 sm:h-20 border-b border-gray-200 bg-white sticky top-0 z-10">
      {/* Left */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="partOne relative w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-gray-100 cursor-pointer shrink-0">
          {(user as any)?.profilePicture ? (
            <img
              src={(user as any).profilePicture}
              alt="User profile picture"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#4f46e5] flex items-center justify-center text-white text-sm font-semibold">
              {user?.firstName?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}
        </div>

        <div className="flex flex-col leading-tight">
          <p className="text-sm text-gray-500">{greeting}</p>
          <h5 className="text-base font-semibold text-gray-900">
            {user?.firstName} <span className="inline-block">👋</span>
          </h5>
        </div>
      </div>

      <div className="partTwo">
        <ResponsiveNav />
      </div>

      <div className="partThree flex items-center gap-2">
        <div className="relative">
          <Button
            className="bg-white hover:bg-gray-100  active:scale-95 transition-all duration-200 shadow-sm border border-gray-200"
            onClick={() => router.push("/notifications")}
            style={{
              height: "40px",
              minWidth: "40px",
              borderRadius: "9999px",
            }}
          >
            <Bell className="w-5 h-5 text-gray-600" />
          </Button>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
        {/* Avatar */}
        <Button
            className="bg-white hover:bg-gray-100  active:scale-95 transition-all duration-200 shadow-sm border border-gray-200"
            onClick={() => router.push("/profile")}
            style={{
              height: "40px",
              minWidth: "40px",
              borderRadius: "9999px",
            }}
          >
          <Settings className="w-5 h-5 text-gray-600" />
        </Button>
      </div>
    </header>
  );
};

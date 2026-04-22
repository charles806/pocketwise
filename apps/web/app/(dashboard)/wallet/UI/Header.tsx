"use client";
import Image from "next/image";
import user from "../../../../public/user.png";
import { useRouter } from "next/navigation";
import { Button } from "@mui/material";
import { ResponsiveNav } from "./ResponsiveNav";
import { Bell } from "lucide-react";

export const WalletHeader = () => {
  const router = useRouter();

  const greetings = ["Good Morning", "Good Afternoon", "Good Evening"];
  const currentHour = new Date().getHours();

  let greeting = greetings[0];
  if (currentHour >= 12 && currentHour < 18) {
    greeting = greetings[1];
  } else if (currentHour >= 18 || currentHour < 6) {
    greeting = greetings[2];
  }

  return (
    <header className="flex items-center justify-between px-6 h-20 border-b border-gray-200 bg-white sticky top-0 z-10">
      {/* Left */}
      <div className="flex items-center gap-3">
        <div className="partOne relative w-11 h-11 rounded-full overflow-hidden bg-gray-100 cursor-pointer shrink-0">
          <Image
            src={user}
            alt="User profile picture"
            fill
            className="object-cover"
            sizes="44px"
            priority
          />
        </div>

        <div className="flex flex-col leading-tight">
          <p className="text-sm text-gray-500">{greeting}</p>
          <h5 className="text-base font-semibold text-gray-900">
            Charles <span className="inline-block">👋</span>
          </h5>
        </div>
      </div>

      <div className="partTwo">
        <ResponsiveNav />
      </div>

      <div className="partThree flex items-center gap-2">
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
        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full bg-[#4f46e5] text-white flex items-center justify-center text-sm font-semibold cursor-pointer"
          onClick={() => router.push("/profile")}
        >
          C
        </div>
      </div>
    </header>
  );
};

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WalletHeader } from "../wallet/UI/Header";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import {
  Camera,
  Copy,
  Check,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

const WALLET_COLORS: Record<string, string> = {
  spend: "#4f46e5",
  savings: "#10b981",
  emergency: "#f43f5e",
  flex: "#f59e0b",
};

const WALLET_LABELS: Record<string, string> = {
  spend: "Spend",
  savings: "Savings",
  emergency: "Emergency",
  flex: "Flex",
};

const DEFAULT_SPLIT = {
  spendPercent: 50,
  savingsPercent: 30,
  emergencyPercent: 10,
  flexPercent: 10,
};

function Page() {
  const router = useRouter();
  const { user, accessToken, refreshUser } = useAuth();
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [initialProfile, setInitialProfile] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    userName: "",
  });
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    userName: "",
  });

  const [pw, setPw] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [showPw, setShowPw] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [split, setSplit] = useState({
    spendPercent: 50,
    savingsPercent: 30,
    emergencyPercent: 10,
    flexPercent: 10,
  });
  const [initialSplit, setInitialSplit] = useState({
    spendPercent: 50,
    savingsPercent: 30,
    emergencyPercent: 10,
    flexPercent: 10,
  });
  const [splitLoading, setSplitLoading] = useState(true);
  const [hasExistingSplit, setHasExistingSplit] = useState(false);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      const p = {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: (user as any).phone || "",
        userName: user.userName || "",
      };
      setProfile(p);
      setInitialProfile(p);
    }
  }, [user]);

  useEffect(() => {
    if (!accessToken) return;
    setSplitLoading(true);
    fetch(`${API_BASE}/api/v1/wallet-split`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: "include",
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => {
        if (body?.data) {
          const s = {
            spendPercent: Number(body.data.spendPercent),
            savingsPercent: Number(body.data.savingsPercent),
            emergencyPercent: Number(body.data.emergencyPercent),
            flexPercent: Number(body.data.flexPercent),
          };
          setSplit(s);
          setInitialSplit(s);
          setHasExistingSplit(true);
        } else {
          setSplit(DEFAULT_SPLIT);
          setInitialSplit(DEFAULT_SPLIT);
          setHasExistingSplit(false);
        }
      })
      .catch(() => {
        setSplit(DEFAULT_SPLIT);
        setInitialSplit(DEFAULT_SPLIT);
      })
      .finally(() => setSplitLoading(false));
  }, [accessToken]);

  const isProfileDirty =
    profile.firstName !== initialProfile.firstName ||
    profile.lastName !== initialProfile.lastName ||
    profile.phone !== initialProfile.phone ||
    profile.userName !== initialProfile.userName;

  const profileInitials =
    (
      (user?.firstName?.[0] || "") + (user?.lastName?.[0] || "")
    ).toUpperCase() || "?";

  const handleAvatarUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        setUploading(true);
        try {
          const res = await fetch(`${API_BASE}/api/v1/auth/upload-avatar`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include",
            body: JSON.stringify({ image: base64 }),
          });
          const body = await res.json();
          if (res.ok && body.success) {
            toast("Profile picture updated", { type: "success" });
            await refreshUser();
          } else {
            toast(body.message || "Failed to upload avatar", { type: "error" });
          }
        } catch {
          toast("Failed to upload avatar", { type: "error" });
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    },
    [accessToken, toast, refreshUser],
  );

  const handleProfileSubmit = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify(profile),
      });
      const body = await res.json();
      if (res.ok && body.success) {
        toast("Profile updated successfully", { type: "success" });
        await refreshUser();
        setInitialProfile(profile);
      } else {
        toast(body.message || "Failed to update profile", { type: "error" });
      }
    } catch {
      toast("Failed to update profile", { type: "error" });
    }
  };

  const handlePasswordSubmit = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify(pw),
      });
      const body = await res.json();
      if (res.ok && body.success) {
        toast("Password updated successfully", { type: "success" });
        setPw({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
      } else {
        toast(body.message || "Failed to change password", { type: "error" });
      }
    } catch {
      toast("Failed to change password", { type: "error" });
    }
  };

  const handleSplitSubmit = async () => {
    try {
      const method = hasExistingSplit ? "PATCH" : "POST";
      const res = await fetch(`${API_BASE}/api/v1/wallet-split`, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify(split),
      });
      const body = await res.json();
      if (res.ok && body.success) {
        toast("Split configuration saved", { type: "success" });
        setInitialSplit(split);
      } else {
        toast(body.message || "Failed to save split config", { type: "error" });
      }
    } catch {
      toast("Failed to save split config", { type: "error" });
    }
  };

  const splitTotal =
    split.spendPercent +
    split.savingsPercent +
    split.emergencyPercent +
    split.flexPercent;
  const splitDirty =
    split.spendPercent !== initialSplit.spendPercent ||
    split.savingsPercent !== initialSplit.savingsPercent ||
    split.emergencyPercent !== initialSplit.emergencyPercent ||
    split.flexPercent !== initialSplit.flexPercent;

  const SPLIT_RANGES: Record<string, { min: number; max: number }> = {
    spendPercent: { min: 50, max: 75 },
    savingsPercent: { min: 10, max: 30 },
    emergencyPercent: { min: 0, max: 10 },
    flexPercent: { min: 0, max: 10 },
  };

  const updateSplit = (key: string, val: number) => {
    const range = SPLIT_RANGES[key];
    if (!range) return;
    setSplit((prev) => ({
      ...prev,
      [key]: Math.min(range.max, Math.max(range.min, val)),
    }));
  };

  const copyAccountNumber = () => {
    if ((user as any)?.accountNumber) {
      navigator.clipboard.writeText((user as any).accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const pwAllFilled =
    pw.currentPassword && pw.newPassword && pw.confirmNewPassword;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <WalletHeader />
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>

        {/* ─── Section 1: Avatar + Basic Info ─── */}
        <section className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_4px_24px_rgba(15,23,42,0.06)] p-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-[#4f46e5] flex items-center justify-center">
                {(user as any)?.profilePicture ? (
                  <img
                    src={(user as any).profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-2xl font-bold">
                    {profileInitials}
                  </span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 text-[#4f46e5] animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 text-slate-500" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-sm text-slate-500">@{user?.userName}</p>
            {(user as any)?.accountNumber && (
              <button
                onClick={copyAccountNumber}
                className="mt-1 inline-flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-slate-600 transition-colors"
              >
                {(user as any).accountNumber}
                {copied ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            )}
            <div className="mt-3">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  ((user as any)?.kycTier ?? 1) >= 1
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                Tier {(user as any)?.kycTier ?? 1}
              </span>
              <p className="text-xs text-slate-400 mt-1">
                Tier {(user as any)?.kycTier ?? 1} &mdash; Basic access
              </p>
            </div>
          </div>
        </section>

        {/* ─── Section 2: Edit Profile ─── */}
        <section className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_4px_24px_rgba(15,23,42,0.06)] p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Edit Profile
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  First Name
                </label>
                <input
                  value={profile.firstName}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, firstName: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Last Name
                </label>
                <input
                  value={profile.lastName}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, lastName: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10 outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Phone
              </label>
              <input
                value={profile.phone}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, phone: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Username
              </label>
              <input
                value={profile.userName}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, userName: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10 outline-none transition-all"
              />
            </div>
            <button
              onClick={handleProfileSubmit}
              disabled={!isProfileDirty}
              className="rounded-xl bg-[#4f46e5] text-white font-semibold px-6 py-2.5 text-sm hover:bg-[#4338ca] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Changes
            </button>
          </div>
        </section>

        {/* ─── Section 3: Change Password ─── */}
        <section className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_4px_24px_rgba(15,23,42,0.06)] p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Change Password
          </h3>
          <div className="space-y-4">
            {(["current", "new", "confirm"] as const).map((field) => {
              const label =
                field === "current"
                  ? "Current Password"
                  : field === "new"
                    ? "New Password"
                    : "Confirm New Password";
              const key =
                field === "confirm"
                  ? "confirmNewPassword"
                  : field === "current"
                    ? "currentPassword"
                    : "newPassword";
              const showKey =
                field === "current"
                  ? "current"
                  : field === "new"
                    ? "new"
                    : "confirm";
              return (
                <div key={field} className="relative">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {label}
                  </label>
                  <input
                    type={showPw[showKey] ? "text" : "password"}
                    value={pw[key]}
                    onChange={(e) =>
                      setPw((p) => ({ ...p, [key]: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-sm focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPw((p) => ({ ...p, [showKey]: !p[showKey] }))
                    }
                    className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600"
                  >
                    {showPw[showKey] ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              );
            })}
            <button
              onClick={handlePasswordSubmit}
              disabled={!pwAllFilled}
              className="rounded-xl bg-[#4f46e5] text-white font-semibold px-6 py-2.5 text-sm hover:bg-[#4338ca] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Update Password
            </button>
          </div>
        </section>

        {/* ─── Section 4: Change Transfer PIN ─── */}
        <section className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_4px_24px_rgba(15,23,42,0.06)] p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Transfer PIN
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Change your transfer PIN or reset it if you&apos;ve forgotten it.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/profile/change-pin")}
              className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm hover:border-[#4f46e5] hover:bg-[#eef2ff] transition-all group"
            >
              <span className="font-medium text-slate-700 group-hover:text-[#4f46e5]">
                Change PIN
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#4f46e5] transition-colors" />
            </button>
            <button
              onClick={() => router.push("/profile/forgot-pin")}
              className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm hover:border-[#4f46e5] hover:bg-[#eef2ff] transition-all group"
            >
              <span className="font-medium text-slate-700 group-hover:text-[#4f46e5]">
                Forgot PIN?
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#4f46e5] transition-colors" />
            </button>
          </div>
        </section>

        {/* ─── Section 5: Wallet Split ─── */}
        <section className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_4px_24px_rgba(15,23,42,0.06)] p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Wallet Split Configuration
          </h3>

          {splitLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-[#4f46e5] animate-spin" />
            </div>
          ) : (
            <div className="space-y-5">
              {(
                [
                  "spendPercent",
                  "savingsPercent",
                  "emergencyPercent",
                  "flexPercent",
                ] as const
              ).map((key) => {
                const label = WALLET_LABELS[key.replace("Percent", "")];
                const color = WALLET_COLORS[key.replace("Percent", "")];
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm font-medium text-slate-700">
                          {label}
                        </span>
                      </div>
                      <span className="text-sm font-semibold" style={{ color }}>
                        {split[key]}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={SPLIT_RANGES[key]!.min}
                      max={SPLIT_RANGES[key]!.max}
                      value={split[key]}
                      onChange={(e) => updateSplit(key, Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#4f46e5]"
                      style={{
                        accentColor: color,
                      }}
                    />
                  </div>
                );
              })}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-sm font-medium text-slate-700">
                  Total
                </span>
                <span
                  className={`text-sm font-bold ${
                    splitTotal === 100 ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {splitTotal}%
                </span>
              </div>

              {splitTotal !== 100 && (
                <p className="text-xs text-red-500">
                  Percentages must add up to 100%
                </p>
              )}

              <button
                onClick={handleSplitSubmit}
                disabled={splitTotal !== 100 || !splitDirty}
                className="rounded-xl bg-[#4f46e5] text-white font-semibold px-6 py-2.5 text-sm hover:bg-[#4338ca] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Split
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Page;

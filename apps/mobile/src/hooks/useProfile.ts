import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

interface SplitConfig {
  spendPercent: number;
  savingsPercent: number;
  emergencyPercent: number;
  flexPercent: number;
}

const DEFAULT_SPLIT: SplitConfig = {
  spendPercent: 50,
  savingsPercent: 30,
  emergencyPercent: 10,
  flexPercent: 10,
};

export const useProfile = () => {
  const { user, accessToken, refreshSession } = useAuth();
  const { toast } = useToast();

  const [split, setSplit] = useState<SplitConfig>(DEFAULT_SPLIT);
  const [initialSplit, setInitialSplit] = useState<SplitConfig>(DEFAULT_SPLIT);
  const [splitLoading, setSplitLoading] = useState(true);
  const [hasExistingSplit, setHasExistingSplit] = useState(false);

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    setSplitLoading(true);
    fetch(`${API_BASE}/api/v1/wallet-split`, {
      headers: { Authorization: `Bearer ${accessToken}` },
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

  const splitDirty =
    split.spendPercent !== initialSplit.spendPercent ||
    split.savingsPercent !== initialSplit.savingsPercent ||
    split.emergencyPercent !== initialSplit.emergencyPercent ||
    split.flexPercent !== initialSplit.flexPercent;

  const splitTotal =
    split.spendPercent +
    split.savingsPercent +
    split.emergencyPercent +
    split.flexPercent;

  const saveSplit = useCallback(async () => {
    if (!accessToken) return;
    try {
      const method = hasExistingSplit ? "PATCH" : "POST";
      const res = await fetch(`${API_BASE}/api/v1/wallet-split`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(split),
      });
      const body = await res.json();
      if (res.ok && body.success) {
        setInitialSplit(split);
        toast("Split configuration saved", { type: "info", title: "Success" });
      } else {
        toast(body.message || "Failed to save split", { type: "error" });
      }
    } catch {
      toast("Network error", { type: "error" });
    }
  }, [accessToken, split, hasExistingSplit, toast]);

  const uploadAvatar = useCallback(
    async (base64: string) => {
      if (!accessToken) return;
      setUploading(true);
      try {
        const res = await fetch(`${API_BASE}/api/v1/auth/upload-avatar`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ image: base64 }),
        });
        const body = await res.json();
        if (res.ok && body.success) {
          toast("Profile picture updated", { type: "info", title: "Success" });
          await refreshSession();
        } else {
          toast(body.message || "Failed to upload avatar", { type: "error" });
        }
      } catch {
        toast("Failed to upload avatar", { type: "error" });
      } finally {
        setUploading(false);
      }
    },
    [accessToken, toast, refreshSession],
  );

  const updateProfile = useCallback(
    async (profile: {
      firstName: string;
      lastName: string;
      phone: string;
      userName: string;
    }) => {
      if (!accessToken) return;
      try {
        const res = await fetch(`${API_BASE}/api/v1/auth/profile`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(profile),
        });
        const body = await res.json();
        if (res.ok && body.success) {
          toast("Profile updated", { type: "info", title: "Success" });
          await refreshSession();
          return true;
        } else {
          toast(body.message || "Failed to update profile", { type: "error" });
          return false;
        }
      } catch {
        toast("Network error", { type: "error" });
        return false;
      }
    },
    [accessToken, toast, refreshSession],
  );

  const changePassword = useCallback(
    async (pw: {
      currentPassword: string;
      newPassword: string;
      confirmNewPassword: string;
    }) => {
      if (!accessToken) return false;
      try {
        const res = await fetch(`${API_BASE}/api/v1/auth/change-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(pw),
        });
        const body = await res.json();
        if (res.ok && body.success) {
          toast("Password updated", { type: "info", title: "Success" });
          return true;
        } else {
          toast(body.message || "Failed to change password", { type: "error" });
          return false;
        }
      } catch {
        toast("Network error", { type: "error" });
        return false;
      }
    },
    [accessToken, toast],
  );

  return {
    user,
    split,
    setSplit,
    splitLoading,
    splitDirty,
    splitTotal,
    saveSplit,
    uploadAvatar,
    uploading,
    updateProfile,
    changePassword,
    SPLIT_RANGES: {
      spendPercent: { min: 50, max: 75 },
      savingsPercent: { min: 10, max: 30 },
      emergencyPercent: { min: 0, max: 10 },
      flexPercent: { min: 0, max: 10 },
    } as Record<string, { min: number; max: number }>,
  };
};

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Camera,
  Copy,
  Check,
  Eye,
  EyeOff,
  Loader,
  ArrowRight,
} from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";

function formatNaira(amount: number) {
  return `₦${(amount ?? 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

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

const Page = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const {
    split,
    setSplit,
    splitLoading,
    splitDirty,
    splitTotal,
    saveSplit,
    uploading,
    updateProfile,
    changePassword,
    SPLIT_RANGES,
  } = useProfile();

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    userName: "",
  });
  const [initialProfile, setInitialProfile] = useState({
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
  const [copied, setCopied] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

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

  const isProfileDirty =
    profile.firstName !== initialProfile.firstName ||
    profile.lastName !== initialProfile.lastName ||
    profile.phone !== initialProfile.phone ||
    profile.userName !== initialProfile.userName;

  const profileInitials =
    (
      (user?.firstName?.[0] || "") + (user?.lastName?.[0] || "")
    ).toUpperCase() || "?";

  const handleProfileSubmit = async () => {
    setSavingProfile(true);
    const ok = await updateProfile(profile);
    if (ok) setInitialProfile(profile);
    setSavingProfile(false);
  };

  const handlePasswordSubmit = async () => {
    setSavingPw(true);
    await changePassword(pw);
    setSavingPw(false);
    setPw({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
  };

  const updateSplit = (key: string, val: number) => {
    const range = SPLIT_RANGES[key];
    if (!range) return;
    setSplit((prev: any) => ({
      ...prev,
      [key]: Math.min(range.max, Math.max(range.min, val)),
    }));
  };

  const copyAccountNumber = () => {
    if ((user as any)?.accountNumber) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const pwAllFilled =
    pw.currentPassword && pw.newPassword && pw.confirmNewPassword;

  return (
    <View
      style={{ flex: 1, backgroundColor: "#f8fafc", paddingTop: insets.top }}
    >
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 20, paddingBottom: 100 }}
      >
        <Text style={{ fontSize: 22, fontWeight: "800", color: "#0f172a" }}>
          My Profile
        </Text>

        {/* Avatar Section */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#e2e8f0",
            padding: 24,
            alignItems: "center",
          }}
        >
          <View style={{ position: "relative", marginBottom: 16 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "#4f46e5",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 28, fontWeight: "700" }}>
                {profileInitials}
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#0f172a" }}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
            @{user?.userName}
          </Text>
          {(user as any)?.accountNumber && (
            <TouchableOpacity
              onPress={copyAccountNumber}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                marginTop: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
                  color: "#94a3b8",
                }}
              >
                {(user as any).accountNumber}
              </Text>
              {copied ? (
                <Check size={12} color="#059669" />
              ) : (
                <Copy size={12} color="#94a3b8" />
              )}
            </TouchableOpacity>
          )}
          <View style={{ marginTop: 12 }}>
            <View
              style={{
                backgroundColor: "#d1fae5",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
              }}
            >
              <Text
                style={{ fontSize: 11, fontWeight: "600", color: "#047857" }}
              >
                Tier {(user as any)?.kycTier ?? 1}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 11,
                color: "#94a3b8",
                textAlign: "center",
                marginTop: 4,
              }}
            >
              Tier {(user as any)?.kycTier ?? 1} — Basic access
            </Text>
          </View>
        </View>

        {/* Edit Profile */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#e2e8f0",
            padding: 20,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#0f172a",
              marginBottom: 16,
            }}
          >
            Edit Profile
          </Text>
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1, gap: 6 }}>
                <Text
                  style={{ fontSize: 12, fontWeight: "600", color: "#334155" }}
                >
                  First Name
                </Text>
                <TextInput
                  style={{
                    backgroundColor: "#f8fafc",
                    borderWidth: 1,
                    borderColor: "#e2e8f0",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    fontSize: 14,
                    color: "#0f172a",
                  }}
                  value={profile.firstName}
                  onChangeText={(t) =>
                    setProfile((p) => ({ ...p, firstName: t }))
                  }
                />
              </View>
              <View style={{ flex: 1, gap: 6 }}>
                <Text
                  style={{ fontSize: 12, fontWeight: "600", color: "#334155" }}
                >
                  Last Name
                </Text>
                <TextInput
                  style={{
                    backgroundColor: "#f8fafc",
                    borderWidth: 1,
                    borderColor: "#e2e8f0",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    fontSize: 14,
                    color: "#0f172a",
                  }}
                  value={profile.lastName}
                  onChangeText={(t) =>
                    setProfile((p) => ({ ...p, lastName: t }))
                  }
                />
              </View>
            </View>
            <View style={{ gap: 6 }}>
              <Text
                style={{ fontSize: 12, fontWeight: "600", color: "#334155" }}
              >
                Phone
              </Text>
              <TextInput
                style={{
                  backgroundColor: "#f8fafc",
                  borderWidth: 1,
                  borderColor: "#e2e8f0",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: "#0f172a",
                }}
                value={profile.phone}
                onChangeText={(t) => setProfile((p) => ({ ...p, phone: t }))}
              />
            </View>
            <View style={{ gap: 6 }}>
              <Text
                style={{ fontSize: 12, fontWeight: "600", color: "#334155" }}
              >
                Username
              </Text>
              <TextInput
                style={{
                  backgroundColor: "#f8fafc",
                  borderWidth: 1,
                  borderColor: "#e2e8f0",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: "#0f172a",
                }}
                value={profile.userName}
                onChangeText={(t) => setProfile((p) => ({ ...p, userName: t }))}
              />
            </View>
            <TouchableOpacity
              onPress={handleProfileSubmit}
              disabled={!isProfileDirty || savingProfile}
              style={{
                backgroundColor: isProfileDirty ? "#4f46e5" : "#94a3b8",
                borderRadius: 12,
                paddingVertical: 10,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 6,
              }}
            >
              {savingProfile && <ActivityIndicator color="#fff" size="small" />}
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>
                {savingProfile ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Change Password */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#e2e8f0",
            padding: 20,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#0f172a",
              marginBottom: 16,
            }}
          >
            Change Password
          </Text>
          <View style={{ gap: 12 }}>
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
                <View key={field} style={{ gap: 6 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: "#334155",
                    }}
                  >
                    {label}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#f8fafc",
                      borderWidth: 1,
                      borderColor: "#e2e8f0",
                      borderRadius: 12,
                      paddingHorizontal: 16,
                    }}
                  >
                    <TextInput
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        fontSize: 14,
                        color: "#0f172a",
                      }}
                      value={pw[key]}
                      onChangeText={(t) => setPw((p) => ({ ...p, [key]: t }))}
                      secureTextEntry={!showPw[showKey]}
                      placeholder="••••••••"
                      placeholderTextColor="#94a3b8"
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setShowPw((p) => ({ ...p, [showKey]: !p[showKey] }))
                      }
                      style={{ padding: 4 }}
                    >
                      {showPw[showKey] ? (
                        <EyeOff size={18} color="#94a3b8" />
                      ) : (
                        <Eye size={18} color="#94a3b8" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
            <TouchableOpacity
              onPress={handlePasswordSubmit}
              disabled={!pwAllFilled || savingPw}
              style={{
                backgroundColor: pwAllFilled ? "#4f46e5" : "#94a3b8",
                borderRadius: 12,
                paddingVertical: 10,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 6,
              }}
            >
              {savingPw && <ActivityIndicator color="#fff" size="small" />}
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>
                {savingPw ? "Updating..." : "Update Password"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transfer PIN */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#e2e8f0",
            padding: 20,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#0f172a",
              marginBottom: 8,
            }}
          >
            Transfer PIN
          </Text>
          <Text style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
            Change your transfer PIN or reset it if you've forgotten it.
          </Text>
          <View style={{ gap: 8 }}>
            <TouchableOpacity
              onPress={() => router.push("/profile/change-pin" as any)}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#f8fafc",
                borderWidth: 1,
                borderColor: "#e2e8f0",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <Text
                style={{ fontSize: 13, fontWeight: "500", color: "#334155" }}
              >
                Change PIN
              </Text>
              <ArrowRight size={16} color="#94a3b8" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/profile/forgot-pin" as any)}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#f8fafc",
                borderWidth: 1,
                borderColor: "#e2e8f0",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <Text
                style={{ fontSize: 13, fontWeight: "500", color: "#334155" }}
              >
                Forgot PIN?
              </Text>
              <ArrowRight size={16} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Wallet Split */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#e2e8f0",
            padding: 20,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#0f172a",
              marginBottom: 16,
            }}
          >
            Wallet Split Configuration
          </Text>
          {splitLoading ? (
            <View style={{ alignItems: "center", paddingVertical: 24 }}>
              <ActivityIndicator color="#4f46e5" />
            </View>
          ) : (
            <View style={{ gap: 20 }}>
              {(
                [
                  "spendPercent",
                  "savingsPercent",
                  "emergencyPercent",
                  "flexPercent",
                ] as const
              ).map((key) => {
                const labelKey = key.replace("Percent", "");
                const label = WALLET_LABELS[labelKey];
                const color = WALLET_COLORS[labelKey];
                return (
                  <View key={key}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <View
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: 6,
                            backgroundColor: color,
                          }}
                        />
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "500",
                            color: "#334155",
                          }}
                        >
                          {label}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 13, fontWeight: "700", color }}>
                        {split[key]}%
                      </Text>
                    </View>
                    <View
                      style={{
                        height: 8,
                        backgroundColor: "#f1f5f9",
                        borderRadius: 999,
                        overflow: "hidden",
                      }}
                    >
                      <View
                        style={{
                          height: "100%",
                          borderRadius: 999,
                          backgroundColor: color,
                          width: `${((split[key] - SPLIT_RANGES[key].min) / (SPLIT_RANGES[key].max - SPLIT_RANGES[key].min)) * 100}%`,
                        }}
                      />
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginTop: 4,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => updateSplit(key, split[key] - 5)}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: "#f1f5f9",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "700",
                            color: "#64748b",
                          }}
                        >
                          -
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => updateSplit(key, split[key] + 5)}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: "#f1f5f9",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "700",
                            color: "#64748b",
                          }}
                        >
                          +
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  borderTopWidth: 1,
                  borderTopColor: "#f1f5f9",
                  paddingTop: 16,
                }}
              >
                <Text
                  style={{ fontSize: 13, fontWeight: "500", color: "#334155" }}
                >
                  Total
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: splitTotal === 100 ? "#059669" : "#ef4444",
                  }}
                >
                  {splitTotal}%
                </Text>
              </View>

              {splitTotal !== 100 && (
                <Text style={{ fontSize: 11, color: "#ef4444" }}>
                  Percentages must add up to 100%
                </Text>
              )}

              <TouchableOpacity
                onPress={saveSplit}
                disabled={splitTotal !== 100 || !splitDirty}
                style={{
                  backgroundColor:
                    splitTotal === 100 && splitDirty ? "#4f46e5" : "#94a3b8",
                  borderRadius: 12,
                  paddingVertical: 10,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}
                >
                  Save Split
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default Page;

"use client";
import { useState, useEffect, useRef } from "react";
import { Lock, Eye, EyeOff, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

const WEAK_PINS = new Set([
  "0000",
  "1111",
  "2222",
  "3333",
  "4444",
  "5555",
  "6666",
  "7777",
  "8888",
  "9999",
  "1234",
  "2345",
  "3456",
  "4567",
  "5678",
  "6789",
  "4321",
  "5432",
  "6543",
  "7654",
  "8765",
  "9876",
]);

export const PinSetupModal = () => {
  const { user, accessToken, isLoading, refreshSession } = useAuth();
  const [visible, setVisible] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const confirmInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && user && user.requiresPinSetup) {
      const timer = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, [user, isLoading]);

  const handleSubmit = async () => {
    setError("");

    if (pin.length !== 4) {
      setError("PIN must be exactly 4 digits");
      inputRef.current?.focus();
      return;
    }

    if (WEAK_PINS.has(pin)) {
      setError("PIN too simple, choose something stronger");
      setPin("");
      setConfirmPin("");
      inputRef.current?.focus();
      return;
    }

    if (pin !== confirmPin) {
      setError("PINs do not match");
      setConfirmPin("");
      confirmInputRef.current?.focus();
      return;
    }

    if (!accessToken) return;

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/setup-pin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify({ pin, confirmPin }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to set PIN");
        return;
      }

      await refreshSession();
      setVisible(false);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!visible) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" />
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0">
        <div
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-slideUp"
          style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.15)" }}
        >
          <div className="p-6 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#eef2ff] flex items-center justify-center mb-3">
              <Lock className="w-5 h-5 text-[#4f46e5]" />
            </div>
            <h2 className="text-lg font-bold text-[#0f172a] leading-tight">
              Set Your Transfer PIN
            </h2>
            <p className="text-sm text-[#475569] mt-1">
              This PIN secures every transfer. You&apos;ll need it to send
              money.
            </p>
          </div>

          <div className="px-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Enter PIN
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 4-digit PIN"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm text-slate-900 tracking-[0.5em] text-center text-2xl font-bold transition-all placeholder:tracking-normal placeholder:text-base placeholder:font-normal focus:border-[#4f46e5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPin ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Confirm PIN
              </label>
              <input
                ref={confirmInputRef}
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                maxLength={4}
                value={confirmPin}
                onChange={(e) =>
                  setConfirmPin(e.target.value.replace(/\D/g, ""))
                }
                placeholder="Re-enter 4-digit PIN"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 tracking-[0.5em] text-center text-2xl font-bold transition-all placeholder:tracking-normal placeholder:text-base placeholder:font-normal focus:border-[#4f46e5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/10"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <CheckCircle
                className={`w-3.5 h-3.5 ${pin.length === 4 && pin === confirmPin ? "text-green-500" : "text-slate-300"}`}
              />
              <span>PINs must match and be exactly 4 digits</span>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          <div className="p-6 pt-4 flex flex-col gap-2">
            <button
              onClick={handleSubmit}
              disabled={pin.length !== 4 || confirmPin.length !== 4 || saving}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                backgroundColor:
                  pin.length === 4 && confirmPin.length === 4
                    ? "#4f46e5"
                    : "#94a3b8",
              }}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Setting PIN..." : "Set PIN →"}
            </button>
            <p className="text-center text-xs text-slate-400">
              You won&apos;t be able to send money without a transfer PIN
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

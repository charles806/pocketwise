"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Bell, Target, ArrowLeftRight, Loader2 } from "lucide-react";
import { WalletHeader } from "../wallet/UI/Header";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

interface Notification {
  id: string;
  title: string;
  message: string;
  category: "GOAL" | "TRANSACTION" | "SECURITY" | "SYSTEM" | "PROMOTION";
  isRead: boolean;
  createdAt: string;
}

function formatTimeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function getDateLabel(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);

  if (date.toDateString() === now.toDateString()) return "Today";

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getDateKey(dateStr: string) {
  return new Date(dateStr).toDateString();
}

function groupByDate(
  notifications: Notification[],
): [string, Notification[]][] {
  const groups = new Map<string, { label: string; items: Notification[] }>();

  for (const n of notifications) {
    const key = getDateKey(n.createdAt);
    const label = getDateLabel(n.createdAt);
    if (!groups.has(key)) {
      groups.set(key, { label, items: [] });
    }
    groups.get(key)!.items.push(n);
  }

  const todayKey = getDateKey(new Date().toISOString());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = getDateKey(yesterday.toISOString());

  const sorted = Array.from(groups.entries()).sort(([aKey], [bKey]) => {
    if (aKey === todayKey) return -1;
    if (bKey === todayKey) return 1;
    if (aKey === yesterdayKey) return -1;
    if (bKey === yesterdayKey) return 1;
    return new Date(bKey).getTime() - new Date(aKey).getTime();
  });

  return sorted.map(
    ([, group]) => [group.label, group.items] as [string, Notification[]],
  );
}

function categoryConfig(category: string) {
  switch (category) {
    case "GOAL":
      return {
        icon: Target,
        bg: "bg-indigo-100",
        color: "text-indigo-600",
      };
    case "TRANSACTION":
      return {
        icon: ArrowLeftRight,
        bg: "bg-emerald-100",
        color: "text-emerald-600",
      };
    default:
      return {
        icon: Bell,
        bg: "bg-slate-100",
        color: "text-slate-600",
      };
  }
}

const SkeletonRow = () => (
  <div className="rounded-xl bg-slate-100 animate-pulse h-16" />
);

const Page = () => {
  const { accessToken } = useAuth();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/notifications`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast(data.message || "Failed to load notifications", {
          type: "error",
        });
        return;
      }
      const body = await res.json();
      setNotifications(body.data || []);
    } catch {
      toast("Failed to load notifications", { type: "error" });
    } finally {
      setLoading(false);
    }
  }, [accessToken, toast]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllAsRead = async () => {
    if (!accessToken) return;
    setMarkingAll(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast(data.message || "Failed to mark all as read", {
          type: "error",
        });
        return;
      }
      await fetchNotifications();
    } catch {
      toast("Failed to mark all as read", { type: "error" });
    } finally {
      setMarkingAll(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    if (!accessToken) return;
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    try {
      const res = await fetch(`${API_BASE}/api/v1/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });
      if (!res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)),
        );
        const data = await res.json().catch(() => ({}));
        toast(data.message || "Failed to mark as read", { type: "error" });
      }
    } catch {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)),
      );
      toast("Failed to mark as read", { type: "error" });
    }
  };

  const groups = useMemo(() => groupByDate(notifications), [notifications]);
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  );

  return (
    <>
      <WalletHeader />
      <main
        className="flex min-h-screen flex-col gap-4 py-4 sm:gap-6 sm:py-6"
        style={{ backgroundColor: "#f8fafc" }}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
              Notifications
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              Stay updated on your activity
            </p>
          </div>
          {unreadCount > 0 && !markingAll && (
            <button
              onClick={handleMarkAllAsRead}
              className="rounded-xl bg-[#4f46e5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4338ca] active:scale-95 transition-all duration-200"
            >
              Mark all as read
            </button>
          )}
          {markingAll && (
            <div className="flex items-center gap-2 rounded-xl bg-[#4f46e5] px-4 py-2 text-sm font-semibold text-white">
              <Loader2 className="h-4 w-4 animate-spin" />
              Marking...
            </div>
          )}
        </div>

        <div className="flex justify-center px-4 pb-6 sm:px-6 lg:px-8">
          <div className="w-full max-w-2xl">
            {loading ? (
              <div className="flex flex-col gap-3">
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/70 bg-white px-4 py-16 shadow-[0_4px_24px_rgba(15,23,42,0.06)]">
                <Bell className="h-12 w-12 text-slate-300" />
                <h4 className="mt-4 text-base font-medium text-slate-500">
                  No notifications yet
                </h4>
                <p className="mt-1 max-w-xs text-center text-sm text-slate-400">
                  We&apos;ll notify you about transfers, goal progress, and more
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {groups.map(([label, notifs]) => (
                  <div key={label}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {label}
                    </p>
                    <div className="flex flex-col gap-2">
                      {notifs.map((n) => {
                        const cfg = categoryConfig(n.category);
                        const Icon = cfg.icon;
                        return (
                          <div
                            key={n.id}
                            onClick={() => {
                              if (!n.isRead) handleMarkAsRead(n.id);
                            }}
                            className={`rounded-xl border border-slate-100 bg-white p-4 cursor-pointer transition-colors hover:bg-slate-50 ${
                              n.isRead
                                ? "border-l-4 border-l-transparent bg-slate-50/50"
                                : "border-l-4 border-l-[#4f46e5] bg-white"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${cfg.bg}`}
                              >
                                <Icon className={`h-5 w-5 ${cfg.color}`} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-slate-900">
                                  {n.title}
                                </p>
                                <p className="line-clamp-2 text-xs text-slate-500">
                                  {n.message}
                                </p>
                              </div>
                              <div className="flex shrink-0 flex-col items-end gap-1.5">
                                <span className="text-xs text-slate-400">
                                  {formatTimeAgo(n.createdAt)}
                                </span>
                                {!n.isRead && (
                                  <span className="h-2 w-2 rounded-full bg-[#4f46e5]" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default Page;

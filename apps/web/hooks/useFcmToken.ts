"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  getFcmToken,
  listenForForegroundMessages,
} from "../libs/firebase-client";

export function useFcmToken() {
  const { user, accessToken, isLoading } = useAuth();
  const { toast } = useToast();
  const hasRun = useRef(false);

  useEffect(() => {
    if (isLoading || !user || !accessToken) return;
    console.log("useFcmToken mounted")
    console.log("Notification support check:", typeof Notification !== "undefined");
    console.log("Current permission:", Notification?.permission);

    if (!hasRun.current) {
      hasRun.current = true;

      getFcmToken().then((token) => {
        if (!token) return;

        const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;
        fetch(`${API_BASE}/api/v1/auth/fcm-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
          body: JSON.stringify({ fcmToken: token }),

        }).catch((error) => {
          console.error("Failed to save FCM token:", error);
        });
      });
    }

    const unsubscribe = listenForForegroundMessages((payload) => {
      const { title, body } = payload.notification || {};
      if (body) {
        toast(body, { title: title || "PocketWise", type: "info" });
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isLoading, user, accessToken, toast]);
}

"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export type ToastType = "info" | "warning" | "error";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
}

interface ToastContextType {
  toasts: Toast[];
  toast: (message: string, options?: { type?: ToastType; title?: string }) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const MAX_TOASTS = 3;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, options?: { type?: ToastType; title?: string }) => {
      const type = options?.type ?? "info";
      const title = options?.title;

      // Prevent duplicate toasts (same type + message)
      setToasts((prev) => {
        const isDuplicate = prev.some(
          (t) => t.message === message && t.type === type,
        );
        if (isDuplicate) return prev;

        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const newToast: Toast = { id, type, message, title };

        // Respect max visible toasts — drop the oldest if over limit
        const updated =
          prev.length >= MAX_TOASTS ? prev.slice(prev.length - MAX_TOASTS + 1) : prev;

        return [...updated, newToast];
      });
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ toasts, toast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

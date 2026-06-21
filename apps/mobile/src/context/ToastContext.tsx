import { createContext, useContext, useCallback, type ReactNode } from "react";
import Toast from "react-native-toast-message";

export type ToastType = "info" | "warning" | "error";

interface ToastContextType {
  toast: (message: string, options?: { type?: ToastType; title?: string }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const toast = useCallback(
    (message: string, options?: { type?: ToastType; title?: string }) => {
      const type = options?.type ?? "info";
      const title = options?.title;

      if (type === "error") console.error(message);
      else if (type === "warning") console.warn(message);

      Toast.show({
        type,
        text1: title,
        text2: message,
      });
    },
    []
  );

  return <ToastContext.Provider value={{ toast }}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
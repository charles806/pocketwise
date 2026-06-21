import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";
import { toastConfig } from "../components/ui/toastConfig";
import "../global.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <Toast config={toastConfig} />
      </ToastProvider>
    </AuthProvider>
  );
}
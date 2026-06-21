import { useState } from "react";
import { View, Text, Pressable, SafeAreaView, KeyboardAvoidingView, Platform } from "react-native";
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import { Eye, EyeOff, Lock } from "lucide-react-native";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { api, ApiError } from "../../services/api";
import { loginSchema } from "../../validation/authSchema";

interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string };
}

export default function LoginScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const { setAuth } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    const normalizedEmail = email.toLowerCase().trim();
    const data = { email: normalizedEmail, password };

    const result = loginSchema.safeParse(data);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        newErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const res = await api.post<LoginResponse>("/api/v1/auth/login", data);
      await setAuth(res.accessToken, res.refreshToken, res.user as any);
      router.replace((from as any) || "/wallet");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          toast("Invalid email or password. Please try again.", {
            type: "error",
            title: "Login Failed",
          });
        } else if (err.status === 429) {
          toast("Too many attempts. Please wait a moment and try again.", {
            type: "warning",
            title: "Slow Down",
          });
        } else {
          toast("Something went wrong. Please try again.", { type: "error", title: "Error" });
        }
      } else {
        toast("Unable to connect. Check your internet connection.", {
          type: "error",
          title: "Connection Error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <View className="flex-1 justify-center px-6">
          <View className="mb-10">
            <Text className="text-3xl font-bold text-slate-900 text-center mb-2">Welcome back 👋</Text>
            <Text className="text-slate-600 text-center">Continue managing your money the smart way.</Text>
          </View>

          <View className="gap-5">
            <Input
              label="Email address"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              editable={!loading}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              editable={!loading}
              secureTextEntry={!showPassword}
              rightElement={
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
                </Pressable>
              }
            />

            <Link href="/forgot-password" className="self-end -mt-2">
              <Text className="text-sm text-slate-600">Forgot password?</Text>
            </Link>

            <Button onPress={handleSubmit} loading={loading}>
              Login
            </Button>

            <View className="flex-row items-center justify-center gap-2 mt-1">
              <Lock size={14} color="#94a3b8" />
              <Text className="text-xs text-slate-400">Bank-grade security • NDPC compliant</Text>
            </View>
          </View>

          <View className="mt-8 flex-row justify-center gap-1">
            <Text className="text-sm text-slate-500">Don't have an account?</Text>
            <Link href="/register">
              <Text className="text-sm font-medium text-slate-900 underline">Create One</Text>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
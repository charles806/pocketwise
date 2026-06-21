import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter } from "expo-router";
import { AppState, type AppStateStatus } from "react-native";
import { secureStorage } from "../utils/secureStorage";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;
const INACTIVITY_LIMIT = 45 * 60 * 1000; // 45 minutes

const REFRESH_TOKEN_KEY = "pocketwise_refresh_token";
const LAST_ACTIVE_KEY = "pocketwise_last_active";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  isSimulationMode?: boolean;
  onboardingComplete?: boolean;
  primaryGoal?: string | null;
  requiresPinSetup?: boolean;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  setAuth: (
    accessToken: string,
    refreshToken: string,
    userData: User,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const justAuthenticatedRef = useRef(false);

  const logout = useCallback(async () => {
    setUser(null);
    setAccessToken(null);
    await secureStorage.deleteItemAsync(REFRESH_TOKEN_KEY);
    await secureStorage.deleteItemAsync(LAST_ACTIVE_KEY);

    fetch(`${API_BASE}/api/v1/auth/logout`, { method: "POST" }).catch(() => {});
    router.replace("/login");
  }, [router]);

  const refreshSession = useCallback(async () => {
    try {
      const refreshToken = await secureStorage.getItemAsync(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        await logout();
        return;
      }

      const data = await response.json();

      if (data.success && data.data?.accessToken) {
        setAccessToken(data.data.accessToken);

        const meResponse = await fetch(`${API_BASE}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${data.data.accessToken}` },
        });

        if (meResponse.ok) {
          const meData = await meResponse.json();
          if (meData.data) setUser(meData.data);
        }
      } else {
        await logout();
      }
    } catch {
      await logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  // Try to restore the session on app launch
  useEffect(() => {
    refreshSession();
  }, []);

  // Inactivity handling — phones don't have a "mouse stopped moving" signal,
  // so instead we timestamp when the app backgrounds, then check elapsed
  // time when it comes back to the foreground.
  useEffect(() => {
    const handleAppStateChange = async (state: AppStateStatus) => {
      if (state === "background") {
        await secureStorage.setItemAsync(
          LAST_ACTIVE_KEY,
          Date.now().toString(),
        );
      } else if (state === "active" && accessToken) {
        const lastActive = await secureStorage.getItemAsync(LAST_ACTIVE_KEY);
        if (
          lastActive &&
          Date.now() - parseInt(lastActive, 10) > INACTIVITY_LIMIT
        ) {
          logout();
        }
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );
    return () => subscription.remove();
  }, [accessToken, logout]);

  const setAuth = useCallback(
    async (newAccessToken: string, refreshToken: string, userData: User) => {
      justAuthenticatedRef.current = true;
      setAccessToken(newAccessToken);
      setUser(userData);
      await secureStorage.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    },
    [],
  );

  return (
    <AuthContext.Provider
      value={{ user, accessToken, isLoading, setAuth, logout, refreshSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

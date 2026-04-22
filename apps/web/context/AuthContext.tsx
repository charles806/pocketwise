"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL;

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  isSimulationMode?: boolean;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  setAuth: (token: string, userData: User) => void;
  logout: () => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    // Clear session flag cookie for middleware
    document.cookie = "auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    
    fetch(`${API_BASE}/api/v1/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
    router.push("/login");
  }, [router]);

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        logout();
        return;
      }

      const data = await response.json();

      if (data.success && data.data?.accessToken) {
        setAccessToken(data.data.accessToken);
        // Set session flag cookie for middleware (expires in 7 days to match refresh token)
        const date = new Date();
        date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));
        document.cookie = `auth_session=true; path=/; expires=${date.toUTCString()}; SameSite=Lax`;

        const meResponse = await fetch(`${API_BASE}/api/v1/auth/me`, {
          headers: {
            Authorization: `Bearer ${data.data.accessToken}`,
          },
          credentials: "include",
        });

        if (meResponse.ok) {
          const meData = await meResponse.json();
          if (meData.data) {
            setUser(meData.data);
          }
        }
      } else {
        logout();
      }
    } catch {
      logout();
    }
  }, [logout]);

  // Auto-redirect if session is recovered and user is on auth page
  useEffect(() => {
    if (!isLoading && user) {
      const path = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      const redirectTo = searchParams.get("from") || "/wallet";
      
      if (path === "/login" || path === "/register") {
        router.push(redirectTo);
      }
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (!response.ok) {
          setIsLoading(false);
          return;
        }

        const data = await response.json();

        if (data.success && data.data?.accessToken) {
          setAccessToken(data.data.accessToken);
          // Set session flag cookie for middleware
          const date = new Date();
          date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));
          document.cookie = `auth_session=true; path=/; expires=${date.toUTCString()}; SameSite=Lax`;

          const meResponse = await fetch(`${API_BASE}/api/v1/auth/me`, {
            headers: {
              Authorization: `Bearer ${data.data.accessToken}`,
            },
            credentials: "include",
          });

          if (meResponse.ok) {
            const meData = await meResponse.json();
            if (meData.data) {
              setUser(meData.data);
            }
          }
        }
      } catch { console.debug("No active session found"); } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const setAuth = useCallback((token: string, userData: User) => {
    setAccessToken(token);
    setUser(userData);
    // Set session flag cookie for middleware
    const date = new Date();
    date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));
    document.cookie = `auth_session=true; path=/; expires=${date.toUTCString()}; SameSite=Lax`;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        setAuth,
        logout,
        refreshSession,
      }}
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

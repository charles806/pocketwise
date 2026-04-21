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

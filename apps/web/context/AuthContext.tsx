"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;
const INACTIVITY_LIMIT = 45 * 60 * 1000; // 45 minutes

const setSessionCookie = () => {
  const date = new Date();
  date.setTime(date.getTime() + INACTIVITY_LIMIT);
  document.cookie = `auth_session=true; path=/; expires=${date.toUTCString()}; SameSite=Lax`;
};

const clearSessionCookie = () => {
  document.cookie =
    "auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
};

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
  // Tracks whether setAuth was just called (signup/login from this tab).
  // When true, the auto-redirect effect is skipped so the calling page
  // (e.g. register → /onboarding) can handle its own navigation.
  const justAuthenticatedRef = useRef(false);

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    clearSessionCookie();

    fetch(`${API_BASE}/api/v1/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
    router.push("/login");
  }, [router]);

  // ── Inactivity Timer ──────────────────────────────────────────────
  const inactivityRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityRef.current) clearTimeout(inactivityRef.current);
    inactivityRef.current = setTimeout(() => {
      logout();
    }, INACTIVITY_LIMIT);
  }, [logout]);

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
        setSessionCookie();

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

  // Auto-redirect if session is recovered and user is on auth page.
  // This only applies when returning to /login or /register with an
  // existing session (e.g. refresh token still valid). It does NOT
  // run when the user just signed up / logged in from this tab,
  // because the calling code handles its own redirect (e.g. to /onboarding).
  useEffect(() => {
    if (!isLoading && user) {
      // Skip if setAuth was just called — let the caller navigate
      if (justAuthenticatedRef.current) {
        justAuthenticatedRef.current = false;
        return;
      }

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
      const url = `${API_BASE}/api/v1/auth/refresh`;

      // console.log(`[AuthContext] initAuth: Fetching from ${url}`);
      try {
        const response = await fetch(url, {
          method: "POST",
          credentials: "include",
        });

        if (!response.ok) {
          const path = window.location.pathname;
          if (path !== "/login" && path !== "/register") {
            router.push("/login");
          }
          setIsLoading(false);
          return;
        }

        const data = await response.json();

        if (data.success && data.data?.accessToken) {
          setAccessToken(data.data.accessToken);
          setSessionCookie();

          const meResponse = await fetch(`${API_BASE}/api/v1/auth/me`, {
            headers: {
              Authorization: `Bearer ${data.data.accessToken}`,
            },
            credentials: "include",
          });

          if (meResponse.ok) {
            const meData = await meResponse.json();
            if (meData.data) {
              console.log(
                "[AuthContext] initAuth: Success! User:",
                meData.data,
                "Access Token:",
                data.data.accessToken,
              );
              setUser(meData.data);
            }
          }
        }
      } catch (err) {
        console.error("[AuthContext] initAuth Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const setAuth = useCallback((token: string, userData: User) => {
    console.log("[AuthContext] Setting user data:", userData);
    justAuthenticatedRef.current = true;
    setAccessToken(token);
    setUser(userData);
    setSessionCookie();
  }, []);

  useEffect(() => {
    if (!accessToken) return;

    resetInactivityTimer();

    const events = [
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "mousemove",
    ];

    const handleActivity = () => {
      setSessionCookie();
      resetInactivityTimer();
    };

    events.forEach((event) => window.addEventListener(event, handleActivity));

    return () => {
      if (inactivityRef.current) clearTimeout(inactivityRef.current);
      events.forEach((event) =>
        window.removeEventListener(event, handleActivity),
      );
    };
  }, [accessToken, resetInactivityTimer]);

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

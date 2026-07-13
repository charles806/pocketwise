"use client";
import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "../../logo.png";
import loginImage from "../../loginImge.png";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import { Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";
import Button from "@mui/material/Button";
import { loginSchema } from "../../../libs/validation";
import CircularProgress from "@mui/material/CircularProgress";
import { useSearchParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

interface LoginFormResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
  };
}

const signInschema = loginSchema;

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "14px",
    backgroundColor: "#f8f7fb",
    transition: "all 0.25s ease",
    "& fieldset": {
      borderColor: "#e2e8f0",
      transition: "all 0.25s ease",
    },
    "&:hover fieldset": {
      borderColor: "#c4b5fd",
    },
    "&.Mui-focused": {
      backgroundColor: "#fff",
      boxShadow:
        "0 0 0 4px rgba(124, 58, 237, 0.08), 0 0 24px rgba(124, 58, 237, 0.12)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#4f65dc",
      borderWidth: "1.5px",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#64748b",
    fontWeight: 500,
    fontSize: "0.9rem",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#4f65dc",
  },
  "& .MuiInputLabel-root.MuiInputLabel-shrink": {
    fontSize: "1rem",
    fontWeight: 500,
    letterSpacing: "0.01em",
    color: "#4f65dc",
  },
  "& .MuiFormHelperText-root": {
    marginLeft: "4px",
    fontWeight: 500,
    fontSize: "0.75rem",
  },
};

const primaryButtonSx =
  "w-full rounded-xl !bg-gradient-to-r !from-violet-600 !to-purple-600 hover:!from-violet-500 hover:!to-purple-500 disabled:!from-slate-200 disabled:!to-slate-200 disabled:!text-slate-400 !text-white transition-all duration-300 !py-3 normal-case font-sans font-bold text-sm shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/45 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 mb-2";

// Shared link style for smooth color and underline transition
const linkStyle =
  "text-sm font-semibold text-slate-500 hover:text-violet-600 transition-all duration-500 ease-out relative inline-block after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[1.5px] after:w-0 hover:after:w-full after:bg-violet-600 after:transition-all after:duration-500 after:ease-out";

const LoginForm = () => {
  const { setAuth } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const search = useSearchParams();
  const redirectTo = search.get("from");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const normalizedEmail = email.toLowerCase().trim();
    const data = { email: normalizedEmail, password };

    const result = signInschema.safeParse(data);
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
      const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      const dataRes = (await res.json()) as LoginFormResponse;

      if (res.ok) {
        console.log("Login User Data:", dataRes.user);
        console.log("");
        setAuth(dataRes.accessToken, dataRes.user);
        window.location.href = redirectTo || "/wallet";
        return;
      } else {
        console.error("[Login] Server error:", dataRes.message);

        if (res.status === 401) {
          toast("Invalid email or password. Please try again.", {
            type: "error",
            title: "Login Failed",
          });
        } else if (res.status === 429) {
          toast("Too many attempts. Please wait a moment and try again.", {
            type: "warning",
            title: "Slow Down",
          });
        } else {
          toast("Something went wrong. Please try again.", {
            type: "error",
            title: "Error",
          });
        }
      }
    } catch (error) {
      console.error("[Login] Network error:", error);
      toast("Unable to connect. Check your internet connection.", {
        type: "error",
        title: "Connection Error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-12 lg:py-16 bg-white">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
            Welcome back 👋
          </h1>
          <p className="text-slate-500 font-medium text-sm sm:text-base">
            Continue managing your money the smart way.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
          <TextField
            label="Email address"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
            fullWidth
            disabled={loading}
            sx={fieldSx}
            autoFocus
            type="email"
          />

          <div className="flex flex-col gap-2">
            <TextField
              label="Password"
              variant="outlined"
              fullWidth
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!errors.password}
              helperText={errors.password}
              disabled={loading}
              sx={fieldSx}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                        className="text-slate-400 hover:text-violet-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <div className="flex justify-end">
              <Link href="/forgot-password" className={linkStyle}>
                Forgot password?
              </Link>
            </div>
          </div>

          <div className="pt-1">
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              disableElevation
              className={primaryButtonSx}
            >
              {loading ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                <>
                  Log in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 bg-emerald-50/70 border border-emerald-100/80 rounded-xl py-3 px-4">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <p className="text-xs font-semibold text-emerald-700">
              Bank-grade security &middot; NDPC compliant
            </p>
          </div>
        </form>

        <p className="mt-8 text-center text-sm font-medium text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className={linkStyle}>
            Create one
          </Link>
        </p>
      </div>
    </section>
  );
};

function LoginFormWithSuspense() {
  return (
    <Suspense
      fallback={
        <section className="w-full lg:w-1/2 flex flex-col justify-center items-center py-12 bg-white">
          <div className="flex flex-col gap-2 text-center mb-10">
            <h1 className="text-3xl font-bold text-slate-900">Welcome back</h1>
            <p className="text-slate-500">
              Continue managing your money the smart way.
            </p>
          </div>
          <CircularProgress size={32} className="text-violet-600" />
        </section>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

const LoginPage = () => {
  return (
    <main className="min-h-screen w-full bg-linear-to-br from-slate-50 to-slate-100 p-3 sm:p-4 lg:p-6 flex items-center justify-center">
      <div className="w-full max-w-360 min-h-[92vh] lg:h-[92vh] flex bg-white overflow-hidden rounded-3xl lg:rounded-4xl border border-slate-200 shadow-xl shadow-slate-200/50">
        <section className="hidden lg:flex flex-col justify-between w-1/2 bg-slate-50/80 p-10 xl:p-14 relative overflow-hidden border-r border-slate-200">
          <div className="absolute top-0 right-0 w-125 h-125 bg-violet-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-100 h-100 bg-fuchsia-100/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-3 w-fit group">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                <Image
                  src={logo}
                  alt="PocketWise Logo"
                  width={28}
                  height={28}
                  className="rounded-md"
                />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">
                PocketWise
              </span>
            </Link>
          </div>

          <div className="relative z-10 max-w-xl mt-6">
            <h1 className="text-4xl xl:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
              No More
              <br />
              <span className="text-violet-600">
                &quot;Where Did My Money Go?&quot;
              </span>
            </h1>
            <p className="text-lg text-slate-600 font-medium leading-relaxed max-w-md">
              PocketWise automatically splits every deposit into smart wallets
              for spending, savings, and emergencies.
            </p>
          </div>

          <div className="relative z-10 flex-1 flex items-end justify-center pt-8">
            <div className="relative w-full max-w-sm xl:max-w-md aspect-square">
              <Image
                src={loginImage}
                alt="PocketWise App Interface"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>
        </section>

        <LoginFormWithSuspense />
      </div>
    </main>
  );
};

export default LoginPage;

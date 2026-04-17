"use client";
import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "../../../public/logo.png";
import loginImage from "../../../public/loginImge.png";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import { Eye, EyeOff } from "lucide-react";
import Button from "@mui/material/Button";
import { LockIcon } from "lucide-react";
import { loginSchema } from "../../../libs/validation";
import { useRouter } from "next/navigation";
import CircularProgress from "@mui/material/CircularProgress";
import { useSearchParams } from "next/navigation";

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

const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const search = useSearchParams();
  const redirectTo = search.get("from");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = { email, password };

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
        console.log("Login successful:", dataRes);
        router.push(redirectTo || "/dashboard");
      } else {
        setErrors({ general: dataRes.message || "Login failed" });
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ general: "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full lg:w-1/2 flex flex-col justify-center py-12">
      <div className="flex flex-col gap-2 text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Welcome back 👋</h1>
        <p className="text-slate-600">
          Continue managing your money the smart way.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 w-[80%] max-w-md mx-auto"
      >
        <TextField
          label="Email address"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={!!errors.email}
          helperText={errors.email}
          fullWidth
          disabled={loading}
        />

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
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-slate-400" />
                    ) : (
                      <Eye className="w-5 h-5 text-slate-400" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <div className="flex justify-end -mt-2">
          <Link
            href="/forgot-password"
            className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          disableElevation
          className="w-full rounded-xl shadow-sm bg-[#0f172a]! !hover:bg-slate-800 disabled:bg-slate-200! disabled:text-slate-400! text-white! transition-colors py-3 normal-case font-sans font-bold text-base mt-2"
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
        </Button>

        <p className="text-xs text-center text-slate-400">
          <LockIcon className="w-4 h-4 inline mr-2" />
          Bank-grade security • NDPC compliant
        </p>
      </form>

      <p className="mt-8 text-center text-sm font-medium text-slate-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-slate-900 hover:underline underline-offset-4"
        >
          Create One
        </Link>
      </p>
    </section>
  );
};

function LoginFormWithSuspense() {
  return (
    <Suspense
      fallback={
        <section className="w-full lg:w-1/2 flex flex-col justify-center py-12">
          <div className="flex flex-col gap-2 text-center mb-10">
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome back 👋
            </h1>
            <p className="text-slate-600">
              Continue managing your money the smart way.
            </p>
          </div>
          <div className="flex justify-center">
            <CircularProgress />
          </div>
        </section>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

const LoginPage = () => {
  return (
    <main className="h-screen w-full bg-linear-to-br from-slate-50 to-slate-100 p-4 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-6xl h-[95vh] flex bg-white overflow-hidden rounded-4xl border border-slate-200 shadow-sm">
        <section className="hidden lg:flex flex-col justify-between w-1/2 bg-slate-50 p-12 relative overflow-hidden border-r border-slate-200">
          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-3 w-fit group">
              <Image
                src={logo}
                alt="PocketWise Logo"
                width={40}
                height={40}
                className="rounded-xl border border-slate-200 shadow-sm group-hover:scale-105 transition-transform"
              />
              <span className="text-xl font-bold text-slate-900 tracking-tighter">
                PocketWise
              </span>
            </Link>
          </div>

          <div className="relative z-10 max-w-xl">
            <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tighter leading-[1.05] mb-6">
              No More "Where Did My Money Go?&quot;
            </h1>
            <p className="text-xl text-slate-600 font-medium leading-relaxed">
              PocketWise automatically splits every deposit into smart wallets
              for spending, savings, and emergencies.
            </p>
          </div>

          <div className="relative z-10 flex-1 flex items-end justify-center">
            <div className="relative w-full max-w-md aspect-square">
              <div className="absolute bottom-10 w-72 h-72 bg-indigo-200 blur-3xl opacity-30 rounded-full"></div>
              <Image
                src={loginImage}
                alt="PocketWise App Interface"
                fill
                className="object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.25)]"
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

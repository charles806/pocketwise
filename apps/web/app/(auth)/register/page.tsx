"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import signUp from "../../walletuicard.png";
import logo from "../../logo.png";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import { Eye, EyeOff, ChevronLeft, Check, ArrowRight } from "lucide-react";
import { z } from "zod";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

interface SignupResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    userName: string;
    isSimulationMode: boolean;
    onboardingComplete: boolean;
    primaryGoal: string | null;
  };
}

const step1Schema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const fullSignupSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    userName: z.string().min(2, "Username must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

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
        "0 0 0 6px rgba(124, 58, 237, 0.06), 0 0 40px rgba(124, 58, 237, 0.18)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#7C3AED",
      borderWidth: "1.5px",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#64748b",
    fontWeight: 500,
    fontSize: "0.9rem",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#7C3AED",
  },
  "& .MuiInputLabel-root.MuiInputLabel-shrink": {
    fontSize: "1rem",
    fontWeight: 500,
    letterSpacing: "0.01em",
    color: "#7C3AED",
  },
  "& .MuiFormHelperText-root": {
    marginLeft: "4px",
    fontWeight: 500,
    fontSize: "0.75rem",
  },
};

const primaryButtonSx =
  "w-full rounded-xl !bg-gradient-to-r !from-violet-600 !to-purple-600 hover:!from-violet-500 hover:!to-purple-500 disabled:!from-slate-200 disabled:!to-slate-200 disabled:!text-slate-400 !text-white transition-all duration-300 !py-4 normal-case font-sans font-bold text-sm shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/45 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2";

export default function SignUp() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const emailInputRef = useRef<HTMLInputElement>(null);
  const firstNameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 1) {
      setTimeout(() => emailInputRef.current?.focus(), 150);
    } else {
      setTimeout(() => firstNameInputRef.current?.focus(), 150);
    }
  }, [step]);

  const calculateStrength = (pass: string) => {
    let score = 0;
    if (!pass) return score;
    if (pass.length >= 8) score += 1;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^a-zA-Z\d]/.test(pass)) score += 1;
    return score;
  };

  const strength = calculateStrength(password);

  const getStrengthColor = (index: number) => {
    if (strength === 0) return "bg-slate-200";
    if (strength < index + 1) return "bg-slate-200";
    if (strength === 1) return "bg-red-500";
    if (strength === 2) return "bg-amber-500";
    if (strength === 3) return "bg-violet-500";
    return "bg-emerald-500";
  };

  const strengthLabel = ["Enter password", "Weak", "Fair", "Good", "Strong"];

  const isStep1Complete =
    email.trim() !== "" &&
    password.trim() !== "" &&
    confirmPassword.trim() !== "";

  const isStep2Complete =
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    userName.trim() !== "" &&
    phoneNumber.trim() !== "" &&
    dateOfBirth.trim() !== "" &&
    termsAccepted;

  const validateStep1 = () => {
    const result = step1Schema.safeParse({ email, password, confirmPassword });
    if (result.success) {
      setErrors({});
      return true;
    }
    const outputErrors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      outputErrors[issue.path[0] as string] = issue.message;
    });
    setErrors(outputErrors);
    return false;
  };

  const handleStep1Submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
      setErrors({});
    }
  };

  const handleStep2Submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const normalizedEmail = email.toLowerCase().trim();
    const fullData = {
      email: normalizedEmail,
      password,
      confirmPassword,
      firstName,
      lastName,
      userName,
      phoneNumber,
      dateOfBirth,
    };
    const result = fullSignupSchema.safeParse(fullData);

    if (!result.success) {
      const outputErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        outputErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(outputErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: normalizedEmail,
          password,
          confirmPassword,
          firstName,
          lastName,
          userName,
          phoneNumber,
          dateOfBirth,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || "Failed to create account";
        console.error("[Register] Server error:", errorMessage);

        if (response.status === 409) {
          setErrors({ email: "An account with this email already exists." });
          setStep(1);
        } else if (response.status === 400) {
          toast(errorMessage, { type: "warning", title: "Invalid Details" });
        } else {
          toast("Something went wrong. Please try again.", {
            type: "error",
            title: "Registration Failed",
          });
        }
        setLoading(false);
        return;
      }

      const signupData = data.data as SignupResponse;
      setAuth(signupData.accessToken, signupData.user);
      router.push("/onboarding");
    } catch (error) {
      console.error("[Register] Network error:", error);
      toast("Unable to connect. Check your internet connection.", {
        type: "error",
        title: "Connection Error",
      });
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setErrors({});
  };

  return (
    <main className="min-h-screen w-full bg-slate-50 p-3 sm:p-4 lg:p-6 flex items-center justify-center">
      <div className="w-full max-w-360 min-h-[92vh] lg:h-[92vh] flex bg-white overflow-hidden rounded-3xl lg:rounded-4xl border border-slate-200 shadow-xl shadow-slate-200/50">
        {/* Left Side */}
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
              <span className="text-xl font-bold font-sans text-slate-900 tracking-tight">
                PocketWise
              </span>
            </Link>
          </div>

          <div className="relative z-10 max-w-xl mt-6">
            <h1 className="text-4xl xl:text-5xl font-extrabold font-sans text-slate-900 tracking-tight leading-[1.1] mb-6">
              One deposit.
              <br />
              Four wallets.
              <br />
              <span className="text-violet-600">Zero effort.</span>
            </h1>
            <p className="text-lg text-slate-600 font-medium leading-relaxed max-w-md">
              Join PocketWise to automatically sort, save, and grow your money
              the exact second it lands in your account.
            </p>
          </div>

          <div className="relative z-10 flex-1 flex items-end justify-center pt-8">
            <div className="relative w-full max-w-sm xl:max-w-md aspect-square">
              <Image
                src={signUp}
                alt="PocketWise App Interface"
                fill
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>
        </section>

        {/* Right Side */}
        <section className="w-full lg:w-1/2 flex flex-col bg-white relative">
          {step === 2 && (
            <button
              onClick={handleBack}
              className="absolute top-6 left-6 z-20 w-9 h-9 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:text-violet-600 hover:border-violet-200 hover:bg-violet-50 transition-all duration-200 shadow-sm"
              aria-label="Go back"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          <div className="flex-1 flex flex-col justify-start pt-16 sm:pt-20 lg:pt-24 pb-12 px-6 sm:px-10 lg:px-16 overflow-y-auto">
            <div className="w-full max-w-md mx-auto">
              {/* Step Progress */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Step {step} of 2
                  </span>
                  <span className="text-xs font-semibold text-violet-700 bg-violet-50 px-3 py-1 rounded-full border border-violet-100">
                    {step === 1 ? "Account" : "Profile"}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-600 rounded-full transition-all duration-500 ease-out"
                    style={{ width: step === 1 ? "50%" : "100%" }}
                  />
                </div>
              </div>

              <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold font-sans text-slate-900 tracking-tight mb-2">
                  {step === 1
                    ? "Create your account"
                    : "Tell us about yourself"}
                </h1>
                <p className="text-slate-500 font-medium text-sm sm:text-base">
                  {step === 1
                    ? "Start managing your money smarter in seconds."
                    : "We need a few more details to set up your profile."}
                </p>
              </div>

              {/* Sliding Panels */}
              <div className="overflow-hidden py-5 -my-5">
                <div
                  className="flex transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                  style={{ transform: `translateX(-${(step - 1) * 100}%)` }}
                >
                  {/* Step 1 */}
                  <div
                    className="w-full shrink-0 px-1"
                    aria-hidden={step !== 1}
                    style={{ pointerEvents: step === 1 ? "auto" : "none" }}
                  >
                    <form
                      onSubmit={handleStep1Submit}
                      className="flex flex-col gap-5 w-full"
                    >
                      <TextField
                        label="Email address"
                        variant="outlined"
                        fullWidth
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={!!errors.email}
                        helperText={errors.email}
                        type="email"
                        disabled={loading}
                        sx={fieldSx}
                        inputRef={emailInputRef}
                      />

                      <div className="w-full flex flex-col gap-3">
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
                                    aria-label="toggle password visibility"
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    }
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

                        {password && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {[0, 1, 2, 3].map((index) => (
                                <div
                                  key={index}
                                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${getStrengthColor(
                                    index,
                                  )}`}
                                />
                              ))}
                              <span className="text-[11px] font-semibold text-slate-500 ml-1 w-14 text-right">
                                {strengthLabel[strength]}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium">
                              Use 8+ characters with uppercase, numbers &
                              symbols
                            </p>
                          </div>
                        )}
                      </div>

                      <TextField
                        label="Confirm password"
                        variant="outlined"
                        fullWidth
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword}
                        disabled={loading}
                        sx={fieldSx}
                        slotProps={{
                          input: {
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="toggle password visibility"
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

                      <div className="pt-2">
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={loading || !isStep1Complete}
                          disableElevation
                          className={primaryButtonSx}
                        >
                          {loading ? (
                            <CircularProgress size={22} color="inherit" />
                          ) : (
                            <>
                              Continue
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </Button>
                      </div>

                      <p className="text-center text-sm font-medium text-slate-500 mt-4">
                        Already have an account?{" "}
                        <Link
                          href="/login"
                          className="text-violet-600 hover:text-violet-700 font-semibold underline underline-offset-4 transition-colors"
                        >
                          Log in
                        </Link>
                      </p>
                    </form>
                  </div>

                  {/* Step 2 */}
                  <div
                    className="w-full shrink-0 px-1"
                    aria-hidden={step !== 2}
                    style={{ pointerEvents: step === 2 ? "auto" : "none" }}
                  >
                    <form
                      onSubmit={handleStep2Submit}
                      className="flex flex-col gap-5 w-full"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <TextField
                          label="First name"
                          variant="outlined"
                          fullWidth
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          error={!!errors.firstName}
                          helperText={errors.firstName}
                          disabled={loading}
                          sx={fieldSx}
                          inputRef={firstNameInputRef}
                        />
                        <TextField
                          label="Last name"
                          variant="outlined"
                          fullWidth
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          error={!!errors.lastName}
                          helperText={errors.lastName}
                          disabled={loading}
                          sx={fieldSx}
                        />
                      </div>

                      <TextField
                        label="Username"
                        variant="outlined"
                        fullWidth
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        error={!!errors.userName}
                        helperText={errors.userName}
                        disabled={loading}
                        sx={fieldSx}
                      />

                      <TextField
                        label="Phone number"
                        variant="outlined"
                        fullWidth
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        error={!!errors.phoneNumber}
                        helperText={errors.phoneNumber}
                        disabled={loading}
                        sx={fieldSx}
                        placeholder="+1 (555) 000-0000"
                      />

                      <TextField
                        label="Date of birth"
                        variant="outlined"
                        fullWidth
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        error={!!errors.dateOfBirth}
                        helperText={errors.dateOfBirth}
                        disabled={loading}
                        sx={fieldSx}
                        slotProps={{
                          inputLabel: { shrink: true },
                        }}
                      />

                      <label
                        className={`flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                          termsAccepted
                            ? "border-violet-200 bg-violet-50/50"
                            : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                        }`}
                      >
                        <div className="relative flex items-center mt-0.5">
                          <input
                            type="checkbox"
                            id="terms"
                            required
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            disabled={loading}
                            className="peer sr-only"
                          />
                          <div
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                              termsAccepted
                                ? "bg-violet-600 border-violet-600"
                                : "border-slate-300 bg-white peer-hover:border-violet-400"
                            }`}
                          >
                            {termsAccepted && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed select-none">
                          I confirm that I am at least 16 years old and I agree
                          to the{" "}
                          <Link
                            href="/terms"
                            className="text-violet-600 hover:text-violet-700 underline underline-offset-2 transition-colors"
                          >
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link
                            href="/privacy"
                            className="text-violet-600 hover:text-violet-700 underline underline-offset-2 transition-colors"
                          >
                            Privacy Policy
                          </Link>
                          .
                        </span>
                      </label>

                      <div className="pt-2">
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={loading || !isStep2Complete}
                          disableElevation
                          className={primaryButtonSx}
                        >
                          {loading ? (
                            <CircularProgress size={22} color="inherit" />
                          ) : (
                            "Create Account"
                          )}
                        </Button>
                      </div>

                      <p className="text-center text-sm font-medium text-slate-500 mt-4">
                        Already have an account?{" "}
                        <Link
                          href="/login"
                          className="text-violet-600 hover:text-violet-700 font-semibold underline underline-offset-4 transition-colors"
                        >
                          Log in
                        </Link>
                      </p>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import signUp from "../../../public/walletuicard.png";
import logo from "../../../public/logo.png";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";
import { z } from "zod";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

interface SignupResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
  };
}

//Validation One
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

//Final Validation

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
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  //Password Strength Calculation
  const calculateStrength = (pass: string) => {
    let score = 0;
    if (!pass) return score;
    if (pass.length >= 8) score += 1;
    if (/[a-zA-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^a-zA-Z\d]/.test(pass)) score += 1;
    return score;
  };

  //Password Strength
  const strength = calculateStrength(password);

  //Password Strength Color
  const getStrengthColor = (index: number) => {
    if (strength === 0) return "bg-slate-200";
    if (strength < index + 1) return "bg-slate-200";
    if (strength === 1) return "bg-red-500";
    if (strength === 2) return "bg-yellow-500";
    if (strength === 3) return "bg-blue-500";
    return "bg-emerald-500";
  };

  //Validate Step 1
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

  //Handle Step 1 Submit
  const handleStep1Submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
      setErrors({});
    }
  };

  //Handle Step 2 Submit
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
        headers: {
          "Content-Type": "application/json",
        },
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

        if(response.status === 400){
          toast(errorMessage, {
            type: "warning",
            title: "Invalid Details",
          });
        }

        if (response.status === 409) {
          // Email already exists — show inline error near the field
          setErrors({ email: "An account with this email already exists." });
          setStep(1);
        } else if (response.status === 400) {
          toast(errorMessage, {
            type: "warning",
            title: "Invalid Details",
          });
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
      router.push("/wallet");
    } catch (error) {
      console.error("[Register] Network error:", error);
      toast("Unable to connect. Check your internet connection.", {
        type: "error",
        title: "Connection Error",
      });
      setLoading(false);
    }
  };

  //Handle Back
  const handleBack = () => {
    setStep(1);
    setErrors({});
  };

  return (
    <main className="h-screen w-full absolute top-0 left-0 bg-slate-50 p-4 lg:p-8">
      <div className="w-full max-w-360 h-[95vh] flex bg-white overflow-hidden rounded-4xl border border-slate-200">
        {/* Left Side */}
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
              <span className="text-xl font-bold font-sans text-slate-900 tracking-tighter">
                PocketWise
              </span>
            </Link>
          </div>

          <div className="relative z-10 max-w-2xl mt-4">
            <h1 className="text-5xl lg:text-6xl font-extrabold font-sans text-slate-900 tracking-tighter leading-[1.05] mb-8">
              One deposit. Four wallets.
              <br />
              Zero effort.
            </h1>
            <p className="text-xl lg:text-2xl text-slate-600 font-medium tracking-tight mb-12 leading-relaxed max-w-[90%]">
              Join PocketWise to automatically sort, save, and grow your money
              the exact second it lands in your account. No math or spreadsheets
              required.
            </p>
          </div>

          <div className="relative z-10 flex-1 flex items-end justify-center">
            <div className="relative w-full max-w-md aspect-square">
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
        <section className="w-full lg:w-1/2 flex flex-col pt-12 pb-12 overflow-y-auto bg-white">
          <div className="w-full max-w-md mx-auto my-auto px-6">
            <div className="flex flex-col gap-2 text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full ${step === 1 ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}
                >
                  Step 1 of 2
                </span>
                {step === 2 && (
                  <button
                    onClick={handleBack}
                    className="text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
              </div>
              <h1 className="text-3xl font-bold font-sans text-slate-900 tracking-tight">
                {step === 1 ? "Create your account" : "Tell us about yourself"}
              </h1>
              <p className="text-slate-500 font-medium text-sm">
                {step === 1
                  ? "Start managing your money smarter in seconds."
                  : "We need a few more details to set up your profile."}
              </p>
            </div>

            {step === 1 ? (
              <form
                onSubmit={handleStep1Submit}
                className="flex flex-col gap-5 w-full"
              >
                <TextField
                  label="Email address"
                  variant="outlined"
                  className="w-full rounded-xl!"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                  type="email"
                  disabled={loading}
                />

                <div className="w-full flex flex-col gap-1.5">
                  <TextField
                    label="Password"
                    variant="outlined"
                    className="w-full rounded-xl!"
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
                              aria-label="toggle password visibility"
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

                  {password && (
                    <div className="flex items-center gap-1.5 mt-1 px-1">
                      {[0, 1, 2, 3].map((index) => (
                        <div
                          key={index}
                          className={`h-1.5 w-full rounded-full transition-colors duration-300 ${getStrengthColor(index)}`}
                        />
                      ))}
                      <span className="text-[10px] text-slate-500 font-medium ml-2 w-16 text-right">
                        {strength === 0 && "Weak"}
                        {strength === 1 && "Weak"}
                        {strength === 2 && "Fair"}
                        {strength === 3 && "Good"}
                        {strength === 4 && "Strong"}
                      </span>
                    </div>
                  )}
                </div>

                <TextField
                  label="Confirm password"
                  variant="outlined"
                  className="w-full rounded-xl!"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  disabled={loading}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
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

                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  disableElevation
                  className="w-full rounded-xl shadow-sm bg-[#0f172a]! !hover:bg-slate-800 disabled:bg-slate-200! disabled:text-slate-400! text-white! transition-colors py-3 normal-case font-sans font-bold text-base mt-2"
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Next"
                  )}
                </Button>
              </form>
            ) : (
              <form
                onSubmit={handleStep2Submit}
                className="flex flex-col gap-5 w-full"
              >

                <TextField
                  label="First name"
                  variant="outlined"
                  className="w-full rounded-xl!"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  disabled={loading}
                />

                <TextField
                  label="Last name"
                  variant="outlined"
                  className="w-full rounded-xl!"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  disabled={loading}
                />

                <TextField
                  label="Username"
                  variant="outlined"
                  className="w-full rounded-xl!"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  error={!!errors.userName}
                  helperText={errors.userName}
                  disabled={loading}
                />

                <TextField
                  label="Phone number"
                  variant="outlined"
                  className="w-full rounded-xl!"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  error={!!errors.phoneNumber}
                  helperText={errors.phoneNumber}
                  disabled={loading}
                />

                <TextField
                  label="Date of birth"
                  variant="outlined"
                  className="w-full rounded-xl!"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  error={!!errors.dateOfBirth}
                  helperText={errors.dateOfBirth}
                  disabled={loading}
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                />

                <div className="flex items-start gap-2 text-left mt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    disabled={loading}
                    className="mt-1 size-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                  />
                  <label
                    htmlFor="terms"
                    className="text-xs text-slate-500 font-medium leading-relaxed cursor-pointer select-none"
                  >
                    I confirm that I am at least 16 years old and I agree to the{" "}
                    <Link
                      href="/terms"
                      className="text-slate-900 underline underline-offset-2 hover:text-slate-700 transition-colors"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-slate-900 underline underline-offset-2 hover:text-slate-700 transition-colors"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  disableElevation
                  className="w-full rounded-xl shadow-sm bg-[#0f172a]! !hover:bg-slate-800 disabled:bg-slate-200! disabled:text-slate-400! text-white! transition-colors py-3 normal-case font-sans font-bold text-base mt-2"
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Continue"
                  )}
                </Button>
              </form>
            )}

            <p className="mt-8 text-center text-sm font-medium text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-slate-900 hover:underline underline-offset-4 transition-colors"
              >
                Log in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/store/auth-store";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // OTP state
  const [otpStep, setOtpStep] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(data),
        },
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setServerError(
          errorData?.message || "Invalid credentials. Please try again.",
        );
        return;
      }

      const result = await res.json();

      if (result.otpRequired) {
        setUserId(result.userId);
        setOtpStep(true);
        setResendCooldown(15);
      } else if (result.success) {
        await fetchUser();
        router.push("/dashboard");
      } else {
        setServerError(result.msg || "Something went wrong.");
      }
    } catch {
      setServerError("Unable to connect. Please check your network.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setOtpError(null);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || "";
    }
    setOtp(newOtp);
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setOtpError("Please enter the complete 6-digit OTP");
      return;
    }

    setIsVerifying(true);
    setOtpError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userId, otp: otpValue }),
        },
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setOtpError(errorData?.message || "Invalid OTP. Please try again.");
        return;
      }

      const result = await res.json();
      if (result.success) {
        await fetchUser();
        router.push("/dashboard");
      }
    } catch {
      setOtpError("Unable to connect. Please check your network.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/resend-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userId }),
        },
      );
      setResendCooldown(15);
      setOtp(["", "", "", "", "", ""]);
      setOtpError(null);
      inputRefs.current[0]?.focus();
    } catch {
      setOtpError("Failed to resend OTP.");
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-900 font-sans">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-indigo-600 via-purple-700 to-violet-800 items-center justify-center p-12 overflow-hidden">
        <div className="relative z-10 max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-8 backdrop-blur-md border border-white/20">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            MIS Platform
          </h2>
          <p className="text-lg text-white/80 mb-10 leading-relaxed">
            Manage your information systems with clarity and confidence.
          </p>
          <div className="flex flex-col gap-4">
            {[
              "Secure & Encrypted",
              "Real-time Analytics",
              "Role-based Access",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-white/60 shrink-0" />
                <span className="text-sm font-medium text-white/90">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
        {/* Decorative Circles */}
        <div className="absolute w-[500px] h-[500px] rounded-full border border-white/10 -top-32 -right-40" />
        <div className="absolute w-[400px] h-[400px] rounded-full border border-white/10 -bottom-20 -left-20" />
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-[560px] shrink-0 flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-slate-900 border-l border-white/5">
        <div className="w-full max-w-sm">
          {/* Mobile Header (visible only on small screens) */}
          <div className="lg:hidden mb-10 flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white text-center">
              MIS Platform
            </h2>
          </div>

          {!otpStep ? (
            <>
              <div className="mb-10 text-center lg:text-left">
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                  Welcome back
                </h1>
                <p className="text-slate-400 text-base">
                  Sign in to your account to continue
                </p>
              </div>

              {/* Server Error Banner */}
              {serverError && (
                <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-sm font-medium shadow-sm">
                  <svg
                    className="w-5 h-5 shrink-0 mt-0.5 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                    />
                  </svg>
                  <span>{serverError}</span>
                </div>
              )}

              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="space-y-6"
              >
                {/* Email Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-300"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg
                        className="w-5 h-5 text-slate-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      {...register("email")}
                      className={`w-full pl-11 pr-4 py-3.5 bg-slate-800 border rounded-xl text-slate-100 placeholder-slate-500 text-base outline-none transition-all duration-200 focus:ring-4 ${
                        errors.email
                          ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20 bg-red-500/5"
                          : "border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-slate-600"
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-400 text-sm flex items-center gap-1.5 mt-1">
                      <svg
                        className="w-4 h-4 shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-300"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg
                        className="w-5 h-5 text-slate-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      {...register("password")}
                      className={`w-full pl-11 pr-12 py-3.5 bg-slate-800 border rounded-xl text-slate-100 placeholder-slate-500 text-base outline-none transition-all duration-200 focus:ring-4 ${
                        errors.password
                          ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20 bg-red-500/5"
                          : "border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-slate-600"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-400 text-sm flex items-center gap-1.5 mt-1">
                      <svg
                        className="w-4 h-4 shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Forgot Password */}
                <div className="flex justify-end -mt-2">
                  <a
                    href="/forgot"
                    className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-base shadow-lg shadow-indigo-600/20 transition-all duration-200 flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="w-5 h-5 animate-spin text-white/70"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* OTP Verification Step */
            <>
              <div className="mb-10 text-center lg:text-left">
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                  Verify OTP
                </h1>
                <p className="text-slate-400 text-base">
                  We sent a 6-digit code to your email. Enter it below to
                  continue.
                </p>
              </div>

              {otpError && (
                <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-sm font-medium shadow-sm">
                  <svg
                    className="w-5 h-5 shrink-0 mt-0.5 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                    />
                  </svg>
                  <span>{otpError}</span>
                </div>
              )}

              <div className="space-y-8">
                {/* OTP Input Boxes */}
                <div
                  className="flex justify-center gap-3"
                  onPaste={handleOtpPaste}
                >
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-semibold bg-slate-800 border border-slate-700 rounded-xl text-slate-100 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 hover:border-slate-600"
                    />
                  ))}
                </div>

                {/* Verify Button */}
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isVerifying}
                  className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-base shadow-lg shadow-indigo-600/20 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <svg
                        className="w-5 h-5 animate-spin text-white/70"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </button>

                {/* Resend OTP */}
                <div className="text-center">
                  <p className="text-slate-400 text-sm">
                    Didn&apos;t receive the code?{" "}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0}
                      className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors disabled:text-slate-600 disabled:cursor-not-allowed"
                    >
                      {resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : "Resend OTP"}
                    </button>
                  </p>
                </div>

                {/* Back to login */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep(false);
                      setOtp(["", "", "", "", "", ""]);
                      setOtpError(null);
                      setUserId(null);
                    }}
                    className="text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors"
                  >
                    Back to login
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

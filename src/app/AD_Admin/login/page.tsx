"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

function AdminLoginFormInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const nextPath = searchParams?.get("next");
  const isInactiveTimeout = searchParams?.get("reason") === "inactivity";

  const isCleanUrl =
    pathname === "/login" ||
    (typeof window !== "undefined" &&
      (window.location.hostname === "admin.leadershipcovenant.com.pk" ||
        window.location.hostname.startsWith("admin.")));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Database health check state
  const [healthStatus, setHealthStatus] = useState<
    "checking" | "connected" | "standby"
  >("checking");
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  // Run database health check on page load to keep database alive and warm
  useEffect(() => {
    let active = true;

    async function checkHealth() {
      try {
        const start = Date.now();
        const res = await fetch("/api/admin/health", { cache: "no-store" });
        const elapsed = Date.now() - start;

        if (!active) return;

        if (res.ok) {
          const data = await res.json();
          setLatencyMs(data.latencyMs || elapsed);
          if (data.connected) {
            setHealthStatus("connected");
          } else {
            setHealthStatus("standby");
          }
        } else {
          setHealthStatus("standby");
        }
      } catch {
        if (active) setHealthStatus("standby");
      }
    }

    checkHealth();

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError("Please enter both your email address and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(
          json.error ||
            "Invalid email or password. Please verify your credentials."
        );
      }

      let safeDestination = isCleanUrl ? "/" : "/AD_Admin";
      if (nextPath) {
        if (isCleanUrl) {
          safeDestination = nextPath.startsWith("/AD_Admin")
            ? nextPath.replace("/AD_Admin", "") || "/"
            : nextPath;
        } else {
          safeDestination = nextPath.startsWith("/AD_Admin")
            ? nextPath
            : `/AD_Admin${nextPath.startsWith("/") ? nextPath : `/${nextPath}`}`;
        }
      }

      router.replace(safeDestination);
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#E6F8F3] via-[#D5F2EB] to-[#BEECE1] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Mint & Amber Brand Atmospheric Light Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#10B981]/25 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-[#FFC400]/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-[#34D399]/20 blur-3xl pointer-events-none" />

      {/* Main Glassmorphic Login Card */}
      <div className="w-full max-w-4xl relative z-10 my-auto">
        <div className="rounded-3xl bg-white/85 backdrop-blur-2xl border border-white/70 shadow-[0_24px_65px_-12px_rgba(16,185,129,0.25),0_12px_30px_-8px_rgba(0,27,51,0.08)] overflow-hidden flex flex-col md:flex-row">
          {/* Top Brand Accent Line */}
          <div className="h-2 w-full md:hidden bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#10B981]" />

          {/* LEFT PANEL: Logo & Executive Branding */}
          <div className="w-full md:w-5/12 bg-gradient-to-br from-[#001B33] via-[#08294A] to-[#041D35] p-8 md:p-10 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Top signature gradient line on desktop */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#10B981]" />

            {/* Subtle brand glow behind logo */}
            <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-[#10B981]/20 blur-2xl pointer-events-none" />

            {/* Left Panel Upper Content */}
            <div className="relative z-10">
              {/* Logo Card */}
              <div className="w-20 h-20 rounded-2xl bg-white p-2.5 shadow-xl border-2 border-[#FFC400]/80 flex items-center justify-center mb-6">
                <img
                  src="/Logo_For_Navbar_Fotter.png"
                  alt="The Leadership Covenant"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Title & Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 text-[#34D399] text-[11px] font-extrabold uppercase tracking-widest mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
                Executive Access
              </div>

              <h1 className="font-serif font-black text-2xl md:text-3xl text-white leading-tight">
                Admin Portal Login
              </h1>

              <p className="text-xs md:text-sm text-[#D7F5EF]/90 font-medium mt-2 leading-relaxed">
                The Leadership Covenant management portal for registrations,
                activity bookings, payments, and site content.
              </p>

              {/* Clean Executive Feature List */}
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 text-xs text-white/90">
                  <div className="w-6 h-6 rounded-lg bg-[#FF7900]/20 border border-[#FF7900]/40 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FFC400]" />
                  </div>
                  <span className="font-semibold">Activity Registrations &amp; CRM</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-white/90">
                  <div className="w-6 h-6 rounded-lg bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                  </div>
                  <span className="font-semibold">Payment Screenshots &amp; Verification</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-white/90">
                  <div className="w-6 h-6 rounded-lg bg-[#0284C7]/20 border border-[#0284C7]/40 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#38BDF8]" />
                  </div>
                  <span className="font-semibold">Full Website CMS Management</span>
                </div>
              </div>
            </div>

            {/* Left Panel Lower Footer */}
            <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
              <p className="text-[11px] text-[#A5C7DF] font-medium flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#FFC400]" />
                <span>Protected Executive Portal • Authorized Only</span>
              </p>
            </div>
          </div>

          {/* RIGHT PANEL: Clean, Colorful Login Form */}
          <div className="w-full md:w-7/12 p-7 sm:p-9 md:p-10 bg-white/95 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="mb-6">
                <h2 className="font-serif font-extrabold text-2xl text-[#001B33]">
                  Sign In to Your Account
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your registered Gmail address and password to continue.
                </p>
              </div>

              {/* Inactivity Alert Banner */}
              {isInactiveTimeout && !error && (
                <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#FF7900]" />
                  <span>
                    Your session was automatically closed after 15 minutes of
                    inactivity for your protection. Please sign in again.
                  </span>
                </div>
              )}

              {/* Error Message Alert Banner */}
              {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {/* The Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="admin-email"
                    className="block text-xs font-bold text-[#001B33] mb-1.5 uppercase tracking-wider"
                  >
                    Admin Email Address (Gmail)
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-[#10B981] absolute left-3.5 pointer-events-none" />
                    <input
                      id="admin-email"
                      type="email"
                      required
                      autoComplete="username"
                      placeholder="admin@gmail.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#C8EFE6] bg-[#EFFBF8]/50 hover:bg-[#EFFBF8]/80 focus:bg-white text-sm font-semibold text-[#001B33] placeholder:text-slate-400 focus:outline-none focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/15 transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="admin-password"
                    className="block text-xs font-bold text-[#001B33] mb-1.5 uppercase tracking-wider"
                  >
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-[#FF7900] absolute left-3.5 pointer-events-none" />
                    <input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError(null);
                      }}
                      className="w-full pl-10 pr-11 py-3 rounded-xl border border-[#C8EFE6] bg-[#EFFBF8]/50 hover:bg-[#EFFBF8]/80 focus:bg-white text-sm font-semibold text-[#001B33] placeholder:text-slate-400 focus:outline-none focus:border-[#FF7900] focus:ring-4 focus:ring-[#FF7900]/15 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 p-1 text-slate-400 hover:text-[#001B33] cursor-pointer transition-colors"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Security Helper Note */}
                <div className="pt-1 text-[11px] text-slate-500 font-medium">
                  Automatic sign out after 15 minutes of inactivity for your
                  security.
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#FF7900] via-[#FF6D00] to-[#E56D00] hover:from-[#E56D00] hover:to-[#CC5F00] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-[#FF7900]/25 transition-all inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing In to Portal…</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Admin Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Panel Bottom Return Link */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-600">
                The Leadership Covenant
              </span>
              <a
                href={isCleanUrl ? "https://leadershipcovenant.com.pk" : "/"}
                className="font-bold text-[#001B33] hover:text-[#FF7900] transition-colors"
              >
                ← Return to Website
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM OF PAGE: Subtle Glassy Live Database Health Indicator */}
      <div className="mt-5 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/60 shadow-sm text-[11px] font-semibold text-slate-700">
          {healthStatus === "checking" && (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-slate-600">
                Verifying database &amp; server connection…
              </span>
            </>
          )}

          {healthStatus === "connected" && (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-800">
                Database &amp; Server Online
              </span>
              {latencyMs !== null && (
                <span className="text-[10px] text-emerald-600 font-mono">
                  ({latencyMs}ms)
                </span>
              )}
            </>
          )}

          {healthStatus === "standby" && (
            <>
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              <span className="text-teal-800">
                Database Standby • Zero-Downtime Engine Active
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-[#E6F8F3] via-[#D5F2EB] to-[#BEECE1] flex items-center justify-center text-[#001B33] text-sm font-bold">
          Loading Admin Portal…
        </div>
      }
    >
      <AdminLoginFormInner />
    </Suspense>
  );
}

"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Loader2,
  AlertCircle,
  KeyRound,
} from "lucide-react";

function AdminLoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams?.get("next") || "/AD_Admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(
          json.error || "Invalid credentials. Please check email and password."
        );
      }

      if (typeof window !== "undefined" && json.token) {
        window.sessionStorage.setItem(
          "tlc_admin_jwt_preview",
          `${String(json.token).slice(0, 16)}...`
        );
      }

      const safeDestination = nextPath.startsWith("/AD_Admin")
        ? nextPath
        : "/AD_Admin";
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
    <div className="min-h-screen w-full bg-gradient-to-br from-[#001B33] via-[#0A2747] to-[#001324] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Subtle Ambient Brand Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#FF7900]/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#34D399]/15 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="rounded-3xl bg-white border-2 border-[#BCE8DF] shadow-[0_28px_70px_rgba(0,0,0,0.45)] overflow-hidden">
          {/* Signature Colorful Top Bar */}
          <div className="h-2 w-full bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#10B981]" />

          {/* Midnight Navy Header */}
          <div className="bg-gradient-to-r from-[#001B33] via-[#102E4D] to-[#001B33] px-7 py-6 text-white flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white p-1.5 border-2 border-[#FFC400]/75 shadow-md shrink-0 flex items-center justify-center">
              <img
                src="/Logo_For_Navbar_Fotter.png"
                alt="The Leadership Covenant"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#FFC400] block">
                Hidden Executive Portal
              </span>
              <h1 className="font-serif font-extrabold text-xl sm:text-2xl text-white leading-tight mt-0.5">
                Admin Sign In
              </h1>
              <p className="text-xs text-[#D7F5EF] mt-0.5">
                CRM, Activity Bookings &amp; Website CMS
              </p>
            </div>
          </div>

          {/* Login Form Body */}
          <form onSubmit={handleSubmit} className="p-7 space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5"
              >
                Admin Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-[#102E4D]/60 absolute left-3.5 pointer-events-none" />
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="username"
                  placeholder="admin@gamail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-[#C8EFE6] bg-[#EFFBF8]/50 focus:bg-white text-sm font-semibold text-[#102E4D] placeholder:text-slate-400 focus:outline-none focus:border-[#102E4D] transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5"
              >
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-[#102E4D]/60 absolute left-3.5 pointer-events-none" />
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 rounded-xl border-2 border-[#C8EFE6] bg-[#EFFBF8]/50 focus:bg-white font-num text-sm font-semibold text-[#102E4D] placeholder:text-slate-400 focus:outline-none focus:border-[#102E4D] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 p-1 text-slate-400 hover:text-[#102E4D] cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-[#EFFBF8] border border-[#C8EFE6] px-3.5 py-2.5 flex items-center justify-between text-[11px] text-[#102E4D]">
              <span className="inline-flex items-center gap-1.5 font-bold">
                <KeyRound className="w-3.5 h-3.5 text-[#FF7900]" />
                HS256 Signed JWT Session
              </span>
              <span className="inline-flex items-center gap-1 text-[#15803D] font-extrabold">
                <ShieldCheck className="w-3.5 h-3.5" />
                24h HttpOnly
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] hover:from-[#E56D00] hover:to-[#CC5F00] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-[#FF7900]/25 transition-all inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 active:scale-98"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating &amp; Issuing JWT…</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="px-7 py-3.5 bg-[#F8FCFB] border-t border-[#E2F4EF] flex items-center justify-between text-xs text-slate-500">
            <span>The Leadership Covenant</span>
            <Link
              href="/"
              className="font-bold text-[#102E4D] hover:text-[#FF7900] transition-colors"
            >
              ← Return to Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#001B33] flex items-center justify-center text-white text-sm font-bold">
          Loading Admin Portal…
        </div>
      }
    >
      <AdminLoginFormInner />
    </Suspense>
  );
}


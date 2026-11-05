"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  CalendarCheck2,
  ShieldCheck,
  MessageSquareText,
  Clock,
  Image as ImageIcon,
  ArrowRight,
  Layers,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  BarChart3,
  PieChart,
  Filter,
  Zap,
  Activity,
  PhoneCall,
  FileCheck2,
  ChevronRight,
  Mail,
  Building2,
  Calendar,
  Sparkles,
} from "lucide-react";
import type {
  ActivityRegistrationRecord,
  ContactSubmissionRecord,
} from "@/lib/supabase-store";

interface DashboardData {
  contactStats: {
    total: number;
    newCount: number;
    inProgressCount: number;
    respondedCount: number;
    archivedCount: number;
    urgentCount: number;
  };
  registrationStats: {
    total: number;
    securedSeats: number;
    provisionalReservations: number;
    verifiedConfirmed: number;
    awaitingVerification: number;
    pendingCallback: number;
    withScreenshots: number;
  };
  activityBreakdown: Array<{
    slug: string;
    title: string;
    city: string;
    startDate: string;
    total: number;
    reserved: number;
    secured: number;
    verified: number;
  }>;
  recentContacts: ContactSubmissionRecord[];
  recentRegistrations: ActivityRegistrationRecord[];
  systemHealth?: {
    firebase?: {
      configured: boolean;
      connected: boolean;
      provider: string;
      message: string;
    };
    supabase?: {
      configured: boolean;
      connected: boolean;
      provider: "supabase" | "local_json";
      message: string;
    };
    cloudinary?: {
      configured: boolean;
      cloudName: string | null;
      folder: string;
      provider: string;
    };
    jwt?: {
      email: string;
      expiresAt: string;
    };
  };
}

function getInitials(name?: string) {
  if (!name) return "TC";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setLoading(true);
    try {
      const res = await fetch(`/api/admin/stats${isRefresh ? "?fresh=1" : ""}`, {
        cache: "no-store",
      });
      if (res.status === 401) {
        if (typeof window !== "undefined") {
          window.location.href = window.location.pathname.startsWith("/AD_Admin")
            ? "/AD_Admin/login?reason=inactivity"
            : "/login?reason=inactivity";
        }
        return;
      }
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (typeof window !== "undefined") {
          try {
            window.sessionStorage.setItem(
              "tlc_admin_dashboard_cache",
              JSON.stringify(json)
            );
            window.localStorage.setItem(
              "tlc_admin_dashboard_cache",
              JSON.stringify(json)
            );
          } catch {
            // Storage quota or error
          }
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    try {
      const cached =
        window.sessionStorage.getItem("tlc_admin_dashboard_cache") ||
        window.localStorage.getItem("tlc_admin_dashboard_cache");
      if (cached) {
        setData(JSON.parse(cached));
      }
    } catch {
      // Fallback
    }
    loadDashboard();
  }, [loadDashboard]);

  // Loading skeleton matching layout during SSR/initial hydration
  if (!mounted && !data) {
    return (
      <div className="space-y-5 sm:space-y-6 animate-pulse">
        <div className="h-32 sm:h-36 rounded-2xl sm:rounded-3xl bg-white border border-[#C8EFE6]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-28 sm:h-32 rounded-2xl bg-white border border-[#C8EFE6]"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          <div className="lg:col-span-7 h-72 sm:h-80 rounded-2xl bg-white border border-[#C8EFE6]" />
          <div className="lg:col-span-5 h-72 sm:h-80 rounded-2xl bg-white border border-[#C8EFE6]" />
        </div>
      </div>
    );
  }

  const reg = data?.registrationStats || {
    total: 0,
    securedSeats: 0,
    provisionalReservations: 0,
    verifiedConfirmed: 0,
    awaitingVerification: 0,
    pendingCallback: 0,
    withScreenshots: 0,
  };

  const con = data?.contactStats || {
    total: 0,
    newCount: 0,
    inProgressCount: 0,
    respondedCount: 0,
    archivedCount: 0,
    urgentCount: 0,
  };

  const totalReg = reg.total || 0;
  const securedPct = totalReg > 0 ? Math.round((reg.securedSeats / totalReg) * 100) : 0;
  const verifiedPct = reg.securedSeats > 0 ? Math.round((reg.verifiedConfirmed / reg.securedSeats) * 100) : 0;
  const inquiryResPct = con.total > 0 ? Math.round((con.respondedCount / con.total) * 100) : 0;

  // Cohort maximum calculation for relative bar charts
  const maxCohortTotal = Math.max(
    ...(data?.activityBreakdown?.map((a) => a.total) || [1]),
    1
  );

  // SVG Donut calculation - compact 36px radius
  const donutRadius = 36;
  const donutCircumference = 2 * Math.PI * donutRadius; // ~226.19

  const funnelSegments = [
    {
      label: "Verified Confirmed",
      count: reg.verifiedConfirmed,
      color: "#10B981", // Emerald
      bgClass: "bg-[#10B981]",
    },
    {
      label: "Awaiting Verification",
      count: reg.awaitingVerification,
      color: "#38BDF8", // Sky Blue
      bgClass: "bg-[#38BDF8]",
    },
    {
      label: "Provisional Reserved",
      count: reg.provisionalReservations,
      color: "#FF7900", // Orange
      bgClass: "bg-[#FF7900]",
    },
    {
      label: "Pending Callback",
      count: reg.pendingCallback,
      color: "#F59E0B", // Amber
      bgClass: "bg-[#F59E0B]",
    },
  ];

  // Calculate SVG stroke offset for each segment
  let accumulatedOffset = 0;
  const renderedSegments = funnelSegments.map((segment) => {
    const fraction = totalReg > 0 ? segment.count / totalReg : 0;
    const strokeDash = fraction * donutCircumference;
    const currentOffset = accumulatedOffset;
    accumulatedOffset += strokeDash;
    return {
      ...segment,
      strokeDasharray: `${strokeDash} ${donutCircumference}`,
      strokeDashoffset: -currentOffset,
      percentage: totalReg > 0 ? Math.round(fraction * 100) : 0,
    };
  });

  return (
    <div className="space-y-5 sm:space-y-6 max-w-full overflow-x-hidden">
      {/* ────────────────── 1. EXECUTIVE WELCOME HERO BANNER ────────────────── */}
      <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#001B33] via-[#0A2540] to-[#001B33] text-white p-4.5 sm:p-7 lg:p-8 shadow-xl relative overflow-hidden border border-white/10 select-none">
        {/* Signature colored top stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#10B981]" />

        {/* Ambient atmospheric gradients */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-gradient-to-br from-[#FF7900]/20 to-[#FFC400]/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -top-16 w-80 h-80 rounded-full bg-gradient-to-br from-[#10B981]/20 to-transparent blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6 relative z-10">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shrink-0" />
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.14em] sm:tracking-[0.16em] text-[#FFC400] truncate">
                The Leadership Covenant • Executive Command Center
              </span>
            </div>
            <h1 className="font-serif font-black text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight">
              Welcome Admin to Portal
            </h1>
            <p className="text-xs sm:text-sm text-[#D7F5EF] max-w-2xl leading-relaxed">
              Live executive overview of registrations, revenue pipeline, attendee enrollments, and inquiries across all leadership programs.
            </p>
          </div>

          {/* Action Hub Buttons (Responsive grid on mobile, horizontal on tablet/desktop) */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-2.5 w-full lg:w-auto shrink-0">
            <Link
              href="/AD_Admin/registrations"
              prefetch={true}
              className="col-span-2 sm:col-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] hover:from-[#E56D00] hover:to-[#CC6200] text-white text-xs font-extrabold uppercase tracking-wider inline-flex items-center justify-center gap-2 shadow-lg shadow-[#FF7900]/25 transition-all active:scale-95 cursor-pointer text-center"
            >
              <CalendarCheck2 className="w-4 h-4 shrink-0" />
              <span className="truncate">Manage Registrations</span>
            </Link>
            <Link
              href="/AD_Admin/cms"
              prefetch={true}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-extrabold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer text-center"
            >
              <Layers className="w-4 h-4 text-[#FFC400] shrink-0" />
              <span>Open CMS</span>
            </Link>
            <button
              type="button"
              onClick={() => loadDashboard(true)}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white cursor-pointer active:scale-95 transition-all inline-flex items-center justify-center gap-1.5"
              title="Refresh dashboard statistics"
              aria-label="Refresh dashboard statistics"
            >
              <RefreshCw
                className={`w-4 h-4 shrink-0 ${loading ? "animate-spin text-[#FFC400]" : "text-slate-200"}`}
              />
              <span className="sm:hidden text-xs font-bold">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* ────────────────── 2. HIGH-IMPACT KPI METRICS CARDS ────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Total Registrations */}
        <div className="rounded-2xl bg-white border-2 border-[#C8EFE6] p-4 sm:p-5 shadow-xs space-y-2.5 sm:space-y-3 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Total Registrations
            </span>
            <span className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl bg-[#EFFBF8] border border-[#C8EFE6] flex items-center justify-center text-[#102E4D]">
              <Users className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <div className="font-num font-black text-2xl sm:text-3xl xl:text-4xl text-[#102E4D]" suppressHydrationWarning>
              {reg.total}
            </div>
            <span className="text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-[#EFFBF8] text-[#102E4D] border border-[#C8EFE6] shrink-0">
              {securedPct}% Secured
            </span>
          </div>
          {/* Mini progress bar */}
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-[#10B981] transition-all duration-500"
              style={{ width: `${securedPct}%` }}
              title={`Secured: ${securedPct}%`}
            />
            <div
              className="h-full bg-[#FF7900] transition-all duration-500"
              style={{ width: `${100 - securedPct}%` }}
              title={`Reserved: ${100 - securedPct}%`}
            />
          </div>
          <div className="text-[11px] sm:text-xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100 flex-wrap gap-1" suppressHydrationWarning>
            <span>
              <strong className="text-[#10B981]">{reg.securedSeats}</strong> Secured
            </span>
            <span>
              <strong className="text-[#FF7900]">{reg.provisionalReservations}</strong> Reserved
            </span>
          </div>
        </div>

        {/* Card 2: Secured Paid Seats */}
        <div className="rounded-2xl bg-white border-2 border-[#BCE8DF] p-4 sm:p-5 shadow-xs space-y-2.5 sm:space-y-3 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Secured Paid Seats
            </span>
            <span className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl bg-[#DCFCE7] border border-[#86EFAC] flex items-center justify-center text-[#15803D]">
              <ShieldCheck className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <div className="font-num font-black text-2xl sm:text-3xl xl:text-4xl text-[#15803D]" suppressHydrationWarning>
              {reg.securedSeats}
            </div>
            <span className="text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] shrink-0">
              {verifiedPct}% Verified
            </span>
          </div>
          {/* Mini verification bar */}
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-[#15803D] transition-all duration-500"
              style={{ width: `${verifiedPct}%` }}
              title={`Verified: ${verifiedPct}%`}
            />
          </div>
          <div className="text-[11px] sm:text-xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100 flex-wrap gap-1" suppressHydrationWarning>
            <span className="inline-flex items-center gap-1 truncate">
              <ImageIcon className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
              <strong>{reg.withScreenshots}</strong> Proofs
            </span>
            <span className="shrink-0">
              <strong className="text-[#15803D]">{reg.verifiedConfirmed}</strong> Confirmed
            </span>
          </div>
        </div>

        {/* Card 3: Pending Action Queue */}
        <div className="rounded-2xl bg-white border-2 border-[#FDE68A] p-4 sm:p-5 shadow-xs space-y-2.5 sm:space-y-3 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Pending Action Queue
            </span>
            <span className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#D97706]">
              <Clock className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <div className="font-num font-black text-2xl sm:text-3xl xl:text-4xl text-[#D97706]" suppressHydrationWarning>
              {reg.awaitingVerification + reg.pendingCallback}
            </div>
            <span className="text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] shrink-0">
              Urgent
            </span>
          </div>
          {/* Mini split bar */}
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-[#0284C7]"
              style={{
                width: `${
                  (reg.awaitingVerification /
                    Math.max(reg.awaitingVerification + reg.pendingCallback, 1)) *
                  100
                }%`,
              }}
              title="Awaiting verification"
            />
            <div
              className="h-full bg-[#F59E0B]"
              style={{
                width: `${
                  (reg.pendingCallback /
                    Math.max(reg.awaitingVerification + reg.pendingCallback, 1)) *
                  100
                }%`,
              }}
              title="Pending callback"
            />
          </div>
          <div className="text-[11px] sm:text-xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100 flex-wrap gap-1" suppressHydrationWarning>
            <span>
              <strong className="text-[#0284C7]">{reg.awaitingVerification}</strong> Verify
            </span>
            <span>
              <strong className="text-[#D97706]">{reg.pendingCallback}</strong> Callback
            </span>
          </div>
        </div>

        {/* Card 4: Contact Inquiries */}
        <div className="rounded-2xl bg-white border-2 border-[#CFE6F3] p-4 sm:p-5 shadow-xs space-y-2.5 sm:space-y-3 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Contact Inquiries
            </span>
            <span className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl bg-[#EDF6FB] border border-[#CFE6F3] flex items-center justify-center text-[#0284C7]">
              <MessageSquareText className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <div className="font-num font-black text-2xl sm:text-3xl xl:text-4xl text-[#102E4D]" suppressHydrationWarning>
              {con.total}
            </div>
            <span className="text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-[#EDF6FB] text-[#0284C7] border border-[#CFE6F3] shrink-0">
              {inquiryResPct}% Responded
            </span>
          </div>
          {/* Mini response bar */}
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-[#10B981] transition-all duration-500"
              style={{ width: `${inquiryResPct}%` }}
              title={`Responded: ${inquiryResPct}%`}
            />
            <div
              className="h-full bg-[#FF7900] transition-all duration-500"
              style={{ width: `${100 - inquiryResPct}%` }}
              title={`New / In Progress: ${100 - inquiryResPct}%`}
            />
          </div>
          <div className="text-[11px] sm:text-xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100 flex-wrap gap-1" suppressHydrationWarning>
            <span className="text-[#FF7900] font-bold">
              {con.newCount} New
            </span>
            <span>
              <strong className="text-[#10B981]">{con.respondedCount}</strong> Responded
            </span>
          </div>
        </div>
      </div>

      {/* ────────────────── 3. VISUAL ANALYTICS & OPERATIONS SECTION ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        {/* Left Column (lg:col-span-7): Activity Enrollment Analytics Bar Visualizer */}
        <div className="lg:col-span-7 h-full rounded-2xl bg-white border-2 border-[#C8EFE6] shadow-xs overflow-hidden flex flex-col">
          <div className="px-3.5 sm:px-4.5 py-3 sm:py-3.5 bg-gradient-to-r from-[#EFFBF8] via-white to-[#DDEFF7]/50 border-b border-[#C8EFE6] flex items-center justify-between shrink-0 gap-2">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
              <span className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-[#0284C7] to-[#0369A1] text-white flex items-center justify-center shadow-xs shrink-0">
                <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-serif font-bold text-xs sm:text-base text-[#102E4D] truncate leading-tight">
                  Activity Enrollment Analytics
                </h3>
                <p className="text-[10px] sm:text-[10.5px] text-slate-500 truncate">
                  Live capacity and registrations across active programs
                </p>
              </div>
            </div>
            <Link
              href="/AD_Admin/registrations"
              prefetch={true}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] hover:from-[#E56D00] hover:to-[#CC6200] text-white text-[10.5px] sm:text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-1 sm:gap-1.5 shadow-sm shadow-[#FF7900]/25 transition-all active:scale-95 shrink-0 whitespace-nowrap"
            >
              <span><span className="hidden xs:inline sm:inline">View </span>CRM</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </Link>
          </div>

          <div
            className="p-3.5 sm:p-4.5 space-y-2.5 flex-1 min-h-0 max-h-[640px] overflow-y-auto pr-2 scroll-smooth overscroll-y-contain [will-change:scroll-position] [-webkit-overflow-scrolling:touch] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-track]:bg-[#EFFBF8] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-[#0284C7] [&::-webkit-scrollbar-thumb]:via-[#10B981] [&::-webkit-scrollbar-thumb]:to-[#FF7900] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:brightness-110"
            style={{ scrollbarColor: "#10B981 #EFFBF8" }}
          >
            {(data?.activityBreakdown || []).map((act) => {
              const cohortSecuredPct = act.total > 0 ? Math.round((act.secured / act.total) * 100) : 0;
              const barFillWidth = Math.max(Math.round((act.total / maxCohortTotal) * 100), act.total > 0 ? 12 : 4);

              return (
                <div
                  key={act.slug}
                  className="p-3 sm:p-3.5 rounded-xl border border-slate-100 hover:border-[#10B981]/50 bg-[#FAFCFB] hover:bg-[#EFFBF8]/50 transition-all space-y-2 group shadow-2xs hover:shadow-xs relative overflow-hidden"
                >
                  {/* Subtle left gradient indicator */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#0284C7] via-[#10B981] to-[#FF7900] opacity-60 group-hover:opacity-100 transition-opacity" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pl-1.5 sm:pl-2">
                    <div className="min-w-0">
                      <Link
                        href={`/AD_Admin/registrations?activity=${encodeURIComponent(act.slug)}`}
                        prefetch={true}
                        className="font-bold text-xs sm:text-sm text-[#102E4D] group-hover:text-[#FF7900] transition-colors truncate block"
                      >
                        {act.title}
                      </Link>
                      <div className="flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-400 mt-0.5">
                        <span className="text-slate-600 font-bold">{act.city}</span>
                        {act.startDate ? <span>• {act.startDate}</span> : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 font-num text-[10.5px] sm:text-[11px] pt-1 sm:pt-0 flex-wrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[#102E4D] font-black border border-slate-200">
                        {act.total} Total
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#DCFCE7] text-[#15803D] font-extrabold border border-[#86EFAC]">
                        {act.secured} Secured
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#FEF3C7] text-[#B45309] font-extrabold border border-[#FDE68A]">
                        {act.reserved} Reserved
                      </span>
                    </div>
                  </div>

                  {/* Multi-tier Progress Bar */}
                  <div className="space-y-1 pl-1.5 sm:pl-2">
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex p-0.5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#10B981] to-[#047857] transition-all duration-700"
                        style={{
                          width: `${(act.secured / Math.max(act.total, 1)) * barFillWidth}%`,
                        }}
                        title={`Secured: ${act.secured}`}
                      />
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#FF7900] to-[#E56D00] transition-all duration-700 ml-0.5"
                        style={{
                          width: `${(act.reserved / Math.max(act.total, 1)) * barFillWidth}%`,
                        }}
                        title={`Reserved: ${act.reserved}`}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-num">
                      <span>Conversion: <strong className="text-[#15803D]">{cohortSecuredPct}%</strong></span>
                      <span>Verified: <strong className="text-[#0284C7]">{act.verified}</strong></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (lg:col-span-5): STACK OF REGISTRATION FUNNEL + ACTION & CRM HUB */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-5 sm:gap-6">
          {/* Top of Stack: Registration Funnel (Compact & Proper) */}
          <div className="rounded-2xl bg-white border-2 border-[#C8EFE6] shadow-xs overflow-hidden flex flex-col">
            <div className="px-4.5 py-3.5 bg-gradient-to-r from-[#EFFBF8] via-white to-[#DDEFF7]/50 border-b border-[#C8EFE6] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF7900] to-[#E56D00] text-white flex items-center justify-center shadow-xs shrink-0">
                  <Filter className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-serif font-bold text-sm sm:text-base text-[#102E4D] truncate">
                    Registration Funnel
                  </h3>
                  <p className="text-[10.5px] text-slate-500 truncate">
                    Seat distribution by booking state
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-num font-black px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] shrink-0">
                {securedPct}% Secured
              </span>
            </div>

            <div className="p-4 sm:p-5 space-y-3.5">
              {/* Donut and Legend side-by-side */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* SVG Donut Ring */}
                <div className="relative shrink-0 flex items-center justify-center">
                  <svg className="w-28 h-28 sm:w-32 sm:h-32 -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r={donutRadius}
                      fill="transparent"
                      stroke="#F1F5F9"
                      strokeWidth="10"
                    />

                    {totalReg > 0 ? (
                      renderedSegments.map((segment) =>
                        segment.count > 0 ? (
                          <circle
                            key={segment.label}
                            cx="50"
                            cy="50"
                            r={donutRadius}
                            fill="transparent"
                            stroke={segment.color}
                            strokeWidth="10"
                            strokeDasharray={segment.strokeDasharray}
                            strokeDashoffset={segment.strokeDashoffset}
                            strokeLinecap="round"
                            className="transition-all duration-700"
                          />
                        ) : null
                      )
                    ) : (
                      <circle
                        cx="50"
                        cy="50"
                        r={donutRadius}
                        fill="transparent"
                        stroke="#E2E8F0"
                        strokeWidth="10"
                      />
                    )}
                  </svg>

                  {/* Center Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                    <span className="font-num font-black text-xl text-[#102E4D]" suppressHydrationWarning>
                      {securedPct}%
                    </span>
                    <span className="text-[8.5px] font-extrabold uppercase tracking-wider text-[#FF7900]">
                      Secured
                    </span>
                    <span className="text-[8px] font-semibold text-slate-400">
                      {reg.securedSeats}/{totalReg}
                    </span>
                  </div>
                </div>

                {/* Legend list right next to donut */}
                <div className="flex-1 w-full space-y-1.5">
                  {renderedSegments.map((seg) => (
                    <div key={seg.label} className="flex items-center justify-between text-xs py-0.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2 h-2 rounded-full ${seg.bgClass} shrink-0`} />
                        <span className="font-semibold text-slate-600 text-[11px] truncate">{seg.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 font-num">
                        <span className="font-black text-[#102E4D] text-xs" suppressHydrationWarning>{seg.count}</span>
                        <span className="text-[10px] text-slate-400 font-bold" suppressHydrationWarning>({seg.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom 2 micro-indicators */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div className="p-2 rounded-xl bg-[#EFFBF8] border border-[#C8EFE6] text-center">
                  <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider block">
                    UBL Confirmed
                  </span>
                  <span className="font-num font-black text-sm text-[#15803D]" suppressHydrationWarning>
                    {verifiedPct}%
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-[#EDF6FB] border border-[#CFE6F3] text-center">
                  <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider block">
                    Inquiry Resolved
                  </span>
                  <span className="font-num font-black text-sm text-[#0284C7]" suppressHydrationWarning>
                    {inquiryResPct}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom of Stack: Action & CRM Hub (Reduced Content with Clean Graphical Representation) */}
          <div className="rounded-2xl bg-white border-2 border-[#C8EFE6] shadow-xs overflow-hidden flex flex-col">
            <div className="px-4.5 py-3.5 bg-gradient-to-r from-[#EFFBF8] via-white to-[#DDEFF7]/50 border-b border-[#C8EFE6] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] text-white flex items-center justify-center shadow-xs shrink-0">
                  <Zap className="w-4 h-4 text-[#FFC400]" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-serif font-bold text-sm sm:text-base text-[#102E4D] truncate">
                    Action &amp; CRM Hub
                  </h3>
                  <p className="text-[10.5px] text-slate-500 truncate">
                    Operational workload &amp; queue distribution
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-num font-black px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] shrink-0">
                {reg.awaitingVerification + reg.pendingCallback + con.newCount} Active
              </span>
            </div>

            <div className="p-4 sm:p-5 space-y-3.5">
              {/* 1. Multi-Segment Graphical Workload Ratio Strip */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Queue Load Distribution</span>
                  </span>
                  <span className="font-num text-[#102E4D] font-extrabold text-[10.5px]">
                    {reg.awaitingVerification + reg.pendingCallback + con.newCount > 0 ? "Pending Follow-up" : "All Clear"}
                  </span>
                </div>

                {/* Multi-Segment Graphical Meter Bar */}
                <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden flex p-0.5">
                  <div
                    className="h-full rounded-full bg-[#10B981] transition-all duration-700"
                    style={{
                      width: `${
                        reg.awaitingVerification + reg.pendingCallback + con.newCount > 0
                          ? Math.round(
                              (reg.awaitingVerification /
                                Math.max(
                                  reg.awaitingVerification + reg.pendingCallback + con.newCount,
                                  1
                                )) * 100
                            )
                          : 33
                      }%`,
                    }}
                    title={`Receipts to verify: ${reg.awaitingVerification}`}
                  />
                  <div
                    className="h-full rounded-full bg-[#F59E0B] transition-all duration-700 ml-0.5"
                    style={{
                      width: `${
                        reg.awaitingVerification + reg.pendingCallback + con.newCount > 0
                          ? Math.round(
                              (reg.pendingCallback /
                                Math.max(
                                  reg.awaitingVerification + reg.pendingCallback + con.newCount,
                                  1
                                )) * 100
                            )
                          : 33
                      }%`,
                    }}
                    title={`Callbacks to make: ${reg.pendingCallback}`}
                  />
                  <div
                    className="h-full rounded-full bg-[#0284C7] transition-all duration-700 ml-0.5"
                    style={{
                      width: `${
                        reg.awaitingVerification + reg.pendingCallback + con.newCount > 0
                          ? Math.round(
                              (con.newCount /
                                Math.max(
                                  reg.awaitingVerification + reg.pendingCallback + con.newCount,
                                  1
                                )) * 100
                            )
                          : 34
                      }%`,
                    }}
                    title={`New inquiries: ${con.newCount}`}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-num pt-0.5 flex-wrap gap-1">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                    <span>Receipts (<strong>{reg.awaitingVerification}</strong>)</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                    <span>Callbacks (<strong>{reg.pendingCallback}</strong>)</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
                    <span>Inquiries (<strong>{con.newCount}</strong>)</span>
                  </span>
                </div>
              </div>

              {/* 2. Graphical Queue Velocity Bars (Clean Comparative Graph) */}
              <div className="space-y-2.5">
                {/* Graph Bar 1: Payment Proof Receipts */}
                <Link
                  href="/AD_Admin/registrations"
                  prefetch={true}
                  className="p-2 rounded-xl border border-slate-100 hover:border-[#10B981]/50 bg-[#FAFCFB] hover:bg-[#DCFCE7]/20 transition-all space-y-1 block group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-[#102E4D] group-hover:text-[#15803D] transition-colors">
                      <FileCheck2 className="w-3.5 h-3.5 text-[#10B981]" />
                      <span className="text-[11.5px]">Payment Proofs</span>
                    </div>
                    <div className="flex items-center gap-2 font-num">
                      <span className="text-[10px] text-slate-400">{reg.verifiedConfirmed} confirmed</span>
                      <span className="text-[10.5px] font-black px-1.5 py-0.2 rounded bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                        {reg.awaitingVerification} to verify
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-gradient-to-r from-[#10B981] to-[#059669] transition-all duration-700 rounded-full"
                      style={{ width: `${verifiedPct}%` }}
                    />
                  </div>
                </Link>

                {/* Graph Bar 2: Provisional Callbacks */}
                <Link
                  href="/AD_Admin/registrations"
                  prefetch={true}
                  className="p-2 rounded-xl border border-slate-100 hover:border-[#F59E0B]/50 bg-[#FAFCFB] hover:bg-[#FEF3C7]/20 transition-all space-y-1 block group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-[#102E4D] group-hover:text-[#D97706] transition-colors">
                      <PhoneCall className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span className="text-[11.5px]">Provisional Callbacks</span>
                    </div>
                    <div className="flex items-center gap-2 font-num">
                      <span className="text-[10px] text-slate-400">{reg.securedSeats} secured</span>
                      <span className="text-[10.5px] font-black px-1.5 py-0.2 rounded bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                        {reg.pendingCallback} to call
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] transition-all duration-700 rounded-full"
                      style={{ width: `${securedPct}%` }}
                    />
                  </div>
                </Link>

                {/* Graph Bar 3: Inbound Inquiries */}
                <Link
                  href="/AD_Admin/contacts"
                  prefetch={true}
                  className="p-2 rounded-xl border border-slate-100 hover:border-[#0284C7]/50 bg-[#FAFCFB] hover:bg-[#EDF6FB]/30 transition-all space-y-1 block group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-[#102E4D] group-hover:text-[#0284C7] transition-colors">
                      <MessageSquareText className="w-3.5 h-3.5 text-[#0284C7]" />
                      <span className="text-[11.5px]">Inbound Messages</span>
                    </div>
                    <div className="flex items-center gap-2 font-num">
                      <span className="text-[10px] text-slate-400">{con.respondedCount} resolved</span>
                      <span className="text-[10.5px] font-black px-1.5 py-0.2 rounded bg-[#EDF6FB] text-[#0284C7] border border-[#CFE6F3]">
                        {con.newCount} new
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-gradient-to-r from-[#0284C7] to-[#0369A1] transition-all duration-700 rounded-full"
                      style={{ width: `${inquiryResPct}%` }}
                    />
                  </div>
                </Link>
              </div>

              {/* 3. Compact 2-Button Action Bar */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                <Link
                  href="/AD_Admin/registrations"
                  prefetch={true}
                  className="py-2 px-2.5 rounded-xl bg-gradient-to-r from-[#001B33] to-[#102E4D] hover:from-[#102E4D] hover:to-[#001B33] text-white text-[11px] font-extrabold inline-flex items-center justify-center gap-1 transition-all shadow-2xs active:scale-98 truncate"
                >
                  <span>Verify ({reg.awaitingVerification})</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#FFC400] shrink-0" />
                </Link>
                <Link
                  href="/AD_Admin/contacts"
                  prefetch={true}
                  className="py-2 px-2.5 rounded-xl bg-[#EFFBF8] hover:bg-[#DCFCE7] border border-[#C8EFE6] text-[#102E4D] text-[11px] font-extrabold inline-flex items-center justify-center gap-1 transition-all shadow-2xs active:scale-98 truncate"
                >
                  <span>Inquiries ({con.newCount})</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ────────────────── 4. TWO-COLUMN LIVE ACTIVITY FEEDS ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Recent Registrations Feed */}
        <div className="rounded-2xl bg-white border-2 border-[#C8EFE6] shadow-xs overflow-hidden flex flex-col">
          <div className="px-3.5 sm:px-4.5 py-3 sm:py-3.5 bg-gradient-to-r from-[#EFFBF8] via-white to-[#DCFCE7]/30 border-b border-[#C8EFE6] flex items-center justify-between shrink-0 gap-2">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
              <span className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-[#10B981] to-[#047857] text-white flex items-center justify-center shadow-xs shrink-0">
                <CalendarCheck2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-serif font-bold text-xs sm:text-base text-[#102E4D] truncate leading-tight">
                  Recent Registrations Feed
                </h3>
                <p className="text-[10px] sm:text-[10.5px] text-slate-500 truncate">
                  Latest activity candidates &amp; applicants
                </p>
              </div>
            </div>
            <Link
              href="/AD_Admin/registrations"
              prefetch={true}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl bg-[#EFFBF8] hover:bg-[#DCFCE7] border border-[#C8EFE6] text-[#10B981] hover:text-[#047857] text-[10.5px] sm:text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-1 sm:gap-1.5 transition-all active:scale-95 shrink-0 whitespace-nowrap shadow-2xs"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </Link>
          </div>

          <div className="p-3 sm:p-4 space-y-2.5 flex-1 max-h-[480px] overflow-y-auto pr-1.5 scroll-smooth overscroll-y-contain [will-change:scroll-position] [-webkit-overflow-scrolling:touch] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-track]:bg-[#EFFBF8] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-[#10B981] [&::-webkit-scrollbar-thumb]:via-[#38BDF8] [&::-webkit-scrollbar-thumb]:to-[#FF7900] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:brightness-110">
            {(data?.recentRegistrations || []).length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No activity registrations yet. Submissions from <code>/apply</code> and <code>/summit</code> will appear here automatically.
              </div>
            ) : (
              data?.recentRegistrations.slice(0, 8).map((r, idx) => {
                const isSecured = r.booking_mode === "secure_seat";
                const isVerified = r.verification_status === "verified_confirmed";
                const isAwaiting = r.verification_status === "awaiting_verification";
                const initials = getInitials(r.full_name);

                // Alternating vibrant gradient palettes for avatars
                const avatarGradients = [
                  "from-[#10B981] to-[#047857]",
                  "from-[#0284C7] to-[#0369A1]",
                  "from-[#FF7900] to-[#E56D00]",
                  "from-[#8B5CF6] to-[#6D28D9]",
                ];
                const avatarGrad = avatarGradients[idx % avatarGradients.length];

                return (
                  <Link
                    key={r.id}
                    href={`/AD_Admin/registrations?activity=${encodeURIComponent(r.activity_slug)}`}
                    prefetch={true}
                    className="p-3 sm:p-3.5 rounded-xl border border-slate-100 hover:border-[#10B981]/50 bg-white hover:bg-[#F0FDF4]/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 group shadow-2xs hover:shadow-xs relative overflow-hidden"
                  >
                    {/* Hover indicator strip */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#10B981] to-[#FF7900] opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Left info block with avatar */}
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Initials Avatar */}
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${avatarGrad} text-white flex items-center justify-center font-black text-xs sm:text-[13px] tracking-wider shrink-0 shadow-2xs ring-2 ring-white`}
                      >
                        {initials}
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs sm:text-sm text-[#102E4D] group-hover:text-[#10B981] transition-colors truncate">
                            {r.full_name}
                          </span>
                          <span className="font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-[#EFFBF8] text-[#102E4D] border border-[#C8EFE6] shrink-0">
                            #{r.reference_code}
                          </span>
                          {r.submission_type === "summit" ? (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] uppercase shrink-0">
                              Summit
                            </span>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate flex-wrap">
                          <span className="font-semibold text-slate-700 truncate max-w-[200px] sm:max-w-[260px]">
                            {r.activity_title}
                          </span>
                          {(r.school_name || r.organization || r.phone) && (
                            <span className="text-slate-400 text-[11px] truncate">
                              • {r.school_name || r.organization || r.phone}
                            </span>
                          )}
                          {r.address_with_city && (
                            <span className="text-slate-400 text-[11px] truncate">
                              • {r.address_with_city}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right badge & status pills */}
                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-center pl-12 sm:pl-0">
                      {/* Booking Mode Pill */}
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1 shadow-2xs ${
                          isSecured
                            ? "bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]"
                            : "bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]"
                        }`}
                      >
                        {isSecured ? (
                          <>
                            <ShieldCheck className="w-3 h-3 text-[#15803D]" />
                            <span>Secured Paid</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-[#D97706]" />
                            <span>Reservation</span>
                          </>
                        )}
                      </span>

                      {/* Verification State Micro-Pill */}
                      {isVerified ? (
                        <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-[#EFFBF8] text-[#10B981] border border-[#C8EFE6] hidden md:inline-flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Confirmed</span>
                        </span>
                      ) : isAwaiting ? (
                        <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-[#EDF6FB] text-[#0284C7] border border-[#CFE6F3] hidden md:inline-flex items-center gap-1">
                          <ImageIcon className="w-2.5 h-2.5" />
                          <span>Admin Review</span>
                        </span>
                      ) : null}

                      {/* Hover action arrow */}
                      <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 group-hover:bg-[#10B981] group-hover:border-[#10B981] group-hover:text-white text-slate-400 flex items-center justify-center transition-all shadow-2xs shrink-0">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Contact Inquiries Feed */}
        <div className="rounded-2xl bg-white border-2 border-[#CFE6F3] shadow-xs overflow-hidden flex flex-col">
          <div className="px-3.5 sm:px-4.5 py-3 sm:py-3.5 bg-gradient-to-r from-[#EDF6FB] via-white to-[#CFE6F3]/30 border-b border-[#CFE6F3] flex items-center justify-between shrink-0 gap-2">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
              <span className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-[#0284C7] to-[#0369A1] text-white flex items-center justify-center shadow-xs shrink-0">
                <MessageSquareText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-serif font-bold text-xs sm:text-base text-[#102E4D] truncate leading-tight">
                  Recent Inquiries &amp; Leads
                </h3>
                <p className="text-[10px] sm:text-[10.5px] text-slate-500 truncate">
                  School, corporate and parent messages
                </p>
              </div>
            </div>
            <Link
              href="/AD_Admin/contacts"
              prefetch={true}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl bg-[#EDF6FB] hover:bg-[#CFE6F3]/50 border border-[#CFE6F3] text-[#0284C7] hover:text-[#0369A1] text-[10.5px] sm:text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-1 sm:gap-1.5 transition-all active:scale-95 shrink-0 whitespace-nowrap shadow-2xs"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-3 sm:p-4 space-y-2.5 flex-1 max-h-[480px] overflow-y-auto pr-1.5 scroll-smooth overscroll-y-contain [will-change:scroll-position] [-webkit-overflow-scrolling:touch] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-track]:bg-[#EDF6FB] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-[#0284C7] [&::-webkit-scrollbar-thumb]:via-[#38BDF8] [&::-webkit-scrollbar-thumb]:to-[#FF7900] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:brightness-110">
            {(data?.recentContacts || []).length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No contact inquiries yet. Messages submitted via <code>/contact</code> appear here in real time.
              </div>
            ) : (
              data?.recentContacts.slice(0, 8).map((c, idx) => {
                const isNew = c.crm_status === "new";
                const isResponded = c.crm_status === "responded";
                const initials = getInitials(c.full_name);

                // Alternating vibrant gradient palettes for avatars
                const avatarGradients = [
                  "from-[#0284C7] to-[#0369A1]",
                  "from-[#FF7900] to-[#E56D00]",
                  "from-[#10B981] to-[#047857]",
                  "from-[#6366F1] to-[#4338CA]",
                ];
                const avatarGrad = avatarGradients[idx % avatarGradients.length];

                return (
                  <Link
                    key={c.id}
                    href="/AD_Admin/contacts"
                    prefetch={true}
                    className="p-3 sm:p-3.5 rounded-xl border border-slate-100 hover:border-[#0284C7]/50 bg-white hover:bg-[#F0F9FF]/50 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 sm:gap-3 group shadow-2xs hover:shadow-xs relative overflow-hidden"
                  >
                    {/* Hover indicator strip */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#0284C7] to-[#38BDF8] opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Left info block with avatar */}
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Initials Avatar */}
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${avatarGrad} text-white flex items-center justify-center font-black text-xs sm:text-[13px] tracking-wider shrink-0 shadow-2xs ring-2 ring-white mt-0.5`}
                      >
                        {initials}
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs sm:text-sm text-[#102E4D] group-hover:text-[#0284C7] transition-colors truncate">
                            {c.full_name}
                          </span>
                          {c.organization && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#EDF6FB] text-[#0284C7] border border-[#CFE6F3] truncate max-w-[160px]">
                              {c.organization}
                            </span>
                          )}
                          {c.address_with_city && (
                            <span className="text-[10px] font-medium text-slate-500 hidden sm:inline truncate max-w-[160px]">
                              • {c.address_with_city}
                            </span>
                          )}
                          {c.interest && (
                            <span className="text-[10px] font-semibold text-slate-400 hidden sm:inline truncate">
                              • {c.interest}
                            </span>
                          )}
                        </div>

                        {/* Stylized message quote */}
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600 line-clamp-1 italic group-hover:bg-white group-hover:border-[#CFE6F3] transition-colors">
                          &ldquo;{c.message}&rdquo;
                        </div>

                        {/* Email/phone meta line */}
                        <div className="text-[10.5px] text-slate-400 truncate">
                          {c.email} {c.phone ? `• ${c.phone}` : ""}
                        </div>
                      </div>
                    </div>

                    {/* Right badge & status pills */}
                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-center pl-12 sm:pl-0">
                      {/* CRM Status Badge */}
                      {isNew ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-[#FF7900] to-[#E56D00] text-white shadow-2xs flex items-center gap-1.5 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          <span>New Lead</span>
                        </span>
                      ) : isResponded ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] flex items-center gap-1 shadow-2xs">
                          <CheckCircle2 className="w-3 h-3 text-[#15803D]" />
                          <span>Responded</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-[#EDF6FB] text-[#0284C7] border border-[#CFE6F3] flex items-center gap-1 shadow-2xs">
                          <Clock className="w-3 h-3 text-[#0284C7]" />
                          <span>{c.crm_status.replace("_", " ")}</span>
                        </span>
                      )}

                      {/* Hover action arrow */}
                      <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 group-hover:bg-[#0284C7] group-hover:border-[#0284C7] group-hover:text-white text-slate-400 flex items-center justify-center transition-all shadow-2xs shrink-0">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

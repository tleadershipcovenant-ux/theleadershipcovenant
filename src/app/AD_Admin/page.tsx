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
  systemHealth: {
    supabase: {
      configured: boolean;
      connected: boolean;
      provider: "supabase" | "local_json";
      message: string;
    };
    cloudinary: {
      configured: boolean;
      cloudName: string | null;
      folder: string;
      provider: string;
    };
    jwt: {
      email: string;
      expiresAt: string;
    };
  };
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
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (typeof window !== "undefined") {
          try {
            window.sessionStorage.setItem(
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
      const cached = window.sessionStorage.getItem("tlc_admin_dashboard_cache");
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
    <div className="space-y-5 sm:space-y-6">
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
            <div className="font-num font-black text-3xl sm:text-4xl text-[#102E4D]" suppressHydrationWarning>
              {reg.total}
            </div>
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-[#EFFBF8] text-[#102E4D] border border-[#C8EFE6] shrink-0">
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
          <div className="text-xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100" suppressHydrationWarning>
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
            <div className="font-num font-black text-3xl sm:text-4xl text-[#15803D]" suppressHydrationWarning>
              {reg.securedSeats}
            </div>
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] shrink-0">
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
          <div className="text-xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100" suppressHydrationWarning>
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
            <div className="font-num font-black text-3xl sm:text-4xl text-[#D97706]" suppressHydrationWarning>
              {reg.awaitingVerification + reg.pendingCallback}
            </div>
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] shrink-0">
              Urgent Attention
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
          <div className="text-xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100" suppressHydrationWarning>
            <span>
              <strong className="text-[#0284C7]">{reg.awaitingVerification}</strong> Verify Proof
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
            <div className="font-num font-black text-3xl sm:text-4xl text-[#102E4D]" suppressHydrationWarning>
              {con.total}
            </div>
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-[#EDF6FB] text-[#0284C7] border border-[#CFE6F3] shrink-0">
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
          <div className="text-xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100" suppressHydrationWarning>
            <span className="text-[#FF7900] font-bold">
              {con.newCount} Unread New
            </span>
            <span>
              <strong className="text-[#10B981]">{con.respondedCount}</strong> Responded
            </span>
          </div>
        </div>
      </div>

      {/* ────────────────── 3. VISUAL ANALYTICS & OPERATIONS SECTION ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left Column (lg:col-span-7): Cohort Enrollment Analytics Bar Visualizer */}
        <div className="lg:col-span-7 rounded-2xl bg-white border-2 border-[#C8EFE6] shadow-xs overflow-hidden flex flex-col">
          <div className="px-4.5 py-3.5 bg-gradient-to-r from-[#EFFBF8] via-white to-[#DDEFF7]/50 border-b border-[#C8EFE6] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0284C7] to-[#0369A1] text-white flex items-center justify-center shadow-xs shrink-0">
                <BarChart3 className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <h3 className="font-serif font-bold text-sm sm:text-base text-[#102E4D] truncate">
                  Cohort Enrollment Analytics
                </h3>
                <p className="text-[10.5px] text-slate-500 truncate">
                  Live capacity and registrations across active programs
                </p>
              </div>
            </div>
            <Link
              href="/AD_Admin/registrations"
              prefetch={true}
              className="text-xs font-extrabold text-[#FF7900] hover:text-[#102E4D] inline-flex items-center gap-1 transition-colors shrink-0"
            >
              <span>View CRM</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-3.5 sm:p-4.5 space-y-2.5 max-h-[620px] overflow-y-auto [scrollbar-width:thin]">
            {(data?.activityBreakdown || []).map((act) => {
              const cohortSecuredPct = act.total > 0 ? Math.round((act.secured / act.total) * 100) : 0;
              const barFillWidth = Math.max(Math.round((act.total / maxCohortTotal) * 100), act.total > 0 ? 12 : 4);

              return (
                <div
                  key={act.slug}
                  className="p-3 rounded-xl border border-slate-100 hover:border-[#C8EFE6] bg-[#FAFCFB] hover:bg-[#EFFBF8]/40 transition-all space-y-1.5 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="min-w-0">
                      <Link
                        href={`/AD_Admin/registrations?activity=${encodeURIComponent(act.slug)}`}
                        prefetch={true}
                        className="font-bold text-xs sm:text-sm text-[#102E4D] group-hover:text-[#FF7900] transition-colors truncate block"
                      >
                        {act.title}
                      </Link>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {act.city} {act.startDate ? `• ${act.startDate}` : ""}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 font-num text-[11px] pt-1 sm:pt-0">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[#102E4D] font-black">
                        {act.total} Total
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#DCFCE7] text-[#15803D] font-extrabold">
                        {act.secured} Secured
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#FEF3C7] text-[#B45309] font-extrabold">
                        {act.reserved} Reserved
                      </span>
                    </div>
                  </div>

                  {/* Multi-tier Progress Bar */}
                  <div className="space-y-1">
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
        <div className="lg:col-span-5 flex flex-col gap-5 sm:gap-6">
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

          {/* Bottom of Stack: Action & CRM Hub (With Graphical Representation) */}
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
                    Live operational queues &amp; follow-up velocity
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-num font-black px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] shrink-0">
                {reg.awaitingVerification + reg.pendingCallback + con.newCount} Active Tasks
              </span>
            </div>

            <div className="p-4 sm:p-5 space-y-3.5">
              {/* Graphical Workload Distribution Meter */}
              <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Queue Workload Ratio</span>
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
                          ? Math.round((reg.awaitingVerification / Math.max(reg.awaitingVerification + reg.pendingCallback + con.newCount, 1)) * 100)
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
                          ? Math.round((reg.pendingCallback / Math.max(reg.awaitingVerification + reg.pendingCallback + con.newCount, 1)) * 100)
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
                          ? Math.round((con.newCount / Math.max(reg.awaitingVerification + reg.pendingCallback + con.newCount, 1)) * 100)
                          : 34
                      }%`,
                    }}
                    title={`New inquiries: ${con.newCount}`}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-num pt-0.5">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                    <span>Receipts</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                    <span>Callbacks</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7]" />
                    <span>Inquiries</span>
                  </span>
                </div>
              </div>

              {/* Graphical Queue Items with Individual Velocity Bars */}
              <div className="space-y-2">
                {/* Item 1: Proof Receipts Graphical Progress */}
                <Link
                  href="/AD_Admin/registrations"
                  prefetch={true}
                  className="p-2.5 rounded-xl border border-slate-100 hover:border-[#10B981]/50 bg-[#FAFCFB] hover:bg-[#DCFCE7]/30 transition-all space-y-1.5 block group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shrink-0">
                        <FileCheck2 className="w-3.5 h-3.5" />
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-[#102E4D] group-hover:text-[#15803D] transition-colors truncate">
                          Proof Receipts Verification
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {reg.withScreenshots} total screenshots uploaded
                        </div>
                      </div>
                    </div>
                    <span className="font-num text-xs font-black px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] shrink-0">
                      {reg.awaitingVerification} to verify
                    </span>
                  </div>

                  {/* Graphical Verification Progress Bar */}
                  <div className="space-y-0.5">
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-gradient-to-r from-[#10B981] to-[#059669] transition-all duration-700"
                        style={{ width: `${verifiedPct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[9.5px] text-slate-400 font-num">
                      <span>Verified: <strong className="text-[#15803D]">{reg.verifiedConfirmed} confirmed</strong></span>
                      <span>Rate: <strong className="text-[#102E4D]">{verifiedPct}%</strong></span>
                    </div>
                  </div>
                </Link>

                {/* Item 2: Phone Callback Queue Graphical Progress */}
                <Link
                  href="/AD_Admin/registrations"
                  prefetch={true}
                  className="p-2.5 rounded-xl border border-slate-100 hover:border-[#F59E0B]/50 bg-[#FAFCFB] hover:bg-[#FEF3C7]/30 transition-all space-y-1.5 block group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
                        <PhoneCall className="w-3.5 h-3.5" />
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-[#102E4D] group-hover:text-[#D97706] transition-colors truncate">
                          Provisional Callback Queue
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          Attendees awaiting confirmation call
                        </div>
                      </div>
                    </div>
                    <span className="font-num text-xs font-black px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] shrink-0">
                      {reg.pendingCallback} to call
                    </span>
                  </div>

                  {/* Graphical Conversion Progress Bar */}
                  <div className="space-y-0.5">
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] transition-all duration-700"
                        style={{ width: `${securedPct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[9.5px] text-slate-400 font-num">
                      <span>Secured: <strong className="text-[#B45309]">{reg.securedSeats} paid</strong></span>
                      <span>Conversion: <strong className="text-[#102E4D]">{securedPct}%</strong></span>
                    </div>
                  </div>
                </Link>

                {/* Item 3: Unread Inquiries Graphical Progress */}
                <Link
                  href="/AD_Admin/contacts"
                  prefetch={true}
                  className="p-2.5 rounded-xl border border-slate-100 hover:border-[#0284C7]/50 bg-[#FAFCFB] hover:bg-[#EDF6FB]/40 transition-all space-y-1.5 block group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-[#EDF6FB] text-[#0284C7] flex items-center justify-center shrink-0">
                        <MessageSquareText className="w-3.5 h-3.5" />
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-[#102E4D] group-hover:text-[#0284C7] transition-colors truncate">
                          Inbound Communications
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          School &amp; candidate inquiries
                        </div>
                      </div>
                    </div>
                    <span className="font-num text-xs font-black px-2 py-0.5 rounded-full bg-[#FF7900]/15 text-[#E56D00] border border-[#FF7900]/30 shrink-0">
                      {con.newCount} new
                    </span>
                  </div>

                  {/* Graphical Resolution Progress Bar */}
                  <div className="space-y-0.5">
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-gradient-to-r from-[#0284C7] to-[#0369A1] transition-all duration-700"
                        style={{ width: `${inquiryResPct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[9.5px] text-slate-400 font-num">
                      <span>Responded: <strong className="text-[#0284C7]">{con.respondedCount} messages</strong></span>
                      <span>Resolved: <strong className="text-[#102E4D]">{inquiryResPct}%</strong></span>
                    </div>
                  </div>
                </Link>
              </div>

              {/* 1-Click Action Button */}
              <Link
                href="/AD_Admin/registrations"
                prefetch={true}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#001B33] to-[#102E4D] hover:from-[#102E4D] hover:to-[#001B33] text-white text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-98"
              >
                <span>Process Pending Verifications</span>
                <ChevronRight className="w-4 h-4 text-[#FFC400]" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ────────────────── 4. TWO-COLUMN LIVE ACTIVITY FEEDS ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Recent Registrations Feed */}
        <div className="rounded-2xl bg-white border-2 border-[#C8EFE6] shadow-xs overflow-hidden flex flex-col">
          <div className="px-4.5 py-3.5 bg-gradient-to-r from-[#EFFBF8] to-white border-b border-[#C8EFE6] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] flex items-center justify-center shrink-0">
                <CalendarCheck2 className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <h3 className="font-serif font-bold text-sm sm:text-base text-[#102E4D] truncate">
                  Recent Registrations Feed
                </h3>
                <p className="text-[10.5px] text-slate-500 truncate">
                  Latest activity candidates &amp; applicants
                </p>
              </div>
            </div>
            <Link
              href="/AD_Admin/registrations"
              prefetch={true}
              className="text-xs font-extrabold text-[#102E4D] hover:text-[#FF7900] inline-flex items-center gap-1 transition-colors shrink-0"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {(data?.recentRegistrations || []).length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No activity registrations yet. Submissions from <code>/apply</code> and <code>/summit</code> will appear here automatically.
              </div>
            ) : (
              data?.recentRegistrations.slice(0, 6).map((r) => (
                <Link
                  key={r.id}
                  href={`/AD_Admin/registrations?activity=${encodeURIComponent(r.activity_slug)}`}
                  prefetch={true}
                  className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 hover:bg-[#EFFBF8]/50 transition-colors group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-[#102E4D] group-hover:text-[#FF7900] transition-colors truncate">
                        {r.full_name}
                      </span>
                      <span className="font-num text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-[#FF7900] shrink-0">
                        #{r.reference_code}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">
                      {r.activity_title} • {r.organization || r.phone}
                    </div>
                  </div>
                  <span
                    className={`self-start sm:self-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
                      r.booking_mode === "secure_seat"
                        ? "bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]"
                        : "bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]"
                    }`}
                  >
                    {r.booking_mode === "secure_seat" ? "Secured Paid" : "Reservation"}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Contact Inquiries Feed */}
        <div className="rounded-2xl bg-white border-2 border-[#CFE6F3] shadow-xs overflow-hidden flex flex-col">
          <div className="px-4.5 py-3.5 bg-gradient-to-r from-[#EDF6FB] to-white border-b border-[#CFE6F3] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-[#EDF6FB] text-[#0284C7] border border-[#CFE6F3] flex items-center justify-center shrink-0">
                <MessageSquareText className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <h3 className="font-serif font-bold text-sm sm:text-base text-[#102E4D] truncate">
                  Recent Inquiries &amp; Leads
                </h3>
                <p className="text-[10.5px] text-slate-500 truncate">
                  School, corporate and parent messages
                </p>
              </div>
            </div>
            <Link
              href="/AD_Admin/contacts"
              prefetch={true}
              className="text-xs font-extrabold text-[#102E4D] hover:text-[#FF7900] inline-flex items-center gap-1 transition-colors shrink-0"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {(data?.recentContacts || []).length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No contact inquiries yet. Messages submitted via <code>/contact</code> appear here in real time.
              </div>
            ) : (
              data?.recentContacts.slice(0, 6).map((c) => (
                <Link
                  key={c.id}
                  href="/AD_Admin/contacts"
                  prefetch={true}
                  className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3 hover:bg-[#EDF6FB]/50 transition-colors group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-[#102E4D] group-hover:text-[#0284C7] transition-colors truncate">
                        {c.full_name}
                      </span>
                      {c.organization && (
                        <span className="text-[11px] font-semibold text-slate-400 truncate">
                          ({c.organization})
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                      {c.message}
                    </p>
                  </div>
                  <span
                    className={`self-start sm:self-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
                      c.crm_status === "new"
                        ? "bg-[#FF7900]/15 text-[#E56D00] border border-[#FF7900]/30"
                        : c.crm_status === "responded"
                        ? "bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {c.crm_status.replace("_", " ")}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

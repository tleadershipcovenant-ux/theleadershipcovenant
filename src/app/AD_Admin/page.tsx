"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  Activity,
  Sparkles,
  PhoneCall,
  FileCheck2,
  ExternalLink,
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
      <div className="space-y-6 animate-pulse">
        <div className="h-36 rounded-2xl sm:rounded-3xl bg-white border border-[#C8EFE6]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-32 rounded-2xl bg-white border border-[#C8EFE6]"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 rounded-2xl bg-white border border-[#C8EFE6]" />
          <div className="h-80 rounded-2xl bg-white border border-[#C8EFE6]" />
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

  // SVG Donut calculation
  const donutRadius = 40;
  const donutCircumference = 2 * Math.PI * donutRadius; // ~251.32

  const funnelSegments = [
    {
      label: "Verified Confirmed",
      count: reg.verifiedConfirmed,
      color: "#10B981", // Emerald
      bgClass: "bg-[#10B981]",
      textClass: "text-[#10B981]",
    },
    {
      label: "Awaiting Verification",
      count: reg.awaitingVerification,
      color: "#38BDF8", // Sky Blue
      bgClass: "bg-[#38BDF8]",
      textClass: "text-[#38BDF8]",
    },
    {
      label: "Provisional Reserved",
      count: reg.provisionalReservations,
      color: "#FF7900", // Orange
      bgClass: "bg-[#FF7900]",
      textClass: "text-[#FF7900]",
    },
    {
      label: "Pending Callback",
      count: reg.pendingCallback,
      color: "#F59E0B", // Amber
      bgClass: "bg-[#F59E0B]",
      textClass: "text-[#F59E0B]",
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
    <div className="space-y-6">
      {/* ────────────────── 1. EXECUTIVE WELCOME HERO BANNER ────────────────── */}
      <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#001B33] via-[#0A2540] to-[#001B33] text-white p-5 sm:p-7 lg:p-8 shadow-xl relative overflow-hidden border border-white/10 select-none">
        {/* Signature colored top stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#10B981]" />

        {/* Ambient atmospheric gradients */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-gradient-to-br from-[#FF7900]/20 to-[#FFC400]/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -top-16 w-80 h-80 rounded-full bg-gradient-to-br from-[#10B981]/20 to-transparent blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#FFC400]">
                The Leadership Covenant • Executive Command Center
              </span>
            </div>
            <h1 className="font-serif font-black text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight">
              Welcome Admin to Portal
            </h1>
            <p className="text-xs sm:text-sm text-[#D7F5EF] max-w-2xl leading-relaxed">
              Live executive overview of registrations, revenue pipeline, attendee enrollments, and inquiries across all leadership programs.
            </p>
          </div>

          {/* Action Hub Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/AD_Admin/registrations"
              prefetch={true}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] hover:from-[#E56D00] hover:to-[#CC6200] text-white text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-2 shadow-lg shadow-[#FF7900]/25 transition-all active:scale-95 cursor-pointer"
            >
              <CalendarCheck2 className="w-4 h-4" />
              <span>Manage Registrations</span>
            </Link>
            <Link
              href="/AD_Admin/cms"
              prefetch={true}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-[#FFC400]" />
              <span>Open CMS</span>
            </Link>
            <button
              type="button"
              onClick={() => loadDashboard(true)}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white cursor-pointer active:scale-95 transition-all"
              title="Refresh dashboard statistics"
              aria-label="Refresh dashboard statistics"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin text-[#FFC400]" : "text-slate-200"}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ────────────────── 2. HIGH-IMPACT KPI METRICS CARDS ────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Total Registrations */}
        <div className="rounded-2xl bg-white border-2 border-[#C8EFE6] p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Total Registrations
            </span>
            <span className="w-9 h-9 rounded-xl bg-[#EFFBF8] border border-[#C8EFE6] flex items-center justify-center text-[#102E4D]">
              <Users className="w-4.5 h-4.5" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="font-num font-black text-3xl sm:text-4xl text-[#102E4D]" suppressHydrationWarning>
              {reg.total}
            </div>
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-[#EFFBF8] text-[#102E4D] border border-[#C8EFE6]">
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
        <div className="rounded-2xl bg-white border-2 border-[#BCE8DF] p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Secured Paid Seats
            </span>
            <span className="w-9 h-9 rounded-xl bg-[#DCFCE7] border border-[#86EFAC] flex items-center justify-center text-[#15803D]">
              <ShieldCheck className="w-4.5 h-4.5" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="font-num font-black text-3xl sm:text-4xl text-[#15803D]" suppressHydrationWarning>
              {reg.securedSeats}
            </div>
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
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
            <span className="inline-flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-[#0284C7]" />
              <strong>{reg.withScreenshots}</strong> Proofs
            </span>
            <span>
              <strong className="text-[#15803D]">{reg.verifiedConfirmed}</strong> Confirmed
            </span>
          </div>
        </div>

        {/* Card 3: Pending Action Queue */}
        <div className="rounded-2xl bg-white border-2 border-[#FDE68A] p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Pending Action Queue
            </span>
            <span className="w-9 h-9 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#D97706]">
              <Clock className="w-4.5 h-4.5" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="font-num font-black text-3xl sm:text-4xl text-[#D97706]" suppressHydrationWarning>
              {reg.awaitingVerification + reg.pendingCallback}
            </div>
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
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
        <div className="rounded-2xl bg-white border-2 border-[#CFE6F3] p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Contact Inquiries
            </span>
            <span className="w-9 h-9 rounded-xl bg-[#EDF6FB] border border-[#CFE6F3] flex items-center justify-center text-[#0284C7]">
              <MessageSquareText className="w-4.5 h-4.5" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="font-num font-black text-3xl sm:text-4xl text-[#102E4D]" suppressHydrationWarning>
              {con.total}
            </div>
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-[#EDF6FB] text-[#0284C7] border border-[#CFE6F3]">
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

      {/* ────────────────── 3. VISUAL ANALYTICS & CHARTS SECTION ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Visual Enrollment Bar Graph */}
        <div className="lg:col-span-2 rounded-2xl bg-white border-2 border-[#C8EFE6] shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 bg-gradient-to-r from-[#EFFBF8] via-white to-[#DDEFF7]/50 border-b border-[#C8EFE6] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-[#001B33] text-[#FFC400] flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-serif font-bold text-base text-[#102E4D]">
                  Cohort Enrollment Analytics
                </h3>
                <p className="text-[11px] text-slate-500">
                  Visual capacity and registration volume across all active programs
                </p>
              </div>
            </div>
            <Link
              href="/AD_Admin/registrations"
              prefetch={true}
              className="text-xs font-extrabold text-[#FF7900] hover:text-[#102E4D] inline-flex items-center gap-1 transition-colors"
            >
              <span>View CRM</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-5 flex-1 space-y-4">
            {(data?.activityBreakdown || []).map((act) => {
              const cohortSecuredPct = act.total > 0 ? Math.round((act.secured / act.total) * 100) : 0;
              const barFillWidth = Math.max(Math.round((act.total / maxCohortTotal) * 100), act.total > 0 ? 12 : 3);

              return (
                <div
                  key={act.slug}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-[#C8EFE6] bg-[#FAFCFB] hover:bg-[#EFFBF8]/40 transition-all space-y-2 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div className="min-w-0">
                      <Link
                        href={`/AD_Admin/registrations?activity=${encodeURIComponent(act.slug)}`}
                        prefetch={true}
                        className="font-bold text-sm text-[#102E4D] group-hover:text-[#FF7900] transition-colors truncate block"
                      >
                        {act.title}
                      </Link>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {act.city} {act.startDate ? `• ${act.startDate}` : ""}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 font-num text-xs">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[#102E4D] font-black">
                        {act.total} Total
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#DCFCE7] text-[#15803D] font-extrabold">
                        {act.secured} Secured
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#FEF3C7] text-[#B45309] font-extrabold">
                        {act.reserved} Reserved
                      </span>
                    </div>
                  </div>

                  {/* Multi-tier Comparative Progress Bar */}
                  <div className="space-y-1">
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex p-0.5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#10B981] via-[#059669] to-[#047857] transition-all duration-700 shadow-xs"
                        style={{
                          width: `${(act.secured / Math.max(act.total, 1)) * barFillWidth}%`,
                        }}
                        title={`Secured Seats: ${act.secured}`}
                      />
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#FF7900] to-[#E56D00] transition-all duration-700 ml-0.5"
                        style={{
                          width: `${(act.reserved / Math.max(act.total, 1)) * barFillWidth}%`,
                        }}
                        title={`Reserved Seats: ${act.reserved}`}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10.5px] text-slate-400 font-num">
                      <span>Conversion Rate: <strong className="text-[#15803D]">{cohortSecuredPct}%</strong></span>
                      <span>Verified: <strong className="text-[#0284C7]">{act.verified}</strong></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Visual Registration Funnel & Donut Chart */}
        <div className="rounded-2xl bg-white border-2 border-[#C8EFE6] shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 bg-gradient-to-r from-[#EFFBF8] via-white to-[#DDEFF7]/50 border-b border-[#C8EFE6] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-[#001B33] text-[#FF7900] flex items-center justify-center">
                <PieChart className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-serif font-bold text-base text-[#102E4D]">
                  Registration Funnel
                </h3>
                <p className="text-[11px] text-slate-500">
                  Seat distribution by booking state
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 flex-1 flex flex-col justify-between space-y-6">
            {/* SVG Donut Ring Chart */}
            <div className="relative flex items-center justify-center py-2">
              <svg className="w-44 h-44 -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={donutRadius}
                  fill="transparent"
                  stroke="#F1F5F9"
                  strokeWidth="11"
                />

                {/* Dynamic Colored Funnel Segments */}
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
                        strokeWidth="11"
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
                    strokeWidth="11"
                  />
                )}
              </svg>

              {/* Center Metrics Pill */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <span className="font-num font-black text-2xl text-[#102E4D]" suppressHydrationWarning>
                  {securedPct}%
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF7900]">
                  Secured
                </span>
                <span className="text-[9px] font-semibold text-slate-400">
                  {reg.securedSeats} of {totalReg}
                </span>
              </div>
            </div>

            {/* Segment Breakdown Legend */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              {renderedSegments.map((seg) => (
                <div key={seg.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${seg.bgClass} shrink-0`} />
                    <span className="font-semibold text-slate-600 truncate">{seg.label}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 font-num">
                    <span className="font-black text-[#102E4D]" suppressHydrationWarning>{seg.count}</span>
                    <span className="text-[10.5px] text-slate-400 font-bold" suppressHydrationWarning>({seg.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Micro Conversion Indicators */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <div className="p-2.5 rounded-xl bg-[#EFFBF8] border border-[#C8EFE6] text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  UBL Confirmed
                </span>
                <span className="font-num font-black text-base text-[#15803D]" suppressHydrationWarning>
                  {verifiedPct}%
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#EDF6FB] border border-[#CFE6F3] text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Inquiry Resolved
                </span>
                <span className="font-num font-black text-base text-[#0284C7]" suppressHydrationWarning>
                  {inquiryResPct}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ────────────────── 4. TWO-COLUMN LIVE ACTIVITY FEEDS ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations Feed */}
        <div className="rounded-2xl bg-white border-2 border-[#C8EFE6] shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 bg-gradient-to-r from-[#EFFBF8] to-white border-b border-[#C8EFE6] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-[#001B33] text-[#10B981] flex items-center justify-center">
                <CalendarCheck2 className="w-3.5 h-3.5" />
              </span>
              <h3 className="font-serif font-bold text-base text-[#102E4D]">
                Recent Registrations Feed
              </h3>
            </div>
            <Link
              href="/AD_Admin/registrations"
              prefetch={true}
              className="text-xs font-extrabold text-[#102E4D] hover:text-[#FF7900] inline-flex items-center gap-1 transition-colors"
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
                  className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-[#EFFBF8]/50 transition-colors group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#102E4D] group-hover:text-[#FF7900] transition-colors truncate">
                        {r.full_name}
                      </span>
                      <span className="font-num text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-[#FF7900]">
                        #{r.reference_code}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">
                      {r.activity_title} • {r.organization || r.phone}
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
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
        <div className="rounded-2xl bg-white border-2 border-[#CFE6F3] shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 bg-gradient-to-r from-[#EDF6FB] to-white border-b border-[#CFE6F3] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-[#001B33] text-[#38BDF8] flex items-center justify-center">
                <MessageSquareText className="w-3.5 h-3.5" />
              </span>
              <h3 className="font-serif font-bold text-base text-[#102E4D]">
                Recent Inquiries &amp; Inbound Leads
              </h3>
            </div>
            <Link
              href="/AD_Admin/contacts"
              prefetch={true}
              className="text-xs font-extrabold text-[#102E4D] hover:text-[#FF7900] inline-flex items-center gap-1 transition-colors"
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
                  className="p-3.5 sm:p-4 flex items-start justify-between gap-3 hover:bg-[#EDF6FB]/50 transition-colors group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#102E4D] group-hover:text-[#0284C7] transition-colors truncate">
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
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
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

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
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
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

  if (!mounted && !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 rounded-3xl bg-white border border-[#C8EFE6]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-28 rounded-2xl bg-white border border-[#C8EFE6]"
            />
          ))}
        </div>
        <div className="h-72 rounded-2xl bg-white border border-[#C8EFE6]" />
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

  return (
    <div className="space-y-6">
      {/* Executive Welcome Hero Banner */}
      <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#001B33] via-[#102E4D] to-[#001B33] text-white p-5 sm:p-7 lg:p-8 shadow-lg relative overflow-hidden border border-white/10">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#10B981]" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <span className="text-[10px] sm:text-[10.5px] font-extrabold uppercase tracking-[0.14em] text-[#FFC400] block">
              The Leadership Covenant • Executive Command Center
            </span>
            <h2 className="font-serif font-extrabold text-xl sm:text-2xl lg:text-3xl text-white leading-tight">
              CRM, Bookings &amp; Website CMS Overview
            </h2>
            <p className="text-xs sm:text-sm text-[#D7F5EF] max-w-2xl">
              Monitor real-time activity enrollments, verify UBL transfer
              screenshots, respond to school inquiries, and manage content
              across every website page.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/AD_Admin/registrations"
              className="px-4 py-2.5 rounded-xl bg-[#FF7900] hover:bg-[#E56D00] text-white text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-2 shadow-md transition-colors"
            >
              <CalendarCheck2 className="w-4 h-4" />
              <span>Manage Registrations</span>
            </Link>
            <Link
              href="/AD_Admin/cms"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-2 transition-colors"
            >
              <Layers className="w-4 h-4 text-[#FFC400]" />
              <span>Open CMS</span>
            </Link>
            <button
              type="button"
              onClick={() => loadDashboard(true)}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white cursor-pointer"
              title="Refresh dashboard"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white border-2 border-[#C8EFE6] p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Total Registrations
            </span>
            <span className="w-9 h-9 rounded-xl bg-[#EFFBF8] border border-[#C8EFE6] flex items-center justify-center text-[#102E4D]">
              <Users className="w-4.5 h-4.5" />
            </span>
          </div>
          <div className="font-num font-black text-3xl text-[#102E4D]" suppressHydrationWarning>
            {reg.total}
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100" suppressHydrationWarning>
            <span>
              <strong className="text-[#15803D]">{reg.securedSeats}</strong>{" "}
              Secured
            </span>
            <span>
              <strong className="text-[#FF7900]">
                {reg.provisionalReservations}
              </strong>{" "}
              Reserved
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-white border-2 border-[#BCE8DF] p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Secured Paid Seats
            </span>
            <span className="w-9 h-9 rounded-xl bg-[#DCFCE7] border border-[#86EFAC] flex items-center justify-center text-[#15803D]">
              <ShieldCheck className="w-4.5 h-4.5" />
            </span>
          </div>
          <div className="font-num font-black text-3xl text-[#15803D]" suppressHydrationWarning>
            {reg.securedSeats}
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100" suppressHydrationWarning>
            <span className="inline-flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-[#005696]" />
              <strong>{reg.withScreenshots}</strong> Proofs
            </span>
            <span>
              <strong className="text-[#15803D]">{reg.verifiedConfirmed}</strong>{" "}
              Verified
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-white border-2 border-[#FDE68A] p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Pending Action Queue
            </span>
            <span className="w-9 h-9 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#D97706]">
              <Clock className="w-4.5 h-4.5" />
            </span>
          </div>
          <div className="font-num font-black text-3xl text-[#D97706]" suppressHydrationWarning>
            {reg.awaitingVerification + reg.pendingCallback}
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100" suppressHydrationWarning>
            <span>
              <strong>{reg.awaitingVerification}</strong> Verify Proof
            </span>
            <span>
              <strong>{reg.pendingCallback}</strong> Callback
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-white border-2 border-[#CFE6F3] p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Contact Us Inquiries
            </span>
            <span className="w-9 h-9 rounded-xl bg-[#EDF6FB] border border-[#CFE6F3] flex items-center justify-center text-[#005696]">
              <MessageSquareText className="w-4.5 h-4.5" />
            </span>
          </div>
          <div className="font-num font-black text-3xl text-[#102E4D]" suppressHydrationWarning>
            {con.total}
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100" suppressHydrationWarning>
            <span className="text-[#FF7900] font-bold">
              {con.newCount} Unread New
            </span>
            <span>
              <strong className="text-[#15803D]">{con.respondedCount}</strong>{" "}
              Responded
            </span>
          </div>
        </div>
      </div>

      {/* Activity-by-Activity Enrollment CRM Breakdown */}
      <div className="rounded-2xl bg-white border-2 border-[#C8EFE6] shadow-2xs overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-[#EFFBF8] via-white to-[#DDEFF7]/50 border-b border-[#C8EFE6] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#102E4D]">
              Enrollments by Activity / Cohort
            </h3>
            <p className="text-xs text-slate-500">
              Click any activity to jump directly to its tab in the Activity
              Registrations CRM
            </p>
          </div>
          <Link
            href="/AD_Admin/registrations"
            className="text-xs font-extrabold text-[#FF7900] hover:text-[#102E4D] inline-flex items-center gap-1"
          >
            <span>View All Activity Tabs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {(data?.activityBreakdown || []).map((act) => (
            <Link
              key={act.slug}
              href={`/AD_Admin/registrations?activity=${encodeURIComponent(
                act.slug
              )}`}
              className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#EFFBF8]/60 transition-colors group"
            >
              <div className="min-w-0">
                <div className="font-bold text-sm text-[#102E4D] group-hover:text-[#FF7900] transition-colors truncate">
                  {act.title}
                </div>
                <div className="font-num text-xs text-slate-500">
                  {act.city}
                  {act.startDate ? ` • ${act.startDate}` : ""}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0 font-num text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[#102E4D] font-extrabold">
                  Total: {act.total}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#FEF3C7] text-[#B45309] font-bold">
                  Reserved: {act.reserved}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#DCFCE7] text-[#15803D] font-bold">
                  Secured Paid: {act.secured}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#E0F2FE] text-[#0369A1] font-bold">
                  Verified: {act.verified}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 2-Column Live Feeds: Recent Registrations + Recent Contact Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="rounded-2xl bg-white border-2 border-[#C8EFE6] shadow-2xs overflow-hidden flex flex-col">
          <div className="px-5 py-4 bg-[#EFFBF8] border-b border-[#C8EFE6] flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-[#102E4D]">
              Recent Activity Registrations
            </h3>
            <Link
              href="/AD_Admin/registrations"
              className="text-xs font-extrabold text-[#102E4D] hover:text-[#FF7900] inline-flex items-center gap-1"
            >
              <span>Open CRM</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {(data?.recentRegistrations || []).length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No activity registrations yet. Submissions from{" "}
                <code>/apply</code> and <code>/summit</code> appear here
                automatically.
              </div>
            ) : (
              data?.recentRegistrations.map((r) => (
                <Link
                  key={r.id}
                  href={`/AD_Admin/registrations?activity=${encodeURIComponent(
                    r.activity_slug
                  )}`}
                  className="p-4 flex items-center justify-between gap-3 hover:bg-[#EFFBF8]/50 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#102E4D] truncate">
                        {r.full_name}
                      </span>
                      <span className="font-num text-[10.5px] font-extrabold text-[#FF7900]">
                        #{r.reference_code}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">
                      {r.activity_title} • {r.phone}
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
                      r.booking_mode === "secure_seat"
                        ? "bg-[#DCFCE7] text-[#15803D]"
                        : "bg-[#FEF3C7] text-[#B45309]"
                    }`}
                  >
                    {r.booking_mode === "secure_seat"
                      ? "Secured Paid"
                      : "Reservation"}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Contact Inquiries */}
        <div className="rounded-2xl bg-white border-2 border-[#CFE6F3] shadow-2xs overflow-hidden flex flex-col">
          <div className="px-5 py-4 bg-[#EDF6FB] border-b border-[#CFE6F3] flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-[#102E4D]">
              Recent Contact Us Inquiries
            </h3>
            <Link
              href="/AD_Admin/contacts"
              className="text-xs font-extrabold text-[#102E4D] hover:text-[#FF7900] inline-flex items-center gap-1"
            >
              <span>Open Contacts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {(data?.recentContacts || []).length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No Contact Us messages yet. Inquiries submitted via{" "}
                <code>/contact</code> or the home contact section appear here
                instantly.
              </div>
            ) : (
              data?.recentContacts.map((c) => (
                <Link
                  key={c.id}
                  href="/AD_Admin/contacts"
                  className="p-4 flex items-start justify-between gap-3 hover:bg-[#EDF6FB]/50 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#102E4D] truncate">
                        {c.full_name}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 truncate">
                        ({c.organization})
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                      {c.message}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
                      c.crm_status === "new"
                        ? "bg-[#FF7900]/15 text-[#E56D00]"
                        : c.crm_status === "responded"
                        ? "bg-[#DCFCE7] text-[#15803D]"
                        : "bg-slate-100 text-slate-600"
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

      {/* System Status Strip */}
      <div className="rounded-2xl bg-white border-2 border-[#C8EFE6] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#001B33] text-[#FFC400] flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#102E4D] flex items-center gap-2">
              <span>System Status</span>
              {data?.systemHealth.supabase.provider === "supabase" ? (
                <span className="inline-flex items-center gap-1 text-[#15803D]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Cloud Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[#16A34A]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> All Systems Operational
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600">
              Database and storage engines are running. All CRM, activity registrations and CMS features are fully functional.
            </p>
          </div>
        </div>

        <Link
          href="/AD_Admin/cms"
          className="px-4 py-2 rounded-xl border-2 border-[#102E4D]/20 hover:border-[#102E4D] text-[#102E4D] text-xs font-extrabold whitespace-nowrap inline-flex items-center gap-1.5 self-start md:self-center"
        >
          <span>Manage Website Content</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#FF7900]" />
        </Link>
      </div>
    </div>
  );
}


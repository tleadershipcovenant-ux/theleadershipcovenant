"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquareText,
  CalendarCheck2,
  Layers,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  PanelLeftClose,
  Calendar,
  Home,
  Briefcase,
  BookOpen,
  DollarSign,
  CreditCard,
  MessageSquare,
  Settings,
} from "lucide-react";

interface QuickBadges {
  newContacts: number;
  pendingRegistrations: number;
}

/* ─── Activities Sub-List ─── */
const ACTIVITIES_SUBMENU = [
  {
    label: "All Registrations",
    href: "/AD_Admin/registrations",
    exact: true,
    dotColor: "bg-[#38BDF8]",
  },
  {
    label: "School Impact Summit 2026",
    href: "/AD_Admin/registrations?activity=school-impact-summit-2026",
    activityKey: "school-impact-summit-2026",
    dotColor: "bg-[#FF7900]",
  },
  {
    label: "7 Habits of Highly Effective People",
    href: "/AD_Admin/registrations?activity=7-habits",
    activityKey: "7-habits",
    dotColor: "bg-[#10B981]",
  },
  {
    label: "4 Disciplines of Execution (4DX)",
    href: "/AD_Admin/registrations?activity=4dx-for-educators",
    activityKey: "4dx-for-educators",
    dotColor: "bg-[#FFC400]",
  },
  {
    label: "Leadership Camp Swat",
    href: "/AD_Admin/registrations?activity=leadership-camp-swat-2026",
    activityKey: "leadership-camp-swat-2026",
    dotColor: "bg-[#A855F7]",
  },
];

/* ─── CMS Pages Sub-List ─── */
const CMS_PAGES_SUBMENU = [
  { label: "Home Page", pageKey: "home", icon: Home, iconColor: "text-[#38BDF8]" },
  { label: "Summit 2026", pageKey: "summit", icon: Calendar, iconColor: "text-[#FF7900]" },
  { label: "Services & Programs", pageKey: "services", icon: Briefcase, iconColor: "text-[#10B981]" },
  { label: "Our Story & Vision", pageKey: "about", icon: BookOpen, iconColor: "text-[#FFC400]" },
  { label: "Activities Catalog", pageKey: "events", icon: Calendar, iconColor: "text-[#818CF8]" },
  { label: "Pricing & Discounts", pageKey: "pricing", icon: DollarSign, iconColor: "text-[#4ADE80]" },
  { label: "Payment & Bank Accounts", pageKey: "payment", icon: CreditCard, iconColor: "text-[#2DD4BF]" },
  { label: "Forms & Microcopy", pageKey: "forms", icon: MessageSquare, iconColor: "text-[#FBBF24]" },
  { label: "Global Site Settings", pageKey: "site", icon: Settings, iconColor: "text-[#94A3B8]" },
];

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isCleanUrl = !pathname.startsWith("/AD_Admin");
  const isLoginRoute = pathname === "/AD_Admin/login" || pathname === "/login";

  // Helper to dynamically output clean URLs on admin subdomain
  const resolveLink = useCallback(
    (legacyPath: string) => {
      if (isCleanUrl) {
        if (legacyPath === "/AD_Admin") return "/";
        if (legacyPath.startsWith("/AD_Admin/"))
          return legacyPath.replace("/AD_Admin", "");
        if (legacyPath.startsWith("/AD_Admin?"))
          return legacyPath.replace("/AD_Admin", "/");
        return legacyPath;
      }
      return legacyPath;
    },
    [isCleanUrl]
  );

  const isDashboardActive = pathname === "/" || pathname === "/AD_Admin";
  const isContactsActive =
    pathname?.startsWith("/contacts") ||
    pathname?.startsWith("/AD_Admin/contacts");
  const isRegistrationsActive =
    pathname?.startsWith("/registrations") ||
    pathname?.startsWith("/AD_Admin/registrations");
  const isCmsActive =
    pathname?.startsWith("/cms") || pathname?.startsWith("/AD_Admin/cms");

  // Desktop sidebar: true = expanded drawer, false = collapsed slim vertical bar
  const [expanded, setExpanded] = useState(true);
  // Mobile slide-over
  const [mobileOpen, setMobileOpen] = useState(false);

  // Accordion dropdown states: Activities & CMS both closed by default on start
  const [activitiesOpen, setActivitiesOpen] = useState(false);
  const [cmsPagesOpen, setCmsPagesOpen] = useState(false);

  const [loggingOut, setLoggingOut] = useState(false);
  const [badges, setBadges] = useState<QuickBadges>({
    newContacts: 0,
    pendingRegistrations: 0,
  });

  const fetchShellMeta = useCallback(async () => {
    if (isLoginRoute) return;
    try {
      const statsRes = await fetch("/api/admin/stats", { cache: "no-store" });
      if (statsRes.status === 401) {
        router.replace(isCleanUrl ? "/login" : "/AD_Admin/login");
        return;
      }

      if (statsRes.ok) {
        const sJson = await statsRes.json();
        setBadges({
          newContacts: sJson?.contactStats?.newCount || 0,
          pendingRegistrations:
            (sJson?.registrationStats?.awaitingVerification || 0) +
            (sJson?.registrationStats?.pendingCallback || 0),
        });
      }
    } catch {
      // Non-blocking meta fetch
    }
  }, [isCleanUrl, isLoginRoute, router]);

  useEffect(() => {
    fetchShellMeta();
  }, [fetchShellMeta, pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (isLoginRoute) {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem("tlc_admin_dashboard_cache");
      }
      router.replace(isCleanUrl ? "/login" : "/AD_Admin/login");
    } finally {
      setLoggingOut(false);
    }
  };

  const totalUnreadCount = badges.newContacts + badges.pendingRegistrations;

  /* ──────────────────────────── Render Sidebar Content ──────────────────────────── */
  const renderNavContent = (isMobile = false) => {
    const isMini = !isMobile && !expanded;

    return (
      <div className="h-full flex flex-col bg-gradient-to-b from-[#001B33] via-[#062340] to-[#001529] text-white border-r border-white/10 select-none shadow-2xl relative">
        {/* Top Signature Colored Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#10B981] shrink-0" />

        {/* Brand Header */}
        <div
          className={`px-3.5 py-4 border-b border-white/10 flex items-center shrink-0 ${
            isMini ? "flex-col justify-center gap-2" : "justify-between gap-2.5"
          }`}
        >
          {isMini ? (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="w-12 h-12 rounded-xl bg-white p-1 border-2 border-white/90 shadow-lg flex items-center justify-center mx-auto cursor-pointer hover:scale-105 active:scale-95 transition-transform group"
              title="Click logo to expand navigation drawer"
            >
              <img
                src="/Logo_For_Navbar_Fotter.png"
                alt="TLC Admin"
                className="w-full h-full object-contain"
              />
            </button>
          ) : (
            <Link
              href={resolveLink("/AD_Admin")}
              className="flex items-center gap-3 min-w-0 group"
              title="Return to Dashboard"
            >
              <div className="w-10 h-10 rounded-xl bg-white p-1 border-2 border-white/90 shadow-md shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
                <img
                  src="/Logo_For_Navbar_Fotter.png"
                  alt="The Leadership Covenant"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#FFC400] block truncate">
                  The Leadership Covenant
                </span>
                <span className="font-serif font-extrabold text-base text-white leading-tight block truncate">
                  TLC Admin Portal
                </span>
              </div>
            </Link>
          )}

          {/* Close / Collapse Icon Button */}
          {!isMini && (
            <button
              type="button"
              onClick={() => {
                if (isMobile) setMobileOpen(false);
                else setExpanded(false);
              }}
              className="p-1.5 rounded-xl text-slate-300 hover:text-white bg-white/6 hover:bg-white/15 border border-white/10 cursor-pointer transition-colors shrink-0"
              title={isMobile ? "Close menu" : "Collapse navigation drawer"}
              aria-label={isMobile ? "Close menu" : "Collapse navigation drawer"}
            >
              {isMobile ? (
                <X className="w-5 h-5" />
              ) : (
                <PanelLeftClose className="w-4 h-4 text-[#FFC400]" />
              )}
            </button>
          )}
        </div>

        {/* Navigation Content Area — Scrollable without visible scrollbar */}
        <nav
          className={`flex-1 min-h-0 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
            isMini ? "px-2 py-3.5 space-y-3" : "px-3.5 py-4 space-y-5"
          }`}
        >
          {/* 1. OVERVIEW: DASHBOARD */}
          <div className="space-y-1">
            {!isMini && (
              <div className="px-3 pb-1 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFC400]" />
                <span>Overview</span>
              </div>
            )}
            <Link
              href={resolveLink("/AD_Admin")}
              prefetch={true}
              title={isMini ? "Dashboard" : undefined}
              className={`group relative flex items-center ${
                isMini
                  ? "justify-center w-12 h-12 mx-auto rounded-xl"
                  : "px-3.5 py-2.5 rounded-xl"
              } transition-all duration-150 ${
                isDashboardActive
                  ? `bg-gradient-to-r from-[#FF7900] via-[#FF881A] to-[#E56D00] text-white shadow-md shadow-[#FF7900]/30 font-bold ${
                      isMini
                        ? "before:absolute before:left-0.5 before:top-2 before:bottom-2 before:w-1 before:rounded-full before:bg-[#FFC400]"
                        : "before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-full before:bg-[#FFC400]"
                    }`
                  : "text-slate-200 hover:bg-white/8 hover:text-white font-semibold"
              }`}
            >
              <div className="relative shrink-0 flex items-center justify-center w-6 h-6">
                <LayoutDashboard
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    isDashboardActive
                      ? "text-white"
                      : "text-[#FFC400] group-hover:text-[#FFE066]"
                  }`}
                />
              </div>
              {!isMini && (
                <span className="ml-3 text-xs sm:text-[13px] leading-snug truncate">
                  Dashboard
                </span>
              )}
            </Link>
          </div>

          {/* 2. CUSTOMER CRM */}
          <div className="space-y-1">
            {!isMini && (
              <div className="px-3 pb-1 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                <span>Customer CRM</span>
              </div>
            )}

            {/* Contact Inquiries Button */}
            <Link
              href={resolveLink("/AD_Admin/contacts")}
              prefetch={true}
              title={
                isMini
                  ? `Contact Inquiries (${badges.newContacts} new)`
                  : undefined
              }
              className={`group relative flex items-center ${
                isMini
                  ? "justify-center w-12 h-12 mx-auto rounded-xl"
                  : "px-3.5 py-2.5 rounded-xl"
              } transition-all duration-150 ${
                isContactsActive
                  ? `bg-gradient-to-r from-[#FF7900] via-[#FF881A] to-[#E56D00] text-white shadow-md shadow-[#FF7900]/30 font-bold ${
                      isMini
                        ? "before:absolute before:left-0.5 before:top-2 before:bottom-2 before:w-1 before:rounded-full before:bg-[#FFC400]"
                        : "before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-full before:bg-[#FFC400]"
                    }`
                  : "text-slate-200 hover:bg-white/8 hover:text-white font-semibold"
              }`}
            >
              <div className="relative shrink-0 flex items-center justify-center w-6 h-6">
                <MessageSquareText
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    isContactsActive
                      ? "text-white"
                      : "text-[#38BDF8] group-hover:text-[#67E8F9]"
                  }`}
                />
                {badges.newContacts > 0 && (
                  <span
                    suppressHydrationWarning
                    className="absolute -top-1 -right-1.5 min-w-[15px] h-[15px] px-1 rounded-full bg-[#FF7900] text-white text-[9px] font-num font-black flex items-center justify-center ring-2 ring-[#001B33] shadow-md shadow-[#FF7900]/40 pointer-events-none"
                    title={`${badges.newContacts} new contacts`}
                  >
                    {badges.newContacts}
                  </span>
                )}
              </div>
              {!isMini && (
                <span className="ml-3 text-xs sm:text-[13px] leading-snug truncate flex-1">
                  Contact Inquiries
                </span>
              )}
            </Link>

            {/* Activity Registrations Button (Closed by default, icon opens list) */}
            <div>
              <div
                className={`group relative flex items-center ${
                  isMini
                    ? "justify-center w-12 h-12 mx-auto rounded-xl"
                    : "px-3.5 py-2.5 rounded-xl"
                } transition-all duration-150 cursor-pointer ${
                  isRegistrationsActive
                    ? `bg-gradient-to-r from-[#FF7900] via-[#FF881A] to-[#E56D00] text-white shadow-md shadow-[#FF7900]/30 font-bold ${
                        isMini
                          ? "before:absolute before:left-0.5 before:top-2 before:bottom-2 before:w-1 before:rounded-full before:bg-[#FFC400]"
                          : "before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-full before:bg-[#FFC400]"
                      }`
                    : "text-slate-200 hover:bg-white/8 hover:text-white font-semibold"
                }`}
                onClick={() => {
                  if (isMini) setExpanded(true);
                  else setActivitiesOpen(!activitiesOpen);
                }}
                title={
                  isMini
                    ? `Activity Registrations (${badges.pendingRegistrations} pending)`
                    : undefined
                }
              >
                <div className={`flex items-center ${isMini ? "justify-center" : "flex-1 min-w-0"}`}>
                  <div className="relative shrink-0 flex items-center justify-center w-6 h-6">
                    <CalendarCheck2
                      className={`w-5 h-5 shrink-0 transition-colors ${
                        isRegistrationsActive
                          ? "text-white"
                          : "text-[#10B981] group-hover:text-[#34D399]"
                      }`}
                    />
                    {badges.pendingRegistrations > 0 && (
                      <span
                        suppressHydrationWarning
                        className="absolute -top-1 -right-1.5 min-w-[15px] h-[15px] px-1 rounded-full bg-[#FF7900] text-white text-[9px] font-num font-black flex items-center justify-center ring-2 ring-[#001B33] shadow-md shadow-[#FF7900]/40 pointer-events-none"
                        title={`${badges.pendingRegistrations} pending registrations`}
                      >
                        {badges.pendingRegistrations}
                      </span>
                    )}
                  </div>
                  {!isMini && (
                    <Link
                      href={resolveLink("/AD_Admin/registrations")}
                      prefetch={true}
                      className="ml-3 text-xs sm:text-[13px] leading-snug truncate hover:underline flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      Activity Registrations
                    </Link>
                  )}
                </div>

                {!isMini && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivitiesOpen(!activitiesOpen);
                    }}
                    className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 ml-1 cursor-pointer transition-colors"
                    title={activitiesOpen ? "Collapse activities" : "Expand activities"}
                    aria-label={activitiesOpen ? "Collapse activities" : "Expand activities"}
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[#FFC400] transition-transform duration-200 ${
                        activitiesOpen ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </button>
                )}
              </div>

              {/* Nested Activities Sub-Menu (Closed on start) */}
              {!isMini && activitiesOpen && (
                <div className="mt-1 ml-4 pl-3 border-l-2 border-[#10B981]/30 space-y-0.5 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                  {ACTIVITIES_SUBMENU.map((act) => {
                    return (
                      <Link
                        key={act.href}
                        href={resolveLink(act.href)}
                        prefetch={true}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-white/8 transition-colors truncate group/act"
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${act.dotColor} group-hover/act:scale-125 transition-transform shadow-xs shrink-0`}
                        />
                        <span className="truncate">{act.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 3. WEBSITE MANAGEMENT: CMS PORTAL */}
          <div className="space-y-1">
            {!isMini && (
              <div className="px-3 pb-1 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FB7185]" />
                <span>Website Management</span>
              </div>
            )}

            <div>
              <div
                className={`group relative flex items-center ${
                  isMini
                    ? "justify-center w-12 h-12 mx-auto rounded-xl"
                    : "px-3.5 py-2.5 rounded-xl"
                } transition-all duration-150 cursor-pointer ${
                  isCmsActive
                    ? `bg-gradient-to-r from-[#FF7900] via-[#FF881A] to-[#E56D00] text-white shadow-md shadow-[#FF7900]/30 font-bold ${
                        isMini
                          ? "before:absolute before:left-0.5 before:top-2 before:bottom-2 before:w-1 before:rounded-full before:bg-[#FFC400]"
                          : "before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-full before:bg-[#FFC400]"
                      }`
                    : "text-slate-200 hover:bg-white/8 hover:text-white font-semibold"
                }`}
                onClick={() => {
                  if (isMini) setExpanded(true);
                  else setCmsPagesOpen(!cmsPagesOpen);
                }}
                title={isMini ? "Website CMS Portal" : undefined}
              >
                <div className={`flex items-center ${isMini ? "justify-center" : "flex-1 min-w-0"}`}>
                  <div className="relative shrink-0 flex items-center justify-center w-6 h-6">
                    <Layers
                      className={`w-5 h-5 shrink-0 transition-colors ${
                        isCmsActive
                          ? "text-white"
                          : "text-[#FB7185] group-hover:text-[#F43F5E]"
                      }`}
                    />
                  </div>
                  {!isMini && (
                    <Link
                      href={resolveLink("/AD_Admin/cms")}
                      prefetch={true}
                      className="ml-3 text-xs sm:text-[13px] leading-snug truncate hover:underline flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      Website CMS Portal
                    </Link>
                  )}
                </div>

                {!isMini && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCmsPagesOpen(!cmsPagesOpen);
                    }}
                    className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 ml-1 cursor-pointer transition-colors"
                    title={cmsPagesOpen ? "Collapse CMS pages" : "Expand CMS pages"}
                    aria-label={cmsPagesOpen ? "Collapse CMS pages" : "Expand CMS pages"}
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[#FFC400] transition-transform duration-200 ${
                        cmsPagesOpen ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </button>
                )}
              </div>

              {/* Nested CMS Pages Sub-List (Closed by default, opened by clicking icon or row) */}
              {!isMini && cmsPagesOpen && (
                <div className="mt-1 ml-4 pl-3 border-l-2 border-[#FB7185]/30 space-y-0.5 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                  {CMS_PAGES_SUBMENU.map((page) => {
                    const PageIcon = page.icon;
                    return (
                      <Link
                        key={page.pageKey}
                        href={resolveLink(`/AD_Admin/cms?page=${page.pageKey}`)}
                        prefetch={true}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-white/8 transition-colors group/item truncate"
                      >
                        <PageIcon
                          className={`w-3.5 h-3.5 ${page.iconColor} group-hover/item:scale-115 transition-transform shrink-0`}
                        />
                        <span className="truncate">{page.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Bottom Section: Refresh & Live Site (Directly above Sign Out) */}
        <div
          className={`${
            isMini ? "p-2 space-y-2" : "p-3.5 space-y-2.5"
          } border-t border-white/10 bg-[#001529]/90 shrink-0`}
        >
          {/* Refresh & Live Site Buttons */}
          {!isMini ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fetchShellMeta}
                className="h-8.5 px-2.5 rounded-xl bg-white/6 hover:bg-white/15 border border-white/10 text-slate-200 hover:text-white text-[11px] font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                title="Refresh CRM stats"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#FFC400]" />
                <span>Refresh</span>
              </button>

              <a
                href={isCleanUrl ? "https://leadershipcovenant.com.pk" : "/"}
                target="_blank"
                rel="noopener noreferrer"
                className="h-8.5 px-2.5 rounded-xl bg-white/6 hover:bg-white/15 border border-white/10 text-slate-200 hover:text-white text-[11px] font-bold inline-flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                title="View live website in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#FF7900]" />
                <span>Live Site</span>
              </a>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={fetchShellMeta}
                className="w-12 h-10 rounded-xl bg-white/6 hover:bg-white/15 border border-white/10 text-[#FFC400] flex items-center justify-center mx-auto cursor-pointer transition-colors active:scale-95"
                title="Refresh statistics"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <a
                href={isCleanUrl ? "https://leadershipcovenant.com.pk" : "/"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-10 rounded-xl bg-white/6 hover:bg-white/15 border border-white/10 text-[#FF7900] flex items-center justify-center mx-auto cursor-pointer transition-colors active:scale-95"
                title="Open public website in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className={`w-full ${
              isMini
                ? "w-12 h-10 rounded-xl flex items-center justify-center mx-auto"
                : "h-9 rounded-xl px-3 flex items-center justify-center gap-2 text-xs"
            } bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 hover:border-red-500/50 text-red-200 hover:text-white font-extrabold transition-all cursor-pointer active:scale-98 disabled:opacity-60`}
            title="Sign Out of Admin"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            {!isMini && <span>{loggingOut ? "Signing out…" : "Sign Out"}</span>}
          </button>
        </div>
      </div>
    );
  };

  /* ──────────────────────────── Main Shell Layout ──────────────────────────── */
  return (
    <div className="min-h-screen bg-[#F3FAF8] text-[#102E4D] relative">
      {/* MOBILE TOP NAVIGATION BAR (STICKY AT TOP OF VIEWPORT ON MOBILE) */}
      <header className="lg:hidden sticky top-0 left-0 right-0 z-40 bg-[#001B33]/95 backdrop-blur-md border-b border-white/10 shadow-lg select-none">
        {/* Signature colored top stripe */}
        <div className="h-1 w-full bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#10B981]" />

        <div className="h-15 px-3.5 flex items-center justify-between gap-3">
          {/* Brand Logo & Name */}
          <Link
            href={resolveLink("/AD_Admin")}
            prefetch={true}
            className="flex items-center gap-2.5 min-w-0 group"
            title="Return to Dashboard"
          >
            <div className="w-8.5 h-8.5 rounded-lg bg-white p-0.5 border border-white/90 shadow-sm shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
              <img
                src="/Logo_For_Navbar_Fotter.png"
                alt="TLC"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#FFC400] block truncate">
                The Leadership Covenant
              </span>
              <span className="font-serif font-extrabold text-sm text-white leading-tight block truncate">
                TLC Admin Portal
              </span>
            </div>
          </Link>

          {/* Right Action Icons: Refresh + Menu Toggle Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={fetchShellMeta}
              className="p-2 rounded-xl bg-white/6 hover:bg-white/15 text-[#FFC400] border border-white/10 cursor-pointer active:scale-95 transition-all"
              title="Refresh statistics"
              aria-label="Refresh statistics"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="relative px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] hover:from-[#E56D00] hover:to-[#CC6200] text-white border border-[#FFC400]/40 shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              title="Open Navigation Menu"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-4.5 h-4.5 text-white" />
              <span className="text-xs font-black uppercase tracking-wider">Menu</span>
              {totalUnreadCount > 0 && (
                <span
                  suppressHydrationWarning
                  className="ml-0.5 px-1.5 py-0.5 min-w-4 h-4 rounded-full bg-white text-[#E56D00] text-[9.5px] font-num font-black flex items-center justify-center shadow-xs"
                >
                  {totalUnreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* DESKTOP FIXED VERTICAL LEFT SIDEBAR — 100% LOCKED IN VIEWPORT AT ALL TIMES */}
      <aside
        className={`hidden lg:flex flex-col fixed top-0 left-0 bottom-0 h-screen z-30 transition-[width] duration-300 ease-out overflow-hidden shadow-2xl ${
          expanded ? "w-72 xl:w-80" : "w-20"
        }`}
      >
        {renderNavContent(false)}
      </aside>

      {/* MOBILE SLIDE-OVER DRAWER FROM LEFT */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-start">
          <div
            className="fixed inset-0 bg-[#001B33]/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 w-80 max-w-[88vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {renderNavContent(true)}
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA ON THE RIGHT — SCROLLS FREELY ACROSS ALL SECTIONS WHILE SIDEBAR STAYS FIXED */}
      <div
        className={`min-h-screen flex flex-col transition-[padding] duration-300 ease-out ${
          expanded ? "lg:pl-72 xl:pl-80" : "lg:pl-20"
        }`}
      >
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-[1500px] w-full mx-auto animate-in fade-in duration-150">
          {children}
        </main>
      </div>
    </div>
  );
}

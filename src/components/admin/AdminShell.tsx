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
  },
  {
    label: "School Impact Summit 2026",
    href: "/AD_Admin/registrations?activity=school-impact-summit-2026",
    activityKey: "school-impact-summit-2026",
  },
  {
    label: "7 Habits of Highly Effective People",
    href: "/AD_Admin/registrations?activity=7-habits",
    activityKey: "7-habits",
  },
  {
    label: "4 Disciplines of Execution (4DX)",
    href: "/AD_Admin/registrations?activity=4dx-for-educators",
    activityKey: "4dx-for-educators",
  },
  {
    label: "Leadership Camp Swat",
    href: "/AD_Admin/registrations?activity=leadership-camp-swat-2026",
    activityKey: "leadership-camp-swat-2026",
  },
];

/* ─── CMS Pages Sub-List ─── */
const CMS_PAGES_SUBMENU = [
  { label: "Home Page", pageKey: "home", icon: Home },
  { label: "Summit 2026", pageKey: "summit", icon: Calendar },
  { label: "Services & Programs", pageKey: "services", icon: Briefcase },
  { label: "Our Story & Vision", pageKey: "about", icon: BookOpen },
  { label: "Activities Catalog", pageKey: "events", icon: Calendar },
  { label: "Pricing & Discounts", pageKey: "pricing", icon: DollarSign },
  { label: "Payment & Bank Accounts", pageKey: "payment", icon: CreditCard },
  { label: "Forms & Microcopy", pageKey: "forms", icon: MessageSquare },
  { label: "Global Site Settings", pageKey: "site", icon: Settings },
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

  // Accordion dropdown states: Activities open by default, CMS closed by default
  const [activitiesOpen, setActivitiesOpen] = useState(true);
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
              className="w-11 h-11 rounded-xl bg-white p-1 border-2 border-white/90 shadow-lg flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform group"
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
              <div className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                Overview
              </div>
            )}
            <Link
              href={resolveLink("/AD_Admin")}
              title={isMini ? "Dashboard" : undefined}
              className={`group relative flex items-center ${
                isMini
                  ? "justify-center p-2.5 rounded-xl"
                  : "px-3.5 py-2.5 rounded-xl"
              } transition-all duration-150 ${
                isDashboardActive
                  ? "bg-gradient-to-r from-[#FF7900] to-[#E56D00] text-white shadow-md shadow-[#FF7900]/25 font-bold"
                  : "text-slate-200 hover:bg-white/8 hover:text-white font-semibold"
              }`}
            >
              <LayoutDashboard
                className={`w-5 h-5 shrink-0 ${
                  isDashboardActive
                    ? "text-white"
                    : "text-[#FFC400] group-hover:text-[#FF7900]"
                }`}
              />
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
              <div className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                Customer CRM
              </div>
            )}

            {/* Contact Inquiries Button */}
            <Link
              href={resolveLink("/AD_Admin/contacts")}
              title={
                isMini
                  ? `Contact Inquiries (${badges.newContacts} new)`
                  : undefined
              }
              className={`group relative flex items-center ${
                isMini
                  ? "justify-center p-2.5 rounded-xl"
                  : "px-3.5 py-2.5 rounded-xl"
              } transition-all duration-150 ${
                isContactsActive
                  ? "bg-gradient-to-r from-[#FF7900] to-[#E56D00] text-white shadow-md shadow-[#FF7900]/25 font-bold"
                  : "text-slate-200 hover:bg-white/8 hover:text-white font-semibold"
              }`}
            >
              <MessageSquareText
                className={`w-5 h-5 shrink-0 ${
                  isContactsActive
                    ? "text-white"
                    : "text-[#FFC400] group-hover:text-[#FF7900]"
                }`}
              />
              {!isMini && (
                <span className="ml-3 text-xs sm:text-[13px] leading-snug truncate flex-1">
                  Contact Inquiries
                </span>
              )}
              {badges.newContacts > 0 && (
                <span
                  className={`${
                    isMini
                      ? "absolute -top-1 -right-1 min-w-4 h-4 px-1 text-[9px]"
                      : "ml-2 min-w-5 h-5 px-1.5 text-[10.5px]"
                  } rounded-full font-num font-extrabold inline-flex items-center justify-center shrink-0 ${
                    isContactsActive
                      ? "bg-white text-[#102E4D]"
                      : "bg-[#FFC400] text-[#001B33] shadow-xs"
                  }`}
                >
                  {badges.newContacts}
                </span>
              )}
            </Link>

            {/* Activity Registrations Button (With styled nested list) */}
            <div>
              <div
                className={`group relative flex items-center ${
                  isMini
                    ? "justify-center p-2.5 rounded-xl"
                    : "px-3.5 py-2.5 rounded-xl"
                } transition-all duration-150 cursor-pointer ${
                  isRegistrationsActive
                    ? "bg-gradient-to-r from-[#FF7900] to-[#E56D00] text-white shadow-md shadow-[#FF7900]/25 font-bold"
                    : "text-slate-200 hover:bg-white/8 hover:text-white font-semibold"
                }`}
                onClick={() => {
                  if (isMini) setExpanded(true);
                  else setActivitiesOpen(!activitiesOpen);
                }}
              >
                <Link
                  href={resolveLink("/AD_Admin/registrations")}
                  className="flex items-center flex-1 min-w-0"
                  onClick={(e) => {
                    if (!isMini) {
                      e.stopPropagation();
                      setActivitiesOpen(true);
                    }
                  }}
                >
                  <CalendarCheck2
                    className={`w-5 h-5 shrink-0 ${
                      isRegistrationsActive
                        ? "text-white"
                        : "text-[#FFC400] group-hover:text-[#FF7900]"
                    }`}
                  />
                  {!isMini && (
                    <span className="ml-3 text-xs sm:text-[13px] leading-snug truncate">
                      Activity Registrations
                    </span>
                  )}
                </Link>

                {badges.pendingRegistrations > 0 && (
                  <span
                    className={`${
                      isMini
                        ? "absolute -top-1 -right-1 min-w-4 h-4 px-1 text-[9px]"
                        : "ml-1.5 min-w-5 h-5 px-1.5 text-[10.5px]"
                    } rounded-full font-num font-extrabold inline-flex items-center justify-center shrink-0 ${
                      isRegistrationsActive
                        ? "bg-white text-[#102E4D]"
                        : "bg-[#FFC400] text-[#001B33] shadow-xs"
                    }`}
                  >
                    {badges.pendingRegistrations}
                  </span>
                )}

                {!isMini && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivitiesOpen(!activitiesOpen);
                    }}
                    className="p-1 rounded text-slate-300 hover:text-white ml-1 cursor-pointer"
                    title="Toggle activities list"
                  >
                    {activitiesOpen ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>

              {/* Nested Activities Sub-Menu */}
              {!isMini && activitiesOpen && (
                <div className="mt-1 ml-4 pl-3 border-l-2 border-[#FFC400]/25 space-y-0.5 py-1">
                  {ACTIVITIES_SUBMENU.map((act) => {
                    return (
                      <Link
                        key={act.href}
                        href={resolveLink(act.href)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-white/8 transition-colors truncate group/act"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF7900] group-hover/act:bg-[#FFC400] group-hover/act:scale-125 transition-transform shrink-0" />
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
              <div className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                Website Management
              </div>
            )}

            <div>
              <div
                className={`group relative flex items-center ${
                  isMini
                    ? "justify-center p-2.5 rounded-xl"
                    : "px-3.5 py-2.5 rounded-xl"
                } transition-all duration-150 cursor-pointer ${
                  isCmsActive
                    ? "bg-gradient-to-r from-[#FF7900] to-[#E56D00] text-white shadow-md shadow-[#FF7900]/25 font-bold"
                    : "text-slate-200 hover:bg-white/8 hover:text-white font-semibold"
                }`}
                onClick={() => {
                  if (isMini) setExpanded(true);
                  else setCmsPagesOpen(!cmsPagesOpen);
                }}
              >
                <Link
                  href={resolveLink("/AD_Admin/cms")}
                  className="flex items-center flex-1 min-w-0"
                  onClick={(e) => {
                    if (!isMini) {
                      e.stopPropagation();
                      setCmsPagesOpen(true);
                    }
                  }}
                >
                  <Layers
                    className={`w-5 h-5 shrink-0 ${
                      isCmsActive
                        ? "text-white"
                        : "text-[#FFC400] group-hover:text-[#FF7900]"
                    }`}
                  />
                  {!isMini && (
                    <span className="ml-3 text-xs sm:text-[13px] leading-snug truncate">
                      Website CMS Portal
                    </span>
                  )}
                </Link>

                {!isMini && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCmsPagesOpen(!cmsPagesOpen);
                    }}
                    className="p-1 rounded text-slate-300 hover:text-white ml-1 cursor-pointer"
                    title="Toggle CMS pages list"
                  >
                    {cmsPagesOpen ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>

              {/* Nested CMS Pages Sub-List (Closed by default, opened by clicking icon or row) */}
              {!isMini && cmsPagesOpen && (
                <div className="mt-1 ml-4 pl-3 border-l-2 border-[#FFC400]/25 space-y-0.5 py-1">
                  {CMS_PAGES_SUBMENU.map((page) => {
                    const PageIcon = page.icon;
                    return (
                      <Link
                        key={page.pageKey}
                        href={resolveLink(`/AD_Admin/cms?page=${page.pageKey}`)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-white/8 transition-colors group/item truncate"
                      >
                        <PageIcon className="w-3 h-3 text-[#FFC400] group-hover/item:text-[#FF7900] shrink-0" />
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
                className="p-2 rounded-xl bg-white/6 hover:bg-white/15 text-[#FFC400] cursor-pointer transition-colors"
                title="Refresh statistics"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <a
                href={isCleanUrl ? "https://leadershipcovenant.com.pk" : "/"}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-white/6 hover:bg-white/15 text-[#FF7900] cursor-pointer transition-colors"
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
                ? "p-2 rounded-xl flex items-center justify-center"
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
      {/* MOBILE FLOATING LEFT BUTTON (WHEN DRAWER IS CLOSED ON MOBILE) */}
      {!mobileOpen && (
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-40 h-11 px-3.5 rounded-2xl bg-[#001B33] hover:bg-[#102E4D] text-white border-2 border-[#FFC400] shadow-2xl flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          title="Open Admin Menu"
          aria-label="Open Admin Menu"
        >
          <Menu className="w-5 h-5 text-[#FFC400]" />
          <span className="text-[11px] font-extrabold text-white">Menu</span>
          {totalUnreadCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#FF7900] text-white text-[9px] font-bold flex items-center justify-center">
              {totalUnreadCount}
            </span>
          )}
        </button>
      )}

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
            className="fixed inset-0 bg-[#001B33]/65 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 w-80 max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1500px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

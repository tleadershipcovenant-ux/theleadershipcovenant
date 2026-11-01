"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquareText,
  CalendarCheck2,
  Layers,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
  KeyRound,
  RefreshCw,
  PanelLeftClose,
  Calendar,
  Sparkles,
  Home,
  Briefcase,
  BookOpen,
  DollarSign,
  CreditCard,
  MessageSquare,
  Settings,
  CircleDot,
} from "lucide-react";

interface SessionInfo {
  email: string;
  role: string;
  jti: string;
  issuedAt: string;
  expiresAt: string;
  tokenPreview: string;
}

interface QuickBadges {
  newContacts: number;
  pendingRegistrations: number;
  supabaseProvider: "supabase" | "local_json";
  cloudinaryConfigured: boolean;
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
  const isLoginRoute = pathname === "/AD_Admin/login";

  // Desktop sidebar: true = expanded drawer, false = collapsed slim vertical bar
  const [expanded, setExpanded] = useState(true);
  // Mobile slide-over
  const [mobileOpen, setMobileOpen] = useState(false);

  // Accordion dropdown states in sidebar
  const [activitiesOpen, setActivitiesOpen] = useState(true);
  const [cmsPagesOpen, setCmsPagesOpen] = useState(true);

  const [jwtPopoverOpen, setJwtPopoverOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [badges, setBadges] = useState<QuickBadges>({
    newContacts: 0,
    pendingRegistrations: 0,
    supabaseProvider: "local_json",
    cloudinaryConfigured: false,
  });

  const fetchShellMeta = useCallback(async () => {
    if (isLoginRoute) return;
    try {
      const [meRes, statsRes] = await Promise.all([
        fetch("/api/admin/auth/me", { cache: "no-store" }),
        fetch("/api/admin/stats", { cache: "no-store" }),
      ]);

      if (meRes.status === 401) {
        router.replace("/AD_Admin/login");
        return;
      }

      if (meRes.ok) {
        const meJson = await meRes.json();
        if (meJson?.session) setSession(meJson.session);
      }

      if (statsRes.ok) {
        const sJson = await statsRes.json();
        setBadges({
          newContacts: sJson?.contactStats?.newCount || 0,
          pendingRegistrations:
            (sJson?.registrationStats?.awaitingVerification || 0) +
            (sJson?.registrationStats?.pendingCallback || 0),
          supabaseProvider:
            sJson?.systemHealth?.supabase?.provider || "local_json",
          cloudinaryConfigured: Boolean(
            sJson?.systemHealth?.cloudinary?.configured
          ),
        });
      }
    } catch {
      // Non-blocking meta fetch
    }
  }, [isLoginRoute, router]);

  useEffect(() => {
    fetchShellMeta();
  }, [fetchShellMeta, pathname]);

  useEffect(() => {
    setMobileOpen(false);
    setJwtPopoverOpen(false);
  }, [pathname]);

  if (isLoginRoute) {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem("tlc_admin_jwt_preview");
      }
      router.replace("/AD_Admin/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  const totalUnreadCount = badges.newContacts + badges.pendingRegistrations;
  const dbLabel =
    badges.supabaseProvider === "supabase" ? "Supabase Cloud" : "Local Database";
  const dbColor =
    badges.supabaseProvider === "supabase" ? "#34D399" : "#FFC400";

  /* ──────────────────────────── Render Sidebar Content ──────────────────────────── */
  const renderNavContent = (isMobile = false) => {
    const isMini = !isMobile && !expanded;

    return (
      <div className="h-full flex flex-col bg-gradient-to-b from-[#001B33] via-[#062340] to-[#001529] text-white border-r border-white/10 select-none shadow-2xl relative">
        {/* Top Signature Colored Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#10B981] shrink-0" />

        {/* Brand Header */}
        <div
          className={`px-3 py-3.5 border-b border-white/10 flex items-center ${
            isMini ? "flex-col justify-center gap-2" : "justify-between gap-2.5"
          }`}
        >
          {/* Logo Button: In Mini Mode, PRESSING LOGO OPENS DRAWER! In Expanded Mode, navigates home */}
          {isMini ? (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="w-11 h-11 rounded-xl bg-white p-1 border-2 border-[#FFC400] shadow-lg flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform group"
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
              href="/AD_Admin"
              className="flex items-center gap-3 min-w-0 group"
              title="Return to Dashboard"
            >
              <div className="w-10 h-10 rounded-xl bg-white p-1 border-2 border-[#FFC400]/80 shadow-md shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
                <img
                  src="/Logo_For_Navbar_Fotter.png"
                  alt="TLC Admin"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <span className="text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-[#FFC400] block truncate">
                  Executive Portal
                </span>
                <span className="font-serif font-bold text-base text-white leading-tight block truncate">
                  TLC Admin CRM
                </span>
              </div>
            </Link>
          )}

          {/* Close Icon Button (Inside Drawer Header) */}
          {!isMini && (
            <button
              type="button"
              onClick={() => {
                if (isMobile) setMobileOpen(false);
                else setExpanded(false);
              }}
              className="p-1.5 rounded-xl text-slate-300 hover:text-white bg-white/6 hover:bg-white/15 border border-white/10 cursor-pointer transition-colors"
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

        {/* Quick Tools Row (Refresh & Live Site) */}
        {!isMini ? (
          <div className="px-4 py-2 flex items-center gap-2 border-b border-white/5 bg-white/2">
            <button
              type="button"
              onClick={fetchShellMeta}
              className="flex-1 h-8 px-2.5 rounded-xl bg-white/6 hover:bg-white/15 border border-white/10 text-slate-200 hover:text-white text-[11px] font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Refresh CRM stats"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#FFC400]" />
              <span>Refresh</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="flex-1 h-8 px-2.5 rounded-xl bg-white/6 hover:bg-white/15 border border-white/10 text-slate-200 hover:text-white text-[11px] font-bold inline-flex items-center justify-center gap-1.5 transition-colors"
              title="View live website in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#FF7900]" />
              <span>Live Site</span>
            </Link>
          </div>
        ) : (
          <div className="py-2.5 flex flex-col items-center gap-2 border-b border-white/5">
            <button
              type="button"
              onClick={fetchShellMeta}
              className="p-2 rounded-xl bg-white/6 hover:bg-white/15 text-[#FFC400] cursor-pointer transition-colors"
              title="Refresh statistics"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              href="/"
              target="_blank"
              className="p-2 rounded-xl bg-white/6 hover:bg-white/15 text-[#FF7900] cursor-pointer transition-colors"
              title="Open public website in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Navigation Content Area (Scrolls internally if long) */}
        <nav
          className={`flex-1 overflow-y-auto ${
            isMini ? "px-2 py-3 space-y-3" : "px-3.5 py-4 space-y-5"
          }`}
        >
          {/* 1. OVERVIEW */}
          <div className="space-y-1">
            {!isMini && (
              <div className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                Overview
              </div>
            )}
            <Link
              href="/AD_Admin"
              title={isMini ? "Dashboard (KPIs & Live CRM Feed)" : undefined}
              className={`group relative flex items-center ${
                isMini ? "justify-center p-2.5 rounded-xl" : "px-3.5 py-2.5 rounded-xl"
              } transition-all duration-150 ${
                pathname === "/AD_Admin"
                  ? "bg-gradient-to-r from-[#FF7900] to-[#E56D00] text-white shadow-md shadow-[#FF7900]/25"
                  : "text-slate-200 hover:bg-white/8 hover:text-white"
              }`}
            >
              <LayoutDashboard
                className={`w-5 h-5 shrink-0 ${
                  pathname === "/AD_Admin"
                    ? "text-white"
                    : "text-[#FFC400]/90 group-hover:text-[#FFC400]"
                }`}
              />
              {!isMini && (
                <div className="ml-3 min-w-0 flex-1">
                  <div className="text-xs sm:text-[13px] font-bold leading-snug truncate">
                    Dashboard
                  </div>
                  <div className="text-[10.5px] text-slate-400 truncate">
                    KPIs &amp; Live CRM Feed
                  </div>
                </div>
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

            {/* Contact Inquiries */}
            <Link
              href="/AD_Admin/contacts"
              title={isMini ? `Contact Inquiries (${badges.newContacts} new)` : undefined}
              className={`group relative flex items-center ${
                isMini ? "justify-center p-2.5 rounded-xl" : "px-3.5 py-2.5 rounded-xl"
              } transition-all duration-150 ${
                pathname?.startsWith("/AD_Admin/contacts")
                  ? "bg-gradient-to-r from-[#FF7900] to-[#E56D00] text-white shadow-md shadow-[#FF7900]/25"
                  : "text-slate-200 hover:bg-white/8 hover:text-white"
              }`}
            >
              <MessageSquareText
                className={`w-5 h-5 shrink-0 ${
                  pathname?.startsWith("/AD_Admin/contacts")
                    ? "text-white"
                    : "text-[#FFC400]/90 group-hover:text-[#FFC400]"
                }`}
              />
              {!isMini && (
                <div className="ml-3 min-w-0 flex-1">
                  <div className="text-xs sm:text-[13px] font-bold leading-snug truncate">
                    Contact Inquiries
                  </div>
                  <div className="text-[10.5px] text-slate-400 truncate">
                    Contact Us Records
                  </div>
                </div>
              )}
              {badges.newContacts > 0 && (
                <span
                  className={`${
                    isMini
                      ? "absolute -top-1 -right-1 min-w-4 h-4 px-1 text-[9px]"
                      : "ml-2 min-w-5 h-5 px-1.5 text-[10.5px]"
                  } rounded-full font-num font-extrabold inline-flex items-center justify-center shrink-0 ${
                    pathname?.startsWith("/AD_Admin/contacts")
                      ? "bg-white text-[#102E4D]"
                      : "bg-[#FFC400] text-[#001B33] shadow-xs"
                  }`}
                >
                  {badges.newContacts}
                </span>
              )}
            </Link>

            {/* Activity Registrations (With nested activities) */}
            <div>
              <div
                className={`group relative flex items-center ${
                  isMini ? "justify-center p-2.5 rounded-xl" : "px-3.5 py-2.5 rounded-xl"
                } transition-all duration-150 cursor-pointer ${
                  pathname?.startsWith("/AD_Admin/registrations")
                    ? "bg-gradient-to-r from-[#FF7900] to-[#E56D00] text-white shadow-md shadow-[#FF7900]/25"
                    : "text-slate-200 hover:bg-white/8 hover:text-white"
                }`}
                onClick={() => {
                  if (isMini) setExpanded(true);
                  else setActivitiesOpen(!activitiesOpen);
                }}
              >
                <Link
                  href="/AD_Admin/registrations"
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
                      pathname?.startsWith("/AD_Admin/registrations")
                        ? "text-white"
                        : "text-[#FFC400]/90 group-hover:text-[#FFC400]"
                    }`}
                  />
                  {!isMini && (
                    <div className="ml-3 min-w-0 flex-1">
                      <div className="text-xs sm:text-[13px] font-bold leading-snug truncate">
                        Activity Registrations
                      </div>
                      <div className="text-[10.5px] text-slate-400 truncate">
                        Bookings &amp; Verification
                      </div>
                    </div>
                  )}
                </Link>

                {badges.pendingRegistrations > 0 && (
                  <span
                    className={`${
                      isMini
                        ? "absolute -top-1 -right-1 min-w-4 h-4 px-1 text-[9px]"
                        : "ml-1.5 min-w-5 h-5 px-1.5 text-[10.5px]"
                    } rounded-full font-num font-extrabold inline-flex items-center justify-center shrink-0 ${
                      pathname?.startsWith("/AD_Admin/registrations")
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
                    className="p-1 rounded text-slate-400 hover:text-white ml-1 cursor-pointer"
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
                        href={act.href}
                        className="block px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-white/8 transition-colors truncate"
                      >
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF7900] mr-2 shrink-0" />
                        <span>{act.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 3. WEBSITE MANAGEMENT & CMS (With All Pages Listed Down There!) */}
          <div className="space-y-1">
            {!isMini && (
              <div className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                Website Management
              </div>
            )}

            <div>
              <div
                className={`group relative flex items-center ${
                  isMini ? "justify-center p-2.5 rounded-xl" : "px-3.5 py-2.5 rounded-xl"
                } transition-all duration-150 cursor-pointer ${
                  pathname?.startsWith("/AD_Admin/cms")
                    ? "bg-gradient-to-r from-[#FF7900] to-[#E56D00] text-white shadow-md shadow-[#FF7900]/25"
                    : "text-slate-200 hover:bg-white/8 hover:text-white"
                }`}
                onClick={() => {
                  if (isMini) setExpanded(true);
                  else setCmsPagesOpen(!cmsPagesOpen);
                }}
              >
                <Link
                  href="/AD_Admin/cms"
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
                      pathname?.startsWith("/AD_Admin/cms")
                        ? "text-white"
                        : "text-[#FFC400]/90 group-hover:text-[#FFC400]"
                    }`}
                  />
                  {!isMini && (
                    <div className="ml-3 min-w-0 flex-1">
                      <div className="text-xs sm:text-[13px] font-bold leading-snug truncate">
                        Website CMS Portal
                      </div>
                      <div className="text-[10.5px] text-slate-400 truncate">
                        All Pages &amp; Content
                      </div>
                    </div>
                  )}
                </Link>

                {!isMini && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCmsPagesOpen(!cmsPagesOpen);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-white ml-1 cursor-pointer"
                    title="Toggle pages list"
                  >
                    {cmsPagesOpen ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>

              {/* Nested CMS Pages Sub-List (All Pages Displayed Down There!) */}
              {!isMini && cmsPagesOpen && (
                <div className="mt-1 ml-4 pl-3 border-l-2 border-[#FFC400]/25 space-y-0.5 py-1">
                  {CMS_PAGES_SUBMENU.map((page) => {
                    const PageIcon = page.icon;
                    return (
                      <Link
                        key={page.pageKey}
                        href={`/AD_Admin/cms?page=${page.pageKey}`}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-white/8 transition-colors group/item"
                      >
                        <PageIcon className="w-3 h-3 text-[#FFC400]/80 group-hover/item:text-[#FFC400] shrink-0" />
                        <span className="truncate">{page.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Bottom Section: Admin Session Card & Logout */}
        <div
          className={`${
            isMini ? "p-2 space-y-2.5" : "p-4 space-y-3"
          } border-t border-white/10 bg-[#001529]/80 shrink-0`}
        >
          {/* JWT Session Details */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setJwtPopoverOpen((v) => !v)}
              className={`w-full ${
                isMini
                  ? "p-2 rounded-xl flex items-center justify-center"
                  : "px-3 py-2 rounded-xl flex items-center gap-2.5 text-left text-xs"
              } bg-white/6 hover:bg-white/12 border border-white/10 font-bold text-slate-200 cursor-pointer transition-colors`}
              title={isMini ? session?.email || "admin@gamail.com" : undefined}
            >
              <ShieldCheck className="w-4 h-4 text-[#34D399] shrink-0" />
              {!isMini && (
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-[11px]">
                    {session?.email || "admin@gamail.com"}
                  </span>
                  <span className="text-[9px] text-slate-400 block font-semibold">
                    Super Administrator
                  </span>
                </div>
              )}
              {!isMini && (
                <span className="px-1.5 py-0.5 rounded bg-[#16A34A]/25 text-[#34D399] text-[9px] font-black uppercase shrink-0">
                  JWT
                </span>
              )}
            </button>

            {/* Popover */}
            {jwtPopoverOpen && (
              <div
                className={`absolute left-0 bottom-full mb-2 ${
                  isMini ? "w-64" : "w-full"
                } rounded-2xl bg-white border-2 border-[#BCE8DF] shadow-2xl p-4 z-50 text-xs space-y-2.5 text-[#102E4D]`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-extrabold inline-flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#FF7900]" />
                    Active JWT Session
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] text-[10px] font-extrabold">
                    HS256 Verified
                  </span>
                </div>
                <div className="space-y-1.5 font-num text-[11.5px]">
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Email:</span>
                    <span className="font-bold truncate text-[#102E4D]">
                      {session?.email || "admin@gamail.com"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Token:</span>
                    <span className="font-semibold text-slate-700">
                      HttpOnly Cookie
                    </span>
                  </div>
                  {session?.expiresAt && (
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-500">Expires:</span>
                      <span className="font-semibold text-slate-700">
                        {new Date(session.expiresAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Database Status Indicator */}
          {!isMini ? (
            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[11px]">
              <span className="text-slate-400 font-semibold">Database Engine</span>
              <span
                className="inline-flex items-center gap-1.5 font-bold"
                style={{ color: dbColor }}
              >
                <span
                  className="w-2 h-2 rounded-full animate-ping"
                  style={{ backgroundColor: dbColor }}
                />
                {dbLabel}
              </span>
            </div>
          ) : (
            <div className="flex justify-center" title={`Database: ${dbLabel}`}>
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: dbColor }}
              />
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
            } bg-white/8 hover:bg-red-500/25 border border-white/10 hover:border-red-400/40 text-slate-200 hover:text-white font-extrabold transition-all cursor-pointer disabled:opacity-60`}
            title="Sign Out of Admin"
          >
            <LogOut className="w-4 h-4 text-[#FFC400]" />
            {!isMini && <span>{loggingOut ? "Signing out…" : "Sign Out"}</span>}
          </button>
        </div>
      </div>
    );
  };

  /* ──────────────────────────── Main Shell Layout ──────────────────────────── */
  return (
    <div className="min-h-screen bg-[#F3FAF8] text-[#102E4D] flex relative overflow-x-hidden">
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

      {/* DESKTOP LOCKED VERTICAL LEFT SIDEBAR */}
      <aside
        className={`hidden lg:block shrink-0 sticky top-0 h-screen z-30 transition-[width] duration-300 ease-out overflow-hidden ${
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

      {/* MAIN CONTENT AREA ON THE RIGHT (SCROLLS FREELY WHILE NAVBAR STAYS LOCKED) */}
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1500px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

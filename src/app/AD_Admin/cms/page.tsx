"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Calendar,
  DollarSign,
  Briefcase,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  Globe,
  Home,
  CheckCircle2,
  AlertTriangle,
  Upload,
  RotateCcw,
  MousePointerClick,
  FileCheck2,
} from "lucide-react";
import type { CmsPageKey } from "@/lib/firebase-cms";

/* ─── Managed Active CMS Pages ─── */
interface ManagedPage {
  key: CmsPageKey;
  label: string;
  pathTag: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  badgeColor: string;
  description: string;
  cmsPath: string;
  livePath: string;
  editableHighlights: string[];
}

const MANAGED_PAGES: ManagedPage[] = [
  {
    key: "home",
    label: "Home Page",
    pathTag: "/",
    icon: Home,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10 border-blue-500/20",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    description: "Hero slider banners, impact statistics, services carousel, testimonials & closing consultation CTA.",
    cmsPath: "/AD_Admin/cms/home",
    livePath: "/",
    editableHighlights: ["Hero Slider", "Impact Numbers", "Programs Carousel", "Voices of Trust"],
  },
  {
    key: "about",
    label: "Our Story & Covenant",
    pathTag: "/about",
    icon: BookOpen,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-500/10 border-amber-500/20",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
    description: "Institutional vision & mission, 4 covenant promises, timeless principles & CEO executive letter.",
    cmsPath: "/AD_Admin/cms/about",
    livePath: "/about",
    editableHighlights: ["Backdrop Photo", "Vision & Mission", "4 Promises", "CEO Message"],
  },
  {
    key: "events",
    label: "Activities Page",
    pathTag: "/activities",
    icon: Calendar,
    iconColor: "text-indigo-500",
    iconBg: "bg-indigo-500/10 border-indigo-500/20",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    description: "Activity cards catalog, cohort schedules, enrollment status, detail modals & apply form pricing.",
    cmsPath: "/AD_Admin/cms/events",
    livePath: "/activities",
    editableHighlights: ["Activity Cards", "Cohort Dates", "Modal Details", "Apply Pricing"],
  },
  {
    key: "services",
    label: "Services & Flagship Programs",
    pathTag: "/services",
    icon: Briefcase,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    description: "6 flagship institutional programs, learning pillars, curriculum highlights & discovery consultation banner.",
    cmsPath: "/AD_Admin/cms/services",
    livePath: "/services",
    editableHighlights: ["6 Program Cards", "Curriculum Bullets", "Program Images", "Consultation CTA"],
  },
  {
    key: "summit",
    label: "School Impact Summit 2026",
    pathTag: "/summit",
    icon: Calendar,
    iconColor: "text-[#FF7900]",
    iconBg: "bg-orange-500/10 border-orange-500/20",
    badgeColor: "bg-orange-50 text-orange-800 border-orange-200",
    description: "Theme objectives, keynote speakers, past video library, audience tracks, venue & registration rules.",
    cmsPath: "/AD_Admin/cms/summit",
    livePath: "/summit",
    editableHighlights: ["Keynote Speakers", "Video Library", "Objectives", "Audience Tracks"],
  },
  {
    key: "pricing",
    label: "Pricing & Early Bird Rules",
    pathTag: "/apply",
    icon: DollarSign,
    iconColor: "text-green-600",
    iconBg: "bg-green-500/10 border-green-500/20",
    badgeColor: "bg-green-50 text-green-700 border-green-200",
    description: "Standard summit fee, early bird discount percentage, live countdown deadline & currency settings.",
    cmsPath: "/AD_Admin/cms/pricing",
    livePath: "/apply",
    editableHighlights: ["Standard Fee (PKR)", "Discount %", "Early Bird Deadline", "Currency"],
  },
];

/* ─── 4-Step How-To Workflow ─── */
const HOW_TO_STEPS = [
  {
    step: "01",
    title: "Select Any Page",
    icon: MousePointerClick,
    desc: "Click 'Open Editor' below or use the left sidebar submenu to access any of the 6 managed pages.",
  },
  {
    step: "02",
    title: "Visual In-Place Edits",
    icon: Layers,
    desc: "Modify text, adjust numbers, reorder items, or click 'Upload Image' to upload via Cloudinary CDN.",
  },
  {
    step: "03",
    title: "Instant Publish (Ctrl+S)",
    icon: Zap,
    desc: "Press Ctrl+S or click 'Publish Changes'. Content syncs to Google Cloud Firestore in under 2 seconds.",
  },
  {
    step: "04",
    title: "Verify on Live Site",
    icon: Globe,
    desc: "Click 'Preview Live' in the editor header to immediately verify your changes on the public website.",
  },
];

/* ─── Core Admin Guidelines ─── */
const GUIDELINES = [
  {
    title: "Publishing Safety & Ctrl+S",
    icon: Zap,
    color: "text-amber-600 bg-amber-50 border-amber-200",
    desc: "All modifications stay staged in your browser until you click 'Publish Changes' or press Ctrl+S. A pulsing amber alert appears whenever unsaved edits exist.",
  },
  {
    title: "Media & Cloudinary Image Uploads",
    icon: Upload,
    color: "text-sky-600 bg-sky-50 border-sky-200",
    desc: "Click 'Upload Image' on any photo field to upload directly from your computer. Supported formats: WebP, PNG, JPG (under 2MB recommended) with global CDN delivery.",
  },
  {
    title: "Zero-Downtime Architecture",
    icon: ShieldCheck,
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    desc: "All public pages utilize defensive multi-tier caching with built-in fallbacks. The website never throws a 500 error or blank screen, even during network transitions.",
  },
  {
    title: "Safe Factory Reset",
    icon: RotateCcw,
    color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    desc: "If content is accidentally deleted or corrupted, click 'Reset Defaults' in any editor header to safely restore the authentic production baseline template.",
  },
];

export default function AdminCmsHubPage() {
  const [pageVisibility, setPageVisibility] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const loadCmsPages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.pages) {
          const vis: Record<string, boolean> = {};
          for (const k of Object.keys(json.pages)) {
            vis[k] = json.pages[k]?.content?._visible !== false;
          }
          setPageVisibility(vis);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCmsPages();
  }, [loadCmsPages]);

  const liveCount = MANAGED_PAGES.filter(
    (m) => pageVisibility[m.key] !== false
  ).length;

  return (
    <div className="space-y-6 pb-16">
      {/* ═══════════════════════════════════════════════════════════
          1. COMPACT EXECUTIVE HEADER WITH ACCENT STRIPE & METRICS
      ═══════════════════════════════════════════════════════════ */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl bg-gradient-to-br from-[#001B33] via-[#0A2644] to-[#001020] text-white p-5 sm:p-7 border border-white/10">
        {/* Top signature gradient stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#10B981]" />

        {/* Ambient subtle glow */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#FFC400]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left info */}
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/8 border border-white/12 text-[10px] font-extrabold uppercase tracking-widest text-[#FFC400]">
                <Sparkles className="w-3 h-3 text-[#FFC400]" />
                <span>Admin CMS Control Center</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Firestore Live</span>
              </span>
            </div>

            <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-white leading-tight">
              Website CMS <span className="text-[#FF7900]">Management Portal</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Central hub for editing all active pages on{" "}
              <strong className="text-white">leadershipcovenant.com.pk</strong>.
              Update headlines, photos, pricing, and speaker profiles with real-time publishing and zero code required.
            </p>
          </div>

          {/* Right quick stats panel */}
          <div className="grid grid-cols-2 gap-2 sm:min-w-[260px] shrink-0">
            {[
              { label: "Managed Pages", val: "6 Core Pages", color: "text-[#38BDF8]", bg: "bg-sky-500/10" },
              { label: "Active Status", val: loading ? "…" : `${liveCount} / 6 Live`, color: "text-[#10B981]", bg: "bg-emerald-500/10" },
              { label: "Publishing", val: "Instant (< 2s)", color: "text-[#FFC400]", bg: "bg-amber-500/10" },
              { label: "Sync Engine", val: "Cloud Firestore", color: "text-[#FF7900]", bg: "bg-orange-500/10" },
            ].map((st) => (
              <div key={st.label} className={`p-3 rounded-2xl border border-white/10 ${st.bg} backdrop-blur-sm`}>
                <div className={`text-sm font-extrabold font-num ${st.color}`}>{st.val}</div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{st.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          2. MANAGED PAGES DIRECTORY (COMPACT & PROPERLY STYLED)
      ═══════════════════════════════════════════════════════════ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-[#FF7900] to-[#FFC400]" />
            <h2 className="font-serif font-bold text-lg text-[#102E4D]">
              Active Website Pages ({MANAGED_PAGES.length})
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">
            Select any page to open its visual editor
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {MANAGED_PAGES.map((page) => {
            const PageIcon = page.icon;
            const isLive = pageVisibility[page.key] !== false;

            return (
              <div
                key={page.key}
                className="group relative rounded-2xl border-2 border-[#C8EFE6] bg-white hover:border-[#FF7900]/50 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col justify-between"
              >
                {/* Top accent line on hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF7900] to-[#FFC400] opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="p-4 sm:p-5 space-y-3">
                  {/* Header: Icon, Title & Route Badge */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${page.iconBg} border group-hover:scale-105 transition-transform`}>
                        <PageIcon className={`w-5 h-5 ${page.iconColor}`} />
                      </div>
                      <div className="min-w-0">
                        <span className={`inline-block text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded border mb-0.5 ${page.badgeColor}`}>
                          {page.pathTag}
                        </span>
                        <h3 className="font-serif font-bold text-sm sm:text-base text-[#102E4D] leading-tight truncate">
                          {page.label}
                        </h3>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase border ${
                        isLive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-emerald-500" : "bg-slate-400"}`} />
                      <span>{isLive ? "Live" : "Draft"}</span>
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {page.description}
                  </p>

                  {/* Highlights tags */}
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {page.editableHighlights.map((hl) => (
                      <span
                        key={hl}
                        className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#EFFBF8] text-[9.5px] font-bold text-slate-600 border border-[#C8EFE6]/60"
                      >
                        {hl}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-4 py-2.5 bg-[#F9FCFB] border-t border-[#C8EFE6] flex items-center justify-between gap-2">
                  <a
                    href={page.livePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#005696] hover:text-[#FF7900] font-bold transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Live</span>
                  </a>

                  <Link
                    href={page.cmsPath}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] hover:from-[#E56D00] hover:to-[#CC5F00] text-white text-xs font-bold uppercase tracking-wider shadow-xs shadow-[#FF7900]/20 hover:shadow-sm transition-all active:scale-95"
                  >
                    <span>Open Editor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          3. HOW TO USE THE CMS: 4-STEP WORKFLOW
      ═══════════════════════════════════════════════════════════ */}
      <div className="rounded-3xl border-2 border-[#C8EFE6] bg-white p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-[#C8EFE6] pb-3">
          <div className="w-8 h-8 rounded-xl bg-[#FF7900]/10 text-[#FF7900] flex items-center justify-center shrink-0">
            <FileCheck2 className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-base sm:text-lg text-[#102E4D]">
              How to Use the Website CMS: 4-Step Editing Workflow
            </h2>
            <p className="text-xs text-slate-400">
              Follow this simple routine to safely edit, preview, and publish content
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {HOW_TO_STEPS.map((st) => {
            const StepIcon = st.icon;
            return (
              <div
                key={st.step}
                className="p-4 rounded-2xl border border-[#C8EFE6] bg-[#FAFCFB] space-y-2 hover:border-[#10B981]/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-num font-extrabold text-xs text-[#FF7900] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                    Step {st.step}
                  </span>
                  <StepIcon className="w-4 h-4 text-[#005696]" />
                </div>
                <h3 className="font-serif font-bold text-sm text-[#102E4D]">
                  {st.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {st.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          4. ADMIN OPERATIONAL GUIDELINES & GOLDEN RULES
      ═══════════════════════════════════════════════════════════ */}
      <div className="rounded-3xl border-2 border-[#C8EFE6] bg-white p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-[#C8EFE6] pb-3">
          <div className="w-8 h-8 rounded-xl bg-[#005696]/10 text-[#005696] flex items-center justify-center shrink-0">
            <BookOpen className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-base sm:text-lg text-[#102E4D]">
              Administrative Guidelines &amp; Publishing Safety Rules
            </h2>
            <p className="text-xs text-slate-400">
              Essential operational rules for website content editors and managers
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {GUIDELINES.map((g, idx) => {
            const GIcon = g.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-[#C8EFE6] bg-[#FAFCFB] space-y-2 hover:border-[#FF7900]/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg border ${g.color}`}>
                    <GIcon className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif font-bold text-sm text-[#102E4D]">
                    {g.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {g.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Highlight Alert Box */}
        <div className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50/80 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 leading-relaxed">
            <strong className="font-bold">Golden Publishing Rule:</strong> Always remember to press{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-white border border-amber-300 text-[10px] font-mono">
              Ctrl+S
            </kbd>{" "}
            or click <strong>&quot;Publish Changes&quot;</strong> before navigating away. Changes are immediately backed up in Cloud Firestore with zero downtime.
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          5. QUICK JUMP DOCK
      ═══════════════════════════════════════════════════════════ */}
      <div className="rounded-2xl border border-[#C8EFE6] bg-white p-3.5 sm:p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-[#FF7900]" />
          <span>Quick Jump to Any Editor:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {MANAGED_PAGES.map((page) => {
            const PageIcon = page.icon;
            return (
              <Link
                key={page.key}
                href={page.cmsPath}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#C8EFE6] bg-[#EFFBF8]/50 hover:bg-[#FF7900]/10 hover:border-[#FF7900] text-xs font-bold text-[#102E4D] hover:text-[#FF7900] transition-colors cursor-pointer"
              >
                <PageIcon className={`w-3.5 h-3.5 ${page.iconColor}`} />
                <span>{page.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

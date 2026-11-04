"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Calendar,
  DollarSign,
  Briefcase,
  Sparkles,
  BookOpen,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Search,
  CreditCard,
  Layers,
  Phone,
  Globe,
  Home,
  Info,
  Sliders,
  FileText,
} from "lucide-react";
import type { CmsPageKey } from "@/lib/firebase-cms";

/* ─── Page Metadata Definitions ─── */
interface PageMeta {
  key: CmsPageKey;
  label: string;
  category: "Commercial" | "Offerings" | "Landing" | "Organization" | "Configuration";
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  livePath: string;
  cmsPath: string;
  iconBg: string;
  iconColor: string;
  categoryColor: string;
  fields: string[];
}

const CMS_PAGES_META: PageMeta[] = [
  {
    key: "home",
    label: "Home Page & Hero Banner",
    category: "Landing",
    icon: Home,
    description: "Hero slider, reach stats, upcoming header, our story, services slider, voices, and CTA.",
    livePath: "/",
    cmsPath: "/AD_Admin/cms/home",
    iconBg: "bg-blue-500/15",
    iconColor: "text-blue-400",
    categoryColor: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    fields: ["Hero", "Reach Stats", "Our Story", "Services Slider", "Voices", "CTA"],
  },
  {
    key: "about",
    label: "Our Story & Covenant",
    category: "Organization",
    icon: Info,
    description: "Foundational philosophy, four covenant promises, timeless principles, and CEO message.",
    livePath: "/about",
    cmsPath: "/AD_Admin/cms/about",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-400",
    categoryColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    fields: ["Hero Banner", "Vision & Mission", "4 Promises", "Principles", "CEO Letter"],
  },
  {
    key: "events",
    label: "Activities Page",
    category: "Offerings",
    icon: Calendar,
    description: "Manage activity cards, details modal, enrollment type, hide/show, and apply-form pricing.",
    livePath: "/activities",
    cmsPath: "/AD_Admin/cms/events",
    iconBg: "bg-violet-500/15",
    iconColor: "text-violet-400",
    categoryColor: "bg-violet-500/15 text-violet-300 border-violet-500/30",
    fields: ["Card Details", "Modal Details", "Enrollment Type", "Apply Form Pricing"],
  },
  {
    key: "services",
    label: "Services & Flagship Programs",
    category: "Offerings",
    icon: Briefcase,
    description: "Hero, all six program cards, images, bullets, enquiry CTAs, and the discovery-call banner.",
    livePath: "/services",
    cmsPath: "/AD_Admin/cms/services",
    iconBg: "bg-teal-500/15",
    iconColor: "text-teal-400",
    categoryColor: "bg-teal-500/15 text-teal-300 border-teal-500/30",
    fields: ["Hero Banner", "Program Cards", "Images & Bullets", "Discovery CTA"],
  },
  {
    key: "summit",
    label: "School Impact Summit 2026",
    category: "Commercial",
    icon: Calendar,
    description: "Theme objectives, featured speakers, venue details, and registration rules.",
    livePath: "/summit",
    cmsPath: "/AD_Admin/cms/summit",
    iconBg: "bg-orange-500/15",
    iconColor: "text-[#FF7900]",
    categoryColor: "bg-orange-500/15 text-orange-300 border-orange-500/30",
    fields: ["Theme & Agenda", "Keynote Speakers", "Venue Schedule", "Registration"],
  },
  {
    key: "pricing",
    label: "Pricing & Early Bird Rules",
    category: "Commercial",
    icon: DollarSign,
    description: "Summit fees, discount percentages, countdown deadlines, and payment instructions.",
    livePath: "/apply",
    cmsPath: "/AD_Admin/cms/pricing",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
    categoryColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    fields: ["Standard Fee (PKR)", "Discount %", "Deadline Date", "Currency"],
  },
  {
    key: "site",
    label: "Global Site & Ticker",
    category: "Configuration",
    icon: Sliders,
    description: "Top marquee announcements ticker, navigation labels, header action buttons, and SEO metadata.",
    livePath: "/",
    cmsPath: "/AD_Admin/cms/site",
    iconBg: "bg-purple-500/15",
    iconColor: "text-purple-400",
    categoryColor: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    fields: ["Marquee Ticker", "Navigation Links", "Call-to-Action", "Global Metadata"],
  },
];

/* ─── Guidelines Guide Sections ─── */
const GUIDELINE_TABS = [
  {
    id: "crud",
    title: "CRUD Operations",
    icon: Layers,
    items: [
      {
        action: "CREATE",
        color: "text-emerald-600 bg-emerald-50 border-emerald-200",
        desc: "Click 'Add New Entry to List' inside any list or section (e.g. add a new cohort, speaker, or service).",
      },
      {
        action: "READ",
        color: "text-sky-600 bg-sky-50 border-sky-200",
        desc: "Inspect live values with clean formatted labels, helper hints, and current photo previews.",
      },
      {
        action: "UPDATE",
        color: "text-amber-600 bg-amber-50 border-amber-200",
        desc: "Edit any headline, discount percentage, date, or description inline. Press Ctrl+S to save.",
      },
      {
        action: "DELETE",
        color: "text-rose-600 bg-rose-50 border-rose-200",
        desc: "Click the trash icon on any entry with instant safety confirmation to remove outdated entries.",
      },
      {
        action: "REORDER",
        color: "text-indigo-600 bg-indigo-50 border-indigo-200",
        desc: "Use the up/down arrows on any card to reorganize priority sequence on the public site.",
      },
    ],
  },
  {
    id: "publishing",
    title: "Publishing & Sync",
    icon: Zap,
    items: [
      {
        action: "INSTANT SYNC",
        color: "text-emerald-600 bg-emerald-50 border-emerald-200",
        desc: "Changes publish directly to the live website database in less than 2 seconds without rebuilding.",
      },
      {
        action: "SHORTCUT",
        color: "text-violet-600 bg-violet-50 border-violet-200",
        desc: "Press Ctrl+S (or Cmd+S on Mac) anywhere in the editor to instantly save and publish all modifications.",
      },
      {
        action: "UNSAVED GUARD",
        color: "text-amber-600 bg-amber-50 border-amber-200",
        desc: "A pulsing amber banner alerts you whenever there are unsaved edits so work is never lost.",
      },
    ],
  },
  {
    id: "media",
    title: "Images & Media",
    icon: Sparkles,
    items: [
      {
        action: "DIRECT UPLOAD",
        color: "text-sky-600 bg-sky-50 border-sky-200",
        desc: "Click 'Upload Image' on any photo field to upload directly from your computer via Cloudinary CDN.",
      },
      {
        action: "FORMATS",
        color: "text-teal-600 bg-teal-50 border-teal-200",
        desc: "Supported image formats include WebP, PNG, JPG, and SVG. Recommended size: under 2 MB.",
      },
      {
        action: "URL PASTING",
        color: "text-indigo-600 bg-indigo-50 border-indigo-200",
        desc: "You can also paste any public image URL directly into the input field for instant preview.",
      },
    ],
  },
  {
    id: "safety",
    title: "Safety & Recovery",
    icon: ShieldCheck,
    items: [
      {
        action: "VISIBILITY TOGGLE",
        color: "text-emerald-600 bg-emerald-50 border-emerald-200",
        desc: "Toggle 'Page is Live' to hide a page temporarily from visitors without deleting any written content.",
      },
      {
        action: "FACTORY RESET",
        color: "text-rose-600 bg-rose-50 border-rose-200",
        desc: "If content is corrupted or accidentally emptied, click 'Reset' to restore the default page template.",
      },
      {
        action: "ISOLATION",
        color: "text-blue-600 bg-blue-50 border-blue-200",
        desc: "Each page maintains its own independent storage, so edits on one page never affect other pages.",
      },
    ],
  },
];

export default function AdminCmsHubPage() {
  const [pageVisibility, setPageVisibility] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeGuideTab, setActiveGuideTab] = useState("crud");
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

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

  const handleToggleCardVisibility = async (key: CmsPageKey, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setTogglingKey(key);
    const newStatus = !(pageVisibility[key] !== false);
    setPageVisibility((prev) => ({ ...prev, [key]: newStatus }));

    try {
      // Fetch current content first to preserve
      const getRes = await fetch("/api/admin/cms", { cache: "no-store" });
      const getJson = await getRes.json();
      const existing = getJson?.pages?.[key]?.content || {};
      const updated = { ...existing, _visible: newStatus };

      const putRes = await fetch("/api/admin/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page_key: key, content: updated }),
      });
      const putJson = await putRes.json().catch(() => ({}));
      if (!putRes.ok || !putJson.ok) {
        throw new Error(putJson.error || "Failed to update visibility");
      }
    } catch {
      setPageVisibility((prev) => ({ ...prev, [key]: !newStatus }));
    } finally {
      setTogglingKey(null);
    }
  };

  const filteredPages = useMemo(() => {
    return CMS_PAGES_META.filter((page) => {
      const matchCat = selectedCategory === "All" || page.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        page.label.toLowerCase().includes(q) ||
        page.description.toLowerCase().includes(q) ||
        page.fields.some((f) => f.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const liveCount = CMS_PAGES_META.filter(
    (m) => pageVisibility[m.key] !== false
  ).length;

  return (
    <div className="space-y-6 pb-16">
      {/* ══════════════════════════════════════════════════
          1. COMPACT HERO SECTION
      ══════════════════════════════════════════════════ */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl bg-gradient-to-br from-[#001B33] via-[#0A2644] to-[#001020] text-white p-6 sm:p-8 border border-white/10">
        {/* Top signature gradient stripe */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#10B981]" />

        {/* Ambient subtle glow */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#FF7900]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left info */}
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/8 border border-white/12 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#FFC400]" />
              <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#FFC400]">
                Firebase Cloud CMS · Real-Time Publishing
              </span>
            </div>

            <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-white leading-tight">
              Website CMS <span className="text-[#FF7900]">Management Portal</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Complete administrative control over all pages of{" "}
              <strong className="text-white">leadershipcovenant.com.pk</strong>.
              Perform visual CRUD edits on texts, pricing rules, schedules, and photos with zero code required.
            </p>

            {/* Quick stats strip */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/6 border border-white/10 text-xs">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-slate-300">
                  <strong className="text-white font-num">{CMS_PAGES_META.length}</strong> Managed Pages
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/6 border border-white/10 text-xs">
                <Globe className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span className="text-slate-300">
                  <strong className="text-white font-num">{loading ? "…" : liveCount}</strong> Live
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/6 border border-white/10 text-xs">
                <Zap className="w-3.5 h-3.5 text-[#FFC400]" />
                <span className="text-slate-300">Instant Sync</span>
              </div>
            </div>
          </div>

          {/* Right quick status panel */}
          <div className="grid grid-cols-2 gap-2.5 sm:min-w-[240px]">
            {[
              { label: "Total Pages", val: CMS_PAGES_META.length, color: "text-[#38BDF8]", bg: "bg-sky-500/10" },
              { label: "Active Live", val: loading ? "…" : liveCount, color: "text-[#10B981]", bg: "bg-emerald-500/10" },
              { label: "CRUD Actions", val: "Full Access", color: "text-[#FFC400]", bg: "bg-amber-500/10" },
              { label: "Cloud Sync", val: "Active", color: "text-[#FF7900]", bg: "bg-orange-500/10" },
            ].map((st) => (
              <div key={st.label} className={`p-3 rounded-xl border border-white/10 ${st.bg} backdrop-blur-sm`}>
                <div className={`text-base font-extrabold font-num ${st.color}`}>{st.val}</div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{st.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          2. FILTER & SEARCH TOOLBAR
      ══════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#C8EFE6] shadow-xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none]">
          {["All", "Landing", "Offerings", "Commercial", "Organization", "Configuration"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-[#102E4D] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search page or field…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#C8EFE6] bg-[#FAFCFB] text-[#102E4D] placeholder:text-slate-400 focus:outline-none focus:border-[#FF7900] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          3. MANAGED PAGES GRID (ALL INCLUDED PAGES)
      ══════════════════════════════════════════════════ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-[#FF7900] to-[#FFC400]" />
            <h2 className="font-serif font-bold text-lg text-[#102E4D]">
              Select a Page to Edit
            </h2>
            <span className="text-xs text-slate-400">
              ({filteredPages.length} {filteredPages.length === 1 ? "page" : "pages"})
            </span>
          </div>

          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Click &quot;Open CRUD Editor&quot; to modify content
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPages.map((meta) => {
            const MetaIcon = meta.icon;
            const isVisible = pageVisibility[meta.key] !== false;
            const isToggling = togglingKey === meta.key;

            return (
              <div
                key={meta.key}
                className="group relative rounded-2xl border-2 border-[#C8EFE6] bg-white hover:border-[#FF7900]/50 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col justify-between"
              >
                {/* Top accent bar on hover */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF7900] to-[#FFC400] opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="p-4 sm:p-5 space-y-3">
                  {/* Header: Icon, Category, and Live Toggle */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.iconBg} border border-slate-100 group-hover:scale-105 transition-transform`}>
                        <MetaIcon className={`w-5 h-5 ${meta.iconColor}`} />
                      </div>
                      <div className="min-w-0">
                        <span className="inline-block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                          {meta.category}
                        </span>
                        <h3 className="font-serif font-bold text-sm sm:text-base text-[#102E4D] leading-tight truncate">
                          {meta.label}
                        </h3>
                      </div>
                    </div>

                    {/* Quick Live / Hidden Status Switch */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleCardVisibility(meta.key, e)}
                      disabled={isToggling}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border cursor-pointer transition-all active:scale-95 ${
                        isVisible
                          ? "bg-[#DCFCE7] text-[#15803D] border-green-200 hover:bg-green-100"
                          : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                      }`}
                      title={isVisible ? "Click to Hide page from visitors" : "Click to make page Live"}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isVisible ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                      <span>{isToggling ? "Updating…" : isVisible ? "Live" : "Hidden"}</span>
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {meta.description}
                  </p>

                  {/* Managed Fields Tags */}
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {meta.fields.map((f) => (
                      <span
                        key={f}
                        className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#EFFBF8] text-[9.5px] font-bold text-slate-600 border border-[#C8EFE6]/60"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="px-4 py-3 bg-[#F9FCFB] border-t border-[#C8EFE6] flex items-center justify-between gap-2">
                  <a
                    href={meta.livePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#005696] hover:text-[#FF7900] font-bold transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Live Page</span>
                  </a>

                  <Link
                    href={meta.cmsPath}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] hover:from-[#E56D00] hover:to-[#CC5F00] text-white text-xs font-extrabold uppercase tracking-wider shadow-xs shadow-[#FF7900]/20 hover:shadow-sm transition-all active:scale-95"
                  >
                    <span>Open CRUD Editor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          4. ADMIN GUIDELINES SECTION
      ══════════════════════════════════════════════════ */}
      <div className="rounded-3xl border-2 border-[#C8EFE6] bg-white p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#C8EFE6] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#005696]/10 text-[#005696] flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base sm:text-lg text-[#102E4D]">
                Admin Operational Guidelines
              </h2>
              <p className="text-xs text-slate-400">
                Official manual for website content managers and editors
              </p>
            </div>
          </div>

          {/* Guide navigation pills */}
          <div className="flex items-center gap-1 bg-[#EFFBF8] p-1 rounded-xl border border-[#C8EFE6] overflow-x-auto">
            {GUIDELINE_TABS.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveGuideTab(tab.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeGuideTab === tab.id
                      ? "bg-[#102E4D] text-white shadow-xs"
                      : "text-slate-600 hover:text-[#102E4D]"
                  }`}
                >
                  <TabIcon className="w-3 h-3" />
                  <span>{tab.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active guideline tab content */}
        {GUIDELINE_TABS.filter((t) => t.id === activeGuideTab).map((tab) => (
          <div key={tab.id} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {tab.items.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-[#C8EFE6] bg-[#FAFCFB] space-y-1.5 hover:border-[#10B981]/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${item.color}`}>
                    {item.action}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        ))}

        {/* Important notice badge */}
        <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/80 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 leading-relaxed">
            <strong>Publishing Safety Rule:</strong> All changes are stored locally in the browser editor until you click{" "}
            <strong>&quot;Publish Changes&quot;</strong> or press <strong>Ctrl+S</strong>. Always verify changes via &quot;Preview Live Page&quot; before logging out.
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          5. QUICK NAVIGATION DOCK
      ══════════════════════════════════════════════════ */}
      <div className="rounded-2xl border border-[#C8EFE6] bg-white p-4 space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-[#FF7900]" />
          <span>Quick Jump to Any CMS Page:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {CMS_PAGES_META.map((meta) => {
            const MetaIcon = meta.icon;
            return (
              <Link
                key={meta.key}
                href={meta.cmsPath}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#C8EFE6] bg-[#EFFBF8]/50 hover:bg-[#FF7900]/10 hover:border-[#FF7900] text-xs font-bold text-[#102E4D] hover:text-[#FF7900] transition-colors cursor-pointer"
              >
                <MetaIcon className={`w-3.5 h-3.5 ${meta.iconColor}`} />
                <span>{meta.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

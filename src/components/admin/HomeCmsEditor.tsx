"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Award,
  Briefcase,
  Building,
  Check,
  CheckCircle2,
  ChevronRight,
  Edit3,
  ExternalLink,
  Eye,
  Globe,
  Image as ImageIcon,
  Layers,
  Loader2,
  Plus,
  Quote,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import {
  HOME_PAGE,
  normalizeHomeCms,
  type HomePageContent,
  type HomeServiceSlide,
  type HomeStatTab,
  type HomeTestimonial,
} from "@/content/home";
import { cmsInputClass } from "@/components/admin/cms-fields";

export default function HomeCmsEditor() {
  const [content, setContent] = useState<HomePageContent>(HOME_PAGE);
  const [visible, setVisible] = useState(true);
  const [original, setOriginal] = useState(
    JSON.stringify({ ...HOME_PAGE, _visible: true })
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [activeStatTab, setActiveStatTab] = useState<string>("international");
  const [activeSection, setActiveSection] = useState<
    "hero" | "stats" | "services" | "story" | "voices" | "cta"
  >("hero");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Service Edit / Add Modal State
  const [editingServiceIndex, setEditingServiceIndex] = useState<number | null>(
    null
  );
  const [isAddingService, setIsAddingService] = useState(false);
  const [serviceFormData, setServiceFormData] = useState<HomeServiceSlide>({
    id: "",
    image: "/images/hero-students.jpg",
    title: "",
    category: "Whole-School Transformation",
    description: "",
    href: "/services",
  });
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(
    null
  );

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadCallbackRef = useRef<((url: string | null) => void) | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Track Unsaved Changes
  const hasUnsavedChanges = useMemo(
    () => JSON.stringify({ ...content, _visible: visible }) !== original,
    [content, visible, original]
  );

  // Load from /api/admin/cms
  const loadPage = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms", { cache: "no-store" });
      if (!res.ok) {
        setContent(HOME_PAGE);
        setVisible(true);
        setOriginal(JSON.stringify({ ...HOME_PAGE, _visible: true }));
        return;
      }
      const json = await res.json();
      const raw = json.pages?.home?.content || {};
      const normalized = normalizeHomeCms(raw);
      const isVisible = raw._visible !== false;
      setContent(normalized);
      setVisible(isVisible);
      setOriginal(JSON.stringify({ ...normalized, _visible: isVisible }));
    } catch (err) {
      console.error("[Home CMS Load Error]", err);
      setContent(HOME_PAGE);
      setVisible(true);
      setOriginal(JSON.stringify({ ...HOME_PAGE, _visible: true }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  // Save changes to Firebase Firestore via /api/admin/cms
  const handleSave = useCallback(async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const payload = { ...content, _visible: visible };
      const res = await fetch("/api/admin/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page_key: "home", content: payload }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Failed to persist to Firebase Firestore.");
      }
      setOriginal(JSON.stringify(payload));
      setFeedback({
        type: "success",
        text: "Home page content published successfully! Public homepage is updated in real time.",
      });
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to publish changes.",
      });
    } finally {
      setSaving(false);
    }
  }, [content, visible]);

  // Reset to default
  const handleReset = async () => {
    if (
      !confirm(
        "Are you sure you want to restore the Home page to original code defaults? Any custom edits will be replaced."
      )
    ) {
      return;
    }
    setResetting(true);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset", page_key: "home" }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        const saved = normalizeHomeCms(json.page?.content);
        const isVisible = json.page?.content?._visible !== false;
        setContent(saved);
        setVisible(isVisible);
        setOriginal(JSON.stringify({ ...saved, _visible: isVisible }));
        setFeedback({
          type: "success",
          text: "Home page restored to factory defaults.",
        });
      }
    } finally {
      setResetting(false);
    }
  };

  // Image Upload Trigger
  const triggerImageUpload = (onUploaded: (url: string) => void) => {
    uploadCallbackRef.current = (url) => {
      if (url) onUploaded(url);
    };
    fileInputRef.current?.click();
  };

  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) {
      uploadCallbackRef.current?.(null);
      return;
    }
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("purpose", "cms");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (res.ok && json.url) {
        uploadCallbackRef.current?.(json.url);
        setFeedback({
          type: "success",
          text: "Image uploaded successfully to Cloudinary.",
        });
      } else {
        uploadCallbackRef.current?.(null);
        setFeedback({
          type: "error",
          text: json.error || "Failed to upload image.",
        });
      }
    } catch {
      uploadCallbackRef.current?.(null);
      setFeedback({
        type: "error",
        text: "Network error during image upload.",
      });
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // STATS SECTION HELPERS (Change Numbers Only)
  // ───────────────────────────────────────────────────────────────────────────
  const updateStatNumber = (
    tabIndex: number,
    statIndex: number,
    newVal: number
  ) => {
    const nextTabs = [...content.stats.tabs];
    const targetTab = nextTabs[tabIndex];
    if (!targetTab) return;
    const nextStats = [...targetTab.stats];
    const targetStat = nextStats[statIndex];
    if (!targetStat) return;

    nextStats[statIndex] = {
      ...targetStat,
      value: isNaN(newVal) ? 0 : newVal,
    };
    nextTabs[tabIndex] = { ...targetTab, stats: nextStats };
    setContent((prev) => ({
      ...prev,
      stats: { ...prev.stats, tabs: nextTabs },
    }));
  };

  // ───────────────────────────────────────────────────────────────────────────
  // SERVICES CRUD HELPERS
  // ───────────────────────────────────────────────────────────────────────────
  const handleOpenAddService = () => {
    setServiceFormData({
      id: `service-${Date.now()}`,
      image: "/images/hero-students.jpg",
      title: "",
      category: "Whole-School Transformation",
      description: "",
      href: "/services",
    });
    setIsAddingService(true);
    setEditingServiceIndex(null);
  };

  const handleOpenEditService = (index: number) => {
    const target = content.services.slides[index];
    if (!target) return;
    setServiceFormData({ ...target });
    setEditingServiceIndex(index);
    setIsAddingService(false);
  };

  const handleSaveServiceModal = () => {
    if (!serviceFormData.title.trim()) {
      alert("Please provide a service title.");
      return;
    }
    const nextSlides = [...content.services.slides];
    if (isAddingService) {
      nextSlides.push({
        ...serviceFormData,
        id:
          serviceFormData.id ||
          serviceFormData.title.toLowerCase().replace(/\s+/g, "-"),
      });
    } else if (editingServiceIndex !== null) {
      nextSlides[editingServiceIndex] = { ...serviceFormData };
    }
    setContent((prev) => ({
      ...prev,
      services: { ...prev.services, slides: nextSlides },
    }));
    setIsAddingService(false);
    setEditingServiceIndex(null);
    setFeedback({
      type: "success",
      text: isAddingService
        ? `Added new service "${serviceFormData.title}". Click "Publish Changes" to save.`
        : `Updated service "${serviceFormData.title}". Click "Publish Changes" to save.`,
    });
  };

  const handleMoveService = (index: number, direction: -1 | 1) => {
    const next = [...content.services.slides];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    setContent((prev) => ({
      ...prev,
      services: { ...prev.services, slides: next },
    }));
  };

  const handleDeleteService = (index: number) => {
    const target = content.services.slides[index];
    const next = content.services.slides.filter((_, i) => i !== index);
    setContent((prev) => ({
      ...prev,
      services: { ...prev.services, slides: next },
    }));
    setDeleteConfirmIndex(null);
    setFeedback({
      type: "success",
      text: `Service "${target?.title || "Item"}" removed. Click "Publish Changes" to persist.`,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24">
      {/* Hidden File Input for Image Uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* 1. Header Bar with Context & Key Actions */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-xs p-5 sm:p-7 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link
                href="/AD_Admin/cms"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#102E4D] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                CMS Hub
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-semibold text-[#FF7900]">
                Home Page
              </span>
            </div>
            <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-[#102E4D] flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#001B33] via-[#102E4D] to-[#001B33] text-white flex items-center justify-center shadow-md shadow-[#102E4D]/20 shrink-0">
                <Sparkles className="w-5 h-5 text-[#FFC400]" />
              </span>
              <span>Home Page CMS</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
              Manage the hero presentation, impact numbers, services slider, and
              community testimonials. Changes publish live to the public homepage with
              zero downtime.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/"
              target="_blank"
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-[#102E4D] inline-flex items-center gap-2 transition-all shadow-2xs hover:border-[#102E4D]/30"
              title="Preview public homepage in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>Preview /</span>
            </Link>

            <button
              type="button"
              onClick={handleReset}
              disabled={resetting || loading}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 inline-flex items-center gap-2 transition-all shadow-2xs cursor-pointer disabled:opacity-60"
              title="Reset home content to original code defaults"
            >
              <RotateCcw
                className={`w-3.5 h-3.5 text-slate-500 ${
                  resetting ? "animate-spin" : ""
                }`}
              />
              <span>Reset Defaults</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading || !hasUnsavedChanges}
              className={`px-5 py-2.5 rounded-xl font-black text-xs inline-flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                hasUnsavedChanges
                  ? "bg-gradient-to-r from-[#FF7900] to-[#E66D00] text-white hover:shadow-lg hover:brightness-105 ring-2 ring-[#FF7900]/30"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
              }`}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>
                    {hasUnsavedChanges ? "Publish Changes" : "Changes Published"}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs font-semibold animate-in fade-in duration-200 ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-rose-50 border-rose-200 text-rose-900"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Section Navigation Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
          {[
            { id: "hero", label: "01 · Hero Header", icon: Sparkles },
            { id: "stats", label: "02 · Reach Stats (Numbers)", icon: Users },
            { id: "services", label: "03 · Services Slider (CRUD)", icon: Briefcase },
            { id: "story", label: "04 · Our Story & Promises", icon: Award },
            { id: "voices", label: "05 · Voices & Quotes", icon: Quote },
            { id: "cta", label: "06 · Action Banner", icon: ChevronRight },
          ].map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => {
                  setActiveSection(sec.id as typeof activeSection);
                  document.getElementById(`section-${sec.id}`)?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold inline-flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#102E4D] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? "text-[#FFC400]" : "text-slate-400"
                  }`}
                />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-[#FF7900] animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Loading homepage content from Firestore...
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* SECTION 01: HERO PRESENTATION                                      */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          <section
            id="section-hero"
            className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden scroll-mt-24"
          >
            {/* Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#001B33] via-[#0A2647] to-[#001B33] text-white flex items-center justify-between gap-4 border-b border-white/10">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFC400] block">
                  Section 01
                </span>
                <h2 className="font-serif font-extrabold text-lg sm:text-xl text-white">
                  Executive Hero Presentation
                </h2>
              </div>
              <span className="text-xs text-white/60 font-semibold hidden sm:inline">
                Top of Homepage
              </span>
            </div>

            <div className="p-5 sm:p-7 space-y-6">
              {/* Hero Live Miniature Preview */}
              <div className="relative rounded-2xl overflow-hidden bg-[#001B33] text-white p-6 sm:p-8 shadow-inner border border-white/10 space-y-4">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#FFC400]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/50 block">
                  Public Hero Live Preview
                </span>
                <h3 className="font-serif font-extrabold text-2xl sm:text-4xl text-white leading-tight">
                  {content.hero.headingStart}{" "}
                  <span className="text-[#FFC400]">
                    {content.hero.headingHighlight}
                  </span>
                </h3>
                <p className="text-xs sm:text-sm text-white/85 max-w-xl leading-relaxed">
                  {content.hero.paragraphs[0] ||
                    "The Leadership Covenant is our promise to every school, family and learner."}
                </p>
                <p className="text-xs font-bold text-[#FFC400]">
                  {content.hero.closingLine}
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <span className="px-4 py-2 rounded-xl bg-[#FF7900] text-white text-xs font-bold shadow-xs">
                    {content.hero.primaryCta.label || "Explore Our Services"}
                  </span>
                  <span className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-bold">
                    {content.hero.secondaryCta.label || "Upcoming Activities"}
                  </span>
                </div>
              </div>

              {/* Reduced & Focused Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Heading Start Text
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.hero.headingStart}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, headingStart: e.target.value },
                      }))
                    }
                    placeholder="A Covenant to"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Gold Highlight Text
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.hero.headingHighlight}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          headingHighlight: e.target.value,
                        },
                      }))
                    }
                    placeholder="Build Leaders"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Lead Body Paragraph
                  </label>
                  <textarea
                    rows={2}
                    className={cmsInputClass}
                    value={content.hero.paragraphs.join("\n")}
                    onChange={(e) => {
                      const lines = e.target.value
                        .split("\n")
                        .map((l) => l.trim())
                        .filter(Boolean);
                      setContent((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, paragraphs: lines },
                      }));
                    }}
                    placeholder="Enter main hero paragraph..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Gold Closing Line
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.hero.closingLine}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, closingLine: e.target.value },
                      }))
                    }
                    placeholder="We help you develop it, deliberately."
                  />
                </div>

                {/* Primary CTA */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-500 block">
                    Primary Button (Gold/Orange)
                  </span>
                  <div className="space-y-2">
                    <input
                      type="text"
                      className={cmsInputClass}
                      value={content.hero.primaryCta.label}
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...prev,
                          hero: {
                            ...prev.hero,
                            primaryCta: {
                              ...prev.hero.primaryCta,
                              label: e.target.value,
                            },
                          },
                        }))
                      }
                      placeholder="Button Label"
                    />
                    <input
                      type="text"
                      className={cmsInputClass}
                      value={content.hero.primaryCta.href}
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...prev,
                          hero: {
                            ...prev.hero,
                            primaryCta: {
                              ...prev.hero.primaryCta,
                              href: e.target.value,
                            },
                          },
                        }))
                      }
                      placeholder="/services"
                    />
                  </div>
                </div>

                {/* Secondary CTA */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-500 block">
                    Secondary Button (Outlined)
                  </span>
                  <div className="space-y-2">
                    <input
                      type="text"
                      className={cmsInputClass}
                      value={content.hero.secondaryCta.label}
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...prev,
                          hero: {
                            ...prev.hero,
                            secondaryCta: {
                              ...prev.hero.secondaryCta,
                              label: e.target.value,
                            },
                          },
                        }))
                      }
                      placeholder="Button Label"
                    />
                    <input
                      type="text"
                      className={cmsInputClass}
                      value={content.hero.secondaryCta.href}
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...prev,
                          hero: {
                            ...prev.hero,
                            secondaryCta: {
                              ...prev.hero.secondaryCta,
                              href: e.target.value,
                            },
                          },
                        }))
                      }
                      placeholder="/activities"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* SECTION 02: REACH & IMPACT STATS (NUMBERS ONLY)                     */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          <section
            id="section-stats"
            className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden scroll-mt-24"
          >
            {/* Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-950 via-[#0A2647] to-emerald-950 text-white flex items-center justify-between gap-4 border-b border-white/10">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block">
                  Section 02 · Numbers Only
                </span>
                <h2 className="font-serif font-extrabold text-lg sm:text-xl text-white">
                  Reach &amp; Impact Statistics
                </h2>
              </div>
              <span className="text-xs text-emerald-300 font-semibold hidden sm:inline">
                Edit Key Metric Figures
              </span>
            </div>

            <div className="p-5 sm:p-7 space-y-6">
              {/* Tab Selector matching public stats component */}
              <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200 max-w-md">
                {content.stats.tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveStatTab(tab.id)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      activeStatTab === tab.id
                        ? "bg-[#102E4D] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* 4 Cards for Active Tab where user ONLY changes numbers */}
              {(() => {
                const tabIndex = content.stats.tabs.findIndex(
                  (t) => t.id === activeStatTab
                );
                const currentTab =
                  tabIndex >= 0 ? content.stats.tabs[tabIndex] : null;
                if (!currentTab) return null;

                const toneColors: Record<string, { bg: string; text: string; border: string }> = {
                  gold: {
                    bg: "bg-amber-50/70",
                    text: "text-amber-800",
                    border: "border-amber-200",
                  },
                  cyan: {
                    bg: "bg-sky-50/70",
                    text: "text-sky-800",
                    border: "border-sky-200",
                  },
                  mint: {
                    bg: "bg-emerald-50/70",
                    text: "text-emerald-800",
                    border: "border-emerald-200",
                  },
                  orange: {
                    bg: "bg-orange-50/70",
                    text: "text-orange-800",
                    border: "border-orange-200",
                  },
                };

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {currentTab.stats.map((stat, statIndex) => {
                      const colors =
                        toneColors[stat.tone] || toneColors.gold;

                      return (
                        <div
                          key={statIndex}
                          className={`p-5 rounded-2xl border-2 ${colors.border} ${colors.bg} space-y-3 transition-all hover:shadow-xs`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              Metric 0{statIndex + 1}
                            </span>
                            <span className="text-xs font-black text-slate-500 font-num">
                              {stat.suffix}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-extrabold text-[#102E4D]">
                              {stat.label}
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-lg font-black text-[#102E4D] font-num focus:outline-none focus:border-[#FF7900] focus:ring-3 focus:ring-[#FF7900]/15"
                                value={stat.value}
                                onChange={(e) =>
                                  updateStatNumber(
                                    tabIndex,
                                    statIndex,
                                    Number(e.target.value)
                                  )
                                }
                              />
                            </div>
                            <span className="text-[10px] text-slate-500 block pt-0.5">
                              Displays on homepage as:{" "}
                              <strong className="text-[#102E4D]">
                                {stat.value.toLocaleString()}
                                {stat.suffix}
                              </strong>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* SECTION 03: SERVICES SLIDER (FULL CRUD)                             */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          <section
            id="section-services"
            className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden scroll-mt-24"
          >
            {/* Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#001B33] via-[#0D3B66] to-[#001B33] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFC400] block">
                  Section 03 · Services Slider
                </span>
                <h2 className="font-serif font-extrabold text-lg sm:text-xl text-white">
                  Homepage Services Slider (Full CRUD)
                </h2>
                <p className="text-xs text-slate-300 max-w-xl">
                  Add, edit, reorder, or delete services displayed on the 3D
                  coverflow carousel.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddService}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E66D00] text-white text-xs font-black inline-flex items-center gap-2 transition-all shadow-md hover:brightness-105 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Add New Service</span>
              </button>
            </div>

            <div className="p-5 sm:p-7 space-y-6">
              {/* Slider Heading & Subtitle Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Section Eyebrow
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.services.eyebrow}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        services: {
                          ...prev.services,
                          eyebrow: e.target.value,
                        },
                      }))
                    }
                    placeholder="What We Do"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Section Main Heading
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.services.heading}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        services: {
                          ...prev.services,
                          heading: e.target.value,
                        },
                      }))
                    }
                    placeholder="Our Services"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Subtitle Description
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.services.subtitle}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        services: {
                          ...prev.services,
                          subtitle: e.target.value,
                        },
                      }))
                    }
                    placeholder="Explore our pathways to building leadership at every level..."
                  />
                </div>
              </div>

              {/* Service Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {content.services.slides.map((slide, index) => (
                  <div
                    key={slide.id || index}
                    className="rounded-2xl border-2 border-slate-200 bg-white overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Preview with Index Badge */}
                      <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                        <img
                          src={slide.image || "/images/hero-students.jpg"}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-black text-white font-num">
                          #{index + 1}
                        </span>
                        <span className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-[#FF7900] text-[9.5px] font-black text-white uppercase tracking-wider">
                          {slide.category || "Service"}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-2">
                        <h4 className="font-serif font-bold text-base text-[#102E4D] leading-snug">
                          {slide.title || "Untitled Service"}
                        </h4>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {slide.description || "No description provided."}
                        </p>
                        <p className="text-[11px] font-mono text-slate-400 truncate">
                          Link: {slide.href || "/services"}
                        </p>
                      </div>
                    </div>

                    {/* Actions Toolbar */}
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveService(index, -1)}
                          disabled={index === 0}
                          className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center disabled:opacity-40 cursor-pointer"
                          title="Move left in slider"
                        >
                          <ArrowUp className="w-3.5 h-3.5 -rotate-90" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveService(index, 1)}
                          disabled={index === content.services.slides.length - 1}
                          className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center disabled:opacity-40 cursor-pointer"
                          title="Move right in slider"
                        >
                          <ArrowDown className="w-3.5 h-3.5 -rotate-90" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmIndex(index)}
                          className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                          title="Delete service"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditService(index)}
                          className="px-3 py-1.5 rounded-lg bg-[#102E4D] hover:bg-[#163B61] text-white text-xs font-extrabold inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#FFC400]" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* SECTION 04: OUR STORY & 4 PROMISES                                 */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          <section
            id="section-story"
            className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden scroll-mt-24"
          >
            {/* Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#001B33] via-[#0A2647] to-[#001B33] text-white flex items-center justify-between gap-4 border-b border-white/10">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFC400] block">
                  Section 04
                </span>
                <h2 className="font-serif font-extrabold text-lg sm:text-xl text-white">
                  Our Story &amp; 4 Promises
                </h2>
              </div>
              <span className="text-xs text-white/60 font-semibold hidden sm:inline">
                About The Leadership Covenant
              </span>
            </div>

            <div className="p-5 sm:p-7 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Eyebrow Text
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.story.eyebrow}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        story: { ...prev.story, eyebrow: e.target.value },
                      }))
                    }
                    placeholder="Our Story"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Main Story Heading
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.story.heading}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        story: { ...prev.story, heading: e.target.value },
                      }))
                    }
                    placeholder="Everyone has a leader within..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Story Subtitle
                  </label>
                  <textarea
                    rows={2}
                    className={cmsInputClass}
                    value={content.story.subtitle}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        story: { ...prev.story, subtitle: e.target.value },
                      }))
                    }
                    placeholder="The Leadership Covenant exists to prepare individuals for life..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Story Image URL / Cloudinary Upload
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      className={cmsInputClass}
                      value={content.story.image}
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...prev,
                          story: { ...prev.story, image: e.target.value },
                        }))
                      }
                      placeholder="/images/hero-students.jpg"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        triggerImageUpload((url) => {
                          setContent((prev) => ({
                            ...prev,
                            story: { ...prev.story, image: url },
                          }));
                        })
                      }
                      className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 4 Core Promises Cards */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                  The Four Core Promises (Learn · Develop · Lead · Transform)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {content.story.promises.map((promise, pIdx) => (
                    <div
                      key={pIdx}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
                    >
                      <span className="text-[10px] font-black text-[#FF7900] uppercase tracking-wider block">
                        Promise 0{pIdx + 1}
                      </span>
                      <input
                        type="text"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold text-xs text-[#102E4D]"
                        value={promise.title}
                        onChange={(e) => {
                          const next = [...content.story.promises];
                          next[pIdx] = { ...promise, title: e.target.value };
                          setContent((prev) => ({
                            ...prev,
                            story: { ...prev.story, promises: next },
                          }));
                        }}
                      />
                      <textarea
                        rows={2}
                        className="w-full p-2 rounded-lg border border-slate-200 text-xs text-slate-600 leading-relaxed"
                        value={promise.body}
                        onChange={(e) => {
                          const next = [...content.story.promises];
                          next[pIdx] = { ...promise, body: e.target.value };
                          setContent((prev) => ({
                            ...prev,
                            story: { ...prev.story, promises: next },
                          }));
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* SECTION 05: VOICES & TESTIMONIALS                                  */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          <section
            id="section-voices"
            className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden scroll-mt-24"
          >
            {/* Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#001B33] via-[#0A2647] to-[#001B33] text-white flex items-center justify-between gap-4 border-b border-white/10">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFC400] block">
                  Section 05
                </span>
                <h2 className="font-serif font-extrabold text-lg sm:text-xl text-white">
                  Voices &amp; Testimonials
                </h2>
              </div>
              <span className="text-xs text-white/60 font-semibold hidden sm:inline">
                Community Quotes &amp; Trust
              </span>
            </div>

            <div className="p-5 sm:p-7 space-y-6">
              {/* Covey / Principle Quote Card */}
              <div className="p-5 rounded-2xl bg-[#F0FDF4] border border-emerald-200 space-y-3">
                <span className="text-[10.5px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <Quote className="w-4 h-4 text-emerald-600" />
                  Primary Leadership Principle Quote
                </span>
                <textarea
                  rows={3}
                  className={cmsInputClass}
                  value={content.voices.principle.quote}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      voices: {
                        ...prev.voices,
                        principle: {
                          ...prev.voices.principle,
                          quote: e.target.value,
                        },
                      },
                    }))
                  }
                  placeholder="Enter main leadership quote..."
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.voices.principle.author}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        voices: {
                          ...prev.voices,
                          principle: {
                            ...prev.voices.principle,
                            author: e.target.value,
                          },
                        },
                      }))
                    }
                    placeholder="Author name"
                  />
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.voices.principle.authorSubtitle}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        voices: {
                          ...prev.voices,
                          principle: {
                            ...prev.voices.principle,
                            authorSubtitle: e.target.value,
                          },
                        },
                      }))
                    }
                    placeholder="Author designation / title"
                  />
                </div>
              </div>

              {/* Testimonials List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                    Community Testimonials
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const nextItems = [
                        ...content.voices.testimonials.items,
                        { quote: "Write a testimonial...", author: "Educator / Leader" },
                      ];
                      setContent((prev) => ({
                        ...prev,
                        voices: {
                          ...prev.voices,
                          testimonials: { items: nextItems },
                        },
                      }));
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-[#102E4D] inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Quote</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {content.voices.testimonials.items.map((item, tIdx) => (
                    <div
                      key={tIdx}
                      className="p-4 rounded-2xl bg-white border-2 border-slate-200 space-y-3 relative group"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          const nextItems =
                            content.voices.testimonials.items.filter(
                              (_, i) => i !== tIdx
                            );
                          setContent((prev) => ({
                            ...prev,
                            voices: {
                              ...prev.voices,
                              testimonials: { items: nextItems },
                            },
                          }));
                        }}
                        className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 p-1"
                        title="Remove quote"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <textarea
                        rows={2}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed italic"
                        value={item.quote}
                        onChange={(e) => {
                          const nextItems = [
                            ...content.voices.testimonials.items,
                          ];
                          nextItems[tIdx] = { ...item, quote: e.target.value };
                          setContent((prev) => ({
                            ...prev,
                            voices: {
                              ...prev.voices,
                              testimonials: { items: nextItems },
                            },
                          }));
                        }}
                      />

                      <input
                        type="text"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-[#102E4D]"
                        value={item.author}
                        onChange={(e) => {
                          const nextItems = [
                            ...content.voices.testimonials.items,
                          ];
                          nextItems[tIdx] = {
                            ...item,
                            author: e.target.value,
                          };
                          setContent((prev) => ({
                            ...prev,
                            voices: {
                              ...prev.voices,
                              testimonials: { items: nextItems },
                            },
                          }));
                        }}
                        placeholder="Author & School"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* SECTION 06: CALL TO ACTION (CTA)                                    */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          <section
            id="section-cta"
            className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden scroll-mt-24"
          >
            {/* Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#001B33] via-[#0A2647] to-[#001B33] text-white flex items-center justify-between gap-4 border-b border-white/10">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFC400] block">
                  Section 06
                </span>
                <h2 className="font-serif font-extrabold text-lg sm:text-xl text-white">
                  Footer Call to Action Banner
                </h2>
              </div>
              <span className="text-xs text-white/60 font-semibold hidden sm:inline">
                Bottom of Homepage
              </span>
            </div>

            <div className="p-5 sm:p-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Eyebrow
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.cta.eyebrow}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        cta: { ...prev.cta, eyebrow: e.target.value },
                      }))
                    }
                    placeholder="Ready to Build Leaders?"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    CTA Heading
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.cta.heading}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        cta: { ...prev.cta, heading: e.target.value },
                      }))
                    }
                    placeholder="Partner with The Leadership Covenant"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Subtext Note
                  </label>
                  <textarea
                    rows={2}
                    className={cmsInputClass}
                    value={content.cta.subtext}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        cta: { ...prev.cta, subtext: e.target.value },
                      }))
                    }
                    placeholder="Whether you represent a school, university, or are seeking individual mastery..."
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SERVICE ADD / EDIT MODAL                                            */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {(isAddingService || editingServiceIndex !== null) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#001B33] via-[#102E4D] to-[#001B33] text-white flex items-center justify-between gap-4 shrink-0 border-b border-white/10">
              <div className="space-y-1 min-w-0 flex-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FFC400]/20 text-[#FFC400] border border-[#FFC400]/30 inline-block">
                  {isAddingService ? "Add New Service" : "Edit Service Slide"}
                </span>
                <h3 className="font-serif font-extrabold text-xl text-white truncate">
                  {serviceFormData.title || "New Service"}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsAddingService(false);
                  setEditingServiceIndex(null);
                }}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-7 overflow-y-auto space-y-4 flex-1 text-slate-800">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                  Service Title *
                </label>
                <input
                  type="text"
                  className={cmsInputClass}
                  value={serviceFormData.title}
                  onChange={(e) =>
                    setServiceFormData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="e.g. Leader in Me"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                  Category Tag
                </label>
                <input
                  type="text"
                  className={cmsInputClass}
                  value={serviceFormData.category}
                  onChange={(e) =>
                    setServiceFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  placeholder="e.g. Whole-School Transformation"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                  Slider Description
                </label>
                <textarea
                  rows={3}
                  className={cmsInputClass}
                  value={serviceFormData.description}
                  onChange={(e) =>
                    setServiceFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe this service for the homepage slider..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                  Service Cover Image
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={serviceFormData.image}
                    onChange={(e) =>
                      setServiceFormData((prev) => ({
                        ...prev,
                        image: e.target.value,
                      }))
                    }
                    placeholder="/images/leader-in-me.jpg"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      triggerImageUpload((url) => {
                        setServiceFormData((prev) => ({ ...prev, image: url }));
                      })
                    }
                    className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                  </button>
                </div>
                {serviceFormData.image && (
                  <div className="mt-2.5 w-full h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 relative">
                    <img
                      src={serviceFormData.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                  Target Link (href)
                </label>
                <input
                  type="text"
                  className={cmsInputClass}
                  value={serviceFormData.href}
                  onChange={(e) =>
                    setServiceFormData((prev) => ({
                      ...prev,
                      href: e.target.value,
                    }))
                  }
                  placeholder="/services#leader-in-me"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsAddingService(false);
                  setEditingServiceIndex(null);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveServiceModal}
                className="px-5 py-2 rounded-xl bg-[#102E4D] hover:bg-[#163B61] text-white text-xs font-black transition-all shadow-md cursor-pointer inline-flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 text-[#FFC400]" />
                <span>Done &amp; Apply Service</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* DELETE CONFIRMATION MODAL                                           */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {deleteConfirmIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="font-serif font-extrabold text-lg text-[#102E4D]">
                Delete Service?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to remove &ldquo;
                <strong>
                  {content.services.slides[deleteConfirmIndex]?.title}
                </strong>
                &rdquo; from the homepage services carousel?
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmIndex(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteService(deleteConfirmIndex)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-sm cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

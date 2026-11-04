"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CheckCircle2,
  Copy,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Layers,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
  Check,
  ChevronRight,
} from "lucide-react";
import { MdArrowForward, MdCheckCircle } from "react-icons/md";
import {
  SERVICES_PAGE,
  normalizeServicesCms,
  type Service,
  type ServicesPageContent,
} from "@/content/services";
import { cmsInputClass } from "@/components/admin/cms-fields";

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 72) || `service-${Date.now()}`
  );
}

function uniqueId(base: string, services: Service[], ignoreIndex: number) {
  let id = slugify(base);
  const used = new Set(
    services.map((service, index) => (index === ignoreIndex ? "" : service.id))
  );
  if (!used.has(id)) return id;
  let n = 2;
  while (used.has(`${id}-${n}`)) n += 1;
  return `${id}-${n}`;
}

function createBlankService(services: Service[]): Service {
  const id = uniqueId("new-leadership-program", services, -1);
  return {
    id,
    interest: id,
    chipLabel: "New Program",
    icon: "star",
    badge: "Executive Leadership Program",
    title: "New Leadership Program",
    tagline: "Inspiring Leadership Character. Transforming Institutional Culture.",
    body: "Write the comprehensive program description that introduces this leadership offering to educators, schools, or professionals.",
    bullets: [
      "Embeds timeless FranklinCovey leadership principles",
      "Develops character, self-mastery, and strategic vision",
      "Includes practical toolkits and institutional frameworks",
    ],
    image: "/images/hero-students.jpg",
    imageAlt: "Leadership Program",
    ctaLabel: "Enquire about this Program",
    accent: "blue",
  };
}

export default function ServicesCmsEditor() {
  const [content, setContent] = useState<ServicesPageContent>(SERVICES_PAGE);
  const [visible, setVisible] = useState(true);
  const [original, setOriginal] = useState(
    JSON.stringify({ ...SERVICES_PAGE, _visible: true })
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState<
    "hero" | "programs" | "cta"
  >("programs");

  // Editing / Add Modal State
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [modalService, setModalService] = useState<Service | null>(null);
  const [deleteTargetIndex, setDeleteTargetIndex] = useState<number | null>(null);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadCallbackRef = useRef<((url: string | null) => void) | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Unsaved Changes Tracker
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
        setContent(SERVICES_PAGE);
        setVisible(true);
        setOriginal(JSON.stringify({ ...SERVICES_PAGE, _visible: true }));
        return;
      }
      const json = await res.json();
      const page = json.pages?.services;
      const raw = page?.content || {};
      const normalized = normalizeServicesCms(raw);
      const isVisible = raw._visible !== false;
      setContent(normalized);
      setVisible(isVisible);
      setOriginal(JSON.stringify({ ...normalized, _visible: isVisible }));
    } catch (err) {
      console.error("[Services CMS Load Error]", err);
      setContent(SERVICES_PAGE);
      setVisible(true);
      setOriginal(JSON.stringify({ ...SERVICES_PAGE, _visible: true }));
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
        body: JSON.stringify({ page_key: "services", content: payload }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Failed to persist to Firebase Firestore.");
      }
      setOriginal(JSON.stringify(payload));
      setFeedback({
        type: "success",
        text: "Services catalog published successfully! Public /services page is updated in real time.",
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

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleSave]);

  // Reset to default
  const handleReset = async () => {
    if (
      !confirm(
        "Are you sure you want to restore the Services page to original code defaults? Any custom programs will be replaced."
      )
    ) {
      return;
    }
    setResetting(true);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset", page_key: "services" }),
      });
      const json = await res.json();
      if (res.ok && json.page) {
        const saved = normalizeServicesCms(json.page.content);
        const isVisible = json.page.content._visible !== false;
        setContent(saved);
        setVisible(isVisible);
        setOriginal(JSON.stringify({ ...saved, _visible: isVisible }));
        setEditingIndex(null);
        setModalService(null);
        setIsAddingNew(false);
        setFeedback({
          type: "success",
          text: "Services page restored to factory defaults.",
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
  // CRUD ACTIONS
  // ───────────────────────────────────────────────────────────────────────────
  const handleOpenAdd = () => {
    const blank = createBlankService(content.services);
    setModalService(blank);
    setIsAddingNew(true);
    setEditingIndex(null);
  };

  const handleOpenEdit = (index: number) => {
    const target = content.services[index];
    if (!target) return;
    setModalService({ ...target, bullets: [...(target.bullets || [])] });
    setEditingIndex(index);
    setIsAddingNew(false);
  };

  const handleSaveModal = () => {
    if (!modalService || !modalService.title.trim()) {
      alert("Please provide a program title.");
      return;
    }
    const nextServices = [...content.services];
    const cleanedBullets = (modalService.bullets || [])
      .map((b) => b.trim())
      .filter(Boolean);

    const readyService: Service = {
      ...modalService,
      title: modalService.title.trim(),
      badge: modalService.badge.trim() || "Program",
      tagline: modalService.tagline.trim(),
      body: modalService.body.trim(),
      bullets: cleanedBullets,
      ctaLabel: modalService.ctaLabel.trim() || "Enquire about this program",
      id: modalService.id || slugify(modalService.title),
      interest: modalService.interest || slugify(modalService.title),
      chipLabel: modalService.chipLabel || modalService.title,
    };

    if (isAddingNew) {
      nextServices.push(readyService);
    } else if (editingIndex !== null) {
      nextServices[editingIndex] = readyService;
    }

    setContent((prev) => ({ ...prev, services: nextServices }));
    setEditingIndex(null);
    setIsAddingNew(false);
    setModalService(null);
    setFeedback({
      type: "success",
      text: isAddingNew
        ? `Added new program "${readyService.title}". Remember to click "Publish Changes" to save.`
        : `Updated "${readyService.title}". Remember to click "Publish Changes" to save.`,
    });
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    const next = [...content.services];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    setContent((prev) => ({ ...prev, services: next }));
  };

  const handleDuplicate = (index: number) => {
    const target = content.services[index];
    if (!target) return;
    const cloneId = uniqueId(`${target.id}-copy`, content.services, -1);
    const clone: Service = {
      ...JSON.parse(JSON.stringify(target)),
      id: cloneId,
      interest: cloneId,
      title: `${target.title} (Copy)`,
      chipLabel: `${target.chipLabel || target.title} (Copy)`,
    };
    const next = [...content.services];
    next.splice(index + 1, 0, clone);
    setContent((prev) => ({ ...prev, services: next }));
    setFeedback({
      type: "success",
      text: `Duplicated "${target.title}". Click "Publish Changes" to persist.`,
    });
  };

  const handleDeleteConfirmed = () => {
    if (deleteTargetIndex === null) return;
    const target = content.services[deleteTargetIndex];
    const next = content.services.filter((_, i) => i !== deleteTargetIndex);
    setContent((prev) => ({ ...prev, services: next }));
    setDeleteTargetIndex(null);
    setFeedback({
      type: "success",
      text: `Program "${target?.title || "Item"}" removed. Click "Publish Changes" to persist.`,
    });
  };

  // Filtered Services List
  const filteredServices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return content.services
      .map((service, index) => ({ service, index }))
      .filter(({ service }) => {
        if (!q) return true;
        return (
          service.title.toLowerCase().includes(q) ||
          service.badge.toLowerCase().includes(q) ||
          service.body.toLowerCase().includes(q) ||
          service.id.toLowerCase().includes(q)
        );
      });
  }, [content.services, searchQuery]);

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
                Services Catalog
              </span>
            </div>
            <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-[#102E4D] flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#001B33] via-[#102E4D] to-[#001B33] text-white flex items-center justify-center shadow-md shadow-[#102E4D]/20 shrink-0">
                <Layers className="w-5 h-5 text-[#FFC400]" />
              </span>
              <span>Services Page CMS</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
              Manage your core leadership pathways, whole-school transformation
              frameworks, educator development courses, and discovery call advisory
              banner.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/services"
              target="_blank"
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-[#102E4D] inline-flex items-center gap-2 transition-all shadow-2xs hover:border-[#102E4D]/30"
              title="Preview public services page in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>Preview /services</span>
            </Link>

            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer ${
                visible
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 bg-slate-50 text-slate-500"
              }`}
            >
              {visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{visible ? "Catalog Live" : "Catalog Hidden"}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={resetting || loading}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 inline-flex items-center gap-2 transition-all shadow-2xs cursor-pointer disabled:opacity-60"
              title="Reset services content to original code defaults"
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
            { id: "hero", label: "01 · Hero Photographic Banner", icon: Sparkles },
            {
              id: "programs",
              label: `02 · Program Cards (${content.services.length})`,
              icon: Layers,
            },
            {
              id: "cta",
              label: "03 · Discovery Consultation Call",
              icon: ChevronRight,
            },
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
            Loading services catalog from Firestore...
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* SECTION 01: HERO PHOTOGRAPHIC BANNER                                */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          <section
            id="section-hero"
            className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden scroll-mt-24"
          >
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#001B33] via-[#0A2647] to-[#001B33] text-white flex items-center justify-between gap-4 border-b border-white/10">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFC400] block">
                  Section 01
                </span>
                <h2 className="font-serif font-extrabold text-lg sm:text-xl text-white">
                  Hero Photographic Banner
                </h2>
              </div>
              <span className="text-xs text-white/60 font-semibold hidden sm:inline">
                Top of /services
              </span>
            </div>

            <div className="p-5 sm:p-7 space-y-6">
              {/* Live Miniature Preview */}
              <div className="relative rounded-2xl overflow-hidden bg-[#001B33] text-white p-6 sm:p-8 shadow-inner border border-white/10 min-h-[220px] flex items-center justify-center text-center">
                <img
                  src={content.hero.image || "/Services/Hero%20Section.png"}
                  alt={content.hero.imageAlt}
                  className="absolute inset-0 w-full h-full object-cover opacity-35"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#001B33]/80 via-[#001B33]/70 to-[#001B33]/90" />
                <div className="relative z-10 max-w-2xl mx-auto space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#FFC400] block">
                    Public Hero Live Preview
                  </span>
                  <h3 className="font-serif font-extrabold text-2xl sm:text-4xl text-white leading-tight">
                    {content.hero.heading}{" "}
                    <span className="text-[#FFC400]">
                      {content.hero.headingHighlight}
                    </span>
                  </h3>
                  <p className="text-xs sm:text-sm text-white/90 max-w-lg mx-auto leading-relaxed">
                    {content.hero.body}
                  </p>
                </div>
              </div>

              {/* Simplified & Clean Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Heading Start Text
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.hero.heading}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, heading: e.target.value },
                      }))
                    }
                    placeholder="Six ways we help you build a"
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
                    placeholder="culture of leadership."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Subtitle Description
                  </label>
                  <textarea
                    rows={2}
                    className={cmsInputClass}
                    value={content.hero.body}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, body: e.target.value },
                      }))
                    }
                    placeholder="Every program shares one belief: everyone has the potential to lead..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Hero Backdrop Photo
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      className={cmsInputClass}
                      value={content.hero.image}
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, image: e.target.value },
                        }))
                      }
                      placeholder="/Services/Hero%20Section.png"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        triggerImageUpload((url) => {
                          setContent((prev) => ({
                            ...prev,
                            hero: { ...prev.hero, image: url },
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
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* SECTION 02: CORE SERVICES CATALOG (FULL CRUD)                       */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          <section
            id="section-programs"
            className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden scroll-mt-24"
          >
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#001B33] via-[#0D3B66] to-[#001B33] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFC400] block">
                  Section 02 · Leadership Programs
                </span>
                <h2 className="font-serif font-extrabold text-lg sm:text-xl text-white flex items-center gap-2">
                  <span>Leadership Services Catalog</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/15 text-white font-num font-semibold">
                    {content.services.length} Programs
                  </span>
                </h2>
                <p className="text-xs text-slate-300 max-w-xl">
                  Add, edit, reorder, or delete leadership program cards shown on the
                  public Services page.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAdd}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E66D00] text-white text-xs font-black inline-flex items-center gap-2 transition-all shadow-md hover:brightness-105 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Add New Program</span>
              </button>
            </div>

            <div className="p-5 sm:p-7 space-y-6">
              {/* Search programs */}
              <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-100">
                <div className="relative min-w-[260px] sm:min-w-[320px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search programs by title or category..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-[#102E4D] placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#FF7900] focus:ring-3 focus:ring-[#FF7900]/15 transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
                  Showing {filteredServices.length} of {content.services.length}
                </span>
              </div>

              {/* Service Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredServices.map(({ service, index }) => (
                  <div
                    key={service.id || index}
                    className="rounded-3xl border-2 border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Gradient Accent Strip */}
                      <div className="h-1.5 w-full bg-gradient-to-r from-[#102E4D] via-[#FFC400] to-[#FF7900]" />

                      {/* Cover Image with Step Number and Category Pill */}
                      <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                        <img
                          src={service.image || "/images/hero-students.jpg"}
                          alt={service.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                        <span className="absolute top-3 left-3 w-8 h-8 rounded-xl bg-white/95 backdrop-blur-xs font-num font-black text-xs text-[#FF7900] shadow-md inline-flex items-center justify-center">
                          0{index + 1}
                        </span>
                        <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-md bg-[#FF7900] text-[9.5px] font-black text-white uppercase tracking-wider shadow-xs">
                          {service.badge || "Program"}
                        </span>
                      </div>

                      {/* Body Content */}
                      <div className="p-4 sm:p-5 space-y-2.5">
                        <h3 className="font-serif font-extrabold text-lg text-[#102E4D] leading-snug">
                          {service.title || "Untitled Program"}
                        </h3>
                        <p className="text-xs font-bold text-[#FF7900] border-l-3 border-[#FFC400] pl-2.5 line-clamp-2">
                          {service.tagline || service.title}
                        </p>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {service.body}
                        </p>

                        {/* Bullets Count */}
                        {service.bullets && service.bullets.length > 0 && (
                          <div className="pt-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                            <MdCheckCircle className="text-emerald-600 text-sm shrink-0" />
                            <span>{service.bullets.length} outcome highlights</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions Toolbar */}
                    <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMove(index, -1)}
                          disabled={index === 0}
                          className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center disabled:opacity-30 cursor-pointer"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(index, 1)}
                          disabled={index === content.services.length - 1}
                          className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center disabled:opacity-30 cursor-pointer"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicate(index)}
                          className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer"
                          title="Duplicate program"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setDeleteTargetIndex(index)}
                          className="w-8 h-8 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center justify-center cursor-pointer"
                          title="Delete program"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(index)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#102E4D] hover:bg-[#163B61] text-white text-xs font-black inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
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
          {/* SECTION 03: DISCOVERY CALL CONSULTATION BANNER                      */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          <section
            id="section-cta"
            className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden scroll-mt-24"
          >
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#001B33] via-[#0A2647] to-[#001B33] text-white flex items-center justify-between gap-4 border-b border-white/10">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFC400] block">
                  Section 03
                </span>
                <h2 className="font-serif font-extrabold text-lg sm:text-xl text-white">
                  Discovery Consultation Banner
                </h2>
              </div>
              <span className="text-xs text-white/60 font-semibold hidden sm:inline">
                Bottom of /services
              </span>
            </div>

            <div className="p-5 sm:p-7 space-y-6">
              {/* Live Preview Card */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#001B33] via-[#0B2540] to-[#001B33] text-white p-6 sm:p-8 text-center space-y-3 border border-white/15 shadow-md">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFC400] to-transparent opacity-90" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#FFC400] block">
                  {content.cta.eyebrow}
                </span>
                <h3 className="font-serif font-extrabold text-xl sm:text-3xl text-white">
                  {content.cta.heading}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                  {content.cta.bodyBefore}{" "}
                  <strong className="text-white font-num font-bold">
                    {content.cta.minutes}
                  </strong>
                  -{content.cta.bodyAfter}
                </p>
                <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                  <span className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] text-white text-xs font-bold uppercase tracking-wider shadow-sm">
                    {content.cta.primaryCta.label}
                  </span>
                  <span className="px-5 py-2.5 rounded-xl border border-white/25 bg-white/5 text-white text-xs font-semibold uppercase tracking-wider">
                    {content.cta.secondaryCta.label}
                  </span>
                </div>
              </div>

              {/* Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Eyebrow Text
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
                    placeholder="Advisory & Consultation"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Main Heading
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
                    placeholder="Not sure which program fits?"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Consultation Minutes Number
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.cta.minutes}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        cta: { ...prev.cta, minutes: e.target.value },
                      }))
                    }
                    placeholder="20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Primary Button Label
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.cta.primaryCta.label}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        cta: {
                          ...prev.cta,
                          primaryCta: {
                            ...prev.cta.primaryCta,
                            label: e.target.value,
                          },
                        },
                      }))
                    }
                    placeholder="Book a discovery call"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* PROGRAM ADD / EDIT MODAL (WITH LIVE CARD PREVIEW)                   */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {modalService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-5xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#001B33] via-[#102E4D] to-[#001B33] text-white flex items-center justify-between gap-4 shrink-0 border-b border-white/10">
              <div className="space-y-1 min-w-0 flex-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FFC400]/20 text-[#FFC400] border border-[#FFC400]/30 inline-block">
                  {isAddingNew ? "Add New Leadership Program" : "Edit Program Card"}
                </span>
                <h3 className="font-serif font-extrabold text-xl sm:text-2xl text-white truncate">
                  {modalService.title || "Untitled Program"}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  setModalService(null);
                  setIsAddingNew(false);
                  setEditingIndex(null);
                }}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal 2-Column Body: Form on Left, Live Preview on Right */}
            <div className="p-5 sm:p-7 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-7 text-slate-800">
              {/* Left Column: Form Sections */}
              <div className="lg:col-span-7 space-y-6">
                {/* 01: Core Info */}
                <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <span className="w-6 h-6 rounded-lg bg-[#102E4D] text-white flex items-center justify-center text-xs font-black">
                      01
                    </span>
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#102E4D]">
                      Core Information
                    </h4>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                        Program Title *
                      </label>
                      <input
                        type="text"
                        className={cmsInputClass}
                        value={modalService.title}
                        onChange={(e) =>
                          setModalService((prev) =>
                            prev ? { ...prev, title: e.target.value } : null
                          )
                        }
                        placeholder="e.g. Leader in Me"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                        Overline Badge
                      </label>
                      <input
                        type="text"
                        className={cmsInputClass}
                        value={modalService.badge}
                        onChange={(e) =>
                          setModalService((prev) =>
                            prev ? { ...prev, badge: e.target.value } : null
                          )
                        }
                        placeholder="e.g. Flagship · EY – 12 Process"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                        Tagline / Highlight Sentence
                      </label>
                      <input
                        type="text"
                        className={cmsInputClass}
                        value={modalService.tagline}
                        onChange={(e) =>
                          setModalService((prev) =>
                            prev ? { ...prev, tagline: e.target.value } : null
                          )
                        }
                        placeholder="Developing Student Leaders. Transforming School Culture."
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                        Full Description Paragraph
                      </label>
                      <textarea
                        rows={4}
                        className={cmsInputClass}
                        value={modalService.body}
                        onChange={(e) =>
                          setModalService((prev) =>
                            prev ? { ...prev, body: e.target.value } : null
                          )
                        }
                        placeholder="Write the full program overview for schools, educators, and leaders..."
                      />
                    </div>
                  </div>
                </div>

                {/* 02: Bullet Highlights */}
                <div className="rounded-2xl border-2 border-emerald-200/90 bg-white p-5 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs font-black">
                        02
                      </span>
                      <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900">
                        Outcome Bullets &amp; Highlights
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setModalService((prev) =>
                          prev
                            ? {
                                ...prev,
                                bullets: [...(prev.bullets || []), ""],
                              }
                            : null
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Highlight</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(modalService.bullets || []).map((bullet, bIdx) => (
                      <div key={bIdx} className="flex items-center gap-2">
                        <MdCheckCircle className="text-emerald-600 text-base shrink-0" />
                        <input
                          type="text"
                          className={cmsInputClass}
                          value={bullet}
                          onChange={(e) => {
                            const nextBullets = [
                              ...(modalService.bullets || []),
                            ];
                            nextBullets[bIdx] = e.target.value;
                            setModalService((prev) =>
                              prev ? { ...prev, bullets: nextBullets } : null
                            );
                          }}
                          placeholder="e.g. Builds high-trust school culture..."
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const nextBullets = (
                              modalService.bullets || []
                            ).filter((_, i) => i !== bIdx);
                            setModalService((prev) =>
                              prev ? { ...prev, bullets: nextBullets } : null
                            );
                          }}
                          className="w-8 h-8 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 flex items-center justify-center shrink-0"
                          title="Remove bullet"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 03: Media & CTA */}
                <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <span className="w-6 h-6 rounded-lg bg-[#FF7900] text-white flex items-center justify-center text-xs font-black">
                      03
                    </span>
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#102E4D]">
                      Program Photo &amp; CTA Button
                    </h4>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                        Program Photo URL / Cloudinary Upload
                      </label>
                      <div className="flex items-center gap-2.5">
                        <input
                          type="text"
                          className={cmsInputClass}
                          value={modalService.image}
                          onChange={(e) =>
                            setModalService((prev) =>
                              prev ? { ...prev, image: e.target.value } : null
                            )
                          }
                          placeholder="/images/leader-in-me.jpg"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            triggerImageUpload((url) => {
                              setModalService((prev) =>
                                prev ? { ...prev, image: url } : null
                              );
                            })
                          }
                          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                        CTA Button Label
                      </label>
                      <input
                        type="text"
                        className={cmsInputClass}
                        value={modalService.ctaLabel}
                        onChange={(e) =>
                          setModalService((prev) =>
                            prev ? { ...prev, ctaLabel: e.target.value } : null
                          )
                        }
                        placeholder="Enquire about Leader in Me"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Real-time Card Preview */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#FF7900] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF7900]" />
                    Live Public Card Preview
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">
                    Interactive Preview
                  </span>
                </div>

                <div className="bg-white rounded-3xl border border-[#D7F5EF] shadow-md overflow-hidden relative group">
                  <div className="h-1.5 w-full bg-gradient-to-r from-[#102E4D] via-[#FFC400] to-[#FF7900]" />
                  <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                    <img
                      src={modalService.image || "/images/hero-students.jpg"}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#001B33]/60 via-transparent to-transparent pointer-events-none" />
                    <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-md bg-[#FF7900] text-[9.5px] font-black text-white uppercase tracking-wider">
                      {modalService.badge || "Program"}
                    </span>
                  </div>

                  <div className="p-5 space-y-3">
                    <h4 className="font-serif font-extrabold text-xl text-[#102E4D] leading-tight">
                      {modalService.title || "Untitled Program"}
                    </h4>
                    <p className="text-xs font-bold text-[#FF7900] border-l-3 border-[#FFC400] pl-2.5 leading-snug">
                      {modalService.tagline || "Tagline highlight goes here..."}
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {modalService.body || "Description text goes here..."}
                    </p>

                    <ul className="space-y-1.5 pt-1">
                      {(modalService.bullets || []).map((bullet, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-xs text-slate-700"
                        >
                          <MdCheckCircle className="text-[#102E4D] text-sm shrink-0 mt-0.5" />
                          <span className="font-medium">{bullet}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="pt-2">
                      <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF7900] text-white text-xs font-bold shadow-xs">
                        <span>{modalService.ctaLabel || "Enquire about this program"}</span>
                        <MdArrowForward className="text-sm" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setModalService(null);
                  setIsAddingNew(false);
                  setEditingIndex(null);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className="px-5 py-2 rounded-xl bg-[#102E4D] hover:bg-[#163B61] text-white text-xs font-black transition-all shadow-md cursor-pointer inline-flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 text-[#FFC400]" />
                <span>Done &amp; Apply Program</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* DELETE CONFIRMATION MODAL                                           */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {deleteTargetIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="font-serif font-extrabold text-lg text-[#102E4D]">
                Delete Program?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to remove &ldquo;
                <strong>
                  {content.services[deleteTargetIndex]?.title}
                </strong>
                &rdquo; from the Services page catalog?
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetIndex(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirmed}
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

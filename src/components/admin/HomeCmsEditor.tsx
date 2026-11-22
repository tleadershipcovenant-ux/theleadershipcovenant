"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Award,
  Briefcase,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Layers,
  Loader2,
  MapPin,
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
} from "@/content/home";
import {
  CATEGORY_LABELS,
  EVENT_LIFECYCLE_LABELS,
  EVENTS,
  getEventLifecycle,
  precomputeLeadershipEvents,
  resolveActivityCardButtons,
  type CardActionButtonType,
  type EventCategory,
  type EventLifecycle,
  type LeadershipEvent,
} from "@/content/events";
import { cmsInputClass } from "@/components/admin/cms-fields";

const EVENT_CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS) as Array<
  [EventCategory, string]
>;

type HomeCmsTabId =
  | "hero"
  | "stats"
  | "upcoming"
  | "story"
  | "services"
  | "voices"
  | "cta";

const HOME_CMS_TABS: Array<{
  id: HomeCmsTabId;
  number: string;
  label: string;
  shortTitle: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: "hero",
    number: "01",
    label: "01 Hero Banner",
    shortTitle: "Executive Hero Banner",
    icon: Sparkles,
  },
  {
    id: "stats",
    number: "02",
    label: "02 Reach & Impact Stats",
    shortTitle: "Reach & Impact Statistics",
    icon: Users,
  },
  {
    id: "upcoming",
    number: "03",
    label: "03 What's Coming Up",
    shortTitle: "What's Coming Up (Programmes & Events)",
    icon: Calendar,
  },
  {
    id: "story",
    number: "04",
    label: "04 Our Story & Promises",
    shortTitle: "Our Story & The 4 Promises",
    icon: Award,
  },
  {
    id: "services",
    number: "05",
    label: "05 Our Services Slider",
    shortTitle: "What We Do — Our Services Slider",
    icon: Briefcase,
  },
  {
    id: "voices",
    number: "06",
    label: "06 Principle & Testimonials",
    shortTitle: "The Principle We Live By & Testimonials",
    icon: Quote,
  },
  {
    id: "cta",
    number: "07",
    label: "07 Footer Action Banner",
    shortTitle: "Start Your Transformation CTA Banner",
    icon: Layers,
  },
];

export default function HomeCmsEditor() {
  const [content, setContent] = useState<HomePageContent>(HOME_PAGE);
  const [visible, setVisible] = useState(true);
  const [original, setOriginal] = useState(
    JSON.stringify({ ...HOME_PAGE, _visible: true })
  );
  const [eventsList, setEventsList] = useState<LeadershipEvent[]>(EVENTS);
  const [originalEvents, setOriginalEvents] = useState(JSON.stringify(EVENTS));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [activeStatTab, setActiveStatTab] = useState<string>("international");
  const [activeTab, setActiveTab] = useState<HomeCmsTabId>("hero");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Programme / Event Edit / Add Modal State (for Section 03: What's Coming Up)
  const [editingEventIndex, setEditingEventIndex] = useState<number | null>(
    null
  );
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [eventFormData, setEventFormData] = useState<LeadershipEvent>(
    EVENTS[0]
  );
  const [deleteEventConfirmIndex, setDeleteEventConfirmIndex] = useState<
    number | null
  >(null);

  // Service Edit / Add Modal State (for Section 05: Our Services Slider)
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

  // Track Unsaved Changes across Home page and What's Coming Up Events
  const hasUnsavedHomeChanges = useMemo(
    () => JSON.stringify({ ...content, _visible: visible }) !== original,
    [content, visible, original]
  );
  const hasUnsavedEventChanges = useMemo(
    () => JSON.stringify(eventsList) !== originalEvents,
    [eventsList, originalEvents]
  );
  const hasUnsavedChanges = hasUnsavedHomeChanges || hasUnsavedEventChanges;

  // Load from /api/admin/cms
  const loadPage = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms", { cache: "no-store" });
      if (!res.ok) {
        setContent(HOME_PAGE);
        setVisible(true);
        setOriginal(JSON.stringify({ ...HOME_PAGE, _visible: true }));
        setEventsList(EVENTS);
        setOriginalEvents(JSON.stringify(EVENTS));
        return;
      }
      const json = await res.json();
      const raw = json.pages?.home?.content || {};
      const normalized = normalizeHomeCms(raw);
      const isVisible = raw._visible !== false;
      setContent(normalized);
      setVisible(isVisible);
      setOriginal(JSON.stringify({ ...normalized, _visible: isVisible }));

      const rawEvents = json.pages?.events?.content?.events;
      const loadedEvents =
        Array.isArray(rawEvents) && rawEvents.length > 0
          ? (rawEvents as LeadershipEvent[])
          : EVENTS;
      setEventsList(loadedEvents);
      setOriginalEvents(JSON.stringify(loadedEvents));
    } catch (err) {
      console.error("[Home CMS Load Error]", err);
      setContent(HOME_PAGE);
      setVisible(true);
      setOriginal(JSON.stringify({ ...HOME_PAGE, _visible: true }));
      setEventsList(EVENTS);
      setOriginalEvents(JSON.stringify(EVENTS));
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
      const resHome = await fetch("/api/admin/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page_key: "home", content: payload }),
      });
      const jsonHome = await resHome.json();
      if (!resHome.ok || !jsonHome.ok) {
        throw new Error(
          jsonHome.error || "Failed to persist Home page to Firestore."
        );
      }
      setOriginal(JSON.stringify(payload));

      if (hasUnsavedEventChanges) {
        const resEvents = await fetch("/api/admin/cms", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            page_key: "events",
            content: { events: eventsList },
          }),
        });
        const jsonEvents = await resEvents.json();
        if (!resEvents.ok || !jsonEvents.ok) {
          throw new Error(
            jsonEvents.error ||
              "Failed to persist What's Coming Up events to Firestore."
          );
        }
        setOriginalEvents(JSON.stringify(eventsList));
      }

      setFeedback({
        type: "success",
        text: "Home page content published successfully! The public homepage is updated in real time.",
      });
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to publish changes.",
      });
    } finally {
      setSaving(false);
    }
  }, [content, visible, eventsList, hasUnsavedEventChanges]);

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (hasUnsavedChanges && !saving) {
          handleSave();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleSave, hasUnsavedChanges, saving]);

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
  // SECTION 02: STATS SECTION HELPERS
  // ───────────────────────────────────────────────────────────────────────────
  const updateStatField = (
    tabIndex: number,
    statIndex: number,
    patch: Partial<{ value: number; suffix: string; label: string }>
  ) => {
    const nextTabs = [...content.stats.tabs];
    const targetTab = nextTabs[tabIndex];
    if (!targetTab) return;
    const nextStats = [...targetTab.stats];
    const targetStat = nextStats[statIndex];
    if (!targetStat) return;

    nextStats[statIndex] = {
      ...targetStat,
      ...patch,
      value:
        patch.value !== undefined
          ? isNaN(patch.value)
            ? 0
            : patch.value
          : targetStat.value,
    };
    nextTabs[tabIndex] = { ...targetTab, stats: nextStats };
    setContent((prev) => ({
      ...prev,
      stats: { ...prev.stats, tabs: nextTabs },
    }));
  };

  // ───────────────────────────────────────────────────────────────────────────
  // SECTION 03: WHAT'S COMING UP (PROGRAMMES & EVENTS) CRUD HELPERS
  // ───────────────────────────────────────────────────────────────────────────
  const handleOpenAddEvent = () => {
    const today = new Date().toISOString().slice(0, 10);
    setEventFormData({
      slug: `programme-${Date.now()}`,
      title: "",
      category: "professional_development",
      description:
        "Interactive leadership programme designed for educators, students, and school leaders.",
      modalDescription: "",
      city: "Islamabad",
      locationNote: "Islamabad • 2026",
      startDate: today,
      endDate: today,
      statusLabel: "Applications open",
      statusTone: "open",
      image: "/images/pd-educators.jpg",
      duration: "1 Full Day",
      schedule: "9:00 AM – 5:00 PM PKT",
      venue: "Islamabad (Venue shared upon confirmation)",
      format: "In-Person Interactive Session",
      certificate: "Official Course Certificate",
      facilitator: "The Leadership Covenant Faculty",
      overview:
        "Interactive leadership programme designed for educators, students, and school leaders.",
      highlights: [
        "Hands-on leadership framework and practical tools",
        "Official certificate of participation",
      ],
      whoShouldAttend: ["School Leaders", "Educators"],
      tag1: "Professional Development",
      tag2: "Educators & Leaders",
      tag3: "Interactive Session",
      hidden: false,
      showOnHome: true,
      lifecycleOverride: "upcoming",
      showMoreDetailsButton: true,
      cardActionButton: "auto",
    });
    setIsAddingEvent(true);
    setEditingEventIndex(null);
  };

  const handleOpenEditEvent = (index: number) => {
    const target = eventsList[index];
    if (!target) return;
    setEventFormData({ ...target });
    setEditingEventIndex(index);
    setIsAddingEvent(false);
  };

  const handlePatchEventCard = (
    index: number,
    patch: Partial<LeadershipEvent>
  ) => {
    setEventsList((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, ...patch } : item))
    );
  };

  const handleSaveEventModal = () => {
    if (!eventFormData.title.trim()) {
      alert("Please provide a programme or event title.");
      return;
    }
    const cleanSlug =
      eventFormData.slug.trim() ||
      eventFormData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    const nextEvents = [...eventsList];
    const finalized: LeadershipEvent = {
      ...eventFormData,
      slug: cleanSlug || `programme-${Date.now()}`,
      endDate: eventFormData.endDate || eventFormData.startDate,
    };
    if (isAddingEvent) {
      nextEvents.unshift(finalized);
    } else if (editingEventIndex !== null) {
      nextEvents[editingEventIndex] = finalized;
    }
    setEventsList(nextEvents);
    setIsAddingEvent(false);
    setEditingEventIndex(null);
    setFeedback({
      type: "success",
      text: isAddingEvent
        ? `Added "${finalized.title}" to What's Coming Up. Click "Publish (Ctrl+S)" to save.`
        : `Updated "${finalized.title}". Click "Publish (Ctrl+S)" to save.`,
    });
  };

  const handleMoveEvent = (index: number, direction: -1 | 1) => {
    const next = [...eventsList];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    setEventsList(next);
  };

  const handleDeleteEvent = (index: number) => {
    const target = eventsList[index];
    setEventsList((prev) => prev.filter((_, i) => i !== index));
    setDeleteEventConfirmIndex(null);
    setFeedback({
      type: "success",
      text: `Programme "${target?.title || "Item"}" removed. Click "Publish (Ctrl+S)" to persist.`,
    });
  };

  // ───────────────────────────────────────────────────────────────────────────
  // SECTION 05: SERVICES CRUD HELPERS
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
        ? `Added new service "${serviceFormData.title}". Click "Publish (Ctrl+S)" to save.`
        : `Updated service "${serviceFormData.title}". Click "Publish (Ctrl+S)" to save.`,
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
      text: `Service "${target?.title || "Item"}" removed. Click "Publish (Ctrl+S)" to persist.`,
    });
  };

  const currentTabIndex = HOME_CMS_TABS.findIndex((t) => t.id === activeTab);
  const prevTab = currentTabIndex > 0 ? HOME_CMS_TABS[currentTabIndex - 1] : null;
  const nextTab =
    currentTabIndex < HOME_CMS_TABS.length - 1
      ? HOME_CMS_TABS[currentTabIndex + 1]
      : null;

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-8 text-center">
        <Loader2 className="w-10 h-10 text-[#FF7900] animate-spin mb-4" />
        <h3 className="text-base font-serif font-bold text-[#102E4D]">
          Loading Home Page CMS...
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Synchronizing homepage sections with Google Cloud Firestore
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-28">
      {/* Hidden File Input for Image Uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* STICKY TOP EXECUTIVE BAR & SECTION SEQUENCE TABS                    */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#001B33]/95 text-white border-b border-white/10 shadow-xl backdrop-blur-md">
        {/* Signature Brand Accent Stripe */}
        <div className="h-[2px] w-full bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#FFC400]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-4">
            {/* Left: Breadcrumbs, Title & Unsaved Changes */}
            <div className="flex items-center gap-2.5 min-w-0">
              <Link
                href="/AD_Admin/cms"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0"
                title="Back to CMS Hub"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-[#FFC400]">
                  <span>Primary Landing Page CMS</span>
                  <span className="text-white/30">•</span>
                  <span className="text-slate-300 normal-case tracking-normal font-medium truncate">
                    Exact Homepage Sequence (01 – 07)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-serif font-black text-white tracking-tight leading-tight truncate">
                    Home Page CMS Editor
                  </h1>
                  {hasUnsavedChanges && (
                    <span className="text-[10px] font-sans font-bold bg-[#FF7900] text-white px-2 py-0.5 rounded-full shadow-xs animate-pulse shrink-0">
                      Unsaved Changes
                    </span>
                  )}
                  {isUploading && (
                    <span className="text-[10px] font-sans font-bold bg-sky-500 text-white px-2 py-0.5 rounded-full shadow-xs inline-flex items-center gap-1 shrink-0">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Uploading...
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Actions & Publish */}
            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap shrink-0">
              {/* Page Live / Draft Status */}
              <button
                type="button"
                onClick={() => setVisible(!visible)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  visible
                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
                    : "bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25"
                }`}
                title={
                  visible
                    ? "Home page is publicly Live"
                    : "Home page is in Draft"
                }
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    visible ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                  }`}
                />
                <span>{visible ? "Live" : "Draft"}</span>
              </button>

              {/* Public Page Preview */}
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white text-xs font-bold border border-white/10 hover:border-white/20 transition-all"
                title="Open public Homepage (/) in a new tab"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
                <span className="hidden sm:inline">Preview /</span>
                <span className="sm:hidden">Preview</span>
              </Link>

              {/* Reset Defaults */}
              <button
                type="button"
                disabled={resetting || saving}
                onClick={handleReset}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-200 text-xs font-bold border border-white/10 transition-all disabled:opacity-50 cursor-pointer"
                title="Restore default authentic homepage content"
              >
                <RotateCcw
                  className={`w-3.5 h-3.5 ${resetting ? "animate-spin" : ""}`}
                />
                <span className="hidden md:inline">Reset</span>
              </button>

              {/* Publish Button */}
              <button
                type="button"
                disabled={saving || !hasUnsavedChanges}
                onClick={handleSave}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-lg transition-all ${
                  hasUnsavedChanges
                    ? "bg-gradient-to-r from-[#FF7900] to-[#E56D00] hover:from-[#E56D00] hover:to-[#CC5F00] text-white cursor-pointer active:scale-95 ring-2 ring-[#FFC400]/40 shadow-orange-950/20"
                    : "bg-white/10 text-white/40 cursor-not-allowed"
                }`}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>
                      {hasUnsavedChanges ? "Publish (Ctrl+S)" : "Published"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 7 Section Navigation Tabs in Exact Homepage Sequence */}
          <div
            className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-white/10 overflow-x-auto scroll-smooth py-1 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#FFC400]/60"
            onWheel={(e) => {
              if (e.deltaY !== 0) {
                e.currentTarget.scrollLeft += e.deltaY;
              }
            }}
          >
            {HOME_CMS_TABS.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#FFC400] text-[#001B33] shadow-md font-extrabold ring-1 ring-[#FFC400]"
                      : "bg-white/5 text-slate-300 hover:bg-white/15 hover:text-white border border-white/5"
                  }`}
                >
                  <TabIcon
                    className={`w-3.5 h-3.5 ${
                      isActive ? "text-[#001B33]" : "text-slate-400"
                    }`}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* FEEDBACK TOAST                                                      */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {feedback && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-bold shadow-xs ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
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
              className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MAIN TABBED SECTION CONTENT (EXACT HOMEPAGE SEQUENCE 01 TO 07)      */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 01: HERO SECTION (HeroSlider.tsx)                               */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "hero" && (
          <section className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#001B33] via-[#0A2647] to-[#001B33] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFC400] block">
                  Homepage Section 01 · Top Hero Slider
                </span>
                <h2 className="font-serif font-extrabold text-lg sm:text-xl text-white">
                  Executive Hero Presentation &amp; Background Slides
                </h2>
                <p className="text-xs text-slate-300 max-w-2xl">
                  Controls the full-viewport opening banner, headline, gold promise
                  line, CTA buttons, and rotating background photography.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold text-[#FFC400] shrink-0">
                1st on Homepage
              </span>
            </div>

            <div className="p-5 sm:p-7 space-y-6">
              {/* Hero Live Miniature Preview */}
              <div className="relative rounded-2xl overflow-hidden bg-[#001B33] text-white p-6 sm:p-8 shadow-inner border border-white/10 space-y-4">
                {content.hero.backgrounds[0]?.src && (
                  <img
                    src={content.hero.backgrounds[0].src}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#001B33]/95 via-[#001B33]/70 to-[#001B33]/60 pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#FFC400]" />

                <div className="relative z-10 text-center max-w-2xl mx-auto space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#FFC400] block">
                    Live Hero Preview
                  </span>
                  <h3 className="font-serif font-extrabold text-2xl sm:text-4xl text-white leading-tight">
                    {content.hero.headingStart}{" "}
                    <span className="text-[#FFC400]">
                      {content.hero.headingHighlight}
                    </span>
                  </h3>
                  <div className="text-xs sm:text-sm text-white/90 space-y-1 leading-relaxed">
                    {content.hero.paragraphs.map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                    <p className="text-xs sm:text-sm font-bold text-[#FFC400] pt-1">
                      {content.hero.closingLine}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <span className="px-4 py-2 rounded-xl bg-[#FF7900] text-white text-xs font-bold shadow-xs">
                      {content.hero.primaryCta.label || "Explore Our Services"} →
                    </span>
                    <span className="px-4 py-2 rounded-xl bg-white/10 border border-white/30 text-white text-xs font-bold">
                      {content.hero.secondaryCta.label || "Upcoming Activities"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Headline & Copy Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Heading Start Text (White)
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
                    Heading Highlight Text (Gold)
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
                    Lead Body Paragraphs (One line per paragraph)
                  </label>
                  <textarea
                    rows={3}
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
                    placeholder="Enter main hero paragraphs..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Gold Closing Promise Line
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
                  <span className="text-[10.5px] font-black uppercase tracking-wider text-[#FF7900] block">
                    Primary Button (Orange Solid)
                  </span>
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        Button Label
                      </label>
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
                        placeholder="Explore Our Services"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        Target URL / Path
                      </label>
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
                </div>

                {/* Secondary CTA */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-[10.5px] font-black uppercase tracking-wider text-[#102E4D] block">
                    Secondary Button (Glass Outlined)
                  </span>
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        Button Label
                      </label>
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
                        placeholder="Upcoming Activities"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        Target URL / Path
                      </label>
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

              {/* Rotating Background Photography Manager */}
              <div className="pt-5 border-t border-slate-100 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-serif font-extrabold text-base text-[#102E4D]">
                      Hero Rotating Background Images ({content.hero.backgrounds.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Images rotate automatically every 4 seconds behind the hero
                      headline.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setContent((prev) => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          backgrounds: [
                            ...prev.hero.backgrounds,
                            {
                              src: "/images/hero-students.jpg",
                              alt: "The Leadership Covenant",
                            },
                          ],
                        },
                      }))
                    }
                    className="px-3.5 py-2 rounded-xl bg-[#102E4D] hover:bg-[#163B61] text-white text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#FFC400]" />
                    <span>Add Background Slide</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {content.hero.backgrounds.map((bg, bgIdx) => (
                    <div
                      key={bgIdx}
                      className="rounded-2xl border-2 border-slate-200 bg-white overflow-hidden flex flex-col justify-between shadow-2xs"
                    >
                      <div>
                        <div className="relative aspect-video bg-slate-900 overflow-hidden">
                          <img
                            src={bg.src || "/images/hero-students.jpg"}
                            alt={bg.alt}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-black">
                            Slide #{bgIdx + 1}
                          </span>
                          {content.hero.backgrounds.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setContent((prev) => ({
                                  ...prev,
                                  hero: {
                                    ...prev.hero,
                                    backgrounds: prev.hero.backgrounds.filter(
                                      (_, i) => i !== bgIdx
                                    ),
                                  },
                                }))
                              }
                              className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white flex items-center justify-center cursor-pointer"
                              title="Remove slide"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="p-3.5 space-y-2.5">
                          <div>
                            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                              Image Path / URL
                            </label>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-[#102E4D]"
                                value={bg.src}
                                onChange={(e) => {
                                  const next = [...content.hero.backgrounds];
                                  next[bgIdx] = { ...bg, src: e.target.value };
                                  setContent((prev) => ({
                                    ...prev,
                                    hero: { ...prev.hero, backgrounds: next },
                                  }));
                                }}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  triggerImageUpload((url) => {
                                    const next = [...content.hero.backgrounds];
                                    next[bgIdx] = { ...bg, src: url };
                                    setContent((prev) => ({
                                      ...prev,
                                      hero: { ...prev.hero, backgrounds: next },
                                    }));
                                  })
                                }
                                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-[#102E4D] shrink-0 cursor-pointer"
                                title="Upload image"
                              >
                                <Upload className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                              Alt Description
                            </label>
                            <input
                              type="text"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600"
                              value={bg.alt}
                              onChange={(e) => {
                                const next = [...content.hero.backgrounds];
                                next[bgIdx] = { ...bg, alt: e.target.value };
                                setContent((prev) => ({
                                  ...prev,
                                  hero: { ...prev.hero, backgrounds: next },
                                }));
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 02: REACH & IMPACT STATS (StatsSection.tsx)                    */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "stats" && (
          <section className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-950 via-[#0A2647] to-emerald-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block">
                  Homepage Section 02 · Reach &amp; Impact Strip
                </span>
                <h2 className="font-serif font-extrabold text-lg sm:text-xl text-white">
                  Reach &amp; Impact Statistics (3 Regional Tabs)
                </h2>
                <p className="text-xs text-slate-300 max-w-2xl">
                  Manage the animated counters across International Footprint,
                  Pakistan Reach, and North Region Spread.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold text-emerald-300 shrink-0">
                2nd on Homepage
              </span>
            </div>

            <div className="p-5 sm:p-7 space-y-6">
              {/* Region Tab Selector matching public stats component */}
              <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200 max-w-xl">
                {content.stats.tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveStatTab(tab.id)}
                    className={`flex-1 py-2.5 px-3.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      activeStatTab === tab.id
                        ? "bg-[#102E4D] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {(() => {
                const tabIndex = content.stats.tabs.findIndex(
                  (t) => t.id === activeStatTab
                );
                const currentTab =
                  tabIndex >= 0 ? content.stats.tabs[tabIndex] : null;
                if (!currentTab) return null;

                const toneColors: Record<
                  string,
                  { bg: string; text: string; border: string }
                > = {
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
                  <div className="space-y-5">
                    <div className="max-w-sm">
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                        Active Region Tab Title
                      </label>
                      <input
                        type="text"
                        className={cmsInputClass}
                        value={currentTab.label}
                        onChange={(e) => {
                          const nextTabs = [...content.stats.tabs];
                          nextTabs[tabIndex] = {
                            ...currentTab,
                            label: e.target.value,
                          };
                          setContent((prev) => ({
                            ...prev,
                            stats: { ...prev.stats, tabs: nextTabs },
                          }));
                        }}
                      />
                    </div>

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
                              <span className="px-2 py-0.5 rounded-full bg-white text-[11px] font-black text-[#102E4D] font-num border border-slate-200">
                                {stat.value.toLocaleString()}
                                {stat.suffix}
                              </span>
                            </div>

                            <div className="space-y-2.5">
                              <div>
                                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                                  Number Value
                                </label>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min="0"
                                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-lg font-black text-[#102E4D] font-num focus:outline-none focus:border-[#FF7900]"
                                    value={stat.value}
                                    onChange={(e) =>
                                      updateStatField(tabIndex, statIndex, {
                                        value: Number(e.target.value),
                                      })
                                    }
                                  />
                                  <input
                                    type="text"
                                    className="w-14 px-2 py-2 rounded-xl border-2 border-slate-300 bg-white text-center text-base font-black text-[#FF7900] font-num focus:outline-none focus:border-[#FF7900]"
                                    value={stat.suffix}
                                    onChange={(e) =>
                                      updateStatField(tabIndex, statIndex, {
                                        suffix: e.target.value,
                                      })
                                    }
                                    title="Suffix (e.g. +)"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                                  Metric Label
                                </label>
                                <input
                                  type="text"
                                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-[#102E4D] focus:outline-none focus:border-[#FF7900]"
                                  value={stat.label}
                                  onChange={(e) =>
                                    updateStatField(tabIndex, statIndex, {
                                      label: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 03: WHAT'S COMING UP (HomeUpcomingSection.tsx)                 */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "upcoming" && (
          <section className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden">
            {/* Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#001B33] via-[#102E4D] to-[#001B33] text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#FFC400]">
                    Homepage Section 03 · Continuous Marquee Slider
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider ${
                      content.upcoming.visible !== false
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                        : "bg-rose-500/20 text-rose-300 border border-rose-400/30"
                    }`}
                  >
                    {content.upcoming.visible !== false
                      ? "Visible on Homepage"
                      : "Hidden on Homepage"}
                  </span>
                </div>
                <h2 className="font-serif font-extrabold text-lg sm:text-xl text-white">
                  What&apos;s Coming Up — Programmes, Events &amp; Learning Experiences
                </h2>
                <p className="text-xs text-slate-300 max-w-2xl">
                  Manage the section heading, bottom CTA button, slider display mode,
                  and every programme/event card &amp; its 2 action buttons displayed in
                  the homepage slider.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setContent((prev) => ({
                      ...prev,
                      upcoming: {
                        ...prev.upcoming,
                        visible: prev.upcoming.visible === false ? true : false,
                      },
                    }))
                  }
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold inline-flex items-center gap-1.5 border transition-all cursor-pointer ${
                    content.upcoming.visible !== false
                      ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
                      : "bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500"
                  }`}
                >
                  {content.upcoming.visible !== false ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hide Section</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Show Section</span>
                    </>
                  )}
                </button>

                <Link
                  href="/AD_Admin/cms/events"
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all"
                  title="Open full Activities & Modal Details CMS"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#FFC400]" />
                  <span>Full Activities CMS</span>
                </Link>

                <button
                  type="button"
                  onClick={handleOpenAddEvent}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E66D00] text-white text-xs font-black inline-flex items-center gap-2 transition-all shadow-md hover:brightness-105 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span>Add Programme / Event</span>
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-7 space-y-6">
              {/* Live Section Header Miniature Preview */}
              <div className="rounded-2xl bg-gradient-to-b from-[#EFFBF8] via-white to-[#EFFBF8] border border-[#D7F5EF] p-5 sm:p-6 text-center space-y-2 shadow-2xs">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
                  Public Section Header Preview
                </span>
                <p className="text-xs font-bold uppercase tracking-widest text-[#FF7900]">
                  {content.upcoming.eyebrow || "WHAT'S COMING UP"}
                </p>
                <h3 className="font-serif font-extrabold text-2xl sm:text-3xl text-[#102E4D] tracking-tight">
                  {content.upcoming.heading ||
                    "Programmes, Events & Learning Experiences"}
                </h3>
                {content.upcoming.subtitle && (
                  <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
                    {content.upcoming.subtitle}
                  </p>
                )}
                <div className="w-16 h-1 bg-[#FFC400] mx-auto rounded-full" />
              </div>

              {/* Section Header, CTA & Filter Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-5 border-b border-slate-100">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Section Eyebrow (Orange Tag)
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.upcoming.eyebrow}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        upcoming: {
                          ...prev.upcoming,
                          eyebrow: e.target.value,
                        },
                      }))
                    }
                    placeholder="WHAT'S COMING UP"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Section Main Heading
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.upcoming.heading}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        upcoming: {
                          ...prev.upcoming,
                          heading: e.target.value,
                        },
                      }))
                    }
                    placeholder="Programmes, Events & Learning Experiences"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Optional Subtitle (Below Main Heading)
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.upcoming.subtitle || ""}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        upcoming: {
                          ...prev.upcoming,
                          subtitle: e.target.value,
                        },
                      }))
                    }
                    placeholder="Optional short description under the heading (leave blank for clean default look)..."
                  />
                </div>

                {/* Bottom CTA Button Label */}
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Bottom Button Label
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.upcoming.ctaLabel}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        upcoming: {
                          ...prev.upcoming,
                          ctaLabel: e.target.value,
                        },
                      }))
                    }
                    placeholder="View all activities"
                  />
                </div>

                {/* Bottom CTA Button Link */}
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Bottom Button Target Link
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.upcoming.ctaHref}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        upcoming: {
                          ...prev.upcoming,
                          ctaHref: e.target.value,
                        },
                      }))
                    }
                    placeholder="/activities"
                  />
                </div>

                {/* Slider Filter Mode & Bottom Button Visibility */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D]">
                    Slider Display Filter &amp; CTA Visibility
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={content.upcoming.filterMode || "upcoming"}
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...prev,
                          upcoming: {
                            ...prev.upcoming,
                            filterMode:
                              e.target.value === "all" ? "all" : "upcoming",
                          },
                        }))
                      }
                      className="flex-1 px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-[#102E4D] focus:outline-none focus:border-[#FF7900]"
                    >
                      <option value="upcoming">
                        Upcoming &amp; Live Events Only
                      </option>
                      <option value="all">
                        All Visible Events (Incl. Past)
                      </option>
                    </select>

                    <button
                      type="button"
                      onClick={() =>
                        setContent((prev) => ({
                          ...prev,
                          upcoming: {
                            ...prev.upcoming,
                            showCta:
                              prev.upcoming.showCta === false ? true : false,
                          },
                        }))
                      }
                      className={`px-3 py-2.5 rounded-xl border text-xs font-extrabold whitespace-nowrap cursor-pointer transition-all ${
                        content.upcoming.showCta !== false
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                          : "bg-slate-100 border-slate-200 text-slate-500"
                      }`}
                      title="Toggle bottom 'View all activities' button"
                    >
                      {content.upcoming.showCta !== false
                        ? "Bottom CTA: Shown"
                        : "Bottom CTA: Hidden"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Programmes & Events Slider Cards Manager */}
              {(() => {
                const todayIso = new Date().toISOString().slice(0, 10);
                const precomputedList = precomputeLeadershipEvents(eventsList);
                const checkIsShownOnHome = (
                  evt: LeadershipEvent,
                  lifecycle: EventLifecycle
                ) => {
                  if (evt.hidden || evt.showOnHome === false) return false;
                  if (evt.showOnHome === true) return true;
                  if (content.upcoming.filterMode === "all") return true;
                  return lifecycle !== "previous";
                };

                const shownCount = precomputedList.filter((evt) =>
                  checkIsShownOnHome(evt, getEventLifecycle(evt, todayIso))
                ).length;
                const hiddenCount = precomputedList.length - shownCount;

                return (
                  <div className="space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-serif font-extrabold text-base sm:text-lg text-[#102E4D]">
                            Slider Programme &amp; Event Cards ({eventsList.length} Total)
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                            {shownCount} Shown on Home
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-slate-200/80 text-slate-600 border border-slate-300">
                            {hiddenCount} Hidden on Home
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          <strong>Shown cards</strong> appear at 100% full visibility;{" "}
                          <strong>Hidden cards</strong> are dimmed with low transparency
                          and excluded from the public homepage marquee.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setEventsList((prev) =>
                              prev.map((item) => ({
                                ...item,
                                showOnHome: true,
                                hidden: false,
                              }))
                            )
                          }
                          className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-extrabold cursor-pointer transition-all"
                        >
                          Show All on Home
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setEventsList((prev) =>
                              prev.map((item) => {
                                const lc = getEventLifecycle(item, todayIso);
                                return {
                                  ...item,
                                  showOnHome: lc !== "previous",
                                };
                              })
                            )
                          }
                          className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition-all"
                        >
                          Show Only Upcoming &amp; Live
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
                      {precomputedList.map((evt, index) => {
                        const lifecycle = getEventLifecycle(evt, todayIso);
                        const isOpenEnrollment = lifecycle === "enrollment_open";
                        const btnCfg = resolveActivityCardButtons(evt, todayIso);
                        const isShownOnHome = checkIsShownOnHome(evt, lifecycle);

                        return (
                          <div
                            key={evt.slug || index}
                            className={`rounded-2xl transition-all duration-200 flex flex-col justify-between overflow-hidden h-full ${
                              !isShownOnHome
                                ? "border-2 border-dashed border-slate-300 bg-slate-100/60 shadow-none"
                                : isOpenEnrollment
                                ? "border-[2.5px] border-[#16A34A] ring-3 ring-[#16A34A]/15 bg-white shadow-md hover:shadow-lg"
                                : "border-2 border-[#B8E8DF] bg-white shadow-sm hover:shadow-md"
                            }`}
                          >
                            {/* Top Homepage Card Live Preview (100% opaque when shown, low opacity when hidden) */}
                            <div
                              className={`transition-all duration-200 ${
                                isShownOnHome
                                  ? "opacity-100"
                                  : "opacity-35 grayscale-[45%] select-none"
                              }`}
                            >
                              {/* Top Color Accent Bar */}
                              <div
                                className={`w-full h-2 bg-gradient-to-r ${
                                  isOpenEnrollment
                                    ? "from-[#16A34A] via-[#22C55E] to-[#15803D]"
                                    : evt.theme.gradient
                                }`}
                              />

                              {/* Fixed-Height Top Status Strip */}
                              {isOpenEnrollment ? (
                                <div className="h-[38px] px-4 bg-gradient-to-r from-[#16A34A] via-[#15803D] to-[#16A34A] text-white flex items-center justify-between gap-2">
                                  <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider">
                                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                    <span>ENROLLMENTS OPEN</span>
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-num text-[9.5px] font-black px-2 py-0.5 rounded-full bg-white text-[#15803D] uppercase tracking-wider">
                                      Live Now
                                    </span>
                                    <span
                                      className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                        isShownOnHome
                                          ? "bg-emerald-950/60 text-emerald-200 border border-white/25"
                                          : "bg-slate-900/80 text-slate-200"
                                      }`}
                                    >
                                      {isShownOnHome ? "Shown" : "Hidden"}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="h-[38px] px-4 bg-[#EFFBF8] border-b border-[#D7F5EF] flex items-center justify-between text-[11px] text-slate-600 font-semibold">
                                  <span className="uppercase tracking-wider text-[10.5px] font-bold text-[#102E4D]/75">
                                    Scheduled Event #{index + 1}
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`text-[9.5px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                        isShownOnHome
                                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                          : "bg-slate-200 text-slate-700 border border-slate-300"
                                      }`}
                                    >
                                      {isShownOnHome
                                        ? "Shown on Home"
                                        : "Hidden on Home"}
                                    </span>
                                    <span className="font-num font-bold text-[#102E4D]">
                                      {evt.yearStr}
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Card Body matching HomeUpcomingSection with uniform heights */}
                              <div className="p-4 space-y-3">
                                <div className="flex items-center gap-3.5 min-h-[68px]">
                                  {/* Date Box */}
                                  <div
                                    className={`w-[62px] shrink-0 rounded-xl overflow-hidden text-center bg-white ${
                                      isOpenEnrollment
                                        ? "border-2 border-[#16A34A] shadow-xs"
                                        : `border ${evt.theme.borderAccent} shadow-2xs`
                                    }`}
                                  >
                                    <div
                                      className={`bg-gradient-to-r ${evt.theme.gradient} text-white text-[10px] font-extrabold uppercase tracking-widest py-0.5`}
                                    >
                                      {evt.monthStr}
                                    </div>
                                    <div className="font-num font-extrabold text-xl leading-tight text-[#102E4D] pt-1">
                                      {evt.dayStr}
                                    </div>
                                    <div className="font-num text-[8.5px] font-semibold uppercase text-slate-500 pb-1 pt-0.5">
                                      {evt.weekdayStr} · {evt.yearStr}
                                    </div>
                                  </div>

                                  {/* Category & Fixed 2-Line Height Title */}
                                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <p
                                      className={`text-[10px] font-extrabold uppercase tracking-wider mb-1 leading-none truncate ${evt.theme.text}`}
                                    >
                                      {CATEGORY_LABELS[evt.category]}
                                    </p>
                                    <h4 className="font-serif font-extrabold text-[15px] text-[#102E4D] leading-[1.25] line-clamp-2 min-h-[38px] flex items-center">
                                      <span>{evt.title}</span>
                                    </h4>
                                  </div>
                                </div>

                                {/* Location & Lifecycle (Uniform Height) */}
                                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] h-[30px]">
                                  <span className="inline-flex items-center gap-1 font-semibold text-[#102E4D] truncate max-w-[165px]">
                                    <MapPin className="w-3.5 h-3.5 text-[#FF7900] shrink-0" />
                                    <span className="truncate">
                                      {evt.locationNote || evt.city}
                                    </span>
                                  </span>
                                  <span className="inline-flex items-center gap-1.5 font-semibold text-slate-600 shrink-0">
                                    <span
                                      className={`w-2 h-2 rounded-full ${
                                        isOpenEnrollment
                                          ? "bg-[#16A34A]"
                                          : lifecycle === "upcoming"
                                          ? "bg-[#2563EB]"
                                          : "bg-[#FF7900]"
                                      }`}
                                    />
                                    <span>{EVENT_LIFECYCLE_LABELS[lifecycle]}</span>
                                  </span>
                                </div>

                                {/* Live 2-Button Preview Bar (Uniform Height) */}
                                <div className="flex items-center gap-2 pt-0.5 min-h-[34px]">
                                  {btnCfg.showMoreDetails && (
                                    <span className="flex-1 py-1.5 px-2 rounded-xl border border-[#D7F5EF] bg-[#EFFBF8] text-[#102E4D] font-bold text-[10.5px] text-center truncate">
                                      More details
                                    </span>
                                  )}
                                  {btnCfg.actionType !== "none" && (
                                    <span
                                      className={`flex-1 py-1.5 px-2 rounded-xl text-white font-black uppercase tracking-wider text-[10.5px] text-center truncate ${
                                        btnCfg.actionType === "enroll_now" ||
                                        (isOpenEnrollment &&
                                          btnCfg.actionType !== "event_details")
                                          ? "bg-gradient-to-r from-[#16A34A] to-[#15803D]"
                                          : `bg-gradient-to-r ${evt.theme.gradient}`
                                      }`}
                                    >
                                      {btnCfg.actionLabel} →
                                    </span>
                                  )}
                                  {!btnCfg.showMoreDetails &&
                                    btnCfg.actionType === "none" && (
                                      <span className="w-full py-1.5 rounded-xl border border-dashed border-slate-200 text-[10px] font-semibold text-slate-400 text-center">
                                        Both Card Buttons Hidden
                                      </span>
                                    )}
                                </div>
                              </div>
                            </div>

                            {/* Quick CMS Controls Panel on Every Card (Always crisp and interactive) */}
                            <div
                              className={`p-3.5 border-t space-y-2.5 ${
                                isShownOnHome
                                  ? "bg-slate-50/90 border-slate-200/80"
                                  : "bg-slate-100/95 border-slate-300/80"
                              }`}
                            >
                              {/* Row 1: Show on Home & Lifecycle Status */}
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1">
                                    Home Slider Visibility
                                  </label>
                                  <select
                                    value={isShownOnHome ? "show" : "hide"}
                                    onChange={(e) => {
                                      const show = e.target.value === "show";
                                      handlePatchEventCard(index, {
                                        showOnHome: show,
                                        hidden: show ? false : evt.hidden,
                                      });
                                    }}
                                    className={`w-full rounded-lg border px-2 py-1.5 text-[10.5px] font-extrabold focus:outline-none cursor-pointer transition-colors ${
                                      isShownOnHome
                                        ? "border-emerald-400 bg-emerald-50 text-emerald-900"
                                        : "border-slate-300 bg-white text-slate-500"
                                    }`}
                                  >
                                    <option value="show">✓ Shown on Home</option>
                                    <option value="hide">✕ Hidden on Home</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1">
                                    Card Status Mode
                                  </label>
                                  <select
                                    value={lifecycle}
                                    onChange={(e) => {
                                      const nextLifecycle =
                                        e.target.value as EventLifecycle;
                                      handlePatchEventCard(index, {
                                        lifecycleOverride: nextLifecycle,
                                        showOnHome:
                                          nextLifecycle !== "previous"
                                            ? true
                                            : evt.showOnHome,
                                        statusTone:
                                          nextLifecycle === "enrollment_open"
                                            ? "open"
                                            : "limited",
                                        statusLabel:
                                          nextLifecycle === "enrollment_open"
                                            ? "Applications open"
                                            : nextLifecycle === "upcoming"
                                            ? "Enrollment not open"
                                            : "Event completed",
                                      });
                                    }}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[10.5px] font-bold text-[#102E4D] focus:outline-none focus:border-[#FF7900] cursor-pointer"
                                  >
                                    <option value="enrollment_open">
                                      Enrollment Open (Green)
                                    </option>
                                    <option value="upcoming">Upcoming Event</option>
                                    <option value="previous">Previous Event</option>
                                  </select>
                                </div>
                              </div>

                              {/* Row 2: 2-Button Selector (Left "More details" + Right Action Button) */}
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1">
                                    Left Button (More details)
                                  </label>
                                  <select
                                    value={
                                      evt.showMoreDetailsButton === false
                                        ? "hide"
                                        : "show"
                                    }
                                    onChange={(e) =>
                                      handlePatchEventCard(index, {
                                        showMoreDetailsButton:
                                          e.target.value === "show",
                                      })
                                    }
                                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[10.5px] font-bold text-[#102E4D] focus:outline-none focus:border-[#FF7900] cursor-pointer"
                                  >
                                    <option value="show">Show (Popup)</option>
                                    <option value="hide">Hide Button</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1">
                                    Right Action Button
                                  </label>
                                  <select
                                    value={evt.cardActionButton || "auto"}
                                    onChange={(e) =>
                                      handlePatchEventCard(index, {
                                        cardActionButton: e.target
                                          .value as CardActionButtonType,
                                      })
                                    }
                                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[10.5px] font-bold text-[#102E4D] focus:outline-none focus:border-[#FF7900] cursor-pointer"
                                  >
                                    <option value="auto">Auto (Default)</option>
                                    <option value="event_details">
                                      Event details (/event)
                                    </option>
                                    <option value="enroll_now">
                                      Enroll now (/apply)
                                    </option>
                                    <option value="apply_now">
                                      Apply now (/apply)
                                    </option>
                                    <option value="none">Hide Button</option>
                                  </select>
                                </div>
                              </div>

                              {/* Row 3: Reorder, Edit, Delete Actions */}
                              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveEvent(index, -1)}
                                    disabled={index === 0}
                                    className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center disabled:opacity-40 cursor-pointer"
                                    title="Move earlier in slider"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5 -rotate-90" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveEvent(index, 1)}
                                    disabled={index === eventsList.length - 1}
                                    className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center disabled:opacity-40 cursor-pointer"
                                    title="Move later in slider"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5 -rotate-90" />
                                  </button>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setDeleteEventConfirmIndex(index)
                                    }
                                    className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                                    title="Delete programme/event"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditEvent(index)}
                                    className="px-3 py-1.5 rounded-lg bg-[#102E4D] hover:bg-[#163B61] text-white text-xs font-extrabold inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-[#FFC400]" />
                                    <span>Edit Card</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 04: OUR STORY & 4 PROMISES (AboutSection.tsx)                  */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "story" && (
          <section className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#001B33] via-[#0A2647] to-[#001B33] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFC400] block">
                  Homepage Section 04 · Our Story &amp; The Covenant
                </span>
                <h2 className="font-serif font-extrabold text-lg sm:text-xl text-white">
                  Our Story, Featured Photography &amp; The 4 Promises
                </h2>
                <p className="text-xs text-slate-300 max-w-2xl">
                  Manage the story section header, featured photograph, covenant
                  narrative, four core promises (Learn, Develop, Lead, Transform),
                  and action buttons.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold text-[#FFC400] shrink-0">
                4th on Homepage
              </span>
            </div>

            <div className="p-5 sm:p-7 space-y-6">
              {/* Top Section Header Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-5 border-b border-slate-100">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Section Eyebrow
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
                    Story Lead Subtitle
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
              </div>

              {/* Two-Column Split: Left Image + Right Promises Narrative */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-5 border-b border-slate-100">
                {/* Left Column: Story Image */}
                <div className="lg:col-span-5 space-y-3">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#102E4D] block">
                    Left Column — Featured Story Photograph
                  </span>
                  <div className="rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-900 aspect-4/3 relative">
                    <img
                      src={content.story.image || "/images/hero-students.jpg"}
                      alt={content.story.imageAlt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-2">
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
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Image Alt Description
                    </label>
                    <input
                      type="text"
                      className={cmsInputClass}
                      value={content.story.imageAlt}
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...prev,
                          story: { ...prev.story, imageAlt: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Right Column: Covenant Narrative & Promises */}
                <div className="lg:col-span-7 space-y-4">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#102E4D] block">
                    Right Column — Covenant Narrative &amp; 4 Core Promises
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10.5px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                        Promises Eyebrow (Orange)
                      </label>
                      <input
                        type="text"
                        className={cmsInputClass}
                        value={content.story.promisesEyebrow}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...prev,
                            story: {
                              ...prev.story,
                              promisesEyebrow: e.target.value,
                            },
                          }))
                        }
                        placeholder="Four promises. One covenant."
                      />
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                        Promises Sub-Heading
                      </label>
                      <input
                        type="text"
                        className={cmsInputClass}
                        value={content.story.promisesHeading}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...prev,
                            story: {
                              ...prev.story,
                              promisesHeading: e.target.value,
                            },
                          }))
                        }
                        placeholder="To be the most trusted catalyst for leadership."
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10.5px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                        Promises Body Narrative
                      </label>
                      <textarea
                        rows={3}
                        className={cmsInputClass}
                        value={content.story.promisesBody}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...prev,
                            story: {
                              ...prev.story,
                              promisesBody: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>

                  {/* 4 Core Promises Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {content.story.promises.map((promise, pIdx) => (
                      <div
                        key={pIdx}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
                      >
                        <span className="text-[10px] font-black text-[#FF7900] uppercase tracking-wider block">
                          Promise 0{pIdx + 1}
                        </span>
                        <input
                          type="text"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-xs text-[#102E4D]"
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
                          className="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-600 leading-relaxed"
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

              {/* Story Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <span className="text-[10.5px] font-black uppercase tracking-wider text-[#FF7900] block">
                    Story Primary Button (Orange)
                  </span>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.story.primaryCta.label}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        story: {
                          ...prev.story,
                          primaryCta: {
                            ...prev.story.primaryCta,
                            label: e.target.value,
                          },
                        },
                      }))
                    }
                    placeholder="Explore Our Services"
                  />
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.story.primaryCta.href}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        story: {
                          ...prev.story,
                          primaryCta: {
                            ...prev.story.primaryCta,
                            href: e.target.value,
                          },
                        },
                      }))
                    }
                    placeholder="/services"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <span className="text-[10.5px] font-black uppercase tracking-wider text-[#102E4D] block">
                    Story Secondary Button (Outlined)
                  </span>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.story.secondaryCta.label}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        story: {
                          ...prev.story,
                          secondaryCta: {
                            ...prev.story.secondaryCta,
                            label: e.target.value,
                          },
                        },
                      }))
                    }
                    placeholder="Read Our Full Story"
                  />
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.story.secondaryCta.href}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        story: {
                          ...prev.story,
                          secondaryCta: {
                            ...prev.story.secondaryCta,
                            href: e.target.value,
                          },
                        },
                      }))
                    }
                    placeholder="/about"
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 05: WHAT WE DO / OUR SERVICES SLIDER (HomeServicesSection.tsx)  */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "services" && (
          <section className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#001B33] via-[#0D3B66] to-[#001B33] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFC400] block">
                  Homepage Section 05 · 3D Coverflow Services Carousel
                </span>
                <h2 className="font-serif font-extrabold text-lg sm:text-xl text-white">
                  What We Do — Our Services Slider (Full CRUD)
                </h2>
                <p className="text-xs text-slate-300 max-w-xl">
                  Add, edit, reorder, or delete service cards displayed on the
                  homepage 3D coverflow carousel.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold text-[#FFC400] hidden sm:inline-block">
                  5th on Homepage
                </span>
                <button
                  type="button"
                  onClick={handleOpenAddService}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E66D00] text-white text-xs font-black inline-flex items-center gap-2 transition-all shadow-md hover:brightness-105 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span>Add New Service</span>
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-7 space-y-6">
              {/* Slider Heading & Subtitle Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-5 border-b border-slate-100">
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

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Slide Action Button Label
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.services.ctaLabel}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        services: {
                          ...prev.services,
                          ctaLabel: e.target.value,
                        },
                      }))
                    }
                    placeholder="Explore Service"
                  />
                </div>

                <div className="sm:col-span-3">
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
                          Slide #{index + 1}
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
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 06: VOICES & TESTIMONIALS (HomeVoicesSection.tsx)              */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "voices" && (
          <section className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#001B33] via-[#0A2647] to-[#001B33] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFC400] block">
                  Homepage Section 06 · Principle Quote &amp; Community Voices
                </span>
                <h2 className="font-serif font-extrabold text-lg sm:text-xl text-white">
                  The Principle We Live By &amp; School Testimonials
                </h2>
                <p className="text-xs text-slate-300 max-w-2xl">
                  Manage the signature Dr. Stephen R. Covey principle quote on the
                  left and the community educator testimonials on the right.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold text-[#FFC400] shrink-0">
                6th on Homepage
              </span>
            </div>

            <div className="p-5 sm:p-7 space-y-6">
              {/* Covey / Principle Quote Card */}
              <div className="p-5 rounded-2xl bg-[#EFFBF8] border border-[#D7F5EF] space-y-4">
                <span className="text-[10.5px] font-black uppercase tracking-wider text-[#102E4D] flex items-center gap-1.5">
                  <Quote className="w-4 h-4 text-[#FF7900]" />
                  Left Column — Primary Leadership Principle Quote
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                      Pill Badge Eyebrow
                    </label>
                    <input
                      type="text"
                      className={cmsInputClass}
                      value={content.voices.principle.eyebrow}
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...prev,
                          voices: {
                            ...prev.voices,
                            principle: {
                              ...prev.voices.principle,
                              eyebrow: e.target.value,
                            },
                          },
                        }))
                      }
                      placeholder="The Principle We Live By"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                      Author Name
                    </label>
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
                      placeholder="Dr. Stephen R. Covey"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                      Author Designation / Book
                    </label>
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
                      placeholder="Author, The 7 Habits of Highly Effective People"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                      Principle Quote Headline
                    </label>
                    <textarea
                      rows={2}
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
                      placeholder="The main thing is to keep the main thing the main thing."
                    />
                  </div>
                </div>
              </div>

              {/* Testimonials List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#102E4D] block">
                      Right Column — Community Testimonials (First 2 cards display side-by-side)
                    </span>
                    <span className="text-xs text-slate-500">
                      Card 1 features the Crimson accent border; Card 2 features the
                      Royal Blue accent border.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const nextItems = [
                        ...content.voices.testimonials.items,
                        {
                          quote: "Write a testimonial...",
                          author: "Educator / Leader",
                        },
                      ];
                      setContent((prev) => ({
                        ...prev,
                        voices: {
                          ...prev.voices,
                          testimonials: { items: nextItems },
                        },
                      }));
                    }}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-extrabold text-[#102E4D] inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#FF7900]" />
                    <span>Add Testimonial</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {content.voices.testimonials.items.map((item, tIdx) => (
                    <div
                      key={tIdx}
                      className={`p-5 rounded-2xl bg-white border-2 border-slate-200 space-y-3 relative border-t-4 ${
                        tIdx % 2 === 0
                          ? "border-t-[#C0392B]"
                          : "border-t-[#2563EB]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Testimonial Card #{tIdx + 1}
                        </span>
                        {content.voices.testimonials.items.length > 1 && (
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
                            className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                            title="Remove testimonial"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                          Quote Text
                        </label>
                        <textarea
                          rows={3}
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed italic focus:outline-none focus:border-[#FF7900]"
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
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                          Author / Role Attribution
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-[#102E4D] focus:outline-none focus:border-[#FF7900]"
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
                          placeholder="Elementary Principal"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 07: CALL TO ACTION BANNER (HomeCtaSection.tsx)                 */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "cta" && (
          <section className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#001B33] via-[#0A2647] to-[#001B33] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFC400] block">
                  Homepage Section 07 · Closing Conversion Banner
                </span>
                <h2 className="font-serif font-extrabold text-lg sm:text-xl text-white">
                  Footer Call to Action Banner
                </h2>
                <p className="text-xs text-slate-300 max-w-2xl">
                  Controls the final dark-navy transformation banner and its 2 action
                  buttons at the bottom of the homepage.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold text-[#FFC400] shrink-0">
                7th on Homepage
              </span>
            </div>

            <div className="p-5 sm:p-7 space-y-6">
              {/* Live Dark Navy Banner Preview */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#001B33] via-[#0B2540] to-[#001B33] text-white p-6 sm:p-8 shadow-lg border border-white/15 text-center space-y-2.5">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFC400] to-transparent" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block">
                  Live CTA Banner Preview
                </span>
                <p className="text-xs font-bold uppercase tracking-widest text-[#FFC400]">
                  {content.cta.eyebrow}
                </p>
                <h3 className="font-serif font-extrabold text-2xl sm:text-3xl text-white">
                  {content.cta.heading}
                </h3>
                <div className="w-14 h-1 bg-[#FFC400] mx-auto rounded-full" />
                <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
                  {content.cta.subtext}
                </p>
                <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                  {content.cta.buttons[0] && (
                    <span className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] text-white font-bold text-xs uppercase tracking-wider shadow-sm">
                      {content.cta.buttons[0].label} →
                    </span>
                  )}
                  {content.cta.buttons[1] && (
                    <span className="px-5 py-2.5 rounded-xl border border-white/25 bg-white/5 text-white font-semibold text-xs uppercase tracking-wider">
                      {content.cta.buttons[1].label}
                    </span>
                  )}
                </div>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Banner Eyebrow (Gold)
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
                    placeholder="Start Your Transformation"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    CTA Main Heading
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
                    placeholder="Ready to lead the change in your school?"
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
                    placeholder="Let's design a leadership journey for your students, educators, and families."
                  />
                </div>

                {/* Button 1 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <span className="text-[10.5px] font-black uppercase tracking-wider text-[#FF7900] block">
                    Button 1 (Primary Orange Button)
                  </span>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">
                      Button Label
                    </label>
                    <input
                      type="text"
                      className={cmsInputClass}
                      value={content.cta.buttons[0]?.label || ""}
                      onChange={(e) => {
                        const nextBtns = [...content.cta.buttons];
                        nextBtns[0] = {
                          label: e.target.value,
                          href: nextBtns[0]?.href || "/contact#enquiry-form",
                          variant: "primary",
                        };
                        setContent((prev) => ({
                          ...prev,
                          cta: { ...prev.cta, buttons: nextBtns },
                        }));
                      }}
                      placeholder="Talk to our team"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">
                      Target Link
                    </label>
                    <input
                      type="text"
                      className={cmsInputClass}
                      value={content.cta.buttons[0]?.href || ""}
                      onChange={(e) => {
                        const nextBtns = [...content.cta.buttons];
                        nextBtns[0] = {
                          label: nextBtns[0]?.label || "Talk to our team",
                          href: e.target.value,
                          variant: "primary",
                        };
                        setContent((prev) => ({
                          ...prev,
                          cta: { ...prev.cta, buttons: nextBtns },
                        }));
                      }}
                      placeholder="/contact#enquiry-form"
                    />
                  </div>
                </div>

                {/* Button 2 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <span className="text-[10.5px] font-black uppercase tracking-wider text-[#102E4D] block">
                    Button 2 (Secondary Outlined Button)
                  </span>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">
                      Button Label
                    </label>
                    <input
                      type="text"
                      className={cmsInputClass}
                      value={content.cta.buttons[1]?.label || ""}
                      onChange={(e) => {
                        const nextBtns = [...content.cta.buttons];
                        nextBtns[1] = {
                          label: e.target.value,
                          href: nextBtns[1]?.href || "/activities",
                          variant: "secondary",
                        };
                        setContent((prev) => ({
                          ...prev,
                          cta: { ...prev.cta, buttons: nextBtns },
                        }));
                      }}
                      placeholder="See upcoming events"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">
                      Target Link
                    </label>
                    <input
                      type="text"
                      className={cmsInputClass}
                      value={content.cta.buttons[1]?.href || ""}
                      onChange={(e) => {
                        const nextBtns = [...content.cta.buttons];
                        nextBtns[1] = {
                          label: nextBtns[1]?.label || "See upcoming events",
                          href: e.target.value,
                          variant: "secondary",
                        };
                        setContent((prev) => ({
                          ...prev,
                          cta: { ...prev.cta, buttons: nextBtns },
                        }));
                      }}
                      placeholder="/activities"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* BOTTOM SECTION SEQUENCE STEPPER (PREV / NEXT HOMEPAGE SECTION)      */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <div>
            {prevTab ? (
              <button
                type="button"
                onClick={() => {
                  setActiveTab(prevTab.id);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-extrabold text-[#102E4D] inline-flex items-center gap-2 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#FF7900]" />
                <span>Previous: {prevTab.label}</span>
              </button>
            ) : (
              <span className="text-xs font-semibold text-slate-400 pl-2">
                Start of Homepage Sequence (Section 01 of 07)
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {HOME_CMS_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setActiveTab(t.id);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`w-7 h-7 rounded-lg text-[10.5px] font-black transition-all cursor-pointer ${
                  activeTab === t.id
                    ? "bg-[#102E4D] text-[#FFC400] shadow-xs"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
                title={t.shortTitle}
              >
                {t.number}
              </button>
            ))}
          </div>

          <div>
            {nextTab ? (
              <button
                type="button"
                onClick={() => {
                  setActiveTab(nextTab.id);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="px-4 py-2 rounded-xl bg-[#102E4D] hover:bg-[#163B61] text-white text-xs font-extrabold inline-flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <span>Next: {nextTab.label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FFC400]" />
              </button>
            ) : (
              <button
                type="button"
                disabled={saving || !hasUnsavedChanges}
                onClick={handleSave}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold inline-flex items-center gap-2 transition-all ${
                  hasUnsavedChanges
                    ? "bg-gradient-to-r from-[#FF7900] to-[#E56D00] text-white cursor-pointer shadow-sm"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                <Save className="w-3.5 h-3.5" />
                <span>
                  {hasUnsavedChanges
                    ? "Publish All Homepage Changes"
                    : "All Changes Published"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SERVICE ADD / EDIT MODAL (TAB 05)                                   */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {(isAddingService || editingServiceIndex !== null) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
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
      {/* SERVICE DELETE CONFIRMATION MODAL                                   */}
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

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* PROGRAMME / EVENT ADD & EDIT MODAL (TAB 03: WHAT'S COMING UP)       */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {(isAddingEvent || editingEventIndex !== null) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#001B33] via-[#102E4D] to-[#001B33] text-white flex items-center justify-between gap-4 shrink-0 border-b border-white/10">
              <div className="space-y-1 min-w-0 flex-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FFC400]/20 text-[#FFC400] border border-[#FFC400]/30 inline-block">
                  {isAddingEvent
                    ? "Add Programme / Event to What's Coming Up"
                    : "Edit Programme / Event Card"}
                </span>
                <h3 className="font-serif font-extrabold text-xl text-white truncate">
                  {eventFormData.title || "New Programme / Event"}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsAddingEvent(false);
                  setEditingEventIndex(null);
                }}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-7 overflow-y-auto space-y-4 flex-1 text-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Programme / Event Title *
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={eventFormData.title}
                    onChange={(e) =>
                      setEventFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="e.g. School Impact Summit 2026"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Category
                  </label>
                  <select
                    className={cmsInputClass}
                    value={eventFormData.category}
                    onChange={(e) =>
                      setEventFormData((prev) => ({
                        ...prev,
                        category: e.target.value as EventCategory,
                      }))
                    }
                  >
                    {EVENT_CATEGORY_OPTIONS.map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Card Lifecycle Status
                  </label>
                  <select
                    className={cmsInputClass}
                    value={getEventLifecycle(eventFormData)}
                    onChange={(e) => {
                      const nextLifecycle = e.target.value as EventLifecycle;
                      setEventFormData((prev) => ({
                        ...prev,
                        lifecycleOverride: nextLifecycle,
                        statusTone:
                          nextLifecycle === "enrollment_open"
                            ? "open"
                            : "limited",
                        statusLabel:
                          nextLifecycle === "enrollment_open"
                            ? "Applications open"
                            : nextLifecycle === "upcoming"
                            ? "Enrollment not open"
                            : "Event completed",
                      }));
                    }}
                  >
                    <option value="enrollment_open">
                      Enrollment Open (Green Live Card)
                    </option>
                    <option value="upcoming">Upcoming Event</option>
                    <option value="previous">Previous Event</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Start Date (Determines Month/Day Badge)
                  </label>
                  <input
                    type="date"
                    className={cmsInputClass}
                    value={eventFormData.startDate}
                    onChange={(e) =>
                      setEventFormData((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                        endDate:
                          !prev.endDate || prev.endDate < e.target.value
                            ? e.target.value
                            : prev.endDate,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    className={cmsInputClass}
                    value={eventFormData.endDate}
                    onChange={(e) =>
                      setEventFormData((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={eventFormData.city}
                    onChange={(e) =>
                      setEventFormData((prev) => ({
                        ...prev,
                        city: e.target.value,
                      }))
                    }
                    placeholder="e.g. Islamabad"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Card Location Line (Optional Note)
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={eventFormData.locationNote || ""}
                    onChange={(e) =>
                      setEventFormData((prev) => ({
                        ...prev,
                        locationNote: e.target.value,
                      }))
                    }
                    placeholder="e.g. Islamabad • Jul 25, 2026"
                  />
                </div>

                {/* 2-Button Configuration Panel */}
                <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#102E4D] block">
                    Card Action Buttons (2 Button Slots)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                        Button 1 (Left — &ldquo;More details&rdquo; Modal)
                      </label>
                      <select
                        className={cmsInputClass}
                        value={
                          eventFormData.showMoreDetailsButton === false
                            ? "hide"
                            : "show"
                        }
                        onChange={(e) =>
                          setEventFormData((prev) => ({
                            ...prev,
                            showMoreDetailsButton: e.target.value === "show",
                          }))
                        }
                      >
                        <option value="show">
                          Show &ldquo;More details&rdquo; Button
                        </option>
                        <option value="hide">
                          Hide &ldquo;More details&rdquo; Button
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                        Button 2 (Right — Primary Action Button)
                      </label>
                      <select
                        className={cmsInputClass}
                        value={eventFormData.cardActionButton || "auto"}
                        onChange={(e) =>
                          setEventFormData((prev) => ({
                            ...prev,
                            cardActionButton: e.target
                              .value as CardActionButtonType,
                          }))
                        }
                      >
                        <option value="auto">
                          Auto (Default by Event Type)
                        </option>
                        <option value="event_details">
                          Event details (Links to /event)
                        </option>
                        <option value="enroll_now">
                          Enroll now (Links to /apply)
                        </option>
                        <option value="apply_now">
                          Apply now (Links to /apply)
                        </option>
                        <option value="none">Hide Second Button</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Short Description (For Popup &amp; Activities Grid)
                  </label>
                  <textarea
                    rows={3}
                    className={cmsInputClass}
                    value={eventFormData.description}
                    onChange={(e) =>
                      setEventFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Summary of the programme or event..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Banner Image
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      className={cmsInputClass}
                      value={eventFormData.image}
                      onChange={(e) =>
                        setEventFormData((prev) => ({
                          ...prev,
                          image: e.target.value,
                        }))
                      }
                      placeholder="/images/pd-educators.jpg"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        triggerImageUpload((url) => {
                          setEventFormData((prev) => ({ ...prev, image: url }));
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

            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsAddingEvent(false);
                  setEditingEventIndex(null);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEventModal}
                className="px-5 py-2 rounded-xl bg-[#102E4D] hover:bg-[#163B61] text-white text-xs font-black transition-all shadow-md cursor-pointer inline-flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 text-[#FFC400]" />
                <span>Done &amp; Apply Card</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* PROGRAMME / EVENT DELETE CONFIRMATION MODAL                         */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {deleteEventConfirmIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="font-serif font-extrabold text-lg text-[#102E4D]">
                Delete Programme / Event?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to remove &ldquo;
                <strong>{eventsList[deleteEventConfirmIndex]?.title}</strong>
                &rdquo; from What&apos;s Coming Up?
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteEventConfirmIndex(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteEvent(deleteEventConfirmIndex)}
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

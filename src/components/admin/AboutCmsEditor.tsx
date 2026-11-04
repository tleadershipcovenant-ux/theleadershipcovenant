"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookOpen,
  Check,
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
  Target,
  ShieldCheck,
  Compass,
  GraduationCap,
  Heart,
  Quote,
  User,
} from "lucide-react";
import { MdArrowForward, MdClose, MdVisibility, MdFlag, MdCheckCircle } from "react-icons/md";
import {
  ABOUT_CONTENT,
  normalizeAboutCms,
  type AboutPageContent,
  type AboutPromise,
  type AboutPrincipleItem,
} from "@/content/about";
import { cmsInputClass } from "@/components/admin/cms-fields";

const PROMISE_COLOR_OPTIONS = [
  { value: "brand-crimson", label: "Crimson Rose (Red)", gradient: "from-[#E11D48] to-[#BE123C]", badge: "bg-rose-50 text-rose-700 border-rose-200" },
  { value: "brand-green", label: "Emerald Green", gradient: "from-[#16A34A] to-[#15803D]", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "brand-yellow", label: "Amber Orange", gradient: "from-[#FF7900] to-[#E56D00]", badge: "bg-amber-50 text-amber-800 border-amber-200" },
  { value: "brand-blue", label: "Royal Blue", gradient: "from-[#2563EB] to-[#1D4ED8]", badge: "bg-blue-50 text-blue-700 border-blue-200" },
];

export default function AboutCmsEditor() {
  const [content, setContent] = useState<AboutPageContent>(ABOUT_CONTENT);
  const [visible, setVisible] = useState(true);
  const [original, setOriginal] = useState(
    JSON.stringify({ ...ABOUT_CONTENT, _visible: true })
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "hero" | "vision" | "covenant" | "principles" | "ceo" | "cta"
  >("hero");

  // Promise Modal State
  const [editingPromiseIndex, setEditingPromiseIndex] = useState<number | null>(null);
  const [isAddingPromise, setIsAddingPromise] = useState(false);
  const [promiseModalData, setPromiseModalData] = useState<AboutPromise | null>(null);

  // Principle Modal State
  const [editingPrincipleIndex, setEditingPrincipleIndex] = useState<number | null>(null);
  const [isAddingPrinciple, setIsAddingPrinciple] = useState(false);
  const [principleModalData, setPrincipleModalData] = useState<AboutPrincipleItem | null>(null);

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "promise" | "principle" | "paragraph";
    index: number;
    title: string;
  } | null>(null);

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
        setContent(ABOUT_CONTENT);
        setVisible(true);
        setOriginal(JSON.stringify({ ...ABOUT_CONTENT, _visible: true }));
        return;
      }
      const json = await res.json();
      const page = json.pages?.about;
      const raw = page?.content || {};
      const normalized = normalizeAboutCms(raw);
      const isVisible = raw._visible !== false;
      setContent(normalized);
      setVisible(isVisible);
      setOriginal(JSON.stringify({ ...normalized, _visible: isVisible }));
    } catch (err) {
      console.error("[About CMS Load Error]", err);
      setContent(ABOUT_CONTENT);
      setVisible(true);
      setOriginal(JSON.stringify({ ...ABOUT_CONTENT, _visible: true }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  // Save changes
  const handleSave = useCallback(async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const payload = {
        ...content,
        _visible: visible,
      };
      const res = await fetch("/api/admin/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page_key: "about",
          content: payload,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Failed to persist to Firebase Firestore.");
      }
      setOriginal(JSON.stringify(payload));
      setFeedback({
        type: "success",
        text: "Our Story content published successfully! The public /about page is live with your updates.",
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

  // Keyboard shortcut Ctrl+S / Cmd+S
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
        "Are you sure you want to restore the Our Story page to original code defaults? Any custom modifications will be replaced."
      )
    ) {
      return;
    }
    setResetting(true);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset", page_key: "about" }),
      });
      const json = await res.json();
      if (res.ok && json.page) {
        const saved = normalizeAboutCms(json.page.content);
        const isVisible = json.page.content._visible !== false;
        setContent(saved);
        setVisible(isVisible);
        setOriginal(JSON.stringify({ ...saved, _visible: isVisible }));
        setEditingPromiseIndex(null);
        setPromiseModalData(null);
        setIsAddingPromise(false);
        setEditingPrincipleIndex(null);
        setPrincipleModalData(null);
        setIsAddingPrinciple(false);
        setFeedback({
          type: "success",
          text: "Our Story page restored to factory defaults.",
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

  /* ────────────────────────── PROMISE CRUD ────────────────────────── */
  const openAddPromise = () => {
    const nextNum = String(content.covenant.promises.length + 1).padStart(2, "0");
    setPromiseModalData({
      number: nextNum,
      word: "",
      promise: "",
      accent: "brand-crimson",
    });
    setIsAddingPromise(true);
    setEditingPromiseIndex(null);
  };

  const openEditPromise = (index: number) => {
    setPromiseModalData({ ...content.covenant.promises[index] });
    setEditingPromiseIndex(index);
    setIsAddingPromise(false);
  };

  const savePromiseModal = () => {
    if (!promiseModalData) return;
    const word = promiseModalData.word.trim();
    if (!word) {
      alert("Promise word title is required (e.g. Learn, Develop, Lead).");
      return;
    }
    setContent((prev) => {
      const list = [...prev.covenant.promises];
      if (isAddingPromise) {
        list.push(promiseModalData);
      } else if (editingPromiseIndex !== null) {
        list[editingPromiseIndex] = promiseModalData;
      }
      return {
        ...prev,
        covenant: { ...prev.covenant, promises: list },
      };
    });
    setPromiseModalData(null);
    setEditingPromiseIndex(null);
    setIsAddingPromise(false);
  };

  const movePromise = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= content.covenant.promises.length) return;
    setContent((prev) => {
      const list = [...prev.covenant.promises];
      const temp = list[index];
      list[index] = list[target];
      list[target] = temp;
      return {
        ...prev,
        covenant: { ...prev.covenant, promises: list },
      };
    });
  };

  const duplicatePromise = (index: number) => {
    setContent((prev) => {
      const list = [...prev.covenant.promises];
      const item = list[index];
      const nextNum = String(list.length + 1).padStart(2, "0");
      list.splice(index + 1, 0, {
        ...item,
        number: nextNum,
        word: `${item.word} (Copy)`,
      });
      return {
        ...prev,
        covenant: { ...prev.covenant, promises: list },
      };
    });
  };

  /* ────────────────────────── PRINCIPLE CRUD ────────────────────────── */
  const openAddPrinciple = () => {
    setPrincipleModalData({
      title: "",
      text: "",
    });
    setIsAddingPrinciple(true);
    setEditingPrincipleIndex(null);
  };

  const openEditPrinciple = (index: number) => {
    setPrincipleModalData({ ...content.principles.items[index] });
    setEditingPrincipleIndex(index);
    setIsAddingPrinciple(false);
  };

  const savePrincipleModal = () => {
    if (!principleModalData) return;
    const title = principleModalData.title.trim();
    if (!title) {
      alert("Principle title is required (e.g. Every voice matters).");
      return;
    }
    setContent((prev) => {
      const list = [...prev.principles.items];
      if (isAddingPrinciple) {
        list.push(principleModalData);
      } else if (editingPrincipleIndex !== null) {
        list[editingPrincipleIndex] = principleModalData;
      }
      return {
        ...prev,
        principles: { ...prev.principles, items: list },
      };
    });
    setPrincipleModalData(null);
    setEditingPrincipleIndex(null);
    setIsAddingPrinciple(false);
  };

  const movePrinciple = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= content.principles.items.length) return;
    setContent((prev) => {
      const list = [...prev.principles.items];
      const temp = list[index];
      list[index] = list[target];
      list[target] = temp;
      return {
        ...prev,
        principles: { ...prev.principles, items: list },
      };
    });
  };

  const duplicatePrinciple = (index: number) => {
    setContent((prev) => {
      const list = [...prev.principles.items];
      const item = list[index];
      list.splice(index + 1, 0, {
        ...item,
        title: `${item.title} (Copy)`,
      });
      return {
        ...prev,
        principles: { ...prev.principles, items: list },
      };
    });
  };

  /* ────────────────────────── CEO PARAGRAPH CRUD ────────────────────────── */
  const addParagraph = () => {
    setContent((prev) => ({
      ...prev,
      ceo: {
        ...prev.ceo,
        paragraphs: [...prev.ceo.paragraphs, "Enter new paragraph text here..."],
      },
    }));
  };

  const updateParagraph = (index: number, text: string) => {
    setContent((prev) => {
      const list = [...prev.ceo.paragraphs];
      list[index] = text;
      return {
        ...prev,
        ceo: { ...prev.ceo, paragraphs: list },
      };
    });
  };

  const moveParagraph = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= content.ceo.paragraphs.length) return;
    setContent((prev) => {
      const list = [...prev.ceo.paragraphs];
      const temp = list[index];
      list[index] = list[target];
      list[target] = temp;
      return {
        ...prev,
        ceo: { ...prev.ceo, paragraphs: list },
      };
    });
  };

  /* ────────────────────────── DELETE EXECUTION ────────────────────────── */
  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "promise") {
      setContent((prev) => ({
        ...prev,
        covenant: {
          ...prev.covenant,
          promises: prev.covenant.promises.filter((_, i) => i !== deleteTarget.index),
        },
      }));
    } else if (deleteTarget.type === "principle") {
      setContent((prev) => ({
        ...prev,
        principles: {
          ...prev.principles,
          items: prev.principles.items.filter((_, i) => i !== deleteTarget.index),
        },
      }));
    } else if (deleteTarget.type === "paragraph") {
      setContent((prev) => ({
        ...prev,
        ceo: {
          ...prev.ceo,
          paragraphs: prev.ceo.paragraphs.filter((_, i) => i !== deleteTarget.index),
        },
      }));
    }
    setDeleteTarget(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 text-[#FF7900] animate-spin" />
        <p className="text-sm font-semibold text-slate-500">
          Loading Our Story page content from Firebase Firestore…
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Hidden file input for uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* ═══════════════════════════════════════════════════════════
          HEADER: EXECUTIVE BAR WITH ACCENT STRIPE & PILL SCROLLBAR
      ═══════════════════════════════════════════════════════════ */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl bg-gradient-to-br from-[#001B33] via-[#0A2644] to-[#001020] text-white border border-white/10">
        {/* Top Signature Colored Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#10B981] shrink-0" />

        {/* Ambient Glows */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#FFC400]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative p-5 sm:p-7 space-y-4">
          {/* Top Bar: Back, Badges, and Live Switch */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Link
                href="/AD_Admin/cms"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/8 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-bold transition-colors border border-white/10"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>CMS Overview Hub</span>
              </Link>

              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Organization · Our Story
              </span>

              <span className="hidden sm:inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Real-Time Firestore
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Public Page Link */}
              <a
                href="/about"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/8 hover:bg-white/15 text-slate-200 hover:text-white text-xs font-bold transition-colors border border-white/10"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#FF7900]" />
                <span>Preview Public Page</span>
              </a>

              {/* Page Live Toggle */}
              <button
                type="button"
                onClick={() => setVisible(!visible)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  visible
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                    : "bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600"
                }`}
              >
                {visible ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                <span>{visible ? "Page is Live" : "Page is Hidden"}</span>
              </button>
            </div>
          </div>

          {/* Main Title Strip & Action Buttons */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
            <div>
              <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-white tracking-tight flex items-center gap-2.5">
                <span>Our Story &amp; Covenant</span>
                <span className="text-xs font-sans font-normal px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
                  /about
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Visual CRUD editor for philosophy, vision, four covenant promises, timeless principles, and the CEO executive message.
              </p>
            </div>

            {/* Quick Actions (Reset & Save) */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleReset}
                disabled={resetting || saving}
                className="px-3.5 py-2 rounded-xl bg-white/6 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-bold border border-white/10 inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                title="Restore default content"
              >
                <RotateCcw className={`w-3.5 h-3.5 text-amber-400 ${resetting ? "animate-spin" : ""}`} />
                <span>Reset Defaults</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving || resetting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] hover:from-[#E56D00] hover:to-[#CC5F00] text-white text-xs font-extrabold uppercase tracking-wider border border-[#FFC400]/40 shadow-lg shadow-[#FF7900]/30 inline-flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing…</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Publish Changes (Ctrl+S)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section Navigation Pills with Ultra-Thin Scrollbar & Wheel Scrolling */}
          <div
            onWheel={(e) => {
              if (e.deltaY !== 0) {
                e.currentTarget.scrollLeft += e.deltaY;
              }
            }}
            className="flex items-center gap-2 pt-2 border-t border-white/10 overflow-x-auto pb-1.5 scroll-smooth [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/35"
          >
            {[
              { id: "hero", label: "01. Hero Banner", count: null },
              { id: "vision", label: "02. Vision & Mission", count: 2 },
              { id: "covenant", label: "03. Covenant Promises", count: content.covenant.promises.length },
              { id: "principles", label: "04. Believed Principles", count: content.principles.items.length },
              { id: "ceo", label: "05. CEO Message & Governance", count: null },
              { id: "cta", label: "06. Closing Journey CTA", count: null },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? "bg-[#FF7900] text-white shadow-md shadow-[#FF7900]/30"
                    : "bg-white/6 text-slate-300 hover:bg-white/12 hover:text-white"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-num ${
                      activeTab === tab.id ? "bg-white/20 text-white" : "bg-white/10 text-slate-300"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Unsaved Changes Banner */}
      {hasUnsavedChanges && (
        <div className="rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 p-3.5 flex items-center justify-between gap-3 text-amber-800 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-xs font-semibold">
              <strong className="font-bold">Unsaved edits detected!</strong> Press{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-amber-300 text-[10px] font-mono">
                Ctrl+S
              </kbd>{" "}
              or click &quot;Publish Changes&quot; to push your updates live.
            </div>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-1 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors cursor-pointer shrink-0"
          >
            Save Now
          </button>
        </div>
      )}

      {/* Feedback Alert Toast */}
      {feedback && (
        <div
          className={`rounded-2xl p-4 flex items-center justify-between gap-3 text-xs font-semibold border animate-in fade-in duration-200 ${
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
            className="text-slate-400 hover:text-slate-600 text-sm font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          SECTION 01: HERO BANNER
      ═══════════════════════════════════════════════════════════ */}
      {activeTab === "hero" && (
        <div className="rounded-3xl border-2 border-[#C8EFE6] bg-white p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#C8EFE6] pb-4">
            <div>
              <h2 className="font-serif font-bold text-lg text-[#102E4D]">
                01. Hero Banner &amp; Photographic Backdrop
              </h2>
              <p className="text-xs text-slate-500">
                Top landing banner of the Our Story page with photographic atmosphere
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Visual Preview */}
            <div className="lg:col-span-5 space-y-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Atmospheric Backdrop Preview
              </label>
              <div className="relative rounded-2xl overflow-hidden bg-[#001B33] text-white p-6 min-h-[220px] flex flex-col justify-end border border-slate-200 shadow-inner group">
                <img
                  src={content.hero.bgImage || "/Our%20story/S1.png"}
                  alt="Backdrop"
                  className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#001B33] via-[#001B33]/60 to-transparent" />
                <div className="relative z-10 space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FFC400]">
                    {content.hero.eyebrow || "Our Story"}
                  </span>
                  <h3 className="font-serif font-extrabold text-base leading-snug">
                    {content.hero.h1}
                  </h3>
                </div>
              </div>

              {/* Upload image button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    triggerImageUpload((url) =>
                      setContent((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, bgImage: url },
                      }))
                    )
                  }
                  disabled={isUploading}
                  className="flex-1 py-2 rounded-xl bg-[#EFFBF8] hover:bg-[#D7F5EF] text-[#005696] text-xs font-bold border border-[#C8EFE6] inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? "Uploading to Cloudinary…" : "Upload Background Photo"}</span>
                </button>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Background Image URL
                </label>
                <input
                  type="text"
                  value={content.hero.bgImage}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, bgImage: e.target.value },
                    }))
                  }
                  className={cmsInputClass}
                  placeholder="/Our%20story/S1.png or https://res.cloudinary.com/..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Eyebrow Label
                </label>
                <input
                  type="text"
                  value={content.hero.eyebrow}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, eyebrow: e.target.value },
                    }))
                  }
                  className={cmsInputClass}
                  placeholder="Our Story"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Main Headline (H1)
                </label>
                <textarea
                  rows={2}
                  value={content.hero.h1}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, h1: e.target.value },
                    }))
                  }
                  className={cmsInputClass}
                  placeholder="Everyone has the potential to lead. We help them discover and develop it."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Subtext Narrative
                </label>
                <textarea
                  rows={3}
                  value={content.hero.subtext}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, subtext: e.target.value },
                    }))
                  }
                  className={cmsInputClass}
                  placeholder="The Leadership Covenant exists to prepare individuals for life..."
                />
              </div>

              {/* SEO Meta */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  SEO Browser Meta
                </span>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={content.meta.title}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        meta: { ...prev.meta, title: e.target.value },
                      }))
                    }
                    className={cmsInputClass}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                    Meta Description
                  </label>
                  <input
                    type="text"
                    value={content.meta.description}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        meta: { ...prev.meta, description: e.target.value },
                      }))
                    }
                    className={cmsInputClass}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          SECTION 02: VISION & MISSION
      ═══════════════════════════════════════════════════════════ */}
      {activeTab === "vision" && (
        <div className="rounded-3xl border-2 border-[#C8EFE6] bg-white p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#C8EFE6] pb-4">
            <div>
              <h2 className="font-serif font-bold text-lg text-[#102E4D]">
                02. Vision &amp; Mission Cards
              </h2>
              <p className="text-xs text-slate-500">
                Institutional purpose, directional aspiration, and organizational mandate
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vision Card Editor */}
            <div className="p-5 sm:p-6 rounded-2xl border-2 border-[#D7F5EF] bg-[#FAFCFB] space-y-4 relative overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-[#102E4D] via-[#FFC400] to-[#FF7900] absolute top-0 left-0" />
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EFFBF8] text-[#FF7900] border border-[#D7F5EF] flex items-center justify-center shrink-0">
                  <MdVisibility className="text-xl" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF7900] block">
                    Card 01
                  </span>
                  <h3 className="font-serif font-extrabold text-base text-[#102E4D]">
                    Our Vision
                  </h3>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Eyebrow Label
                </label>
                <input
                  type="text"
                  value={content.visionMission.vision.eyebrow}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      visionMission: {
                        ...prev.visionMission,
                        vision: { ...prev.visionMission.vision, eyebrow: e.target.value },
                      },
                    }))
                  }
                  className={cmsInputClass}
                  placeholder="Purpose & Direction"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={content.visionMission.vision.subtitle}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      visionMission: {
                        ...prev.visionMission,
                        vision: { ...prev.visionMission.vision, subtitle: e.target.value },
                      },
                    }))
                  }
                  className={cmsInputClass}
                  placeholder="Our Aspiration"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Heading Title
                </label>
                <input
                  type="text"
                  value={content.visionMission.vision.title}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      visionMission: {
                        ...prev.visionMission,
                        vision: { ...prev.visionMission.vision, title: e.target.value },
                      },
                    }))
                  }
                  className={cmsInputClass}
                  placeholder="Our Vision"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Vision Statement Body
                </label>
                <textarea
                  rows={4}
                  value={content.visionMission.vision.text}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      visionMission: {
                        ...prev.visionMission,
                        vision: { ...prev.visionMission.vision, text: e.target.value },
                      },
                    }))
                  }
                  className={cmsInputClass}
                  placeholder="To be the most trusted catalyst for leadership..."
                />
              </div>
            </div>

            {/* Mission Card Editor */}
            <div className="p-5 sm:p-6 rounded-2xl border-2 border-[#D7F5EF] bg-[#FAFCFB] space-y-4 relative overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-[#FF7900] via-[#FFC400] to-[#102E4D] absolute top-0 left-0" />
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EFFBF8] text-[#FF7900] border border-[#D7F5EF] flex items-center justify-center shrink-0">
                  <MdFlag className="text-xl" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF7900] block">
                    Card 02
                  </span>
                  <h3 className="font-serif font-extrabold text-base text-[#102E4D]">
                    Our Mission
                  </h3>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Eyebrow Label
                </label>
                <input
                  type="text"
                  value={content.visionMission.mission.eyebrow}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      visionMission: {
                        ...prev.visionMission,
                        mission: { ...prev.visionMission.mission, eyebrow: e.target.value },
                      },
                    }))
                  }
                  className={cmsInputClass}
                  placeholder="Institutional Mandate"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={content.visionMission.mission.subtitle}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      visionMission: {
                        ...prev.visionMission,
                        mission: { ...prev.visionMission.mission, subtitle: e.target.value },
                      },
                    }))
                  }
                  className={cmsInputClass}
                  placeholder="Our Action"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Heading Title
                </label>
                <input
                  type="text"
                  value={content.visionMission.mission.title}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      visionMission: {
                        ...prev.visionMission,
                        mission: { ...prev.visionMission.mission, title: e.target.value },
                      },
                    }))
                  }
                  className={cmsInputClass}
                  placeholder="Our Mission"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Mission Statement Body
                </label>
                <textarea
                  rows={4}
                  value={content.visionMission.mission.text}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      visionMission: {
                        ...prev.visionMission,
                        mission: { ...prev.visionMission.mission, text: e.target.value },
                      },
                    }))
                  }
                  className={cmsInputClass}
                  placeholder="The Leadership Covenant exists to prepare individuals for life..."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          SECTION 03: THE COVENANT PROMISES (CRUD)
      ═══════════════════════════════════════════════════════════ */}
      {activeTab === "covenant" && (
        <div className="rounded-3xl border-2 border-[#C8EFE6] bg-white p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#C8EFE6] pb-4">
            <div>
              <h2 className="font-serif font-bold text-lg text-[#102E4D]">
                03. The Leadership Covenant Promises ({content.covenant.promises.length})
              </h2>
              <p className="text-xs text-slate-500">
                Enduring commitments pledged to students, educators, and schools
              </p>
            </div>

            <button
              type="button"
              onClick={openAddPromise}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] hover:from-[#E56D00] hover:to-[#CC5F00] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Promise</span>
            </button>
          </div>

          {/* Section Header Inputs */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Section Eyebrow
              </label>
              <input
                type="text"
                value={content.covenant.eyebrow}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    covenant: { ...prev.covenant, eyebrow: e.target.value },
                  }))
                }
                className={cmsInputClass}
                placeholder="The Covenant"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Main Heading
              </label>
              <input
                type="text"
                value={content.covenant.heading}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    covenant: { ...prev.covenant, heading: e.target.value },
                  }))
                }
                className={cmsInputClass}
                placeholder="Four promises. One covenant."
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Subtext Description
              </label>
              <input
                type="text"
                value={content.covenant.subtext}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    covenant: { ...prev.covenant, subtext: e.target.value },
                  }))
                }
                className={cmsInputClass}
                placeholder="Our solemn pledge to students..."
              />
            </div>
          </div>

          {/* Promise Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {content.covenant.promises.map((p, idx) => {
              const colorConfig =
                PROMISE_COLOR_OPTIONS.find((c) => c.value === p.accent) ||
                PROMISE_COLOR_OPTIONS[idx % PROMISE_COLOR_OPTIONS.length];

              return (
                <div
                  key={idx}
                  className="rounded-2xl border-2 border-[#D7F5EF] bg-white hover:border-[#FF7900] shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
                >
                  <div className={`h-1.5 w-full bg-gradient-to-r ${colorConfig.gradient}`} />

                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`px-2.5 py-0.5 rounded-lg text-xs font-num font-extrabold border ${colorConfig.badge}`}>
                          {p.number || `0${idx + 1}`}
                        </span>
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => movePromise(idx, "up")}
                            disabled={idx === 0}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                            title="Move Earlier"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => movePromise(idx, "down")}
                            disabled={idx === content.covenant.promises.length - 1}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                            title="Move Later"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-serif font-extrabold text-xl text-[#102E4D] tracking-tight group-hover:text-[#FF7900] transition-colors">
                        {p.word}
                      </h3>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        {p.promise}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                        <MdCheckCircle className="text-[#FF7900]" />
                        <span>Promise</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => duplicatePromise(idx)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#005696] hover:bg-slate-100 cursor-pointer"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditPromise(idx)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#FF7900] hover:bg-slate-100 cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget({
                              type: "promise",
                              index: idx,
                              title: `${p.number} - ${p.word}`,
                            })
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          SECTION 04: BELIEVED PRINCIPLES (CRUD)
      ═══════════════════════════════════════════════════════════ */}
      {activeTab === "principles" && (
        <div className="rounded-3xl border-2 border-[#C8EFE6] bg-white p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#C8EFE6] pb-4">
            <div>
              <h2 className="font-serif font-bold text-lg text-[#102E4D]">
                04. Principles We Lead By ({content.principles.items.length})
              </h2>
              <p className="text-xs text-slate-500">
                Core leadership philosophy and institutional culture principles
              </p>
            </div>

            <button
              type="button"
              onClick={openAddPrinciple}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] hover:from-[#E56D00] hover:to-[#CC5F00] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Principle</span>
            </button>
          </div>

          {/* Section Header Inputs */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Section Eyebrow
              </label>
              <input
                type="text"
                value={content.principles.eyebrow}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    principles: { ...prev.principles, eyebrow: e.target.value },
                  }))
                }
                className={cmsInputClass}
                placeholder="What we believe"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Main Heading
              </label>
              <input
                type="text"
                value={content.principles.heading}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    principles: { ...prev.principles, heading: e.target.value },
                  }))
                }
                className={cmsInputClass}
                placeholder="Principles we lead by."
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Subtext Description
              </label>
              <input
                type="text"
                value={content.principles.subtext}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    principles: { ...prev.principles, subtext: e.target.value },
                  }))
                }
                className={cmsInputClass}
                placeholder="Timeless principles grounded in frameworks..."
              />
            </div>
          </div>

          {/* Principles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {content.principles.items.map((principle, idx) => (
              <div
                key={idx}
                className="rounded-2xl border-2 border-[#D7F5EF] bg-white hover:border-[#FF7900] shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group p-5 relative"
              >
                <div className="h-1 w-full bg-gradient-to-r from-[#FF7900] via-[#FFC400] to-[#FF7900] absolute top-0 left-0" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-num font-extrabold text-xs uppercase tracking-widest text-[#FF7900]">
                      Principle 0{idx + 1}
                    </span>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => movePrinciple(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                        title="Move Earlier"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => movePrinciple(idx, "down")}
                        disabled={idx === content.principles.items.length - 1}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                        title="Move Later"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-serif font-extrabold text-lg text-[#102E4D] leading-snug group-hover:text-[#FF7900] transition-colors">
                    {principle.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {principle.text}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => duplicatePrinciple(idx)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-[#005696] hover:bg-slate-100 cursor-pointer"
                    title="Duplicate"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditPrinciple(idx)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-[#FF7900] hover:bg-slate-100 cursor-pointer"
                    title="Edit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteTarget({
                        type: "principle",
                        index: idx,
                        title: principle.title,
                      })
                    }
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          SECTION 05: CEO MESSAGE & GOVERNANCE
      ═══════════════════════════════════════════════════════════ */}
      {activeTab === "ceo" && (
        <div className="rounded-3xl border-2 border-[#C8EFE6] bg-white p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#C8EFE6] pb-4">
            <div>
              <h2 className="font-serif font-bold text-lg text-[#102E4D]">
                05. CEO Message &amp; Leadership Governance
              </h2>
              <p className="text-xs text-slate-500">
                Official statement from the Chief Executive Officer with portrait photo
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* CEO Portrait & Author Info */}
            <div className="lg:col-span-4 space-y-4">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                CEO Portrait Photo
              </label>
              <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-3/4 border border-slate-200 shadow-inner group">
                <img
                  src={content.ceo.photo || "/images/ubaid.jpg"}
                  alt={content.ceo.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="font-serif font-bold text-sm">{content.ceo.name}</div>
                  <div className="text-[11px] text-[#FFC400] font-semibold">{content.ceo.role}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  triggerImageUpload((url) =>
                    setContent((prev) => ({
                      ...prev,
                      ceo: { ...prev.ceo, photo: url },
                    }))
                  )
                }
                disabled={isUploading}
                className="w-full py-2 rounded-xl bg-[#EFFBF8] hover:bg-[#D7F5EF] text-[#005696] text-xs font-bold border border-[#C8EFE6] inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? "Uploading to Cloudinary…" : "Upload New CEO Portrait"}</span>
              </button>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Photo URL
                </label>
                <input
                  type="text"
                  value={content.ceo.photo}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      ceo: { ...prev.ceo, photo: e.target.value },
                    }))
                  }
                  className={cmsInputClass}
                  placeholder="/images/ubaid.jpg"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  CEO Full Name
                </label>
                <input
                  type="text"
                  value={content.ceo.name}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      ceo: { ...prev.ceo, name: e.target.value },
                    }))
                  }
                  className={cmsInputClass}
                  placeholder="Ubaid ur Rehman"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Official Title / Role
                </label>
                <input
                  type="text"
                  value={content.ceo.role}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      ceo: { ...prev.ceo, role: e.target.value },
                    }))
                  }
                  className={cmsInputClass}
                  placeholder="CEO, The Leadership Covenant"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Partner / Regional Credential
                </label>
                <input
                  type="text"
                  value={content.ceo.credential}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      ceo: { ...prev.ceo, credential: e.target.value },
                    }))
                  }
                  className={cmsInputClass}
                  placeholder="Regional Manager, FranklinCovey Education"
                />
              </div>
            </div>

            {/* Message Body & Paragraphs Manager */}
            <div className="lg:col-span-8 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Eyebrow Label
                </label>
                <input
                  type="text"
                  value={content.ceo.eyebrow}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      ceo: { ...prev.ceo, eyebrow: e.target.value },
                    }))
                  }
                  className={cmsInputClass}
                  placeholder="Message from The Chief Executive"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Featured Executive Quote (H3)
                </label>
                <input
                  type="text"
                  value={content.ceo.quote}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      ceo: { ...prev.ceo, quote: e.target.value },
                    }))
                  }
                  className={cmsInputClass}
                  placeholder="“The future will be shaped by those we lead today.”"
                />
              </div>

              {/* Dynamic Paragraphs Manager */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Message Paragraphs ({content.ceo.paragraphs.length})
                  </label>
                  <button
                    type="button"
                    onClick={addParagraph}
                    className="px-2.5 py-1 rounded-lg bg-[#EFFBF8] hover:bg-[#D7F5EF] text-[#005696] text-xs font-bold inline-flex items-center gap-1 border border-[#C8EFE6] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Paragraph</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {content.ceo.paragraphs.map((pText, pIdx) => (
                    <div
                      key={pIdx}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Paragraph 0{pIdx + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveParagraph(pIdx, "up")}
                            disabled={pIdx === 0}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveParagraph(pIdx, "down")}
                            disabled={pIdx === content.ceo.paragraphs.length - 1}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteTarget({
                                type: "paragraph",
                                index: pIdx,
                                title: `Paragraph 0${pIdx + 1}`,
                              })
                            }
                            className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer ml-1"
                            title="Delete Paragraph"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <textarea
                        rows={3}
                        value={pText}
                        onChange={(e) => updateParagraph(pIdx, e.target.value)}
                        className={cmsInputClass}
                        placeholder="Write paragraph content..."
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          SECTION 06: CLOSING JOURNEY CTA
      ═══════════════════════════════════════════════════════════ */}
      {activeTab === "cta" && (
        <div className="rounded-3xl border-2 border-[#C8EFE6] bg-white p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#C8EFE6] pb-4">
            <div>
              <h2 className="font-serif font-bold text-lg text-[#102E4D]">
                06. Closing Journey Call-to-Action Banner
              </h2>
              <p className="text-xs text-slate-500">
                Midnight navy consultation banner displayed at the footer of Our Story
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Visual Preview */}
            <div className="lg:col-span-5 space-y-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                CTA Card Live Preview
              </label>
              <div className="rounded-2xl bg-gradient-to-br from-[#001B33] via-[#0B2540] to-[#001B33] text-white p-6 border border-white/15 text-center relative overflow-hidden shadow-lg space-y-3">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFC400] to-transparent" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#FFC400]">
                  {content.closingBanner.eyebrow}
                </p>
                <h3 className="font-serif font-extrabold text-lg text-white">
                  {content.closingBanner.heading}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {content.closingBanner.subtext}
                </p>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                  <span className="px-3.5 py-1.5 rounded-lg bg-[#FF7900] text-white text-[11px] font-bold">
                    {content.closingBanner.primaryButton.label}
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-[11px] font-semibold border border-white/20">
                    {content.closingBanner.secondaryButton.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Banner Eyebrow Label
                </label>
                <input
                  type="text"
                  value={content.closingBanner.eyebrow}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      closingBanner: {
                        ...prev.closingBanner,
                        eyebrow: e.target.value,
                      },
                    }))
                  }
                  className={cmsInputClass}
                  placeholder="Start Your Transformation"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Main Headline
                </label>
                <input
                  type="text"
                  value={content.closingBanner.heading}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      closingBanner: {
                        ...prev.closingBanner,
                        heading: e.target.value,
                      },
                    }))
                  }
                  className={cmsInputClass}
                  placeholder="Ready to Begin the Journey?"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Subtext Description
                </label>
                <textarea
                  rows={2}
                  value={content.closingBanner.subtext}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      closingBanner: {
                        ...prev.closingBanner,
                        subtext: e.target.value,
                      },
                    }))
                  }
                  className={cmsInputClass}
                  placeholder="Join hundreds of visionary educators..."
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                    Primary CTA Button
                  </span>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Label</label>
                    <input
                      type="text"
                      value={content.closingBanner.primaryButton.label}
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...prev,
                          closingBanner: {
                            ...prev.closingBanner,
                            primaryButton: {
                              ...prev.closingBanner.primaryButton,
                              label: e.target.value,
                            },
                          },
                        }))
                      }
                      className={cmsInputClass}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Target URL</label>
                    <input
                      type="text"
                      value={content.closingBanner.primaryButton.href}
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...prev,
                          closingBanner: {
                            ...prev.closingBanner,
                            primaryButton: {
                              ...prev.closingBanner.primaryButton,
                              href: e.target.value,
                            },
                          },
                        }))
                      }
                      className={cmsInputClass}
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                    Secondary CTA Button
                  </span>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Label</label>
                    <input
                      type="text"
                      value={content.closingBanner.secondaryButton.label}
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...prev,
                          closingBanner: {
                            ...prev.closingBanner,
                            secondaryButton: {
                              ...prev.closingBanner.secondaryButton,
                              label: e.target.value,
                            },
                          },
                        }))
                      }
                      className={cmsInputClass}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Target URL</label>
                    <input
                      type="text"
                      value={content.closingBanner.secondaryButton.href}
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...prev,
                          closingBanner: {
                            ...prev.closingBanner,
                            secondaryButton: {
                              ...prev.closingBanner.secondaryButton,
                              href: e.target.value,
                            },
                          },
                        }))
                      }
                      className={cmsInputClass}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODAL: ADD / EDIT PROMISE
      ═══════════════════════════════════════════════════════════ */}
      {promiseModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#C8EFE6] shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-gradient-to-r from-[#001B33] to-[#0A2644] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#FFC400]" />
                <h3 className="font-serif font-bold text-base">
                  {isAddingPromise ? "Add Covenant Promise" : "Edit Covenant Promise"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPromiseModalData(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <MdClose className="text-xl" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Promise Number
                  </label>
                  <input
                    type="text"
                    value={promiseModalData.number}
                    onChange={(e) =>
                      setPromiseModalData({
                        ...promiseModalData,
                        number: e.target.value,
                      })
                    }
                    className={cmsInputClass}
                    placeholder="01"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Word Title (e.g. Learn)
                  </label>
                  <input
                    type="text"
                    value={promiseModalData.word}
                    onChange={(e) =>
                      setPromiseModalData({
                        ...promiseModalData,
                        word: e.target.value,
                      })
                    }
                    className={cmsInputClass}
                    placeholder="Learn"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Promise Commitment Narrative
                </label>
                <textarea
                  rows={3}
                  value={promiseModalData.promise}
                  onChange={(e) =>
                    setPromiseModalData({
                      ...promiseModalData,
                      promise: e.target.value,
                    })
                  }
                  className={cmsInputClass}
                  placeholder="We commit to lifelong learning as the foundation of leadership."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Color Theme Accent
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PROMISE_COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() =>
                        setPromiseModalData({
                          ...promiseModalData,
                          accent: c.value,
                        })
                      }
                      className={`p-2.5 rounded-xl border text-left text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                        promiseModalData.accent === c.value
                          ? "border-[#FF7900] bg-orange-50/50 text-[#102E4D] ring-2 ring-[#FF7900]/20"
                          : "border-slate-200 hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${c.gradient}`} />
                      <span className="truncate">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPromiseModalData(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={savePromiseModal}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] text-white text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer"
              >
                {isAddingPromise ? "Add Promise" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODAL: ADD / EDIT PRINCIPLE
      ═══════════════════════════════════════════════════════════ */}
      {principleModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#C8EFE6] shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-gradient-to-r from-[#001B33] to-[#0A2644] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#FFC400]" />
                <h3 className="font-serif font-bold text-base">
                  {isAddingPrinciple ? "Add Believed Principle" : "Edit Believed Principle"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPrincipleModalData(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <MdClose className="text-xl" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Principle Title
                </label>
                <input
                  type="text"
                  value={principleModalData.title}
                  onChange={(e) =>
                    setPrincipleModalData({
                      ...principleModalData,
                      title: e.target.value,
                    })
                  }
                  className={cmsInputClass}
                  placeholder="Every voice matters"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Principle Narrative Text
                </label>
                <textarea
                  rows={4}
                  value={principleModalData.text}
                  onChange={(e) =>
                    setPrincipleModalData({
                      ...principleModalData,
                      text: e.target.value,
                    })
                  }
                  className={cmsInputClass}
                  placeholder="Leadership is a habit, not a title. We design experiences where every student, teacher, and parent can lead."
                />
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPrincipleModalData(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={savePrincipleModal}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] text-white text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer"
              >
                {isAddingPrinciple ? "Add Principle" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODAL: SAFE DELETE CONFIRMATION
      ═══════════════════════════════════════════════════════════ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-rose-200 shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-serif font-bold text-lg text-slate-800">
                Confirm Deletion
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove &quot;
                <strong className="text-slate-800">{deleteTarget.title}</strong>&quot;?
                This will take effect when you publish your changes.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

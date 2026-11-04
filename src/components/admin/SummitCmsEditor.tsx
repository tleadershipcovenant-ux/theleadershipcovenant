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
  Play,
  Video,
  Users,
  Compass,
  GraduationCap,
  Building2,
  BookOpen,
  HeartHandshake,
  Target,
} from "lucide-react";
import { MdArrowForward, MdClose } from "react-icons/md";
import {
  SUMMIT_CONTENT,
  normalizeSummitCms,
  type SummitPageContent,
  type SummitSpeaker,
  type SummitVideoItem,
  type SummitObjectiveItem,
  type SummitAudienceRole,
} from "@/content/summit";
import { cmsInputClass } from "@/components/admin/cms-fields";

function extractYouTubeId(urlOrId: string): string {
  const clean = urlOrId.trim();
  if (!clean) return "";
  // Check for standard YouTube URL patterns
  const match = clean.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  if (match && match[1]) return match[1];
  // Direct 11-char ID
  if (/^[\w-]{11}$/.test(clean)) return clean;
  return clean;
}

const AUDIENCE_ICON_OPTIONS = [
  { value: "building", label: "Building / Landmark", icon: Building2 },
  { value: "graduation", label: "Graduation Cap", icon: GraduationCap },
  { value: "book", label: "Book Open", icon: BookOpen },
  { value: "heart", label: "Heart / Well-being", icon: HeartHandshake },
  { value: "compass", label: "Compass / Navigation", icon: Compass },
] as const;

export default function SummitCmsEditor() {
  const [content, setContent] = useState<SummitPageContent>(SUMMIT_CONTENT);
  const [visible, setVisible] = useState(true);
  const [original, setOriginal] = useState(
    JSON.stringify({ ...SUMMIT_CONTENT, _visible: true })
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "hero" | "objectives" | "audience" | "speakers" | "videos" | "cta"
  >("hero");

  // Speaker Modal State
  const [editingSpeakerIndex, setEditingSpeakerIndex] = useState<number | null>(null);
  const [isAddingSpeaker, setIsAddingSpeaker] = useState(false);
  const [speakerModalData, setSpeakerModalData] = useState<SummitSpeaker | null>(null);

  // Video Modal State
  const [editingVideoIndex, setEditingVideoIndex] = useState<number | null>(null);
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [videoModalData, setVideoModalData] = useState<SummitVideoItem | null>(null);

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "speaker" | "video" | "objective" | "audience";
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
        setContent(SUMMIT_CONTENT);
        setVisible(true);
        setOriginal(JSON.stringify({ ...SUMMIT_CONTENT, _visible: true }));
        return;
      }
      const json = await res.json();
      const page = json.pages?.summit;
      const raw = page?.content || {};
      const normalized = normalizeSummitCms(raw);
      const isVisible = raw._visible !== false;
      setContent(normalized);
      setVisible(isVisible);
      setOriginal(JSON.stringify({ ...normalized, _visible: isVisible }));
    } catch (err) {
      console.error("[Summit CMS Load Error]", err);
      setContent(SUMMIT_CONTENT);
      setVisible(true);
      setOriginal(JSON.stringify({ ...SUMMIT_CONTENT, _visible: true }));
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
        body: JSON.stringify({ page_key: "summit", content: payload }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Failed to persist to Firebase Firestore.");
      }
      setOriginal(JSON.stringify(payload));
      setFeedback({
        type: "success",
        text: "Summit content published successfully! The public /summit page is live with your updates.",
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
        "Are you sure you want to restore the School Impact Summit page to original code defaults? Any custom speakers or content will be replaced."
      )
    ) {
      return;
    }
    setResetting(true);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset", page_key: "summit" }),
      });
      const json = await res.json();
      if (res.ok && json.page) {
        const saved = normalizeSummitCms(json.page.content);
        const isVisible = json.page.content._visible !== false;
        setContent(saved);
        setVisible(isVisible);
        setOriginal(JSON.stringify({ ...saved, _visible: isVisible }));
        setEditingSpeakerIndex(null);
        setSpeakerModalData(null);
        setIsAddingSpeaker(false);
        setEditingVideoIndex(null);
        setVideoModalData(null);
        setIsAddingVideo(false);
        setFeedback({
          type: "success",
          text: "Summit page restored to factory defaults.",
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
  // CRUD FOR SPEAKERS
  // ───────────────────────────────────────────────────────────────────────────
  const handleOpenAddSpeaker = () => {
    const newSpeaker: SummitSpeaker = {
      id: `speaker-${Date.now()}`,
      name: "Distinguished Leader",
      role: "Keynote Facilitator",
      title: "Senior Educational Consultant",
      bio: "Provide a brief description of the speaker's distinguished background, leadership impact, and contribution to education.",
      image: "/Submit/fazal.jpeg",
      badgeColor: "bg-[#102E4D] text-[#FFC400] border-[#102E4D]/30",
      topAccent: "from-[#102E4D] via-[#001B33] to-[#FFC400]",
    };
    setSpeakerModalData(newSpeaker);
    setIsAddingSpeaker(true);
    setEditingSpeakerIndex(null);
  };

  const handleOpenEditSpeaker = (index: number) => {
    const target = content.speakers.items[index];
    if (!target) return;
    setSpeakerModalData({ ...target });
    setEditingSpeakerIndex(index);
    setIsAddingSpeaker(false);
  };

  const handleSaveSpeakerModal = () => {
    if (!speakerModalData || !speakerModalData.name.trim()) {
      alert("Please provide the speaker's name.");
      return;
    }
    const nextList = [...content.speakers.items];
    const readySpeaker: SummitSpeaker = {
      ...speakerModalData,
      name: speakerModalData.name.trim(),
      role: speakerModalData.role.trim() || "Facilitator",
      title: speakerModalData.title.trim(),
      bio: speakerModalData.bio.trim(),
      image: speakerModalData.image.trim() || "/Submit/fazal.jpeg",
    };

    if (isAddingSpeaker) {
      nextList.push(readySpeaker);
    } else if (editingSpeakerIndex !== null) {
      nextList[editingSpeakerIndex] = readySpeaker;
    }

    setContent((prev) => ({
      ...prev,
      speakers: { ...prev.speakers, items: nextList },
    }));
    setEditingSpeakerIndex(null);
    setIsAddingSpeaker(false);
    setSpeakerModalData(null);
    setFeedback({
      type: "success",
      text: `Speaker "${readySpeaker.name}" updated. Click "Publish Changes" (Ctrl+S) to save.`,
    });
  };

  const handleMoveSpeaker = (index: number, dir: -1 | 1) => {
    const list = [...content.speakers.items];
    const target = index + dir;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    setContent((prev) => ({
      ...prev,
      speakers: { ...prev.speakers, items: list },
    }));
  };

  // ───────────────────────────────────────────────────────────────────────────
  // CRUD FOR VIDEOS
  // ───────────────────────────────────────────────────────────────────────────
  const handleOpenAddVideo = () => {
    const newVideo: SummitVideoItem = {
      id: `vid-${Date.now()}`,
      youtubeId: "e-zgk1VWN1s",
      title: "School Impact Summit — Event Highlight",
      description:
        "Relive keynote moments, coaching sessions, and school leadership stories from our summit.",
      thumbnail: "https://img.youtube.com/vi/e-zgk1VWN1s/maxresdefault.jpg",
    };
    setVideoModalData(newVideo);
    setIsAddingVideo(true);
    setEditingVideoIndex(null);
  };

  const handleOpenEditVideo = (index: number) => {
    const target = content.videos.items[index];
    if (!target) return;
    setVideoModalData({ ...target });
    setEditingVideoIndex(index);
    setIsAddingVideo(false);
  };

  const handleSaveVideoModal = () => {
    if (!videoModalData || !videoModalData.title.trim()) {
      alert("Please provide a title for the video.");
      return;
    }
    const cleanId = extractYouTubeId(videoModalData.youtubeId);
    if (!cleanId) {
      alert("Please enter a valid YouTube video ID or URL.");
      return;
    }
    const readyVideo: SummitVideoItem = {
      ...videoModalData,
      youtubeId: cleanId,
      title: videoModalData.title.trim(),
      description: videoModalData.description.trim(),
      thumbnail:
        videoModalData.thumbnail.trim() ||
        `https://img.youtube.com/vi/${cleanId}/maxresdefault.jpg`,
    };

    const nextList = [...content.videos.items];
    if (isAddingVideo) {
      nextList.push(readyVideo);
    } else if (editingVideoIndex !== null) {
      nextList[editingVideoIndex] = readyVideo;
    }

    setContent((prev) => ({
      ...prev,
      videos: { ...prev.videos, items: nextList },
    }));
    setEditingVideoIndex(null);
    setIsAddingVideo(false);
    setVideoModalData(null);
    setFeedback({
      type: "success",
      text: `Video "${readyVideo.title}" saved. Remember to click "Publish Changes" to persist.`,
    });
  };

  const handleMoveVideo = (index: number, dir: -1 | 1) => {
    const list = [...content.videos.items];
    const target = index + dir;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    setContent((prev) => ({
      ...prev,
      videos: { ...prev.videos, items: list },
    }));
  };

  // ───────────────────────────────────────────────────────────────────────────
  // DELETE CONFIRMATION HANDLER
  // ───────────────────────────────────────────────────────────────────────────
  const handleDeleteConfirmed = () => {
    if (!deleteTarget) return;
    const { type, index, title } = deleteTarget;

    if (type === "speaker") {
      const next = content.speakers.items.filter((_, i) => i !== index);
      setContent((prev) => ({
        ...prev,
        speakers: { ...prev.speakers, items: next },
      }));
    } else if (type === "video") {
      const next = content.videos.items.filter((_, i) => i !== index);
      setContent((prev) => ({
        ...prev,
        videos: { ...prev.videos, items: next },
      }));
    } else if (type === "objective") {
      const next = content.objectives.items.filter((_, i) => i !== index);
      setContent((prev) => ({
        ...prev,
        objectives: { ...prev.objectives, items: next },
      }));
    } else if (type === "audience") {
      const next = content.audience.items.filter((_, i) => i !== index);
      setContent((prev) => ({
        ...prev,
        audience: { ...prev.audience, items: next },
      }));
    }

    setDeleteTarget(null);
    setFeedback({
      type: "success",
      text: `Removed "${title}". Click "Publish Changes" to persist.`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-8 text-center">
        <Loader2 className="w-10 h-10 text-[#FF7900] animate-spin mb-4" />
        <h3 className="text-base font-serif font-bold text-[#102E4D]">
          Loading School Impact Summit CMS...
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Synchronizing with Google Cloud Firestore
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-28">
      {/* Hidden File Input for Cloudinary Uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* STICKY TOP EXECUTIVE BAR                                            */}
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
                  <span>Featured Event CMS</span>
                  <span className="text-white/30">•</span>
                  <span className="text-slate-300 normal-case tracking-normal font-medium truncate">
                    School Impact Summit 2026
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-serif font-black text-white tracking-tight leading-tight truncate">
                    School Impact Summit Editor
                  </h1>
                  {hasUnsavedChanges && (
                    <span className="text-[10px] font-sans font-bold bg-[#FF7900] text-white px-2 py-0.5 rounded-full shadow-xs animate-pulse shrink-0">
                      Unsaved Changes
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Actions & Save */}
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
                title={visible ? "Summit page is publicly Live" : "Summit page is in Draft"}
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
                href="/summit"
                target="_blank"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white text-xs font-bold border border-white/10 hover:border-white/20 transition-all"
                title="Open public /summit in a new tab"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
                <span className="hidden sm:inline">Preview /summit</span>
                <span className="sm:hidden">Preview</span>
              </Link>

              {/* Reset Defaults */}
              <button
                type="button"
                disabled={resetting || saving}
                onClick={handleReset}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-200 text-xs font-bold border border-white/10 transition-all disabled:opacity-50 cursor-pointer"
                title="Restore default authentic content"
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
                    <span>{hasUnsavedChanges ? "Publish (Ctrl+S)" : "Published"}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section Navigation Tabs with Sleek Compact Scrollbar */}
          <div
            className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-white/10 overflow-x-auto scroll-smooth py-1 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#FFC400]/60"
            onWheel={(e) => {
              if (e.deltaY !== 0) {
                e.currentTarget.scrollLeft += e.deltaY;
              }
            }}
          >
            {[
              { id: "hero", label: "01 Hero Photographic Banner", icon: ImageIcon },
              { id: "objectives", label: "02 Summit Objectives", icon: Target },
              { id: "audience", label: "03 Target Audience Roles", icon: Users },
              { id: "speakers", label: "04 Speakers & Facilitators", icon: Sparkles },
              { id: "videos", label: "05 Watch & Relive Videos", icon: Video },
              { id: "cta", label: "06 Reserve Seat CTA", icon: Layers },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#FFC400] text-[#001B33] shadow-md font-extrabold ring-1 ring-[#FFC400]"
                      : "bg-white/5 text-slate-300 hover:bg-white/15 hover:text-white border border-white/5"
                  }`}
                >
                  <TabIcon className={`w-3.5 h-3.5 ${isActive ? "text-[#001B33]" : "text-slate-400"}`} />
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
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-bold ${feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
              }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
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
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MAIN CONTENT WORKSPACE                                              */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 01: HERO BANNER SECTION                                         */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "hero" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF7900]">
                    Section 01
                  </span>
                  <h2 className="text-xl font-serif font-black text-[#102E4D]">
                    Hero Photographic Banner
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage the main banner picture, responsive mobile picture, and floating registration CTA.
                  </p>
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="mb-8 rounded-2xl overflow-hidden bg-[#001B33] border border-[#001B33] shadow-md relative">
                <div className="h-1 w-full bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#FFC400]" />
                <div className="relative aspect-[16/6] min-h-[220px] flex items-center justify-center bg-black/30 overflow-hidden">
                  <img
                    src={content.hero.desktopImage || "/Submit/Hero.png"}
                    alt={content.hero.imageAlt}
                    className="w-full h-full object-contain object-center"
                  />
                  {/* Floating CTA Preview */}
                  <div className="absolute bottom-4 right-4 z-20">
                    <span className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg inline-flex items-center gap-1.5">
                      <span>{content.hero.registerCtaLabel || "Register Now"}</span>
                      <MdArrowForward className="text-sm" />
                    </span>
                  </div>
                </div>
                <div className="h-1 w-full bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#FFC400]" />
              </div>

              {/* Hero Form Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Desktop Hero Banner Image
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      className={cmsInputClass}
                      value={content.hero.desktopImage}
                      placeholder="/Submit/Hero.png"
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, desktopImage: e.target.value },
                        }))
                      }
                    />
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() =>
                        triggerImageUpload((url) => {
                          setContent((prev) => ({
                            ...prev,
                            hero: { ...prev.hero, desktopImage: url },
                          }));
                        })
                      }
                      className="px-3.5 py-2.5 rounded-xl bg-[#001B33] text-white text-xs font-bold hover:bg-[#102E4D] transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Used on tablets and desktops (≥640px). Default: <code>/Submit/Hero.png</code>
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Mobile Hero Banner Image
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      className={cmsInputClass}
                      value={content.hero.mobileImage}
                      placeholder="/Submit/Mobile%20devices%20hero%20section.png"
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, mobileImage: e.target.value },
                        }))
                      }
                    />
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() =>
                        triggerImageUpload((url) => {
                          setContent((prev) => ({
                            ...prev,
                            hero: { ...prev.hero, mobileImage: url },
                          }));
                        })
                      }
                      className="px-3.5 py-2.5 rounded-xl bg-[#001B33] text-white text-xs font-bold hover:bg-[#102E4D] transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Used on mobile devices (&lt;640px).
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Registration Button Label
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.hero.registerCtaLabel}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, registerCtaLabel: e.target.value },
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Registration Button URL Link
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.hero.registerCtaHref}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, registerCtaHref: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 02: SUMMIT OBJECTIVES                                           */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "objectives" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF7900]">
                    Section 02
                  </span>
                  <h2 className="text-xl font-serif font-black text-[#102E4D]">
                    Summit Objectives ("What this summit is for ?")
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Edit the intro narrative and the core pillars: Discover, Voice, Impact.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newObj: SummitObjectiveItem = {
                      id: `obj-${Date.now()}`,
                      title: "NEW OBJECTIVE",
                      text: "Describe what participants will explore or accomplish.",
                      takeaway: "Key Focus • Outcome",
                    };
                    setContent((prev) => ({
                      ...prev,
                      objectives: {
                        ...prev.objectives,
                        items: [...prev.objectives.items, newObj],
                      },
                    }));
                  }}
                  className="px-4 py-2 rounded-xl bg-[#001B33] text-white text-xs font-bold hover:bg-[#102E4D] transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Pillar</span>
                </button>
              </div>

              {/* Section Heading & Body */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Section Heading
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.objectives.heading}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        objectives: { ...prev.objectives, heading: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Eyebrow Tag (Optional)
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.objectives.eyebrow}
                    placeholder="e.g. Core Purpose"
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        objectives: { ...prev.objectives, eyebrow: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Main Narrative Body
                  </label>
                  <textarea
                    rows={3}
                    className={cmsInputClass}
                    value={content.objectives.body}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        objectives: { ...prev.objectives, body: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>

              {/* Objective Pillar Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {content.objectives.items.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-5 rounded-2xl border border-[#D7F5EF] bg-[#F7FDFB] hover:border-[#FFC400] transition-colors space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-num font-extrabold text-[11px] px-2.5 py-1 rounded-md bg-[#102E4D] text-[#FFC400]">
                        0{idx + 1}
                      </span>
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                        {content.objectives.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteTarget({
                                type: "objective",
                                index: idx,
                                title: item.title,
                              })
                            }
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete Pillar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                        Pillar Title
                      </label>
                      <input
                        type="text"
                        className={cmsInputClass}
                        value={item.title}
                        onChange={(e) => {
                          const next = [...content.objectives.items];
                          next[idx] = { ...item, title: e.target.value };
                          setContent((prev) => ({
                            ...prev,
                            objectives: { ...prev.objectives, items: next },
                          }));
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        className={cmsInputClass}
                        value={item.text}
                        onChange={(e) => {
                          const next = [...content.objectives.items];
                          next[idx] = { ...item, text: e.target.value };
                          setContent((prev) => ({
                            ...prev,
                            objectives: { ...prev.objectives, items: next },
                          }));
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                        Takeaway Badge
                      </label>
                      <input
                        type="text"
                        className={cmsInputClass}
                        value={item.takeaway}
                        placeholder="e.g. Practices • Perspectives"
                        onChange={(e) => {
                          const next = [...content.objectives.items];
                          next[idx] = { ...item, takeaway: e.target.value };
                          setContent((prev) => ({
                            ...prev,
                            objectives: { ...prev.objectives, items: next },
                          }));
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 03: TARGET AUDIENCE ROLES                                       */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "audience" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF7900]">
                    Section 03
                  </span>
                  <h2 className="text-xl font-serif font-black text-[#102E4D]">
                    Target Audience ("Who Should Attend ?")
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage the pull quote and the attendee role cards.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newRole: SummitAudienceRole = {
                      role: "New Leadership Role",
                      icon: "building",
                      topGradient: "from-[#102E4D] to-[#FFC400]",
                    };
                    setContent((prev) => ({
                      ...prev,
                      audience: {
                        ...prev.audience,
                        items: [...prev.audience.items, newRole],
                      },
                    }));
                  }}
                  className="px-4 py-2 rounded-xl bg-[#001B33] text-white text-xs font-bold hover:bg-[#102E4D] transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Role</span>
                </button>
              </div>

              {/* Heading & Pull Quote */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Section Heading
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.audience.heading}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        audience: { ...prev.audience, heading: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Eyebrow Tag (Optional)
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.audience.eyebrow}
                    placeholder="e.g. Target Attendees"
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        audience: { ...prev.audience, eyebrow: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Executive Pull Quote
                  </label>
                  <textarea
                    rows={2}
                    className={cmsInputClass}
                    value={content.audience.pullQuote}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        audience: { ...prev.audience, pullQuote: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>

              {/* Role Cards List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {content.audience.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-[#D7F5EF] bg-white hover:border-[#FFC400] transition-colors flex flex-col justify-between space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-[#FF7900] uppercase tracking-wider">
                        Role 0{idx + 1}
                      </span>
                      {content.audience.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget({
                              type: "audience",
                              index: idx,
                              title: item.role,
                            })
                          }
                          className="p-1 text-slate-300 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                        Role Title
                      </label>
                      <input
                        type="text"
                        className={cmsInputClass}
                        value={item.role}
                        onChange={(e) => {
                          const next = [...content.audience.items];
                          next[idx] = { ...item, role: e.target.value };
                          setContent((prev) => ({
                            ...prev,
                            audience: { ...prev.audience, items: next },
                          }));
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                        Icon Symbol
                      </label>
                      <select
                        className={cmsInputClass}
                        value={item.icon}
                        onChange={(e) => {
                          const next = [...content.audience.items];
                          next[idx] = { ...item, icon: e.target.value as any };
                          setContent((prev) => ({
                            ...prev,
                            audience: { ...prev.audience, items: next },
                          }));
                        }}
                      >
                        {AUDIENCE_ICON_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 04: SPEAKERS & FACILITATORS (FULL CRUD)                         */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "speakers" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF7900]">
                    Section 04
                  </span>
                  <h2 className="text-xl font-serif font-black text-[#102E4D]">
                    Speakers &amp; Facilitators
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage distinguished facilitators, their biographies, photos, and roles.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddSpeaker}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] text-white text-xs font-extrabold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Facilitator</span>
                </button>
              </div>

              {/* Section Header Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Section Eyebrow
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.speakers.eyebrow}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        speakers: { ...prev.speakers, eyebrow: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Section Heading
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.speakers.heading}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        speakers: { ...prev.speakers, heading: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>

              {/* Speakers List Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {content.speakers.items.map((spk, idx) => (
                  <div
                    key={spk.id || idx}
                    className="rounded-3xl bg-white border border-[#D7F5EF] hover:border-[#FFC400] shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group relative"
                  >
                    <div
                      className={`h-1.5 w-full bg-gradient-to-r ${spk.topAccent ||
                        (idx % 2 === 0
                          ? "from-[#102E4D] via-[#001B33] to-[#FFC400]"
                          : "from-[#FF7900] via-[#E56D00] to-[#FFC400]")
                        }`}
                    />

                    <div className="flex flex-col sm:flex-row flex-1 p-5 gap-5 items-center">
                      <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        <img
                          src={spk.image || "/Submit/fazal.jpeg"}
                          alt={spk.name}
                          className="w-full h-full object-cover object-center"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${spk.badgeColor ||
                            (idx % 2 === 0
                              ? "bg-[#102E4D] text-[#FFC400] border-[#102E4D]/30"
                              : "bg-[#FF7900] text-white border-[#FF7900]/30")
                            } inline-block mb-1.5`}
                        >
                          {spk.role}
                        </span>
                        <h3 className="font-serif font-extrabold text-lg text-[#102E4D] truncate">
                          {spk.name}
                        </h3>
                        <p className="text-xs font-bold text-[#FF7900] mt-0.5 truncate">
                          {spk.title}
                        </p>
                        <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                          {spk.bio}
                        </p>
                      </div>
                    </div>

                    {/* Toolbar */}
                    <div className="bg-slate-50 border-t border-slate-100 px-5 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveSpeaker(idx, -1)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 disabled:opacity-30"
                          title="Move Left"
                        >
                          <ArrowUp className="w-3.5 h-3.5 -rotate-90" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === content.speakers.items.length - 1}
                          onClick={() => handleMoveSpeaker(idx, 1)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 disabled:opacity-30"
                          title="Move Right"
                        >
                          <ArrowDown className="w-3.5 h-3.5 -rotate-90" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditSpeaker(idx)}
                          className="px-3 py-1.5 rounded-lg bg-[#001B33] text-white text-xs font-bold hover:bg-[#102E4D] transition-colors flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        {content.speakers.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteTarget({
                                type: "speaker",
                                index: idx,
                                title: spk.name,
                              })
                            }
                            className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors"
                            title="Delete Speaker"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 05: WATCH & RELIVE VIDEOS (FULL CRUD)                           */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "videos" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF7900]">
                    Section 05
                  </span>
                  <h2 className="text-xl font-serif font-black text-[#102E4D]">
                    Watch &amp; Relive (Video Slider)
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage highlight videos, YouTube IDs, custom thumbnails, and descriptions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddVideo}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] text-white text-xs font-extrabold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Video</span>
                </button>
              </div>

              {/* Section Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Section Eyebrow
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.videos.eyebrow}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        videos: { ...prev.videos, eyebrow: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Section Heading
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.videos.heading}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        videos: { ...prev.videos, heading: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>

              {/* Videos Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {content.videos.items.map((vid, idx) => (
                  <div
                    key={vid.id || idx}
                    className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      {/* Thumbnail Preview with Play Icon */}
                      <div className="relative aspect-video bg-slate-900 overflow-hidden">
                        <img
                          src={
                            vid.thumbnail ||
                            `https://img.youtube.com/vi/${vid.youtubeId}/maxresdefault.jpg`
                          }
                          alt={vid.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white text-[#102E4D] flex items-center justify-center shadow-lg">
                            <Play className="w-5 h-5 translate-x-0.5 text-slate-900" />
                          </div>
                        </div>
                        <span className="absolute bottom-2 left-2 bg-black/70 text-white font-mono text-[10px] px-2 py-0.5 rounded">
                          ID: {vid.youtubeId}
                        </span>
                      </div>

                      <div className="p-5">
                        <h3 className="font-serif font-bold text-base text-[#102E4D] line-clamp-1">
                          {vid.title}
                        </h3>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                          {vid.description}
                        </p>
                      </div>
                    </div>

                    {/* Toolbar */}
                    <div className="bg-slate-50 border-t border-slate-100 px-5 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveVideo(idx, -1)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 disabled:opacity-30"
                          title="Move Earlier"
                        >
                          <ArrowUp className="w-3.5 h-3.5 -rotate-90" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === content.videos.items.length - 1}
                          onClick={() => handleMoveVideo(idx, 1)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 disabled:opacity-30"
                          title="Move Later"
                        >
                          <ArrowDown className="w-3.5 h-3.5 -rotate-90" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditVideo(idx)}
                          className="px-3 py-1.5 rounded-lg bg-[#001B33] text-white text-xs font-bold hover:bg-[#102E4D] transition-colors flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        {content.videos.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteTarget({
                                type: "video",
                                index: idx,
                                title: vid.title,
                              })
                            }
                            className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors"
                            title="Delete Video"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 06: RESERVE YOUR SEAT CTA BANNER                                */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "cta" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF7900]">
                    Section 06
                  </span>
                  <h2 className="text-xl font-serif font-black text-[#102E4D]">
                    Reserve Your Seat CTA Banner
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage the bottom call-to-action banner shown to visitors at the end of the page.
                  </p>
                </div>
              </div>

              {/* Live Preview */}
              <div className="mb-8 rounded-3xl overflow-hidden bg-gradient-to-br from-[#001B33] via-[#0B2540] to-[#001B33] text-white p-8 sm:p-10 border border-white/15 text-center relative shadow-xl">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFC400] to-transparent opacity-90" />
                <p className="text-xs font-bold uppercase tracking-widest text-[#FFC400] mb-2">
                  {content.registration.eyebrow}
                </p>
                <h3 className="font-serif font-extrabold text-2xl text-white">
                  {content.registration.heading}
                </h3>
                <div className="w-16 h-1 bg-[#FFC400] mx-auto mt-2.5 rounded-full" />
                <p className="text-xs text-slate-300 mt-2.5 max-w-md mx-auto">
                  {content.registration.subtext}
                </p>
                <div className="mt-5 flex items-center justify-center gap-3">
                  <span className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] text-white font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 shadow-md">
                    <span>{content.registration.primaryCtaLabel}</span>
                    <MdArrowForward className="text-base" />
                  </span>
                  <span className="px-5 py-2.5 rounded-xl border border-white/20 bg-white/5 text-white font-semibold text-xs uppercase tracking-wider">
                    {content.registration.secondaryCtaLabel}
                  </span>
                </div>
              </div>

              {/* CTA Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Eyebrow Text
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.registration.eyebrow}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        registration: {
                          ...prev.registration,
                          eyebrow: e.target.value,
                        },
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Main Banner Heading
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.registration.heading}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        registration: {
                          ...prev.registration,
                          heading: e.target.value,
                        },
                      }))
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Subtext Narrative
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.registration.subtext}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        registration: {
                          ...prev.registration,
                          subtext: e.target.value,
                        },
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Primary CTA Button Label
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.registration.primaryCtaLabel}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        registration: {
                          ...prev.registration,
                          primaryCtaLabel: e.target.value,
                        },
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Primary CTA Link
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.registration.primaryCtaHref}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        registration: {
                          ...prev.registration,
                          primaryCtaHref: e.target.value,
                        },
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Secondary CTA Button Label
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.registration.secondaryCtaLabel}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        registration: {
                          ...prev.registration,
                          secondaryCtaLabel: e.target.value,
                        },
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Secondary CTA Link
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={content.registration.secondaryCtaHref}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        registration: {
                          ...prev.registration,
                          secondaryCtaHref: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SPEAKER EDIT / ADD MODAL                                            */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {speakerModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-[#001B33] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FFC400]">
                  {isAddingSpeaker ? "Add New Facilitator" : "Edit Facilitator Profile"}
                </span>
                <h3 className="font-serif font-black text-lg sm:text-xl">
                  {speakerModalData.name || "Speaker Profile"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSpeakerModalData(null);
                  setIsAddingSpeaker(false);
                  setEditingSpeakerIndex(null);
                }}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: 2 Columns */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Form Inputs */}
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Speaker Full Name *
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={speakerModalData.name}
                    placeholder="e.g. Mr. Fazal Niazi"
                    onChange={(e) =>
                      setSpeakerModalData({
                        ...speakerModalData,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                      Role Badge Label
                    </label>
                    <input
                      type="text"
                      className={cmsInputClass}
                      value={speakerModalData.role}
                      placeholder="e.g. Lead Facilitator"
                      onChange={(e) =>
                        setSpeakerModalData({
                          ...speakerModalData,
                          role: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                      Badge Style
                    </label>
                    <select
                      className={cmsInputClass}
                      value={
                        speakerModalData.badgeColor?.includes("bg-[#FF7900]")
                          ? "orange"
                          : "navy"
                      }
                      onChange={(e) =>
                        setSpeakerModalData({
                          ...speakerModalData,
                          badgeColor:
                            e.target.value === "orange"
                              ? "bg-[#FF7900] text-white border-[#FF7900]/30"
                              : "bg-[#102E4D] text-[#FFC400] border-[#102E4D]/30",
                          topAccent:
                            e.target.value === "orange"
                              ? "from-[#FF7900] via-[#E56D00] to-[#FFC400]"
                              : "from-[#102E4D] via-[#001B33] to-[#FFC400]",
                        })
                      }
                    >
                      <option value="navy">Navy with Gold Accent</option>
                      <option value="orange">Orange with Amber Accent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Title &amp; Designation
                  </label>
                  <input
                    type="text"
                    className={cmsInputClass}
                    value={speakerModalData.title}
                    placeholder="e.g. Practice Lead, FranklinCovey Education"
                    onChange={(e) =>
                      setSpeakerModalData({
                        ...speakerModalData,
                        title: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Biography Narrative
                  </label>
                  <textarea
                    rows={4}
                    className={cmsInputClass}
                    value={speakerModalData.bio}
                    placeholder="Describe their impact, experience, and leadership contribution..."
                    onChange={(e) =>
                      setSpeakerModalData({
                        ...speakerModalData,
                        bio: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                    Profile Photo URL
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      className={cmsInputClass}
                      value={speakerModalData.image}
                      placeholder="/Submit/fazal.jpeg"
                      onChange={(e) =>
                        setSpeakerModalData({
                          ...speakerModalData,
                          image: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() =>
                        triggerImageUpload((url) => {
                          setSpeakerModalData((prev) =>
                            prev ? { ...prev, image: url } : null
                          );
                        })
                      }
                      className="px-3.5 py-2.5 rounded-xl bg-[#001B33] text-white text-xs font-bold hover:bg-[#102E4D] transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Card Preview */}
              <div className="lg:col-span-5 bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-center">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-3 block text-center">
                  Live Card Preview (Mirrors Live Summit Page)
                </span>

                <div className="rounded-3xl bg-white border border-[#D7F5EF] shadow-md overflow-hidden">
                  <div
                    className={`h-1.5 w-full bg-gradient-to-r ${speakerModalData.topAccent ||
                      "from-[#102E4D] via-[#001B33] to-[#FFC400]"
                      }`}
                  />
                  <div className="p-5 flex flex-col items-center text-center">
                    <div className="w-28 h-28 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 mb-3">
                      <img
                        src={speakerModalData.image || "/Submit/fazal.jpeg"}
                        alt={speakerModalData.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${speakerModalData.badgeColor ||
                        "bg-[#102E4D] text-[#FFC400]"
                        } inline-block mb-2`}
                    >
                      {speakerModalData.role || "Facilitator"}
                    </span>
                    <h4 className="font-serif font-extrabold text-lg text-[#102E4D]">
                      {speakerModalData.name || "Speaker Name"}
                    </h4>
                    <p className="text-xs font-bold text-[#FF7900] mt-1 leading-snug">
                      {speakerModalData.title || "Designation"}
                    </p>
                    <p className="text-xs text-slate-600 mt-2.5 leading-relaxed line-clamp-3">
                      {speakerModalData.bio || "Biography narrative preview..."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setSpeakerModalData(null);
                  setIsAddingSpeaker(false);
                  setEditingSpeakerIndex(null);
                }}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSpeakerModal}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] text-white text-xs font-extrabold uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
              >
                Save Facilitator
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* VIDEO EDIT / ADD MODAL                                              */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {videoModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-[#001B33] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FFC400]">
                  {isAddingVideo ? "Add New Video Highlight" : "Edit Video Highlight"}
                </span>
                <h3 className="font-serif font-black text-lg sm:text-xl">
                  {videoModalData.title || "Video Details"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setVideoModalData(null);
                  setIsAddingVideo(false);
                  setEditingVideoIndex(null);
                }}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                  YouTube Video ID or Full URL *
                </label>
                <input
                  type="text"
                  className={cmsInputClass}
                  value={videoModalData.youtubeId}
                  placeholder="e.g. e-zgk1VWN1s or https://www.youtube.com/watch?v=e-zgk1VWN1s"
                  onChange={(e) => {
                    const raw = e.target.value;
                    const cleanId = extractYouTubeId(raw);
                    setVideoModalData({
                      ...videoModalData,
                      youtubeId: cleanId,
                      thumbnail: `https://img.youtube.com/vi/${cleanId}/maxresdefault.jpg`,
                    });
                  }}
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  You can paste a full YouTube URL or just the 11-character video ID.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                  Video Title *
                </label>
                <input
                  type="text"
                  className={cmsInputClass}
                  value={videoModalData.title}
                  placeholder="e.g. School Impact Summit — Event Highlights"
                  onChange={(e) =>
                    setVideoModalData({
                      ...videoModalData,
                      title: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                  Short Description
                </label>
                <textarea
                  rows={3}
                  className={cmsInputClass}
                  value={videoModalData.description}
                  placeholder="Summarize the core takeaways or moments featured in this video..."
                  onChange={(e) =>
                    setVideoModalData({
                      ...videoModalData,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              {/* Video Thumbnail Preview */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                  Thumbnail Preview
                </label>
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
                  <img
                    src={
                      videoModalData.thumbnail ||
                      `https://img.youtube.com/vi/${videoModalData.youtubeId}/maxresdefault.jpg`
                    }
                    alt={videoModalData.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 translate-x-0.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setVideoModalData(null);
                  setIsAddingVideo(false);
                  setEditingVideoIndex(null);
                }}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveVideoModal}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] text-white text-xs font-extrabold uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
              >
                Save Video
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* DELETE CONFIRMATION MODAL                                           */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-black text-lg text-[#102E4D]">
              Confirm Removal
            </h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Are you sure you want to delete{" "}
              <strong className="text-[#102E4D]">"{deleteTarget.title}"</strong>?
              This will remove it from the Summit page once you publish changes.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirmed}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold uppercase tracking-wider shadow-md transition-colors"
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


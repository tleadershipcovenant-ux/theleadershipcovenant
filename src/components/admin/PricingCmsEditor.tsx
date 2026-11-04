"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BadgePercent,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  DollarSign,
  ExternalLink,
  Eye,
  EyeOff,
  Info,
  Loader2,
  MapPin,
  Percent,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  Users,
  X,
  Zap,
  AlertCircle,
  ArrowLeft,
  Award,
  Hourglass,
  Tag,
} from "lucide-react";
import {
  EVENTS,
  type LeadershipEvent,
  getEventLifecycle,
  EVENT_LIFECYCLE_LABELS,
  CATEGORY_LABELS,
  SHORT_MONTHS,
  SHORT_WEEKDAYS,
  getMonthTheme,
  type EventLifecycle,
} from "@/content/events";
import { getActivityPricing } from "@/content/pricing";
import { cmsInputClass } from "@/components/admin/cms-fields";

/* ─── Date Picker Conversion & Formatting Helpers ─── */
function toDatetimeLocal(value?: string): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(trimmed)) {
    return trimmed.slice(0, 16);
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return `${trimmed}T00:00`;
  }
  try {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
  } catch {
    // Ignore fallback
  }
  return trimmed.slice(0, 16);
}

function fromDatetimeLocal(value: string, isEndOfDay = false): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  const seconds = isEndOfDay ? "59" : "00";
  return `${trimmed}:${seconds}+05:00`;
}

function formatPrettyDate(isoStr?: string): string {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Karachi",
    });
  } catch {
    return isoStr;
  }
}

function getPresetDate(daysAhead: number, isEndOfDay = true): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const time = isEndOfDay ? "23:59:59" : "00:00:00";
  return `${y}-${m}-${day}T${time}+05:00`;
}

function getEndOfCurrentMonth(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const lastDay = new Date(y, m, 0).getDate();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${y}-${pad(m)}-${pad(lastDay)}T23:59:59+05:00`;
}

function getStartOfCurrentMonth(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${y}-${pad(m)}-01T00:00:00+05:00`;
}

export default function PricingCmsEditor() {
  const [events, setEvents] = useState<LeadershipEvent[]>(EVENTS);
  const [original, setOriginal] = useState<string>(
    JSON.stringify({ events: EVENTS })
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filter, setFilter] = useState<
    "all" | "early_bird" | "paid" | "free" | "hidden"
  >("all");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [todayIsoDate] = useState(() => new Date().toISOString().slice(0, 10));

  // 1. Fetch latest CMS Data from /api/admin/cms
  const loadCmsData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms", { cache: "no-store" });
      if (!res.ok) {
        setEvents(EVENTS);
        setOriginal(JSON.stringify({ events: EVENTS }));
        return;
      }
      const json = await res.json();
      const eventsPage = json.pages?.events;
      const content = eventsPage?.content || {};

      let list =
        Array.isArray(content.events) && content.events.length > 0
          ? (content.events as LeadershipEvent[])
          : EVENTS;

      // Smart synchronization with code defaults
      // Ensure all 8 standard events exist and inherit updated default fields from code if missing
      const codeMap = new Map(EVENTS.map((e) => [e.slug, e]));
      const existingSlugs = new Set(list.map((e) => e.slug));

      // Auto-include any newly created code activities
      const newlyAddedInCode = EVENTS.filter((e) => !existingSlugs.has(e.slug));
      if (newlyAddedInCode.length > 0) {
        list = [...list, ...newlyAddedInCode];
      }

      // Merge missing pricing and summary fields from code defaults into existing activities
      list = list.map((ev) => {
        const codeEvent = codeMap.get(ev.slug);
        if (!codeEvent) return ev;
        return {
          ...codeEvent,
          ...ev,
          regularPrice:
            typeof ev.regularPrice === "number"
              ? ev.regularPrice
              : codeEvent.regularPrice ?? 0,
          currency: ev.currency || codeEvent.currency || "PKR",
          discountPercent:
            typeof ev.discountPercent === "number"
              ? ev.discountPercent
              : codeEvent.discountPercent ?? 0,
          isOfferActive:
            typeof ev.isOfferActive === "boolean"
              ? ev.isOfferActive
              : codeEvent.isOfferActive ?? false,
          offerLabel: ev.offerLabel || codeEvent.offerLabel || "",
          offerStartDate: ev.offerStartDate || codeEvent.offerStartDate || "",
          offerEndDate: ev.offerEndDate || codeEvent.offerEndDate || "",
          seatLimit: ev.seatLimit || codeEvent.seatLimit || 30,
          duration: ev.duration || codeEvent.duration || "",
          venue: ev.venue || codeEvent.venue || "",
          certificate: ev.certificate || codeEvent.certificate || "",
          schedule: ev.schedule || codeEvent.schedule || "",
        };
      });

      setEvents(list);
      setOriginal(JSON.stringify({ events: list }));
    } catch (err) {
      console.error("[Pricing CMS Load Error]", err);
      setEvents(EVENTS);
      setOriginal(JSON.stringify({ events: EVENTS }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCmsData();
  }, [loadCmsData]);

  // Unsaved changes tracker
  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify({ events }) !== original;
  }, [events, original]);

  // 2. Sync with Website Catalog
  const handleSyncFromWebsite = useCallback(() => {
    setSyncing(true);
    const codeMap = new Map(EVENTS.map((e) => [e.slug, e]));
    let updatedCount = 0;
    let addedCount = 0;

    const existingSlugs = new Set(events.map((e) => e.slug));
    const merged = events.map((existing) => {
      const fromCode = codeMap.get(existing.slug);
      if (fromCode) {
        updatedCount += 1;
        return {
          ...fromCode,
          ...existing,
          // Sync duration, venue, certificate if empty
          duration: existing.duration || fromCode.duration,
          venue: existing.venue || fromCode.venue,
          certificate: existing.certificate || fromCode.certificate,
          schedule: existing.schedule || fromCode.schedule,
          // Sync pricing defaults for summit if not already customized
          regularPrice:
            typeof existing.regularPrice === "number" && existing.regularPrice > 0
              ? existing.regularPrice
              : fromCode.regularPrice ?? 0,
          discountPercent:
            typeof existing.discountPercent === "number" &&
            existing.discountPercent > 0
              ? existing.discountPercent
              : fromCode.discountPercent ?? 0,
          offerStartDate:
            existing.offerStartDate || fromCode.offerStartDate || "",
          offerEndDate: existing.offerEndDate || fromCode.offerEndDate || "",
          offerLabel: existing.offerLabel || fromCode.offerLabel || "",
          isOfferActive:
            typeof existing.isOfferActive === "boolean"
              ? existing.isOfferActive
              : fromCode.isOfferActive ?? false,
          seatLimit: existing.seatLimit || fromCode.seatLimit || 30,
          currency: existing.currency || fromCode.currency || "PKR",
        };
      }
      return existing;
    });

    // Add any code events not yet in list
    for (const codeEvt of EVENTS) {
      if (!existingSlugs.has(codeEvt.slug)) {
        merged.push(codeEvt);
        addedCount += 1;
      }
    }

    setEvents(merged);
    setSyncing(false);
    setFeedback({
      type: "success",
      text: `Commercial rules synchronized with public website catalog (${updatedCount} updated, ${addedCount} added). Click "Publish Changes" to save permanently.`,
    });
  }, [events]);

  // 3. Save / Publish to Firebase Firestore
  const handleSave = useCallback(async () => {
    setSaving(true);
    setFeedback(null);
    try {
      // Clean up whitespace
      const cleaned = events.map((event) => ({
        ...event,
        offerLabel: event.offerLabel?.trim(),
        duration: event.duration?.trim(),
        venue: event.venue?.trim(),
        certificate: event.certificate?.trim(),
        schedule: event.schedule?.trim(),
      }));

      // 1. Primary Save to events catalog
      const resEvents = await fetch("/api/admin/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page_key: "events",
          content: { events: cleaned, _visible: true },
        }),
      });

      const jsonEvents = await resEvents.json();
      if (!resEvents.ok || !jsonEvents.ok) {
        throw new Error(
          jsonEvents.error || "Failed to update events catalog in Firestore."
        );
      }

      // 2. Also sync to commercial pricing document
      const summitEvent =
        cleaned.find((e) => e.slug === "school-impact-summit-2026") || cleaned[0];

      await fetch("/api/admin/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page_key: "pricing",
          content: {
            summitSlug: summitEvent?.slug || "school-impact-summit-2026",
            regularPrice: summitEvent?.regularPrice || 5000,
            discountPercent: summitEvent?.discountPercent || 20,
            earlyBirdDeadline:
              summitEvent?.offerEndDate || "2026-11-07T23:59:59+05:00",
            currency: summitEvent?.currency || "PKR",
          },
        }),
      }).catch(() => {});

      setOriginal(JSON.stringify({ events: cleaned }));
      setFeedback({
        type: "success",
        text: "Pricing and early bird rules published successfully! Public application form and activities pages now show updated prices.",
      });
    } catch (err) {
      setFeedback({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Failed to persist pricing rules.",
      });
    } finally {
      setSaving(false);
    }
  }, [events]);

  // Quick toggle early bird directly on card
  const handleToggleEarlyBird = useCallback(
    (index: number) => {
      setEvents((prev) => {
        const next = [...prev];
        const current = next[index];
        if (!current) return prev;
        const willBeActive = !current.isOfferActive;
        next[index] = {
          ...current,
          isOfferActive: willBeActive,
          // If turning on and discount is 0, give a sensible 20% default
          discountPercent:
            willBeActive && (!current.discountPercent || current.discountPercent <= 0)
              ? 20
              : current.discountPercent,
          offerLabel:
            willBeActive && !current.offerLabel
              ? `Early Bird ${current.discountPercent || 20}% OFF`
              : current.offerLabel,
        };
        return next;
      });
    },
    []
  );

  // Filtered & Searched Events List
  const filteredEvents = useMemo(() => {
    let result = [...events];

    // Filter status tab
    if (filter === "early_bird") {
      result = result.filter(
        (e) =>
          e.isOfferActive &&
          typeof e.regularPrice === "number" &&
          e.regularPrice > 0 &&
          (e.discountPercent || 0) > 0
      );
    } else if (filter === "paid") {
      result = result.filter(
        (e) => typeof e.regularPrice === "number" && e.regularPrice > 0
      );
    } else if (filter === "free") {
      result = result.filter((e) => !e.regularPrice || e.regularPrice <= 0);
    } else if (filter === "hidden") {
      result = result.filter((e) => Boolean(e.hidden));
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (e) =>
          (e.title || "").toLowerCase().includes(q) ||
          (e.slug || "").toLowerCase().includes(q) ||
          (e.city || "").toLowerCase().includes(q) ||
          (CATEGORY_LABELS[e.category] || "").toLowerCase().includes(q)
      );
    }

    return result;
  }, [events, filter, searchQuery]);

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      all: events.length,
      early_bird: events.filter(
        (e) =>
          e.isOfferActive &&
          typeof e.regularPrice === "number" &&
          e.regularPrice > 0 &&
          (e.discountPercent || 0) > 0
      ).length,
      paid: events.filter((e) => typeof e.regularPrice === "number" && e.regularPrice > 0).length,
      free: events.filter((e) => !e.regularPrice || e.regularPrice <= 0).length,
      hidden: events.filter((e) => Boolean(e.hidden)).length,
    };
  }, [events]);

  const currentlyEditingEvent =
    editingIndex !== null ? events[editingIndex] : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24">
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
                Commercial Rules
              </span>
            </div>
            <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-[#102E4D] flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                <BadgePercent className="w-5 h-5 text-white" />
              </span>
              <span>Pricing &amp; Early Bird Rules</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
              Manage commercial pricing, early-bird promotional offers, seat limits,
              and apply-form summary details. Changes publish immediately to the live
              seat booking system with zero downtime.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="/apply"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-[#102E4D] inline-flex items-center gap-2 transition-all shadow-2xs hover:border-[#102E4D]/30"
              title="Preview public Apply and Seat Booking page"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>Preview /apply</span>
            </a>

            <button
              type="button"
              onClick={handleSyncFromWebsite}
              disabled={syncing || loading}
              className="px-3.5 py-2 rounded-xl border border-teal-200 bg-teal-50/60 hover:bg-teal-100/70 text-xs font-bold text-teal-800 inline-flex items-center gap-2 transition-all shadow-2xs cursor-pointer disabled:opacity-60"
              title="Synchronize pricing fields with code defaults"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-teal-700 ${
                  syncing ? "animate-spin" : ""
                }`}
              />
              <span>Sync with Website</span>
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

        {/* Quick KPI Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Activities
            </span>
            <span className="font-num font-black text-2xl text-[#102E4D] block mt-0.5">
              {counts.all}
            </span>
            <span className="text-[10.5px] text-slate-500">
              Synced with Events Catalog
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-600" />
              Early Bird Active
            </span>
            <span className="font-num font-black text-2xl text-emerald-800 block mt-0.5">
              {counts.early_bird}
            </span>
            <span className="text-[10.5px] text-emerald-600 font-medium">
              Promotional discount live
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
              Paid Seat Programs
            </span>
            <span className="font-num font-black text-2xl text-blue-900 block mt-0.5">
              {counts.paid}
            </span>
            <span className="text-[10.5px] text-blue-600 font-medium">
              With registration fee
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block">
              Free Provisional
            </span>
            <span className="font-num font-black text-2xl text-teal-900 block mt-0.5">
              {counts.free}
            </span>
            <span className="text-[10.5px] text-teal-600 font-medium">
              0 PKR reserve now seats
            </span>
          </div>
        </div>
      </div>

      {/* 2. Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Segmented Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: "all", label: `All Activities (${counts.all})` },
            { id: "early_bird", label: `Early Bird Active (${counts.early_bird})` },
            { id: "paid", label: `Paid Seats (${counts.paid})` },
            { id: "free", label: `Free Provisional (${counts.free})` },
            { id: "hidden", label: `Hidden (${counts.hidden})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id as typeof filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filter === tab.id
                  ? "bg-[#102E4D] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px] sm:min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, city, category..."
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50/70 text-xs font-semibold text-[#102E4D] placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#FF7900] focus:ring-3 focus:ring-[#FF7900]/15 transition-all"
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
      </div>

      {/* 3. Cards Grid: Pricing, Commercial Rules & Summary */}
      {loading ? (
        <div className="p-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-[#FF7900] animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Loading commercial rules from Firestore...
          </p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-12 text-center space-y-3 bg-white rounded-3xl border border-slate-200">
          <Info className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-[#102E4D]">
            No matching activities found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or switching to the &ldquo;All Activities&rdquo;
            filter tab.
          </p>
          <button
            type="button"
            onClick={() => {
              setFilter("all");
              setSearchQuery("");
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#102E4D] transition-all cursor-pointer inline-block mt-2"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((event) => {
            const indexInMaster = events.findIndex((e) => e.slug === event.slug);
            const [yStr, mStr, dStr] = (event.startDate || "").split("-");
            const yearNum = Number(yStr) || 2026;
            const monthIndex = Number.isFinite(Number(mStr))
              ? Number(mStr) - 1
              : 0;
            const dayNum = Number(dStr) || 1;
            const monthStr = SHORT_MONTHS[monthIndex] ?? "Jul";
            const dayStr = String(dayNum).padStart(2, "0");
            const weekdayIdx = new Date(
              Date.UTC(yearNum, monthIndex, dayNum)
            ).getUTCDay();
            const weekdayStr = SHORT_WEEKDAYS[weekdayIdx] ?? "Sat";
            const theme = getMonthTheme(monthIndex);
            const lifecycle = getEventLifecycle(event, todayIsoDate);
            const pricing = getActivityPricing(event.slug, event);
            const isPaid = pricing.hasPricing && (pricing.regularPrice || 0) > 0;
            const isOfferActive = pricing.isEarlyBirdActive;

            return (
              <div
                key={event.slug}
                className={`rounded-3xl flex flex-col overflow-hidden bg-white border-2 transition-all shadow-xs hover:shadow-md ${
                  event.hidden
                    ? "border-amber-300 opacity-80"
                    : isOfferActive
                    ? "border-emerald-300 ring-2 ring-emerald-400/20"
                    : isPaid
                    ? "border-blue-200"
                    : "border-slate-200"
                }`}
              >
                {/* Top Accent Strip */}
                <div
                  className={`h-1.5 w-full ${
                    isOfferActive
                      ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600"
                      : isPaid
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600"
                      : `bg-gradient-to-r ${theme.gradient}`
                  }`}
                />

                {/* Status Bar */}
                {event.hidden ? (
                  <div className="px-4 py-1.5 bg-amber-50 border-b border-amber-200 text-amber-800 text-[10.5px] font-black uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                      <span>Hidden (Draft)</span>
                    </span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900">
                      Not Public
                    </span>
                  </div>
                ) : isOfferActive ? (
                  <div className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-[10.5px] font-black uppercase tracking-wider flex items-center justify-between shadow-2xs">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                      <span>{event.offerLabel || "Early Bird Discount Active"}</span>
                    </span>
                    <span className="text-[9.5px] font-num font-extrabold bg-white/20 px-2 py-0.5 rounded-full text-white">
                      {event.discountPercent || 20}% OFF
                    </span>
                  </div>
                ) : isPaid ? (
                  <div className="px-4 py-1.5 bg-blue-50 border-b border-blue-200 text-blue-800 text-[10.5px] font-bold uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                      <span>Paid Seat Registration</span>
                    </span>
                    <span className="text-[9.5px] text-blue-700 font-num">
                      No Active Discount
                    </span>
                  </div>
                ) : (
                  <div className="px-4 py-1.5 bg-slate-50 border-b border-slate-100 text-slate-600 text-[10.5px] font-bold uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span>Free Provisional Booking</span>
                    </span>
                    <span className="text-[9.5px] text-slate-500 font-num">
                      0 PKR Fee
                    </span>
                  </div>
                )}

                {/* Card Main Body */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                  {/* Activity Info Header */}
                  <div className="flex items-start gap-3">
                    {/* Compact Date Badge */}
                    <div className="w-[52px] shrink-0 rounded-xl overflow-hidden bg-white border border-slate-200 text-center shadow-2xs">
                      <div
                        className={`bg-gradient-to-r ${theme.gradient} text-white text-[9px] font-black uppercase py-0.5 leading-none`}
                      >
                        {monthStr}
                      </div>
                      <div className="font-num font-extrabold text-[18px] text-[#102E4D] leading-tight py-0.5">
                        {dayStr}
                      </div>
                      <div className="font-num text-[7.5px] font-bold uppercase text-slate-400 pb-1 leading-none">
                        {weekdayStr}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF7900] truncate">
                        {CATEGORY_LABELS[event.category] || event.category}
                      </p>
                      <h3
                        className="font-serif font-bold text-base text-[#102E4D] leading-tight line-clamp-2 mt-0.5"
                        title={event.title}
                      >
                        {event.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {event.city || "Islamabad, Pakistan"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Commercial Pricing Summary Box */}
                  <div
                    className={`p-3.5 rounded-2xl border space-y-2.5 ${
                      isOfferActive
                        ? "bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-emerald-500/10 border-emerald-300/80"
                        : isPaid
                        ? "bg-blue-50/50 border-blue-200"
                        : "bg-slate-50/70 border-slate-200"
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-500">
                        {isPaid ? "Registration Fee" : "Commercial Model"}
                      </span>
                      {event.seatLimit && (
                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>Limit: {event.seatLimit} seats</span>
                        </span>
                      )}
                    </div>

                    {isPaid ? (
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-2.5 flex-wrap">
                          <span className="font-num font-black text-2xl text-[#102E4D]">
                            {pricing.formattedPayablePrice}
                          </span>
                          {isOfferActive && (
                            <span className="font-num text-xs text-slate-400 line-through">
                              {pricing.formattedRegularPrice}
                            </span>
                          )}
                        </div>

                        {isOfferActive ? (
                          <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-800 pt-0.5">
                            <span className="flex items-center gap-1 text-emerald-700">
                              <Zap className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                              Save {pricing.formattedSavings} (
                              {pricing.discountPercent}% OFF)
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Ends {pricing.deadlineText}
                            </span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-500 font-medium">
                            Standard full registration fee
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <span className="font-num font-black text-lg text-teal-800">
                          Free Provisional Seat
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Applicants reserve without immediate online payment
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Apply Form Summary Fields Preview (Duration, Venue, Certificate) */}
                  <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/90 text-xs space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block pb-0.5 border-b border-slate-200/60">
                      Apply Form Summary Line Items
                    </span>
                    <div className="space-y-1.5 text-[11.5px] text-slate-700">
                      <div className="flex items-center gap-2">
                        <Hourglass className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span className="font-semibold truncate">
                          {event.duration || "Scheduled Cohort Session"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">
                          {event.venue
                            ? `${event.venue} (${event.city || "Islamabad"})`
                            : event.city || "Islamabad, Pakistan"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">
                          {event.certificate ||
                            event.format ||
                            "Official Certificate of Completion"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    {/* Quick Early Bird Switch */}
                    {isPaid ? (
                      <button
                        type="button"
                        onClick={() => handleToggleEarlyBird(indexInMaster)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                          event.isOfferActive
                            ? "bg-emerald-100/90 text-emerald-800 hover:bg-emerald-200"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                        title="Toggle Early Bird promotion on/off"
                      >
                        <Zap
                          className={`w-3 h-3 ${
                            event.isOfferActive
                              ? "text-emerald-600 fill-emerald-600"
                              : "text-slate-400"
                          }`}
                        />
                        <span>
                          {event.isOfferActive ? "Offer ON" : "Offer OFF"}
                        </span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400">
                        Provisional Mode
                      </span>
                    )}

                    {/* Configure Button */}
                    <button
                      type="button"
                      onClick={() => setEditingIndex(indexInMaster)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#102E4D] hover:bg-[#163B61] text-white text-[11.5px] font-extrabold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Tag className="w-3.5 h-3.5 text-[#FFC400]" />
                      <span>Configure Rules</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Interactive Pricing & Early Bird Edit Modal */}
      {editingIndex !== null && currentlyEditingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-3xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#001B33] via-[#102E4D] to-[#001B33] text-white flex items-center justify-between gap-4 shrink-0 border-b border-white/10">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FFC400]/20 text-[#FFC400] border border-[#FFC400]/30">
                    Commercial Rules Editor
                  </span>
                  <span className="text-xs text-white/60 font-num">
                    slug: {currentlyEditingEvent.slug}
                  </span>
                </div>
                <h2 className="font-serif font-extrabold text-xl sm:text-2xl text-white truncate">
                  {currentlyEditingEvent.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setEditingIndex(null)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Scrollable Body */}
            <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-slate-800">
              {/* Section 01: Commercial Model & Base Price */}
              <div className="rounded-2xl border-2 border-blue-200/90 bg-white shadow-xs p-5 space-y-4">
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-blue-100">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black">
                      01
                    </span>
                    <h3 className="text-sm font-extrabold text-[#102E4D] uppercase tracking-wider">
                      Commercial Model &amp; Base Price
                    </h3>
                  </div>
                  <span className="text-xs text-blue-700 font-semibold hidden sm:inline">
                    Apply Form Fee Rules
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Model Selector Pills */}
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                      Select Registration Model
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEvents((prev) => {
                            const next = [...prev];
                            next[editingIndex] = {
                              ...next[editingIndex],
                              regularPrice:
                                (next[editingIndex].regularPrice || 0) > 0
                                  ? next[editingIndex].regularPrice
                                  : 5000,
                              currency: next[editingIndex].currency || "PKR",
                            };
                            return next;
                          });
                        }}
                        className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                          (currentlyEditingEvent.regularPrice || 0) > 0
                            ? "bg-blue-50/70 border-blue-600 ring-2 ring-blue-500/20"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-[#102E4D]">
                            Paid Seat Registration
                          </span>
                          {(currentlyEditingEvent.regularPrice || 0) > 0 && (
                            <Check className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Displays registration fee &amp; payment instructions on /apply
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEvents((prev) => {
                            const next = [...prev];
                            next[editingIndex] = {
                              ...next[editingIndex],
                              regularPrice: 0,
                              isOfferActive: false,
                            };
                            return next;
                          });
                        }}
                        className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                          !currentlyEditingEvent.regularPrice ||
                          currentlyEditingEvent.regularPrice <= 0
                            ? "bg-teal-50/70 border-teal-600 ring-2 ring-teal-500/20"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-[#102E4D]">
                            Free Provisional Reservation
                          </span>
                          {(!currentlyEditingEvent.regularPrice ||
                            currentlyEditingEvent.regularPrice <= 0) && (
                            <Check className="w-4 h-4 text-teal-600" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          No fee shown on form (provisional reserve seat mode)
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Regular Price, Currency, and Seat Limit */}
                  {(currentlyEditingEvent.regularPrice || 0) > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div>
                        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                          Regular Fee Amount
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            step="500"
                            className={cmsInputClass}
                            value={currentlyEditingEvent.regularPrice || ""}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setEvents((prev) => {
                                const next = [...prev];
                                next[editingIndex] = {
                                  ...next[editingIndex],
                                  regularPrice: isNaN(val) ? 0 : val,
                                };
                                return next;
                              });
                            }}
                            placeholder="5000"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                          Currency
                        </label>
                        <select
                          className={cmsInputClass}
                          value={currentlyEditingEvent.currency || "PKR"}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEvents((prev) => {
                              const next = [...prev];
                              next[editingIndex] = {
                                ...next[editingIndex],
                                currency: val,
                              };
                              return next;
                            });
                          }}
                        >
                          <option value="PKR">PKR (Pakistani Rupee)</option>
                          <option value="USD">USD (US Dollar)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                          Seat Capacity Limit
                        </label>
                        <input
                          type="number"
                          min="1"
                          className={cmsInputClass}
                          value={currentlyEditingEvent.seatLimit || 30}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setEvents((prev) => {
                              const next = [...prev];
                              next[editingIndex] = {
                                ...next[editingIndex],
                                seatLimit: isNaN(val) ? 30 : val,
                              };
                              return next;
                            });
                          }}
                          placeholder="200"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 02: Early Bird & Promotional Offer */}
              {(currentlyEditingEvent.regularPrice || 0) > 0 && (
                <div className="rounded-2xl border-2 border-emerald-200/90 bg-white shadow-xs p-5 space-y-4">
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-emerald-100">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black">
                        02
                      </span>
                      <h3 className="text-sm font-extrabold text-[#102E4D] uppercase tracking-wider">
                        Early Bird &amp; Promotional Offer
                      </h3>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <span className="text-xs font-extrabold text-emerald-900">
                        {currentlyEditingEvent.isOfferActive
                          ? "Offer Active"
                          : "Offer Disabled"}
                      </span>
                      <input
                        type="checkbox"
                        checked={Boolean(currentlyEditingEvent.isOfferActive)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setEvents((prev) => {
                            const next = [...prev];
                            next[editingIndex] = {
                              ...next[editingIndex],
                              isOfferActive: checked,
                              discountPercent:
                                checked &&
                                (!next[editingIndex].discountPercent ||
                                  next[editingIndex].discountPercent <= 0)
                                  ? 20
                                  : next[editingIndex].discountPercent,
                              offerLabel:
                                checked && !next[editingIndex].offerLabel
                                  ? `Early Bird ${next[editingIndex].discountPercent || 20}% OFF`
                                  : next[editingIndex].offerLabel,
                            };
                            return next;
                          });
                        }}
                        className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
                      />
                    </label>
                  </div>

                  {currentlyEditingEvent.isOfferActive && (
                    <div className="space-y-4 pt-1">
                      {/* Discount Percentage with Preset Pills */}
                      <div>
                        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                          Discount Percentage
                        </label>
                        <div className="flex items-center gap-2 flex-wrap">
                          {[10, 15, 20, 25, 30, 40, 50].map((pct) => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => {
                                setEvents((prev) => {
                                  const next = [...prev];
                                  next[editingIndex] = {
                                    ...next[editingIndex],
                                    discountPercent: pct,
                                    offerLabel: `Early Bird ${pct}% OFF`,
                                  };
                                  return next;
                                });
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                currentlyEditingEvent.discountPercent === pct
                                  ? "bg-emerald-700 text-white shadow-xs"
                                  : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                              }`}
                            >
                              {pct}% OFF
                            </button>
                          ))}
                          <div className="flex items-center gap-1 min-w-[100px]">
                            <input
                              type="number"
                              min="1"
                              max="99"
                              className={cmsInputClass}
                              value={currentlyEditingEvent.discountPercent || ""}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setEvents((prev) => {
                                  const next = [...prev];
                                  next[editingIndex] = {
                                    ...next[editingIndex],
                                    discountPercent: isNaN(val) ? 0 : val,
                                  };
                                  return next;
                                });
                              }}
                              placeholder="20"
                            />
                            <span className="text-xs font-bold text-slate-500">
                              %
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Offer Label Input */}
                      <div>
                        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                          Offer Banner Label
                        </label>
                        <input
                          type="text"
                          className={cmsInputClass}
                          value={currentlyEditingEvent.offerLabel || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEvents((prev) => {
                              const next = [...prev];
                              next[editingIndex] = {
                                ...next[editingIndex],
                                offerLabel: val,
                              };
                              return next;
                            });
                          }}
                          placeholder="e.g. Early Bird 20% OFF or Special Ramadan Offer"
                        />
                      </div>

                      {/* Interactive Calendar Date Pickers Grid: Offer Start Date & Offer End Date (Deadline) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        {/* 01. Offer Start Date Card */}
                        <div className="p-4 rounded-2xl border-2 border-emerald-200/90 bg-emerald-50/40 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-emerald-600" />
                              <span>Offer Start Date &amp; Time</span>
                            </label>
                            {currentlyEditingEvent.offerStartDate ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                                Active from Start
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                                Not Scheduled
                              </span>
                            )}
                          </div>

                          {/* Interactive Calendar Input with Direct Picker Trigger */}
                          <div className="relative flex items-center">
                            <input
                              type="datetime-local"
                              className="w-full pl-3 pr-10 py-2.5 text-xs font-semibold rounded-xl border-2 border-emerald-300 bg-white text-[#102E4D] focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 shadow-xs cursor-pointer"
                              value={toDatetimeLocal(currentlyEditingEvent.offerStartDate)}
                              onChange={(e) => {
                                const val = fromDatetimeLocal(e.target.value, false);
                                setEvents((prev) => {
                                  const next = [...prev];
                                  next[editingIndex] = {
                                    ...next[editingIndex],
                                    offerStartDate: val,
                                  };
                                  return next;
                                });
                              }}
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                const input = e.currentTarget.parentElement?.querySelector("input") as HTMLInputElement | null;
                                input?.showPicker?.();
                              }}
                              className="absolute right-2.5 p-1 text-emerald-600 hover:text-emerald-800 transition-colors cursor-pointer"
                              title="Click to open interactive calendar picker"
                            >
                              <Calendar className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Pretty Formatted Date Preview */}
                          <div className="text-[11px] text-slate-600 flex items-center justify-between pt-0.5">
                            <span className="truncate">
                              {currentlyEditingEvent.offerStartDate ? (
                                <>
                                  📅 <strong>Starts:</strong> {formatPrettyDate(currentlyEditingEvent.offerStartDate)}
                                </>
                              ) : (
                                <span className="text-slate-400 italic">No start date set (offer starts immediately)</span>
                              )}
                            </span>
                            {currentlyEditingEvent.offerStartDate && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEvents((prev) => {
                                    const next = [...prev];
                                    next[editingIndex] = {
                                      ...next[editingIndex],
                                      offerStartDate: "",
                                    };
                                    return next;
                                  });
                                }}
                                className="text-[10.5px] font-bold text-rose-600 hover:underline cursor-pointer shrink-0 ml-2"
                              >
                                Clear
                              </button>
                            )}
                          </div>

                          {/* Quick Presets */}
                          <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-emerald-200/60">
                            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Presets:</span>
                            <button
                              type="button"
                              onClick={() => {
                                const nowStr = new Date().toISOString().slice(0, 16);
                                const val = fromDatetimeLocal(nowStr, false);
                                setEvents((prev) => {
                                  const next = [...prev];
                                  next[editingIndex] = { ...next[editingIndex], offerStartDate: val };
                                  return next;
                                });
                              }}
                              className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                            >
                              Today
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const val = getStartOfCurrentMonth();
                                setEvents((prev) => {
                                  const next = [...prev];
                                  next[editingIndex] = { ...next[editingIndex], offerStartDate: val };
                                  return next;
                                });
                              }}
                              className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                            >
                              1st of Month
                            </button>
                          </div>
                        </div>

                        {/* 02. Offer End Date (Deadline) Card */}
                        <div className="p-4 rounded-2xl border-2 border-emerald-200/90 bg-emerald-50/40 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-emerald-600" />
                              <span>Offer End Date (Deadline)</span>
                            </label>
                            {currentlyEditingEvent.offerEndDate ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                                Countdown Enforced
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                                Ongoing Offer
                              </span>
                            )}
                          </div>

                          {/* Interactive Calendar Input with Direct Picker Trigger */}
                          <div className="relative flex items-center">
                            <input
                              type="datetime-local"
                              className="w-full pl-3 pr-10 py-2.5 text-xs font-semibold rounded-xl border-2 border-emerald-300 bg-white text-[#102E4D] focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 shadow-xs cursor-pointer"
                              value={toDatetimeLocal(currentlyEditingEvent.offerEndDate)}
                              onChange={(e) => {
                                const val = fromDatetimeLocal(e.target.value, true);
                                setEvents((prev) => {
                                  const next = [...prev];
                                  next[editingIndex] = {
                                    ...next[editingIndex],
                                    offerEndDate: val,
                                  };
                                  return next;
                                });
                              }}
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                const input = e.currentTarget.parentElement?.querySelector("input") as HTMLInputElement | null;
                                input?.showPicker?.();
                              }}
                              className="absolute right-2.5 p-1 text-emerald-600 hover:text-emerald-800 transition-colors cursor-pointer"
                              title="Click to open interactive calendar picker"
                            >
                              <Calendar className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Pretty Formatted Date Preview */}
                          <div className="text-[11px] text-slate-600 flex items-center justify-between pt-0.5">
                            <span className="truncate">
                              {currentlyEditingEvent.offerEndDate ? (
                                <>
                                  ⏰ <strong>Expires:</strong> {formatPrettyDate(currentlyEditingEvent.offerEndDate)}
                                </>
                              ) : (
                                <span className="text-slate-400 italic">No deadline set (offer never expires)</span>
                              )}
                            </span>
                            {currentlyEditingEvent.offerEndDate && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEvents((prev) => {
                                    const next = [...prev];
                                    next[editingIndex] = {
                                      ...next[editingIndex],
                                      offerEndDate: "",
                                    };
                                    return next;
                                  });
                                }}
                                className="text-[10.5px] font-bold text-rose-600 hover:underline cursor-pointer shrink-0 ml-2"
                              >
                                Clear
                              </button>
                            )}
                          </div>

                          {/* Quick Presets */}
                          <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-emerald-200/60">
                            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Presets:</span>
                            <button
                              type="button"
                              onClick={() => {
                                const val = getPresetDate(7, true);
                                setEvents((prev) => {
                                  const next = [...prev];
                                  next[editingIndex] = { ...next[editingIndex], offerEndDate: val };
                                  return next;
                                });
                              }}
                              className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                            >
                              +7 Days
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const val = getPresetDate(14, true);
                                setEvents((prev) => {
                                  const next = [...prev];
                                  next[editingIndex] = { ...next[editingIndex], offerEndDate: val };
                                  return next;
                                });
                              }}
                              className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                            >
                              +14 Days
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const val = getPresetDate(30, true);
                                setEvents((prev) => {
                                  const next = [...prev];
                                  next[editingIndex] = { ...next[editingIndex], offerEndDate: val };
                                  return next;
                                });
                              }}
                              className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                            >
                              +30 Days
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const val = getEndOfCurrentMonth();
                                setEvents((prev) => {
                                  const next = [...prev];
                                  next[editingIndex] = { ...next[editingIndex], offerEndDate: val };
                                  return next;
                                });
                              }}
                              className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                            >
                              End of Month
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Live Calculation Preview Callout */}
                      {(() => {
                        const pricing = getActivityPricing(
                          currentlyEditingEvent.slug,
                          currentlyEditingEvent
                        );
                        return (
                          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border border-emerald-300 text-xs text-emerald-950 space-y-2">
                            <span className="text-[10.5px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                              Live Pricing Calculation on Public Form
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-num">
                              <div>
                                <span className="text-[10px] text-slate-500 block">
                                  Standard Price
                                </span>
                                <span className="font-bold text-sm text-[#102E4D]">
                                  {pricing.formattedRegularPrice}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 block">
                                  Discount
                                </span>
                                <span className="font-bold text-sm text-emerald-700">
                                  {pricing.discountPercent}% OFF
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 block">
                                  Participant Pays
                                </span>
                                <span className="font-black text-sm text-[#102E4D]">
                                  {pricing.formattedPayablePrice}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 block">
                                  Total Savings
                                </span>
                                <span className="font-black text-sm text-emerald-700">
                                  {pricing.formattedSavings}
                                </span>
                              </div>
                            </div>
                            <p className="text-[11px] text-emerald-800 pt-1 border-t border-emerald-200/60">
                              Deadline shown to participants:{" "}
                              <strong>{pricing.deadlineText}</strong>
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* Section 03: Apply Form Summary Line Items */}
              <div className="rounded-2xl border-2 border-purple-200/90 bg-white shadow-xs p-5 space-y-4">
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-purple-100">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-black">
                      03
                    </span>
                    <h3 className="text-sm font-extrabold text-[#102E4D] uppercase tracking-wider">
                      Apply Form Summary Line Items
                    </h3>
                  </div>
                  <span className="text-xs text-purple-700 font-semibold hidden sm:inline">
                    Shown in Landscape Box on /apply
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                      <Hourglass className="w-3.5 h-3.5 text-sky-600" />
                      Duration Line
                    </label>
                    <input
                      type="text"
                      className={cmsInputClass}
                      value={currentlyEditingEvent.duration || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEvents((prev) => {
                          const next = [...prev];
                          next[editingIndex] = {
                            ...next[editingIndex],
                            duration: val,
                          };
                          return next;
                        });
                      }}
                      placeholder="1-Day Regional Summit"
                    />
                    <span className="text-[10.5px] text-slate-400 mt-1 block">
                      e.g. &ldquo;1-Day Regional Summit&rdquo; or &ldquo;2 Full Days Immersive&rdquo;
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      Venue &amp; Location Line
                    </label>
                    <input
                      type="text"
                      className={cmsInputClass}
                      value={currentlyEditingEvent.venue || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEvents((prev) => {
                          const next = [...prev];
                          next[editingIndex] = {
                            ...next[editingIndex],
                            venue: val,
                          };
                          return next;
                        });
                      }}
                      placeholder="Islamabad (Venue shared upon confirmation)"
                    />
                    <span className="text-[10.5px] text-slate-400 mt-1 block">
                      e.g. &ldquo;Islamabad (Venue shared upon confirmation)&rdquo;
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      Participant Kit &amp; Certificate Line
                    </label>
                    <input
                      type="text"
                      className={cmsInputClass}
                      value={currentlyEditingEvent.certificate || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEvents((prev) => {
                          const next = [...prev];
                          next[editingIndex] = {
                            ...next[editingIndex],
                            certificate: val,
                          };
                          return next;
                        });
                      }}
                      placeholder="Summit Participant Kit & Certificate"
                    />
                    <span className="text-[10.5px] text-slate-400 mt-1 block">
                      e.g. &ldquo;FranklinCovey Participation Certificate&rdquo;
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      Schedule Timing Note
                    </label>
                    <input
                      type="text"
                      className={cmsInputClass}
                      value={currentlyEditingEvent.schedule || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEvents((prev) => {
                          const next = [...prev];
                          next[editingIndex] = {
                            ...next[editingIndex],
                            schedule: val,
                          };
                          return next;
                        });
                      }}
                      placeholder="9:00 AM – 5:00 PM PKT"
                    />
                    <span className="text-[10.5px] text-slate-400 mt-1 block">
                      e.g. &ldquo;9:00 AM – 5:00 PM PKT&rdquo;
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 04: Real-time Apply Form Preview */}
              <div className="rounded-2xl border border-slate-200 bg-[#001B33] text-white p-5 space-y-3.5 shadow-md">
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/10">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#FFC400] flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-[#FFC400]" />
                    Live Apply Form Preview
                  </span>
                  <span className="text-[10px] text-white/50 uppercase tracking-widest font-semibold">
                    Step 1 Preview Box
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#FFC400]">
                      {CATEGORY_LABELS[currentlyEditingEvent.category] ||
                        currentlyEditingEvent.category}
                    </p>
                    <h4 className="font-serif font-bold text-lg text-white leading-snug mt-0.5">
                      {currentlyEditingEvent.title}
                    </h4>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
                      <Hourglass className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                      <span className="font-semibold text-white truncate">
                        {currentlyEditingEvent.duration ||
                          "Scheduled Cohort Session"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
                      <MapPin className="w-3.5 h-3.5 text-[#FF7900] shrink-0" />
                      <span className="font-semibold text-white truncate">
                        {currentlyEditingEvent.venue
                          ? `${currentlyEditingEvent.venue} (${
                              currentlyEditingEvent.city || "Islamabad"
                            })`
                          : currentlyEditingEvent.city || "Islamabad, Pakistan"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
                      <Award className="w-3.5 h-3.5 text-[#34D399] shrink-0" />
                      <span className="font-semibold text-white truncate">
                        {currentlyEditingEvent.certificate ||
                          "Official Certificate of Completion"}
                      </span>
                    </div>
                  </div>

                  {/* Pricing Box in Preview */}
                  {(() => {
                    const pricing = getActivityPricing(
                      currentlyEditingEvent.slug,
                      currentlyEditingEvent
                    );
                    if (!pricing.hasPricing) return null;
                    return (
                      <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#FFC400]/20 via-[#FF7900]/12 to-[#16A34A]/10 border border-[#FFC400]/50 space-y-1.5 font-num">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#FFC400] block">
                          Registration Fee &amp; Offer
                        </span>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="font-black text-xl text-white">
                            {pricing.formattedPayablePrice}
                          </span>
                          {pricing.isEarlyBirdActive && (
                            <span className="text-xs text-white/50 line-through">
                              {pricing.formattedRegularPrice}
                            </span>
                          )}
                          {pricing.isEarlyBirdActive && (
                            <span className="text-[10px] font-black text-[#34D399] bg-[#34D399]/20 px-2 py-0.5 rounded-full">
                              {pricing.discountPercent}% OFF
                            </span>
                          )}
                        </div>
                        {pricing.isEarlyBirdActive && (
                          <p className="text-[11px] text-[#34D399] font-medium">
                            Early Bird Valid until {pricing.deadlineText}
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Sticky Modal Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const defaultEvt = EVENTS.find(
                    (e) => e.slug === currentlyEditingEvent.slug
                  );
                  if (defaultEvt) {
                    setEvents((prev) => {
                      const next = [...prev];
                      next[editingIndex] = {
                        ...next[editingIndex],
                        regularPrice: defaultEvt.regularPrice ?? 0,
                        discountPercent: defaultEvt.discountPercent ?? 0,
                        offerStartDate: defaultEvt.offerStartDate || "",
                        offerEndDate: defaultEvt.offerEndDate || "",
                        isOfferActive: defaultEvt.isOfferActive ?? false,
                        offerLabel: defaultEvt.offerLabel || "",
                        seatLimit: defaultEvt.seatLimit || 30,
                        duration: defaultEvt.duration || "",
                        venue: defaultEvt.venue || "",
                        certificate: defaultEvt.certificate || "",
                        schedule: defaultEvt.schedule || "",
                      };
                      return next;
                    });
                  }
                }}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-600 transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Code Default</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingIndex(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingIndex(null);
                    setFeedback({
                      type: "success",
                      text: `Commercial rules updated for "${currentlyEditingEvent.title}". Remember to click "Publish Changes" to save to the database.`,
                    });
                  }}
                  className="px-5 py-2 rounded-xl bg-[#102E4D] hover:bg-[#163B61] text-white text-xs font-black transition-all shadow-md cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-[#FFC400]" />
                  <span>Done &amp; Apply Rules</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


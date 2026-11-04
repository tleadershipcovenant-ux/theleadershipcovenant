"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const EventDetailModal = dynamic(
  () => import("@/components/EventDetailModal"),
  { ssr: false }
);
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  MdAccessTime,
  MdArrowForward,
  MdCalendarToday,
  MdCheckCircle,
  MdGroups,
  MdInfoOutline,
  MdLocationOn,
  MdRecordVoiceOver,
  MdWorkspacePremium,
} from "react-icons/md";
import {
  CATEGORY_LABELS,
  EVENT_LIFECYCLE_LABELS,
  EVENTS,
  getEventLifecycle,
  getMonthTheme,
  type EventCategory,
  type EventLifecycle,
  type LeadershipEvent,
  type StatusTone,
} from "@/content/events";

const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS) as Array<
  [EventCategory, string]
>;

const LIFECYCLE_OPTIONS: Array<{
  id: EventLifecycle;
  label: string;
  hint: string;
  active: string;
}> = [
  {
    id: "enrollment_open",
    label: "Enrollment Open",
    hint: "Green live card. Apply form is available.",
    active: "border-[#16A34A] bg-[#F0FDF4] text-[#166534]",
  },
  {
    id: "upcoming",
    label: "Upcoming Event",
    hint: "Blue status. Visible, enrollment not live yet.",
    active: "border-[#2563EB] bg-[#EFF6FF] text-[#1E40AF]",
  },
  {
    id: "previous",
    label: "Previous Event",
    hint: "Orange status. Details stay visible, apply is hidden.",
    active: "border-[#F97316] bg-[#FFF7ED] text-[#C2410C]",
  },
];

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 72) || `activity-${Date.now()}`
  );
}

function uniqueSlug(base: string, events: LeadershipEvent[], ignoreIndex: number) {
  let slug = slugify(base);
  const used = new Set(
    events
      .map((event, index) => (index === ignoreIndex ? "" : event.slug))
      .filter(Boolean)
  );
  if (!used.has(slug)) return slug;
  let n = 2;
  while (used.has(`${slug}-${n}`)) n += 1;
  return `${slug}-${n}`;
}

function createBlankEvent(events: LeadershipEvent[]): LeadershipEvent {
  const today = new Date().toISOString().slice(0, 10);
  return {
    slug: uniqueSlug("new-activity", events, -1),
    title: "New Activity",
    category: "professional_development",
    description:
      "Write a short card summary visitors will see on the Activities page.",
    modalDescription: "",
    city: "Islamabad",
    locationNote: "",
    startDate: today,
    endDate: today,
    statusLabel: "Enrollment not open",
    statusTone: "limited",
    image: "/images/pd-educators.jpg",
    duration: "1 Full Day",
    schedule: "9:00 AM – 5:00 PM PKT",
    venue: "Islamabad (Venue shared upon confirmation)",
    format: "In-Person Interactive Session",
    certificate: "Official Course Certificate",
    facilitator: "The Leadership Covenant Faculty",
    overview: "",
    highlights: ["Add a highlight visitors will see in the details modal."],
    whoShouldAttend: ["School Leaders"],
    tag1: "Professional Development",
    tag2: "Educators & Leaders",
    tag3: "Interactive Session",
    currency: "PKR",
    regularPrice: 0,
    discountPercent: 0,
    isOfferActive: false,
    offerLabel: "",
    offerStartDate: "",
    offerEndDate: "",
    seatLimit: 0,
    hidden: false,
    lifecycleOverride: "upcoming",
  };
}

function Field({
  label,
  hint,
  children,
  badge,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  badge?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D]">
          {label}
        </span>
        {badge ? (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
            {badge}
          </span>
        ) : null}
      </div>
      {hint ? <span className="block text-[11px] text-slate-500 leading-tight">{hint}</span> : null}
      {children}
    </label>
  );
}

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-[#102E4D] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/25 focus:border-[#FF7900] transition-all";

const SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

const SHORT_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function ActivityPreviewCard({
  event,
  onEdit,
  onToggleHidden,
  onDelete,
  onPreviewModal,
  isTogglingHidden = false,
}: {
  event: LeadershipEvent;
  onEdit: () => void;
  onToggleHidden: () => void;
  onDelete: () => void;
  onPreviewModal: () => void;
  isTogglingHidden?: boolean;
}) {
  const [yStr, mStr, dStr] = (event.startDate || "2026-01-01").split("-");
  const yearStr = Number(yStr) || 2026;
  const monthIndex = Number.isFinite(Number(mStr)) ? Number(mStr) - 1 : 0;
  const dayNum = Number(dStr) || 1;
  const dayStr = String(dayNum).padStart(2, "0");
  const monthStr = SHORT_MONTHS[monthIndex] ?? "Jul";
  const weekdayIdx = new Date(Date.UTC(yearStr, monthIndex, dayNum)).getUTCDay();
  const weekdayStr = SHORT_WEEKDAYS[weekdayIdx] ?? "Sat";
  const theme = getMonthTheme(monthIndex);
  const lifecycle = getEventLifecycle(event);
  const isPreviousEvent = lifecycle === "previous";
  const isOpenEnrollment = lifecycle === "enrollment_open";
  const isSummit = event.slug === "school-impact-summit-2026";
  const statusDot =
    lifecycle === "previous"
      ? "bg-[#F97316]"
      : lifecycle === "enrollment_open"
      ? "bg-[#16A34A]"
      : "bg-[#2563EB]";

  return (
    <article
      className={`rounded-2xl flex flex-col overflow-hidden relative transition-all ${
        event.hidden
          ? "opacity-75 border-2 border-amber-300 bg-amber-50/20 shadow-sm"
          : isOpenEnrollment
          ? "bg-gradient-to-b from-[#F0FDF4] via-white to-[#F0FDF4] border-[3px] border-[#16A34A] ring-4 ring-[#16A34A]/25 shadow-[0_22px_45px_-8px_rgba(22,163,74,0.25)]"
          : `bg-white border border-[#D7F5EF] shadow-md ${theme.ring}`
      }`}
    >
      <div
        className={`w-full ${
          isOpenEnrollment
            ? "h-2 bg-gradient-to-r from-[#16A34A] via-[#22C55E] to-[#15803D]"
            : `h-1.5 bg-gradient-to-r ${theme.gradient}`
        }`}
      />

      {event.hidden ? (
        <div className="px-4 py-2 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-600 text-white text-[11px] font-black uppercase tracking-wider flex items-center justify-between shadow-xs">
          <span className="flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-amber-200" />
            <span>Hidden from Public Website</span>
          </span>
          <span className="text-[10px] bg-black/30 px-2.5 py-0.5 rounded-full font-extrabold tracking-wide">
            Draft Mode
          </span>
        </div>
      ) : isOpenEnrollment ? (
        <div className="px-4 py-2 bg-gradient-to-r from-[#16A34A] via-[#15803D] to-[#16A34A] text-white flex items-center justify-between gap-2 shadow-xs">
          <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
            </span>
            <span>ENROLLMENTS OPEN</span>
          </span>
          <span className="font-num text-[10.5px] font-black px-2.5 py-0.5 rounded-full bg-white text-[#15803D] uppercase tracking-wider shadow-xs">
            Live on Website
          </span>
        </div>
      ) : (
        <div className="px-4 py-1.5 bg-[#F0FDF4] border-b border-emerald-200 text-emerald-800 text-[10.5px] font-extrabold uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-emerald-700">
            <Eye className="w-3.5 h-3.5 text-emerald-600" />
            <span>Live on Public Website</span>
          </span>
          <span className="text-[9.5px] font-bold text-emerald-700 font-num">
            {EVENT_LIFECYCLE_LABELS[lifecycle]}
          </span>
        </div>
      )}

      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <div className="flex items-start gap-3 sm:gap-4">
          <div
            className={`w-[64px] shrink-0 rounded-xl overflow-hidden border shadow-xs text-center bg-white ${theme.borderAccent}`}
          >
            <div
              className={`bg-gradient-to-r ${theme.gradient} text-white text-[10px] font-extrabold uppercase tracking-widest py-0.5`}
            >
              {monthStr}
            </div>
            <div className="font-num font-extrabold text-[20px] leading-tight text-[#102E4D] pt-1">
              {dayStr}
            </div>
            <div className="font-num text-[8.5px] font-semibold uppercase text-slate-500 pb-1.5 pt-0.5">
              {weekdayStr} · {yearStr}
            </div>
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className={`text-[10.5px] font-bold uppercase tracking-wider ${theme.text} mb-1`}>
              {CATEGORY_LABELS[event.category] || event.category}
            </p>
            <h3 className="font-serif font-bold text-[17px] text-[#102E4D] leading-[1.28]">
              {event.title || "Untitled activity"}
            </h3>
          </div>
        </div>

        <p className="mt-3 text-[12.5px] text-slate-600 leading-relaxed line-clamp-3">
          {event.description || "No card description yet."}
        </p>

        <div className="mt-auto pt-4">
          <div className="pt-3.5 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <MdAccessTime className={`${theme.text} text-sm shrink-0`} />
              <span className="font-num font-medium">
                {event.schedule || event.duration || "Schedule not set"}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-[#102E4D] inline-flex items-center gap-1.5">
                <MdLocationOn className={`${theme.text} text-[15px] shrink-0`} />
                <span className="font-num">{event.locationNote || event.city}</span>
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide ${
                  isOpenEnrollment
                    ? "text-[#166534] bg-[#DCFCE7] border border-[#4ADE80]"
                    : isPreviousEvent
                    ? "text-[#C2410C] bg-[#FFEDD5] border border-[#FB923C]"
                    : "text-[#075985] bg-[#E0F2FE] border border-[#7DD3FC]"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
                {EVENT_LIFECYCLE_LABELS[lifecycle]}
              </span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={onPreviewModal}
                className="flex-1 py-2.5 rounded-xl border border-[#D7F5EF] bg-[#EFFBF8]/80 hover:bg-[#D7F5EF] text-[#102E4D] text-[11px] font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Preview visitor detailed information popup"
              >
                <MdInfoOutline className="text-sm text-[#FF7900]" />
                More details
              </button>
              {isPreviousEvent ? null : (
                <span
                  className={`flex-1 py-2.5 rounded-xl text-white text-[11px] font-bold uppercase tracking-wider inline-flex items-center justify-center gap-1 ${
                    isOpenEnrollment
                      ? "bg-gradient-to-r from-[#16A34A] via-[#15803D] to-[#166534]"
                      : `bg-gradient-to-r ${theme.gradient}`
                  }`}
                >
                  {isOpenEnrollment ? "Enroll now" : "Apply now"}
                  <MdArrowForward className="text-sm" />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Styled Card Actions: Edit, Live/Hide Toggle, and Delete */}
      <div className="px-3.5 py-3 bg-[#F8FBFA] border-t border-[#D7F5EF] flex items-center gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="flex-1 h-9 rounded-xl bg-[#102E4D] hover:bg-[#001B33] text-white text-[11px] font-extrabold uppercase tracking-wider inline-flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-98"
          title="Edit full activity copy, dates, modal, and pricing"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#FFC400]" />
          <span>Edit Activity</span>
        </button>

        <button
          type="button"
          onClick={onToggleHidden}
          disabled={isTogglingHidden}
          className={`h-9 px-3.5 rounded-xl border text-[11px] font-bold inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-60 ${
            event.hidden
              ? "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 shadow-xs"
              : "border-amber-300 bg-amber-50/70 text-amber-900 hover:bg-amber-100 shadow-xs"
          }`}
          title={
            event.hidden
              ? "Click to publish this activity LIVE on the public page"
              : "Click to hide this activity from the public page"
          }
        >
          {isTogglingHidden ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : event.hidden ? (
            <Eye className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 text-amber-700" />
          )}
          <span>{isTogglingHidden ? "Saving…" : event.hidden ? "Make Live" : "Hide"}</span>
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="h-9 px-3 rounded-xl border border-rose-200 bg-rose-50/80 hover:bg-rose-100 text-rose-700 text-[11px] font-bold inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          title={`Delete “${event.title}”`}
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
          <span>Delete</span>
        </button>
      </div>
    </article>
  );
}

function StringListEditor({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      {values.map((value, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            className={inputClass}
            value={value}
            placeholder={placeholder}
            onChange={(e) => {
              const next = [...values];
              next[index] = e.target.value;
              onChange(next);
            }}
          />
          <button
            type="button"
            onClick={() => onChange(values.filter((_, i) => i !== index))}
            className="w-9 h-9 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50"
            title="Remove"
          >
            <X className="w-4 h-4 mx-auto" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...values, ""])}
        className="w-full h-9 rounded-xl border-2 border-dashed border-[#C8EFE6] text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] hover:border-[#FF7900]"
      >
        + Add item
      </button>
    </div>
  );
}

function ActivityEditorForm({
  event,
  onChange,
  onUpload,
  onPreviewModal,
}: {
  event: LeadershipEvent;
  onChange: (next: LeadershipEvent) => void;
  onUpload: () => Promise<string | null>;
  onPreviewModal: (event: LeadershipEvent) => void;
}) {
  const lifecycle = event.lifecycleOverride || getEventLifecycle(event);
  const start = new Date(`${event.startDate || "2026-01-01"}T00:00:00`);
  const theme = getMonthTheme(start.getMonth());

  const setLifecycle = (next: EventLifecycle) => {
    const statusTone: StatusTone =
      next === "enrollment_open"
        ? "open"
        : event.statusTone === "free"
        ? "free"
        : "limited";
    const statusLabel =
      next === "enrollment_open"
        ? "Open enrollment"
        : next === "previous"
        ? "Previous event"
        : event.statusTone === "free"
        ? event.statusLabel || "Free • RSVP required"
        : "Enrollment not open";
    onChange({
      ...event,
      lifecycleOverride: next,
      statusTone,
      statusLabel,
    });
  };

  const isMissingRequired = !event.title?.trim() || !event.startDate;

  return (
    <div className="space-y-6">
      {/* Awareness / Warning Alert */}
      {isMissingRequired ? (
        <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-900 flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h5 className="font-bold text-xs uppercase tracking-wide text-amber-800">
              Required Information Missing
            </h5>
            <p className="text-xs text-amber-800 leading-relaxed">
              {!event.title?.trim() ? "• Activity Title is empty. " : ""}
              {!event.startDate ? "• Start Date is missing. " : ""}
              Please provide these fields so this activity renders properly on public calendars and search.
            </p>
          </div>
        </div>
      ) : null}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 01: CARD DETAILS & PUBLIC PRESENTATION (VIOLET)
      ───────────────────────────────────────────────────────────── */}
      <section
        id="cms-card"
        className="rounded-2xl border-2 border-violet-200/90 bg-white shadow-xs overflow-hidden transition-all"
      >
        <div className="px-5 py-3.5 bg-gradient-to-r from-violet-50 via-purple-50/50 to-white border-b border-violet-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              01
            </span>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-violet-700">
                Public Card Presentation
              </p>
              <h4 className="font-serif font-bold text-[#102E4D] text-sm sm:text-base">
                Activities Page Catalog Card
              </h4>
            </div>
          </div>
          <span className="hidden sm:inline-flex text-[11px] font-semibold text-violet-600 bg-violet-100/70 px-2.5 py-1 rounded-full border border-violet-200">
            Visible on /activities
          </span>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="Activity Title" hint="Primary public title displayed on the card and headers">
                <input
                  className={inputClass}
                  value={event.title}
                  placeholder="e.g. 7 Habits for Teens Leadership Camp"
                  onChange={(e) => onChange({ ...event, title: e.target.value })}
                />
              </Field>
            </div>

            <Field label="URL Slug" hint="Used in web links: /apply?activity=your-slug">
              <input
                className={inputClass}
                value={event.slug}
                onChange={(e) => onChange({ ...event, slug: slugify(e.target.value) })}
              />
            </Field>

            <Field label="Category" hint="Controls color themes, filtering, and curriculum tags">
              <select
                className={inputClass}
                value={event.category}
                onChange={(e) =>
                  onChange({ ...event, category: e.target.value as EventCategory })
                }
              >
                {CATEGORY_OPTIONS.map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>

            <div className="sm:col-span-2">
              <Field
                label="Card Description"
                hint="Concise 1-3 sentence summary displayed on the public card"
              >
                <textarea
                  rows={3}
                  className={inputClass}
                  value={event.description}
                  placeholder="Enter a compelling teaser describing the program..."
                  onChange={(e) => onChange({ ...event, description: e.target.value })}
                />
              </Field>
            </div>

            <Field label="City / Region" hint="e.g. Islamabad, Peshawar, Swat, Online">
              <input
                className={inputClass}
                value={event.city}
                placeholder="Islamabad"
                onChange={(e) => onChange({ ...event, city: e.target.value })}
              />
            </Field>

            <Field label="Location Note" hint="Optional secondary line on the card (e.g. Serena Hotel)">
              <input
                className={inputClass}
                value={event.locationNote || ""}
                placeholder="F-10/3 Regional Campus"
                onChange={(e) => onChange({ ...event, locationNote: e.target.value })}
              />
            </Field>

            <Field label="Start Date">
              <input
                type="date"
                className={inputClass}
                value={event.startDate}
                onChange={(e) => onChange({ ...event, startDate: e.target.value })}
              />
            </Field>

            <Field label="End Date">
              <input
                type="date"
                className={inputClass}
                value={event.endDate}
                onChange={(e) => onChange({ ...event, endDate: e.target.value })}
              />
            </Field>

            <Field label="Schedule / Timing" hint="e.g. 9:00 AM – 4:00 PM PKT">
              <input
                className={inputClass}
                value={event.schedule}
                placeholder="9:00 AM – 4:00 PM PKT"
                onChange={(e) => onChange({ ...event, schedule: e.target.value })}
              />
            </Field>

            <Field label="Duration" hint="e.g. 1 Day Intensive, 3 Days / 2 Nights">
              <input
                className={inputClass}
                value={event.duration}
                placeholder="1 Day Intensive"
                onChange={(e) => onChange({ ...event, duration: e.target.value })}
              />
            </Field>
          </div>

          {/* Tags row with live preview */}
          <div className="pt-2 border-t border-slate-100">
            <span className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
              Card Badges & Tags (Up to 3)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                className={inputClass}
                placeholder="Tag 1 (e.g. Certified)"
                value={event.tag1 || ""}
                onChange={(e) => onChange({ ...event, tag1: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Tag 2 (e.g. Hands-on)"
                value={event.tag2 || ""}
                onChange={(e) => onChange({ ...event, tag2: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Tag 3 (e.g. Cohort 2026)"
                value={event.tag3 || ""}
                onChange={(e) => onChange({ ...event, tag3: e.target.value })}
              />
            </div>
            {(event.tag1 || event.tag2 || event.tag3) ? (
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Preview:</span>
                {[event.tag1, event.tag2, event.tag3].filter(Boolean).map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 border border-violet-200 text-[10.5px] font-bold"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {/* Dual Image Uploader */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <Field
              label="Card / Modal Cover Image"
              hint="Paste an image URL directly or upload an image file to Cloudinary"
            >
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  className={inputClass}
                  placeholder="https://... or /Activities/A1.png"
                  value={event.image}
                  onChange={(e) => onChange({ ...event, image: e.target.value })}
                />
                <button
                  type="button"
                  onClick={async () => {
                    const url = await onUpload();
                    if (url) onChange({ ...event, image: url });
                  }}
                  className="h-10 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold inline-flex items-center justify-center gap-2 shrink-0 shadow-xs hover:opacity-95 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  Upload Image
                </button>
              </div>
            </Field>

            {event.image ? (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-20 h-14 object-cover rounded-xl border border-slate-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#102E4D] truncate">{event.image}</p>
                  <p className="text-[10px] text-emerald-600 font-bold">Image loaded successfully</p>
                </div>
                <button
                  type="button"
                  onClick={() => onChange({ ...event, image: "" })}
                  className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200"
                >
                  Clear
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 02: MODAL DETAILS & OVERVIEW (SKY BLUE)
      ───────────────────────────────────────────────────────────── */}
      <section
        id="cms-modal"
        className="rounded-2xl border-2 border-sky-200/90 bg-white shadow-xs overflow-hidden transition-all"
      >
        <div className="px-5 py-3.5 bg-gradient-to-r from-sky-50 via-blue-50/50 to-white border-b border-sky-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              02
            </span>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-sky-700">
                Detailed Information Modal
              </p>
              <h4 className="font-serif font-bold text-[#102E4D] text-sm sm:text-base">
                Interactive "More Details" Popup
              </h4>
            </div>
          </div>
          <span className="hidden sm:inline-flex text-[11px] font-semibold text-sky-700 bg-sky-100/70 px-2.5 py-1 rounded-full border border-sky-200">
            Curriculum & Venue
          </span>
        </div>

        <div className="p-5 space-y-4">
          {/* Header Preview Banner */}
          <div className="rounded-2xl overflow-hidden border border-sky-100 bg-[#001B33] text-white relative">
            <div className={`h-1.5 bg-gradient-to-r ${theme.gradient}`} />
            <div className="relative p-5 sm:p-6 min-h-[110px] flex flex-col justify-end">
              {event.image ? (
                <img
                  src={event.image}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-35"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-[#001B33] via-[#001B33]/80 to-transparent" />
              <div className="relative space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FFC400]">
                  {CATEGORY_LABELS[event.category]}
                </span>
                <h5 className="font-serif font-extrabold text-base sm:text-lg leading-snug">
                  {event.title || "Activity Title"}
                </h5>
                <p className="text-[11px] text-slate-300">
                  {event.duration} • {event.schedule} • {event.city}
                </p>
              </div>
            </div>
          </div>

          <Field
            label="Modal Short Summary"
            hint="Optional richer summary displayed in the modal hero card instead of the card teaser"
          >
            <textarea
              rows={2}
              className={inputClass}
              value={event.modalDescription || ""}
              placeholder="Short summary displayed prominently in the details modal..."
              onChange={(e) => onChange({ ...event, modalDescription: e.target.value })}
            />
          </Field>

          <Field
            label="Full Program Overview"
            hint="Comprehensive overview describing the curriculum, philosophy, and learning objectives"
          >
            <textarea
              rows={5}
              className={inputClass}
              value={event.overview}
              placeholder="Detailed syllabus, methodologies, and outcomes..."
              onChange={(e) => onChange({ ...event, overview: e.target.value })}
            />
          </Field>

          {/* 2x2 Structured Specification Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Field label="Venue Location" hint="e.g. Serena Hotel Islamabad / TLC Executive Hall">
              <input
                className={inputClass}
                value={event.venue}
                placeholder="Serena Hotel / Campus"
                onChange={(e) => onChange({ ...event, venue: e.target.value })}
              />
            </Field>

            <Field label="Learning Format" hint="e.g. In-Person Experiential Workshop">
              <input
                className={inputClass}
                value={event.format}
                placeholder="In-Person Experiential Cohort"
                onChange={(e) => onChange({ ...event, format: e.target.value })}
              />
            </Field>

            <Field label="Certificate / Credential" hint="e.g. FranklinCovey Certificate of Completion">
              <input
                className={inputClass}
                value={event.certificate}
                placeholder="Official FranklinCovey Certificate"
                onChange={(e) => onChange({ ...event, certificate: e.target.value })}
              />
            </Field>

            <Field label="Master Facilitator" hint="e.g. Certified FranklinCovey Master Trainer">
              <input
                className={inputClass}
                value={event.facilitator}
                placeholder="Lead Master Trainer"
                onChange={(e) => onChange({ ...event, facilitator: e.target.value })}
              />
            </Field>
          </div>

          {/* 4 Equal-Height Colored Spec Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="min-h-[84px] h-full p-4 rounded-2xl bg-sky-50/80 border border-sky-200/90 flex items-center gap-3.5 shadow-xs">
              <div className="p-2.5 rounded-xl bg-sky-100 text-sky-700 shrink-0 shadow-xs">
                <MdCalendarToday className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-extrabold uppercase tracking-wide text-sky-800">
                  Schedule & Duration
                </div>
                <div className="text-xs sm:text-[13px] font-bold text-[#102E4D] truncate">
                  {event.startDate || "Date TBD"} {event.endDate && event.endDate !== event.startDate ? `– ${event.endDate}` : ""}
                </div>
                <div className="text-[11px] text-slate-600 truncate">{event.duration || "Duration TBD"} • {event.schedule || "Full Day"}</div>
              </div>
            </div>

            <div className="min-h-[84px] h-full p-4 rounded-2xl bg-teal-50/80 border border-teal-200/90 flex items-center gap-3.5 shadow-xs">
              <div className="p-2.5 rounded-xl bg-teal-100 text-teal-700 shrink-0 shadow-xs">
                <MdLocationOn className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-extrabold uppercase tracking-wide text-teal-800">
                  Venue & City
                </div>
                <div className="text-xs sm:text-[13px] font-bold text-[#102E4D] truncate">
                  {event.venue || "Confirmed Venue"}
                </div>
                <div className="text-[11px] text-slate-600 truncate">{event.city || "Islamabad"} • {event.locationNote || "Confirmed"}</div>
              </div>
            </div>

            <div className="min-h-[84px] h-full p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/90 flex items-center gap-3.5 shadow-xs">
              <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700 shrink-0 shadow-xs">
                <MdWorkspacePremium className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-extrabold uppercase tracking-wide text-indigo-800">
                  Format & Certificate
                </div>
                <div className="text-xs sm:text-[13px] font-bold text-[#102E4D] truncate">
                  {event.certificate || "Certificate of Completion"}
                </div>
                <div className="text-[11px] text-slate-600 truncate">{event.format || "In-person Workshop"}</div>
              </div>
            </div>

            <div className="min-h-[84px] h-full p-4 rounded-2xl bg-purple-50/80 border border-purple-200/90 flex items-center gap-3.5 shadow-xs">
              <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700 shrink-0 shadow-xs">
                <MdRecordVoiceOver className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-extrabold uppercase tracking-wide text-purple-800">
                  Facilitated By
                </div>
                <div className="text-xs sm:text-[13px] font-bold text-[#102E4D] truncate">
                  {event.facilitator || "Certified Master Trainer"}
                </div>
                <div className="text-[11px] text-slate-600 truncate">The Leadership Covenant</div>
              </div>
            </div>
          </div>

          {/* Highlights & Audience List Editors */}
          <div className="pt-3 border-t border-slate-100 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MdCheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D]">
                  Program Highlights & What You Will Experience
                </span>
              </div>
              <StringListEditor
                values={event.highlights || []}
                onChange={(highlights) => onChange({ ...event, highlights })}
                placeholder="e.g. Master the 7 Habits operating system"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <MdGroups className="w-4 h-4 text-sky-600" />
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D]">
                  Target Audience & Who Should Attend
                </span>
              </div>
              <StringListEditor
                values={event.whoShouldAttend || []}
                onChange={(whoShouldAttend) => onChange({ ...event, whoShouldAttend })}
                placeholder="e.g. Principals, Academic Heads, Youth aged 14-19"
              />
            </div>
          </div>

          {/* Full Interactive Live Modal Visual Preview */}
          <div className="pt-4 border-t border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-sky-600" />
                Full Modal Visual Preview (What Visitors See)
              </span>
              <button
                type="button"
                onClick={() => onPreviewModal(event)}
                className="text-xs font-bold text-sky-600 hover:text-sky-800 inline-flex items-center gap-1 cursor-pointer"
              >
                Open Fullscreen Dialog →
              </button>
            </div>

            <div className="rounded-2xl border-2 border-sky-200/90 bg-white shadow-md overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${theme.gradient}`} />
              <div className="relative min-h-[160px] sm:min-h-[180px] bg-[#001B33] text-white p-5 sm:p-7 flex flex-col justify-end">
                {event.image ? (
                  <img
                    src={event.image}
                    alt={event.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-35"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-[#001B33] via-[#001B33]/80 to-transparent" />
                <div className="relative z-10 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#FF7900] text-white shadow-xs">
                      {CATEGORY_LABELS[event.category]}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20">
                      {event.city || "Islamabad"}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {event.statusLabel || "Open enrollment"}
                    </span>
                  </div>
                  <h3 className="font-serif font-black text-lg sm:text-2xl text-white leading-tight">
                    {event.title || "Activity Title"}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
                    {event.modalDescription || event.description || "Program overview..."}
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-7 space-y-5 bg-white">
                {/* 4 Equal-height Specs Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                    <MdCalendarToday className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[10px] font-bold uppercase text-slate-500">Date & Schedule</div>
                      <div className="text-xs font-bold text-[#102E4D]">
                        {event.startDate || "Date TBD"}
                      </div>
                      <div className="text-[10.5px] text-slate-600">{event.schedule || "Full Day"}</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                    <MdLocationOn className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[10px] font-bold uppercase text-slate-500">Venue & City</div>
                      <div className="text-xs font-bold text-[#102E4D] truncate">{event.venue || event.city}</div>
                      <div className="text-[10.5px] text-slate-600">{event.city}</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                    <MdWorkspacePremium className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[10px] font-bold uppercase text-slate-500">Format & Certificate</div>
                      <div className="text-xs font-bold text-[#102E4D] truncate">{event.certificate || "FranklinCovey"}</div>
                      <div className="text-[10.5px] text-slate-600 truncate">{event.format || "In-person"}</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                    <MdRecordVoiceOver className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[10px] font-bold uppercase text-slate-500">Lead Facilitator</div>
                      <div className="text-xs font-bold text-[#102E4D] truncate">{event.facilitator || "Master Trainer"}</div>
                      <div className="text-[10.5px] text-slate-600">The Leadership Covenant</div>
                    </div>
                  </div>
                </div>

                {/* Overview Paragraph Preview */}
                {event.overview ? (
                  <div className="space-y-1.5 p-4 rounded-xl bg-[#EFFBF8]/60 border border-[#D7F5EF]">
                    <div className="text-[11px] font-black uppercase tracking-wider text-[#102E4D]">
                      Program Curriculum & Overview
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                      {event.overview}
                    </p>
                  </div>
                ) : null}

                {/* Highlights Preview */}
                {(event.highlights && event.highlights.length > 0) ? (
                  <div className="space-y-2">
                    <div className="text-[11px] font-black uppercase tracking-wider text-[#102E4D] flex items-center gap-1.5">
                      <MdCheckCircle className="w-4 h-4 text-emerald-600" />
                      Key Highlights & Takeaways
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                      {event.highlights.filter(Boolean).map((h, i) => (
                        <li key={i} className="flex items-start gap-2 p-2 rounded-lg bg-emerald-50/50 border border-emerald-100">
                          <span className="text-emerald-600 font-bold shrink-0">✓</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {/* Target Audience Preview */}
                {(event.whoShouldAttend && event.whoShouldAttend.length > 0) ? (
                  <div className="space-y-2">
                    <div className="text-[11px] font-black uppercase tracking-wider text-[#102E4D] flex items-center gap-1.5">
                      <MdGroups className="w-4 h-4 text-sky-600" />
                      Target Audience
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {event.whoShouldAttend.filter(Boolean).map((aud, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-xs font-semibold">
                          {aud}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Bottom Bar Preview */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Application Status</span>
                    <div className="text-xs font-bold text-[#102E4D]">
                      {Number(event.regularPrice || 0) > 0 ? (
                        <span>Fee: {event.currency || "PKR"} {event.regularPrice?.toLocaleString()}</span>
                      ) : (
                        <span>Provisional Registration • RSVP Required</span>
                      )}
                    </div>
                  </div>
                  <span className="px-4 py-2 rounded-xl bg-[#102E4D] text-white text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm">
                    Apply Now
                    <MdArrowForward className="w-3.5 h-3.5 text-[#FFC400]" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 03: ACTIVITY TYPE & PUBLIC LIFECYCLE (AMBER / ORANGE)
      ───────────────────────────────────────────────────────────── */}
      <section
        id="cms-type"
        className="rounded-2xl border-2 border-amber-200/90 bg-white shadow-xs overflow-hidden transition-all"
      >
        <div className="px-5 py-3.5 bg-gradient-to-r from-amber-50 via-orange-50/50 to-white border-b border-amber-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              03
            </span>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-amber-700">
                Enrollment Status & Public Lifecycle
              </p>
              <h4 className="font-serif font-bold text-[#102E4D] text-sm sm:text-base">
                Public Card Status Badge
              </h4>
            </div>
          </div>
          <span className="hidden sm:inline-flex text-[11px] font-semibold text-amber-800 bg-amber-100/70 px-2.5 py-1 rounded-full border border-amber-200">
            Controls Apply Form
          </span>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {LIFECYCLE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setLifecycle(option.id)}
                className={`text-left p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                  lifecycle === option.id
                    ? `${option.active} shadow-sm ring-2 ring-offset-1 ring-amber-400/40`
                    : "border-slate-200 bg-white text-[#102E4D] hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wide">
                    {option.label}
                  </span>
                  {lifecycle === option.id ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-current animate-pulse" />
                  ) : null}
                </div>
                <p className="text-[11px] mt-1.5 opacity-80 leading-relaxed">{option.hint}</p>
              </button>
            ))}
          </div>

          <Field
            label="Custom Status Badge Label (Optional)"
            hint="Override default text with custom wording (e.g. 'Seats Filling Fast', 'RSVP Required', 'Free Workshop')"
          >
            <input
              className={inputClass}
              value={event.statusLabel}
              placeholder="e.g. ENROLLMENTS OPEN • LIVE NOW"
              onChange={(e) => onChange({ ...event, statusLabel: e.target.value })}
            />
          </Field>

          {/* Public Visibility Status Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4.5 rounded-2xl border border-slate-200 bg-white shadow-xs mt-3 gap-3">
            <div>
              <div className="text-xs font-extrabold text-[#102E4D] flex items-center gap-2">
                {event.hidden ? (
                  <span className="p-1 rounded-lg bg-amber-100 text-amber-800">
                    <EyeOff className="w-4 h-4" />
                  </span>
                ) : (
                  <span className="p-1 rounded-lg bg-emerald-100 text-emerald-800">
                    <Eye className="w-4 h-4" />
                  </span>
                )}
                <span>Public Website Visibility Status</span>
              </div>
              <p className="text-[11.5px] text-slate-600 mt-1 max-w-md">
                {event.hidden
                  ? "Currently HIDDEN (Draft) — Not visible on /activities or in the /apply form."
                  : "Currently LIVE (Public) — Visible to all website visitors on /activities and /apply."}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onChange({ ...event, hidden: false })}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer border transition-all inline-flex items-center gap-1.5 active:scale-95 ${
                  !event.hidden
                    ? "bg-[#10B981] text-white border-[#10B981] shadow-xs"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live (Open)</span>
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...event, hidden: true })}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer border transition-all inline-flex items-center gap-1.5 active:scale-95 ${
                  event.hidden
                    ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>Hidden (Draft)</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ActivitiesCmsEditor() {
  const [events, setEvents] = useState<LeadershipEvent[]>([]);
  const [original, setOriginal] = useState("[]");
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | EventLifecycle | "hidden">("all");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [previewModalEvent, setPreviewModalEvent] = useState<LeadershipEvent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    index: number;
    event: LeadershipEvent;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingIndex, setTogglingIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadResolveRef = useRef<((url: string | null) => void) | null>(null);

  const hasUnsavedChanges = useMemo(
    () => JSON.stringify({ events, _visible: visible }) !== original,
    [events, visible, original]
  );

  const loadPage = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms", { cache: "no-store" });
      if (!res.ok) {
        setEvents(EVENTS);
        setVisible(true);
        setOriginal(JSON.stringify({ events: EVENTS, _visible: true }));
        return;
      }
      const json = await res.json();
      const page = json.pages?.events;
      const content = page?.content || {};
      let list = Array.isArray(content.events) && content.events.length > 0
        ? (content.events as LeadershipEvent[])
        : EVENTS;

      // Smart auto-detection: If code in src/content/events.ts has added new activities
      // whose slugs are not yet in Firestore, auto-include them so CMS stays fully up-to-date!
      const existingSlugs = new Set(list.map((e) => e.slug));
      const newlyAddedInCode = EVENTS.filter((e) => !existingSlugs.has(e.slug));
      if (newlyAddedInCode.length > 0) {
        list = [...list, ...newlyAddedInCode];
      }

      setEvents(list);
      setVisible(content._visible !== false);
      setOriginal(JSON.stringify({ events: list, _visible: content._visible !== false }));
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSyncFromActivityPage = useCallback(() => {
    const codeMap = new Map(EVENTS.map((e) => [e.slug, e]));
    let addedCount = 0;
    let updatedCount = 0;

    const merged = events.map((existing) => {
      const fromCode = codeMap.get(existing.slug);
      if (fromCode) {
        // Merge code defaults with existing custom values
        updatedCount += 1;
        return {
          ...fromCode,
          ...existing,
        };
      }
      return existing;
    });

    const existingSlugs = new Set(events.map((e) => e.slug));
    for (const codeEvt of EVENTS) {
      if (!existingSlugs.has(codeEvt.slug)) {
        merged.push(JSON.parse(JSON.stringify(codeEvt)));
        addedCount += 1;
      }
    }

    setEvents(merged);
    setFeedback({
      type: "success",
      text: `Catalog synchronized with public Activity page. ${addedCount} new activities added, ${updatedCount} verified. Click 'Publish Changes' to save to Firebase.`,
    });
  }, [events]);

  const handleAddDummyActivity = useCallback(() => {
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const dummy: LeadershipEvent = {
      slug: `sample-ai-leadership-workshop-${randomId}`,
      title: `AI & Executive Leadership Masterclass [SAMPLE #${randomId}]`,
      category: "professional_development",
      city: "Islamabad",
      locationNote: "TLC Executive Suites, F-10/3",
      startDate: "2026-06-20",
      endDate: "2026-06-21",
      schedule: "9:00 AM – 5:00 PM PKT",
      duration: "2 Days Immersive",
      description:
        "Sample test activity created for CMS validation. Test card details, interactive preview modal, pricing rules, and Cloudinary image upload.",
      overview:
        "This sample activity allows administrators to safely test all CMS capabilities: card presentation, detailed popup modals, Cloudinary image uploads, early-bird discount rules, and Firebase Firestore synchronization.",
      venue: "Serena Hotel Executive Hall, Islamabad",
      format: "In-Person Executive Cohort & Practical Simulation",
      certificate: "Official FranklinCovey Executive Leadership Credential",
      facilitator: "Lead Master Trainer & Education Fellow",
      highlights: [
        "Test dynamic green checkmark bullets in the live modal",
        "Interactive pricing discount countdown simulation",
        "Dual Cloudinary upload proof and responsive card layout",
        "Chronological sorting verification on public Activities page",
      ],
      whoShouldAttend: [
        "School Principals & Vice Principals",
        "Educational Directors & Academic Deans",
        "CMS Administrators verifying publishing workflows",
      ],
      tag1: "TestActivity",
      tag2: "CMSVerified",
      tag3: "Cohort2026",
      image: "/Activities/A1.png",
      regularPrice: 7500,
      currency: "PKR",
      discountPercent: 20,
      isOfferActive: true,
      offerLabel: "Early Bird 20% OFF",
      offerStartDate: "2026-05-01T00:00:00+05:00",
      offerEndDate: "2026-06-15T23:59:59+05:00",
      seatLimit: 30,
      hidden: false,
      lifecycleOverride: "enrollment_open",
      statusTone: "open",
      statusLabel: "TEST ENROLLMENT OPEN • LIVE NOW",
    };

    setEvents((prev) => [dummy, ...prev]);
    setEditingIndex(0);
    setFeedback({
      type: "success",
      text: "Sample test dummy activity added! You can now test editing, modal preview, and publishing. You can delete it anytime.",
    });
  }, []);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  useEffect(() => {
    if (editingIndex === null && deleteTarget === null && previewModalEvent === null) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [editingIndex, deleteTarget, previewModalEvent]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const cleaned = events.map((event) => ({
        ...event,
        highlights: (event.highlights || []).map((item) => item.trim()).filter(Boolean),
        whoShouldAttend: (event.whoShouldAttend || [])
          .map((item) => item.trim())
          .filter(Boolean),
      }));
      const payload = { events: cleaned, _visible: visible };
      const res = await fetch("/api/admin/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page_key: "events", content: payload }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed to publish.");
      const saved = (json.page.content.events as LeadershipEvent[]) || cleaned;
      setEvents(saved);
      setOriginal(
        JSON.stringify({
          events: saved,
          _visible: json.page.content._visible !== false,
        })
      );
      setFeedback({
        type: "success",
        text: "Activities catalog published. Public Activities and Apply pages will use this content.",
      });
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to publish changes.",
      });
    } finally {
      setSaving(false);
    }
  }, [events, visible]);

  const handleToggleHidden = useCallback(
    async (index: number) => {
      const target = events[index];
      if (!target) return;
      const newHidden = !target.hidden;
      const next = [...events];
      next[index] = { ...target, hidden: newHidden };
      setEvents(next);
      setTogglingIndex(index);

      try {
        const cleaned = next.map((event) => ({
          ...event,
          highlights: (event.highlights || []).map((item) => item.trim()).filter(Boolean),
          whoShouldAttend: (event.whoShouldAttend || [])
            .map((item) => item.trim())
            .filter(Boolean),
        }));
        const payload = { events: cleaned, _visible: visible };
        const res = await fetch("/api/admin/cms", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ page_key: "events", content: payload }),
        });
        const json = await res.json();
        if (!res.ok || !json.ok) throw new Error(json.error || "Failed to persist to Firebase.");

        setOriginal(
          JSON.stringify({
            events: cleaned,
            _visible: visible,
          })
        );
        setFeedback({
          type: "success",
          text: newHidden
            ? `Activity "${target.title}" is now HIDDEN from the public Activities page and Apply form.`
            : `Activity "${target.title}" is now LIVE on the public Activities page and Apply form.`,
        });
      } catch (err) {
        // Rollback on failure
        setEvents(events);
        setFeedback({
          type: "error",
          text: err instanceof Error ? err.message : "Failed to update visibility.",
        });
      } finally {
        setTogglingIndex(null);
      }
    },
    [events, visible]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    const { index, event: target } = deleteTarget;
    setIsDeleting(true);

    const next = events.filter((_, i) => i !== index);
    setEvents(next);
    if (editingIndex === index) {
      setEditingIndex(null);
    } else if (editingIndex !== null && editingIndex > index) {
      setEditingIndex(editingIndex - 1);
    }

    try {
      const cleaned = next.map((event) => ({
        ...event,
        highlights: (event.highlights || []).map((item) => item.trim()).filter(Boolean),
        whoShouldAttend: (event.whoShouldAttend || [])
          .map((item) => item.trim())
          .filter(Boolean),
      }));
      const payload = { events: cleaned, _visible: visible };
      const res = await fetch("/api/admin/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page_key: "events", content: payload }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed to delete from Firebase.");

      setOriginal(
        JSON.stringify({
          events: cleaned,
          _visible: visible,
        })
      );
      setDeleteTarget(null);
      setFeedback({
        type: "success",
        text: `Activity “${target.title}” deleted successfully and saved to Firebase.`,
      });
    } catch (err) {
      // Rollback on failure
      setEvents(events);
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to delete activity.",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, events, visible, editingIndex]);

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

  const handleReset = async () => {
    if (!window.confirm("Reset the Activities catalog to the original website defaults?")) {
      return;
    }
    setResetting(true);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset", page_key: "events" }),
      });
      const json = await res.json();
      if (res.ok && json.page) {
        const list = (json.page.content.events as LeadershipEvent[]) || EVENTS;
        setEvents(list);
        setVisible(json.page.content._visible !== false);
        setOriginal(
          JSON.stringify({
            events: list,
            _visible: json.page.content._visible !== false,
          })
        );
        setEditingIndex(null);
        setFeedback({ type: "success", text: "Activities catalog restored to defaults." });
      }
    } finally {
      setResetting(false);
    }
  };

  const handleUpload = async (): Promise<string | null> =>
    new Promise((resolve) => {
      uploadResolveRef.current = resolve;
      fileInputRef.current?.click();
    });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      uploadResolveRef.current?.(null);
      return;
    }
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("purpose", "cms");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (res.ok && json.url) {
        uploadResolveRef.current?.(json.url);
        setFeedback({ type: "success", text: "Image uploaded." });
      } else {
        uploadResolveRef.current?.(null);
        setFeedback({ type: "error", text: json.error || "Upload failed." });
      }
    } catch {
      uploadResolveRef.current?.(null);
    }
    e.target.value = "";
  };

  const filteredIndexes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return events
      .map((event, index) => ({ event, index }))
      .filter(({ event }) => {
        if (filter === "hidden") return Boolean(event.hidden);
        if (filter !== "all" && getEventLifecycle(event) !== filter) return false;
        if (
          q &&
          !`${event.title} ${event.city} ${event.description} ${event.slug}`
            .toLowerCase()
            .includes(q)
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        return (
          (a.event.startDate || "").localeCompare(b.event.startDate || "") ||
          a.event.title.localeCompare(b.event.title)
        );
      });
  }, [events, filter, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: events.length,
      enrollment_open: events.filter((e) => getEventLifecycle(e) === "enrollment_open").length,
      upcoming: events.filter((e) => getEventLifecycle(e) === "upcoming").length,
      previous: events.filter((e) => getEventLifecycle(e) === "previous").length,
      hidden: events.filter((e) => e.hidden).length,
    };
  }, [events]);

  const editingEvent = editingIndex === null ? null : events[editingIndex];

  return (
    <div className="space-y-5 pb-16">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Link
            href="/AD_Admin/cms"
            className="flex items-center gap-1.5 text-slate-500 hover:text-[#FF7900] font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            CMS Overview Hub
          </Link>
          <span>/</span>
          <span className="text-[#102E4D] font-extrabold">Activities Page</span>
        </div>
        {hasUnsavedChanges ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 font-extrabold text-[10.5px]">
            Unsaved changes · Ctrl+S
          </div>
        ) : null}
      </div>

      <div className="rounded-3xl bg-white border-2 border-[#C8EFE6] shadow-xl overflow-hidden">
        <div className="relative bg-gradient-to-r from-[#001B33] via-[#082038] to-[#001428] p-5 sm:p-7 text-white">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#10B981]" />

          <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-5">
            {/* Left Column: Title & Description */}
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-[#FFC400] text-[10px] font-extrabold uppercase tracking-widest">
                  <Sparkles className="w-3 h-3" />
                  Live CMS Editor
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Firestore Synced
                </span>
              </div>

              <h1 className="font-serif font-extrabold text-xl sm:text-2xl text-white tracking-tight">
                Activities Page CMS
              </h1>

              <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed">
                Same card layout as the public Activities page. Edit card copy, modal details,
                activity type, and apply-form pricing from one place.
              </p>
            </div>

            {/* Right Column: Perfectly Placed & Aligned Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
              <Link
                href="/activities"
                target="_blank"
                className="h-10 px-3.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-bold inline-flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-98"
                title="Open public Activities page in a new tab"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#38BDF8]" />
                Preview
              </Link>

              <button
                type="button"
                onClick={handleSyncFromActivityPage}
                disabled={loading || saving}
                title="Sync new activities or code updates from src/content/events.ts"
                className="h-10 px-3.5 rounded-xl border border-sky-400/30 bg-sky-500/15 hover:bg-sky-500/25 text-sky-200 text-xs font-bold inline-flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50 cursor-pointer active:scale-98"
              >
                <RotateCcw className="w-3.5 h-3.5 text-sky-300" />
                Sync from Code
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={resetting}
                title="Restore all activities back to original website defaults"
                className="h-10 px-3.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-bold inline-flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50 cursor-pointer active:scale-98"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                {resetting ? "Resetting…" : "Reset"}
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving || loading}
                className="h-10 px-5 rounded-xl bg-gradient-to-r from-[#FF7900] via-[#FF8800] to-[#E56D00] hover:brightness-105 text-white text-xs font-black uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer active:scale-98"
              >
                {saving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Publishing…
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Publish Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {feedback ? (
          <div
            className={`px-6 py-2.5 border-b flex items-center gap-2.5 text-xs font-semibold ${
              feedback.type === "success"
                ? "bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="flex-1">{feedback.text}</span>
            <button type="button" onClick={() => setFeedback(null)}>
              ✕
            </button>
          </div>
        ) : null}

        <div className="px-5 sm:px-6 py-4 border-b border-[#C8EFE6] space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="relative w-full lg:w-80">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#C8EFE6] text-xs"
                placeholder="Search title, city, slug…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={handleAddDummyActivity}
                className="h-9 px-3.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-98"
                title="Create a sample test activity to safely test CMS editing, modal preview, pricing, and publishing"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                + Sample Test Activity
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = createBlankEvent(events);
                  setEvents((prev) => [...prev, next]);
                  setEditingIndex(events.length);
                }}
                className="h-9 px-4 rounded-xl bg-[#102E4D] hover:bg-[#001B33] text-white text-xs font-extrabold uppercase tracking-wider inline-flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-98"
              >
                <Plus className="w-4 h-4" />
                Add activity
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ["all", `All (${counts.all})`],
                ["enrollment_open", `Enrollment open (${counts.enrollment_open})`],
                ["upcoming", `Upcoming (${counts.upcoming})`],
                ["previous", `Previous (${counts.previous})`],
                ["hidden", `Hidden (${counts.hidden})`],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filter === id
                    ? "bg-[#102E4D] text-white shadow-xs"
                    : id === "hidden" && counts.hidden > 0
                    ? "bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100"
                    : "bg-[#EFFBF8] text-[#102E4D] border border-[#C8EFE6] hover:bg-[#D7F5EF]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-72 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : filteredIndexes.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <Sparkles className="w-8 h-8 text-[#FF7900] mx-auto" />
              <p className="font-bold text-[#102E4D]">No activities match this filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredIndexes.map(({ event, index }) => (
                <ActivityPreviewCard
                  key={`${event.slug}-${index}`}
                  event={event}
                  onEdit={() => setEditingIndex(index)}
                  onPreviewModal={() => setPreviewModalEvent(event)}
                  onToggleHidden={() => handleToggleHidden(index)}
                  onDelete={() => setDeleteTarget({ index, event })}
                  isTogglingHidden={togglingIndex === index}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editing Activity Centered Modal */}
      {editingEvent && editingIndex !== null ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[#001020]/80 backdrop-blur-md animate-in fade-in duration-200">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Close editor"
            onClick={() => {
              if (
                events[editingIndex] &&
                JSON.stringify(events[editingIndex]) !== JSON.stringify(editingEvent)
              ) {
                if (
                  window.confirm(
                    "You have unsaved changes on this activity. Click OK to keep your changes in the catalog, or Cancel to discard."
                  )
                ) {
                  setEditingIndex(null);
                  setFeedback({
                    type: "success",
                    text: `Activity "${editingEvent.title}" preserved in working catalog. Remember to click 'Publish Changes' to persist live to Firebase.`,
                  });
                  return;
                }
              }
              setEditingIndex(null);
            }}
          />
          <div className="relative w-full max-w-4xl lg:max-w-5xl max-h-[92vh] sm:max-h-[90vh] bg-[#F8FAFC] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Top signature gradient line */}
            <div className="h-1 bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#10B981] z-20 shrink-0" />

            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#001B33] via-[#0A2644] to-[#001830] text-white flex items-center justify-between gap-4 shrink-0">
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/10 text-[#FFC400] border border-white/15">
                    Activity #{editingIndex + 1} of {events.length}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                    {CATEGORY_LABELS[editingEvent.category] || editingEvent.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-300 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                    /{editingEvent.slug}
                  </span>
                </div>
                <h3 className="font-serif font-extrabold text-lg sm:text-xl text-white truncate">
                  {editingEvent.title || "Untitled Activity"}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setPreviewModalEvent(editingEvent)}
                  className="inline-flex items-center gap-1.5 h-8.5 px-3 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-xs font-bold text-sky-200 border border-sky-400/30 cursor-pointer transition-colors shadow-xs"
                  title="Preview how visitors see this modal on top of editor"
                >
                  <Eye className="w-3.5 h-3.5 text-[#38BDF8]" />
                  Preview Modal
                </button>
                <button
                  type="button"
                  onClick={() => setEditingIndex(null)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
                  title="Close modal (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sticky Section Quick Jump Tabs */}
            <div className="px-6 py-2.5 bg-white border-b border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0 shadow-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mr-1 hidden sm:inline">
                Jump to:
              </span>
              {[
                { id: "cms-card", label: "01 · Card Details", color: "text-violet-700 bg-violet-50 hover:bg-violet-100 border-violet-200" },
                { id: "cms-modal", label: "02 · Modal Details", color: "text-sky-700 bg-sky-50 hover:bg-sky-100 border-sky-200" },
                { id: "cms-type", label: "03 · Lifecycle & Status", color: "text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    const el = document.getElementById(tab.id);
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${tab.color}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-[#F8FAFC]">
              <ActivityEditorForm
                event={editingEvent}
                onChange={(next) => {
                  const copy = [...events];
                  copy[editingIndex] = next;
                  setEvents(copy);
                }}
                onUpload={handleUpload}
                onPreviewModal={(evt) => setPreviewModalEvent(evt)}
              />
            </div>

            {/* Sticky Bottom Actions Bar with Perfect Alignment */}
            <div className="px-5 sm:px-7 py-3.5 sm:py-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0 shadow-lg">
              <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                <button
                  type="button"
                  onClick={() => setEditingIndex(null)}
                  className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-98"
                >
                  <X className="w-3.5 h-3.5 text-slate-400" />
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteTarget({ index: editingIndex, event: editingEvent });
                  }}
                  className="h-10 px-3.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-700 inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-98"
                  title="Delete this activity from catalog"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  Delete Activity
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const defaultEvt = EVENTS.find((e) => e.slug === editingEvent.slug);
                    if (defaultEvt) {
                      if (
                        !window.confirm(
                          `Reset "${editingEvent.title}" back to website defaults? Any custom modifications on this activity will be reverted.`
                        )
                      ) {
                        return;
                      }
                      const copy = [...events];
                      copy[editingIndex] = JSON.parse(JSON.stringify(defaultEvt));
                      setEvents(copy);
                      setFeedback({
                        type: "success",
                        text: `Reset "${defaultEvt.title}" to code defaults.`,
                      });
                    } else {
                      alert("This custom activity has no default template.");
                    }
                  }}
                  className="h-10 px-3.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-xs font-bold text-amber-800 inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-98"
                  title="Revert this single activity back to factory defaults"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                  Reset Activity to Default
                </button>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                <button
                  type="button"
                  onClick={() => {
                    if (!editingEvent.title?.trim()) {
                      alert("Activity Title is required before finishing.");
                      return;
                    }
                    setEditingIndex(null);
                    setFeedback({
                      type: "success",
                      text: `Activity "${editingEvent.title}" updated in working catalog! Click "Publish Changes" in the top bar to save permanently to Firebase.`,
                    });
                  }}
                  className="h-10 px-4.5 rounded-xl bg-[#102E4D] hover:bg-[#001B33] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-98"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Done Editing
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="h-10 px-5 rounded-xl bg-gradient-to-r from-[#FF7900] via-[#FF8800] to-[#E56D00] hover:brightness-105 active:scale-98 text-white text-xs font-black uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Publishing…
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Publish All Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Dedicated Activity Delete Confirmation Modal with Clear Warning */}
      {deleteTarget ? (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-[#001020]/80 backdrop-blur-md animate-in fade-in duration-200">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Cancel deletion"
            onClick={() => !isDeleting && setDeleteTarget(null)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Top Red Gradient Accent Stripe */}
            <div className="h-2 w-full bg-gradient-to-r from-rose-500 via-red-600 to-rose-700" />

            <div className="p-6 sm:p-7 space-y-5">
              {/* Header with Danger Trash Icon */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 shadow-sm">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-xl text-[#102E4D]">
                    Delete Activity from Catalog?
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Please review the activity details below before permanently deleting.
                  </p>
                </div>
              </div>

              {/* Activity Preview Summary Box */}
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/90 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    {CATEGORY_LABELS[deleteTarget.event.category] || deleteTarget.event.category}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 font-num">
                    <MdLocationOn className="text-[#FF7900]" />
                    {deleteTarget.event.city || "Islamabad"} · {deleteTarget.event.startDate || "2026"}
                  </span>
                </div>
                <h4 className="font-serif font-bold text-base text-[#102E4D]">
                  {deleteTarget.event.title}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-2">
                  {deleteTarget.event.description || "No description provided."}
                </p>
              </div>

              {/* Warning Notice Box */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">
                    Warning: This action permanently deletes this activity
                  </p>
                  <p className="text-[11.5px] text-amber-800 leading-relaxed">
                    This will remove the activity from Firebase, the public /activities catalog, and applicant cohort selection. If you only want to take it down temporarily, use <strong>Hide Instead</strong> to keep your data safe.
                  </p>
                </div>
              </div>

              {/* Action Buttons: Cancel, Hide Instead, and Confirm Delete */}
              <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeleteTarget(null)}
                  className="w-full sm:w-auto h-11 px-5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>

                {!deleteTarget.event.hidden ? (
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={async () => {
                      const idx = deleteTarget.index;
                      setDeleteTarget(null);
                      await handleToggleHidden(idx);
                    }}
                    className="w-full sm:w-auto h-11 px-4.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    title="Hide this activity from public view instead of deleting"
                  >
                    <EyeOff className="w-4 h-4 text-amber-700" />
                    <span>Hide Instead</span>
                  </button>
                ) : null}

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="w-full sm:w-auto h-11 px-5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white text-xs font-black uppercase tracking-wider inline-flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98 disabled:opacity-60"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Deleting from Firebase…</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Confirm &amp; Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Fullscreen EventDetailModal Preview rendered ON TOP OF the CMS modal */}
      {previewModalEvent ? (
        <EventDetailModal
          event={previewModalEvent}
          zIndexClassName="z-[150]"
          onClose={() => setPreviewModalEvent(null)}
        />
      ) : null}
    </div>
  );
}

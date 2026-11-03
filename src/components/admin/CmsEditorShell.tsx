"use client";

import React, { useEffect, useState, useCallback, useRef, Suspense } from "react";
import Link from "next/link";
import {
  Layers,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Upload,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  List,
  Sparkles,
  ArrowLeft,
  Info,
  Search,
  Copy,
  ArrowUp,
  ArrowDown,
  Home,
  Users,
  Globe,
  CreditCard,
  Briefcase,
  Calendar,
  DollarSign,
  Phone,
  Tag,
  Clock,
  BadgePercent,
  Check,
  AlertTriangle,
  Zap,
} from "lucide-react";
import type { CmsPageKey } from "@/lib/firebase-cms";

/* ─── Client Friendly Label Formatter ─── */
function formatFieldLabel(key: string): string {
  const map: Record<string, string> = {
    title: "Title / Main Heading",
    subtitle: "Subtitle / Tagline",
    description: "Detailed Description",
    badge: "Badge Text",
    ctaPrimary: "Primary Button Text",
    ctaSecondary: "Secondary Button Text",
    phoneNumber: "Phone Number",
    emailAddress: "Email Address",
    address: "Physical Address",
    whatsapp: "WhatsApp Number",
    accountNumber: "Bank Account Number",
    accountTitle: "Account Title / Name",
    bankName: "Bank Name",
    iban: "IBAN Number",
    regularPrice: "Standard Fee (PKR)",
    discountPercent: "Discount Percentage (%)",
    earlyBirdDeadline: "Early Bird Deadline Date",
    offerStartDate: "Offer Start Date & Time",
    offerEndDate: "Offer End Date & Time (Deadline)",
    isOfferActive: "Offer Active Status",
    offerLabel: "Offer Promo Badge Label",
    seatLimit: "Seat Capacity Limit",
    startDate: "Start Date",
    endDate: "End Date",
    schedule: "Daily Timing / Schedule",
    city: "City / Location",
    outcomes: "Expected Outcomes & Benefits",
    targetAudience: "Who Should Attend / Target Audience",
    summitSlug: "Summit Identifier Slug",
    currency: "Currency Code",
    tag1: "Tag 1 (Pillar / Level)",
    tag2: "Tag 2 (Target Audience)",
    tag3: "Tag 3 (Format / Highlight)",
    whoIsItFor: "Target Audience / Who Is It For",
    whatWeDeliver: "What We Deliver & Key Pillars",
    modalDescription: "Event Modal Summary Description",
    locationNote: "Location / Venue Quick Note",
    statusLabel: "Status Badge Label",
    statusTone: "Status Tone (open / limited / free)",
    venue: "Physical Venue / Facility",
    format: "Program Format (In-Person / Hybrid)",
    certificate: "Certificate Awarded",
    facilitator: "Lead Facilitator",
    overview: "Comprehensive Program Overview",
    highlights: "Program Highlights",
    whoShouldAttend: "Target Participant Profiles",
    officeHours: "Office Working Hours",
    consultationNote: "Consultation & Partnership Note",
  };
  if (map[key]) return map[key];
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function getFieldHelper(key: string): string | null {
  const helpers: Record<string, string> = {
    hero: "This appears at the very top of the page when visitors arrive.",
    regularPrice: "Enter base amount in PKR without commas (e.g. 5000, or 0 for Free RSVP).",
    discountPercent: "Enter discount percentage between 0 and 100 (e.g. 20 for 20% off).",
    earlyBirdDeadline: "ISO date format (e.g. 2026-11-07T23:59:59+05:00) or date string.",
    offerStartDate: "Date and time when the promotional offer begins.",
    offerEndDate: "Date and time when early bird expires and regular price takes over.",
    whatsapp: "Format: +923192091249 with country code for direct chat.",
    iban: "Official 24-character Pakistani IBAN starting with PK.",
    tag1: "Primary level/pillar tag (e.g. Professional Development, Student Camp, Summit 2026).",
    tag2: "Target audience badge (e.g. Educators & Leaders, Grade 6-12, Parents).",
    tag3: "Perk or format badge (e.g. Interactive Masterclass, 3-Day Residential, Free Entry).",
  };
  return helpers[key] || null;
}

/* ─── Visual Form Field Component ─── */
export function VisualField({
  fieldKey,
  value,
  onChange,
  depth = 0,
  onUploadMedia,
  searchQuery = "",
}: {
  fieldKey: string;
  value: unknown;
  onChange: (newVal: unknown) => void;
  depth?: number;
  onUploadMedia: () => Promise<string | null>;
  searchQuery?: string;
}) {
  const label = formatFieldLabel(fieldKey);
  const helper = getFieldHelper(fieldKey);

  // If search query is provided, check if this field matches
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    const matchKey = fieldKey.toLowerCase().includes(q);
    const matchLabel = label.toLowerCase().includes(q);
    const matchVal = typeof value === "string" && value.toLowerCase().includes(q);
    if (!matchKey && !matchLabel && !matchVal && typeof value !== "object") {
      return null;
    }
  }

  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return (
      <ObjectEditor
        fieldKey={fieldKey}
        value={value as Record<string, unknown>}
        onChange={onChange}
        depth={depth}
        onUploadMedia={onUploadMedia}
        searchQuery={searchQuery}
      />
    );
  }

  if (Array.isArray(value)) {
    return (
      <ArrayEditor
        fieldKey={fieldKey}
        value={value}
        onChange={onChange}
        depth={depth}
        onUploadMedia={onUploadMedia}
        searchQuery={searchQuery}
      />
    );
  }

  if (typeof value === "boolean") {
    return (
      <div className="flex items-center justify-between p-3 rounded-xl border border-[#C8EFE6] bg-[#EFFBF8]/50 hover:border-[#10B981]/50 transition-colors">
        <div>
          <span className="font-bold text-xs text-[#102E4D] block">{label}</span>
          {helper && <span className="text-[10.5px] text-slate-500 block mt-0.5">{helper}</span>}
        </div>
        <button
          type="button"
          onClick={() => onChange(!value)}
          className={`relative inline-flex h-5.5 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
            value ? "bg-[#10B981]" : "bg-slate-300"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out mt-0.5 ${
              value ? "translate-x-5.5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
    );
  }

  if (typeof value === "number") {
    return (
      <div className="space-y-1">
        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D]">
          {label}
        </label>
        {helper && <p className="text-[10px] text-slate-500">{helper}</p>}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full px-3 py-2 rounded-xl border-2 border-[#C8EFE6] bg-white font-num font-bold text-xs text-[#102E4D] focus:outline-none focus:border-[#FF7900] transition-colors"
        />
      </div>
    );
  }

  const strVal = String(value ?? "");
  const isImage =
    fieldKey.toLowerCase().includes("image") ||
    fieldKey.toLowerCase().includes("logo") ||
    fieldKey.toLowerCase().includes("photo") ||
    fieldKey.toLowerCase().includes("qr") ||
    fieldKey.toLowerCase().includes("banner") ||
    /\.(jpg|jpeg|png|webp|svg|gif)$/i.test(strVal);

  if (isImage) {
    return (
      <div className="space-y-2 p-3 rounded-xl border border-[#C8EFE6] bg-[#EFFBF8]/40">
        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D]">
          {label} (Photo / Image)
        </label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            value={strVal}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Image URL or /path.jpg"
            className="flex-1 px-3 py-1.5 rounded-lg border border-[#C8EFE6] bg-white text-xs text-[#102E4D] focus:outline-none focus:border-[#FF7900]"
          />
          <button
            type="button"
            onClick={async () => {
              const url = await onUploadMedia();
              if (url) onChange(url);
            }}
            className="h-8 px-3 rounded-lg bg-[#005696] hover:bg-[#004477] text-white text-[11px] font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image</span>
          </button>
        </div>
        {strVal && (
          <div className="mt-1.5 rounded-lg border border-[#C8EFE6] bg-white p-1.5 inline-block max-w-xs shadow-2xs">
            <img
              src={strVal}
              alt={label}
              className="max-h-20 w-auto rounded object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
      </div>
    );
  }

  // DateTime input support for offer dates
  const isDateTime =
    fieldKey === "offerStartDate" ||
    fieldKey === "offerEndDate" ||
    fieldKey === "earlyBirdDeadline";

  if (isDateTime) {
    // Format for datetime-local: YYYY-MM-DDTHH:mm
    const dateVal = strVal.length >= 16 ? strVal.slice(0, 16) : strVal;
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D]">
            {label}
          </label>
          <Clock className="w-3.5 h-3.5 text-[#FF7900]" />
        </div>
        {helper && <p className="text-[10px] text-slate-500">{helper}</p>}
        <div className="flex items-center gap-2">
          <input
            type="datetime-local"
            value={dateVal}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border-2 border-[#C8EFE6] bg-white font-num text-xs text-[#102E4D] focus:outline-none focus:border-[#FF7900] transition-colors"
          />
        </div>
      </div>
    );
  }

  const isLongText =
    strVal.length > 80 ||
    fieldKey.toLowerCase().includes("description") ||
    fieldKey.toLowerCase().includes("message") ||
    fieldKey.toLowerCase().includes("body") ||
    fieldKey.toLowerCase().includes("statement") ||
    fieldKey.toLowerCase().includes("instructions") ||
    fieldKey.toLowerCase().includes("bio") ||
    fieldKey.toLowerCase().includes("overview");

  if (isLongText) {
    return (
      <div className="space-y-1">
        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D]">
          {label}
        </label>
        {helper && <p className="text-[10px] text-slate-500">{helper}</p>}
        <textarea
          rows={3}
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border-2 border-[#C8EFE6] bg-white text-xs text-[#102E4D] focus:outline-none focus:border-[#FF7900] leading-relaxed resize-y transition-colors"
        />
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D]">
        {label}
      </label>
      {helper && <p className="text-[10px] text-slate-500">{helper}</p>}
      <input
        type="text"
        value={strVal}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-xl border-2 border-[#C8EFE6] bg-white text-xs text-[#102E4D] focus:outline-none focus:border-[#FF7900] transition-colors"
      />
    </div>
  );
}

/* ─── Nested Object Card Section ─── */
export function ObjectEditor({
  fieldKey,
  value,
  onChange,
  depth = 0,
  onUploadMedia,
  searchQuery = "",
}: {
  fieldKey: string;
  value: Record<string, unknown>;
  onChange: (newVal: unknown) => void;
  depth?: number;
  onUploadMedia: () => Promise<string | null>;
  searchQuery?: string;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const label = formatFieldLabel(fieldKey);
  const keys = Object.keys(value).filter((k) => !k.startsWith("_"));

  return (
    <div className="rounded-2xl border-2 border-[#C8EFE6] bg-white shadow-2xs overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-gradient-to-r from-[#EFFBF8] via-white to-[#EFFBF8] border-b border-[#C8EFE6] flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-[#E5F7F3] transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6.5 h-6.5 rounded-lg bg-[#FF7900]/15 text-[#FF7900] flex items-center justify-center shrink-0 font-bold text-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-[#102E4D] truncate">{label}</h4>
            <span className="text-[10px] text-slate-400">
              {keys.length} editable {keys.length === 1 ? "field" : "fields"}
            </span>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="p-4 space-y-3.5">
          {keys.map((k) => (
            <VisualField
              key={k}
              fieldKey={k}
              value={value[k]}
              onChange={(newVal) => {
                onChange({ ...value, [k]: newVal });
              }}
              depth={depth + 1}
              onUploadMedia={onUploadMedia}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Dedicated Activity Item Editor Component ─── */
function ActivityItemEditor({
  item,
  onChange,
  onUploadMedia,
  searchQuery,
}: {
  item: Record<string, unknown>;
  onChange: (updated: Record<string, unknown>) => void;
  onUploadMedia: () => Promise<string | null>;
  searchQuery?: string;
}) {
  const regular = Number(item.regularPrice ?? 0);
  const discount = Number(item.discountPercent ?? 0);
  const currency = String(item.currency || "PKR");
  const offerStart = String(item.offerStartDate || "");
  const offerEnd = String(item.offerEndDate || "");
  const isOfferActive = item.isOfferActive !== false;

  // Real-time offer status calculation
  const now = new Date();
  const hasStart = !!offerStart;
  const hasEnd = !!offerEnd;
  const afterStart = hasStart ? now >= new Date(offerStart) : true;
  const beforeEnd = hasEnd ? now <= new Date(offerEnd) : true;
  const isPromoLive = isOfferActive && afterStart && beforeEnd && discount > 0;
  const payable = isPromoLive ? Math.round(regular * (1 - discount / 100)) : regular;
  const savings = isPromoLive ? regular - payable : 0;

  let statusBadgeText = "Offer Inactive";
  let statusBadgeColor = "bg-slate-100 text-slate-600 border-slate-200";

  if (regular === 0) {
    statusBadgeText = "Complimentary Free Entry";
    statusBadgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (!isOfferActive) {
    statusBadgeText = "Offer Paused / Standard Fee Active";
    statusBadgeColor = "bg-amber-50 text-amber-700 border-amber-200";
  } else if (hasStart && !afterStart) {
    statusBadgeText = `Offer Scheduled (Starts ${new Date(offerStart).toLocaleDateString()})`;
    statusBadgeColor = "bg-blue-50 text-blue-700 border-blue-200";
  } else if (hasEnd && !beforeEnd) {
    statusBadgeText = `Early Bird Expired (Standard Fee Active)`;
    statusBadgeColor = "bg-rose-50 text-rose-700 border-rose-200";
  } else if (isPromoLive) {
    statusBadgeText = `LIVE IN APPLY FORM: ${discount}% OFF Early Bird Rate`;
    statusBadgeColor = "bg-emerald-500/15 text-emerald-700 border-emerald-400 font-extrabold animate-pulse";
  }

  const isSummit =
    item.slug === "school-impact-summit-2026" ||
    String(item.slug || "").includes("summit");

  // Filter keys for remaining fields
  const handledKeys = new Set([
    "tag1",
    "tag2",
    "tag3",
    "regularPrice",
    "discountPercent",
    "offerStartDate",
    "offerEndDate",
    "isOfferActive",
    "offerLabel",
    "seatLimit",
    "currency",
  ]);

  const remainingKeys = Object.keys(item).filter((k) => !handledKeys.has(k) && !k.startsWith("_"));

  return (
    <div className="space-y-4">
      {/* ── SECTION 1: THE 3 ACTIVITY TAGS / BADGES ── */}
      <div className="rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/40 via-white to-indigo-50/20 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-indigo-600" />
            <h5 className="font-extrabold text-xs text-[#102E4D] uppercase tracking-wider">
              Activity 3 Tags (Badges &amp; Filtering)
            </h5>
          </div>
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
            Explorer Badges
          </span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          These three distinct tags classify the activity on the calendar, search explorer, and event cards.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Tag 1 */}
          <div className="space-y-1">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-indigo-900">
              Tag 1 (Program Pillar / Level)
            </label>
            <input
              type="text"
              placeholder="e.g. Professional Development"
              value={String(item.tag1 ?? "")}
              onChange={(e) => onChange({ ...item, tag1: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg border border-indigo-200 bg-white text-xs font-semibold text-[#102E4D] focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Tag 2 */}
          <div className="space-y-1">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-emerald-900">
              Tag 2 (Target Audience / Role)
            </label>
            <input
              type="text"
              placeholder="e.g. Educators &amp; Leaders"
              value={String(item.tag2 ?? "")}
              onChange={(e) => onChange({ ...item, tag2: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg border border-emerald-200 bg-white text-xs font-semibold text-[#102E4D] focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Tag 3 */}
          <div className="space-y-1">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-purple-900">
              Tag 3 (Format / Highlight)
            </label>
            <input
              type="text"
              placeholder="e.g. Interactive Masterclass"
              value={String(item.tag3 ?? "")}
              onChange={(e) => onChange({ ...item, tag3: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg border border-purple-200 bg-white text-xs font-semibold text-[#102E4D] focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Live Badges Preview */}
        <div className="pt-2 border-t border-indigo-100 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400">Card Preview:</span>
          {item.tag1 ? (
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10.5px] font-bold inline-flex items-center gap-1">
              🏷️ {String(item.tag1)}
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 italic">Tag 1 empty</span>
          )}
          {item.tag2 ? (
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10.5px] font-bold inline-flex items-center gap-1">
              👥 {String(item.tag2)}
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 italic">Tag 2 empty</span>
          )}
          {item.tag3 ? (
            <span className="px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10.5px] font-bold inline-flex items-center gap-1">
              ✨ {String(item.tag3)}
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 italic">Tag 3 empty</span>
          )}
        </div>
      </div>

      {/* ── SECTION 2: PRICING & EARLY BIRD RULES (EXCLUSIVELY FOR SUMMIT) ── */}
      {isSummit ? (
      <div className="rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/40 via-white to-emerald-50/20 p-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BadgePercent className="w-4 h-4 text-emerald-600" />
            <h5 className="font-extrabold text-xs text-[#102E4D] uppercase tracking-wider">
              Pricing &amp; Early Bird Rules (Linked to Apply Form)
            </h5>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
            Registration Fee Engine
          </span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Controls the registration fee and promotional discounts in the application form for this activity.
          When the early-bird window is active, applying visitors receive the discounted rate automatically.
        </p>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Base Fee */}
          <div className="space-y-1">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#102E4D]">
              Standard Base Fee (PKR)
            </label>
            <input
              type="number"
              value={regular}
              onChange={(e) => onChange({ ...item, regularPrice: Number(e.target.value) })}
              placeholder="e.g. 4500 (0 for free)"
              className="w-full px-3 py-1.5 rounded-lg border-2 border-[#C8EFE6] bg-white font-num font-bold text-xs text-[#102E4D] focus:outline-none focus:border-[#FF7900]"
            />
            <span className="text-[9.5px] text-slate-400 block">Set to 0 for Free RSVP</span>
          </div>

          {/* Discount Percent */}
          <div className="space-y-1">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#102E4D]">
              Early Bird Discount (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={discount}
              onChange={(e) => onChange({ ...item, discountPercent: Number(e.target.value) })}
              placeholder="e.g. 20"
              className="w-full px-3 py-1.5 rounded-lg border-2 border-[#C8EFE6] bg-white font-num font-bold text-xs text-[#102E4D] focus:outline-none focus:border-[#FF7900]"
            />
            <span className="text-[9.5px] text-slate-400 block">Percentage off standard fee</span>
          </div>

          {/* Offer Start Date-Time */}
          <div className="space-y-1">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#102E4D]">
              Offer Start Date &amp; Time
            </label>
            <input
              type="datetime-local"
              value={offerStart.length >= 16 ? offerStart.slice(0, 16) : offerStart}
              onChange={(e) => onChange({ ...item, offerStartDate: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg border-2 border-[#C8EFE6] bg-white font-num text-xs text-[#102E4D] focus:outline-none focus:border-[#FF7900]"
            />
            <span className="text-[9.5px] text-slate-400 block">When discount starts</span>
          </div>

          {/* Offer End Date-Time (Deadline) */}
          <div className="space-y-1">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#102E4D]">
              Offer End Date &amp; Time (Deadline)
            </label>
            <input
              type="datetime-local"
              value={offerEnd.length >= 16 ? offerEnd.slice(0, 16) : offerEnd}
              onChange={(e) => onChange({ ...item, offerEndDate: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg border-2 border-[#C8EFE6] bg-white font-num text-xs text-[#102E4D] focus:outline-none focus:border-[#FF7900]"
            />
            <span className="text-[9.5px] text-slate-400 block">After this, full fee applies</span>
          </div>
        </div>

        {/* Secondary options row: Active Switch + Promo Label + Seat Limit */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="flex items-center justify-between p-2.5 rounded-lg border border-emerald-200 bg-white">
            <div>
              <span className="font-bold text-xs text-[#102E4D] block">Offer Active Status</span>
              <span className="text-[9.5px] text-slate-400 block">Toggle discount on/off</span>
            </div>
            <button
              type="button"
              onClick={() => onChange({ ...item, isOfferActive: !isOfferActive })}
              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${
                isOfferActive ? "bg-[#10B981]" : "bg-slate-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 mt-0.5 ${
                  isOfferActive ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#102E4D]">
              Promo Badge Label (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Early Bird 20% OFF"
              value={String(item.offerLabel ?? "")}
              onChange={(e) => onChange({ ...item, offerLabel: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg border border-[#C8EFE6] bg-white text-xs text-[#102E4D] focus:outline-none focus:border-[#FF7900]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#102E4D]">
              Seat Limit Capacity
            </label>
            <input
              type="number"
              placeholder="e.g. 40"
              value={Number(item.seatLimit ?? 0) || ""}
              onChange={(e) => onChange({ ...item, seatLimit: Number(e.target.value) })}
              className="w-full px-3 py-1.5 rounded-lg border border-[#C8EFE6] bg-white font-num text-xs text-[#102E4D] focus:outline-none focus:border-[#FF7900]"
            />
          </div>
        </div>

        {/* ── LIVE PRICING CALCULATION PREVIEW ── */}
        <div className="p-3 rounded-xl border border-emerald-300 bg-white shadow-2xs space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-100 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#102E4D]">
                Registration Form Live Pricing Preview:
              </span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadgeColor}`}>
              {statusBadgeText}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[9.5px] text-slate-500 font-bold uppercase">Base Fee</div>
              <div className="font-num font-extrabold text-xs sm:text-sm text-[#102E4D]">
                {regular === 0 ? "Free RSVP" : `${currency} ${regular.toLocaleString()}`}
              </div>
            </div>

            <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
              <div className="text-[9.5px] text-amber-700 font-bold uppercase">Discount Rate</div>
              <div className="font-num font-extrabold text-xs sm:text-sm text-amber-800">
                {discount > 0 ? `${discount}% Off` : "0% (Standard)"}
              </div>
            </div>

            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
              <div className="text-[9.5px] text-emerald-700 font-bold uppercase">Payable in Form</div>
              <div className="font-num font-extrabold text-xs sm:text-sm text-emerald-800">
                {regular === 0 ? "Free RSVP" : `${currency} ${payable.toLocaleString()}`}
              </div>
            </div>

            <div className="p-2 rounded-lg bg-sky-50 border border-sky-200">
              <div className="text-[9.5px] text-sky-700 font-bold uppercase">Visitor Saves</div>
              <div className="font-num font-extrabold text-xs sm:text-sm text-sky-800">
                {savings > 0 ? `${currency} ${savings.toLocaleString()}` : "PKR 0"}
              </div>
            </div>
          </div>
        </div>
      </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 text-slate-500">
            <BadgePercent className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-[11px] leading-relaxed">
              Registration pricing rules apply exclusively to <strong>The School Impact Summit 2026</strong>. No price is displayed for this activity.
            </span>
          </div>
        </div>
      )}

      {/* ── SECTION 3: OTHER PROGRAM DETAILS ── */}
      <div className="space-y-3 pt-2">
        <h5 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">
          Program Curriculum, Venue &amp; Facilitator Details
        </h5>
        {remainingKeys.map((k) => (
          <VisualField
            key={k}
            fieldKey={k}
            value={item[k]}
            onChange={(newVal) => onChange({ ...item, [k]: newVal })}
            onUploadMedia={onUploadMedia}
            searchQuery={searchQuery}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── List / Array Items Card Section with Full CRUD & Reordering ─── */
export function ArrayEditor({
  fieldKey,
  value,
  onChange,
  depth = 0,
  onUploadMedia,
  searchQuery = "",
}: {
  fieldKey: string;
  value: unknown[];
  onChange: (newVal: unknown) => void;
  depth?: number;
  onUploadMedia: () => Promise<string | null>;
  searchQuery?: string;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const label = formatFieldLabel(fieldKey);

  const handleItemChange = (index: number, newVal: unknown) => {
    const copy = [...value];
    copy[index] = newVal;
    onChange(copy);
  };

  const handleRemove = (index: number) => {
    if (!window.confirm(`Delete item #${index + 1}?`)) return;
    const copy = [...value];
    copy.splice(index, 1);
    onChange(copy);
  };

  const handleDuplicate = (index: number) => {
    const itemToClone = value[index];
    const clone = JSON.parse(JSON.stringify(itemToClone));
    if (typeof clone === "object" && clone !== null && !Array.isArray(clone)) {
      if ("title" in clone) clone.title = `${clone.title} (Copy)`;
      if ("name" in clone) clone.name = `${clone.name} (Copy)`;
      if ("id" in clone) clone.id = `${clone.id}-copy-${Date.now()}`;
      if ("slug" in clone) clone.slug = `${clone.slug}-copy-${Date.now()}`;
    }
    const copy = [...value];
    copy.splice(index + 1, 0, clone);
    onChange(copy);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const copy = [...value];
    const temp = copy[index - 1];
    copy[index - 1] = copy[index];
    copy[index] = temp;
    onChange(copy);
  };

  const handleMoveDown = (index: number) => {
    if (index === value.length - 1) return;
    const copy = [...value];
    const temp = copy[index + 1];
    copy[index + 1] = copy[index];
    copy[index] = temp;
    onChange(copy);
  };

  const handleAdd = () => {
    if (value.length > 0) {
      const template = value[0];
      if (typeof template === "object" && template !== null && !Array.isArray(template)) {
        const blank: Record<string, unknown> = {};
        for (const k of Object.keys(template as Record<string, unknown>)) {
          blank[k] = "";
        }
        // If it's an event template, initialize defaults
        if (fieldKey === "events" || "category" in (template as Record<string, unknown>)) {
          blank.slug = `activity-${Date.now()}`;
          blank.title = "New Activity Title";
          blank.category = "professional_development";
          blank.regularPrice = 4500;
          blank.discountPercent = 20;
          blank.isOfferActive = true;
          blank.currency = "PKR";
          blank.tag1 = "Professional Development";
          blank.tag2 = "Educators & Leaders";
          blank.tag3 = "Interactive Session";
        }
        onChange([...value, blank]);
      } else {
        onChange([...value, ""]);
      }
    } else {
      onChange([...value, ""]);
    }
  };

  return (
    <div className="rounded-2xl border-2 border-[#C8EFE6] bg-white shadow-2xs overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-gradient-to-r from-[#EFFBF8] via-white to-[#EFFBF8] border-b border-[#C8EFE6] flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-[#E5F7F3] transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6.5 h-6.5 rounded-lg bg-[#005696]/15 text-[#005696] flex items-center justify-center shrink-0">
            <List className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-[#102E4D] truncate">{label}</h4>
            <span className="text-[10px] text-slate-400">
              {value.length} {value.length === 1 ? "entry" : "entries"} in this list (CRUD active)
            </span>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="p-4 space-y-3.5">
          {value.map((item, index) => {
            const isObject = typeof item === "object" && item !== null && !Array.isArray(item);
            const itemObj = item as Record<string, unknown>;
            const previewTitle = isObject
              ? itemObj.title || itemObj.name || itemObj.label || itemObj.heading || `Item #${index + 1}`
              : String(item);

            // Check if this is an activity item
            const isActivity =
              fieldKey === "events" ||
              (isObject && "category" in itemObj && "slug" in itemObj);

            return (
              <div
                key={index}
                className="rounded-xl border border-slate-200 bg-[#FAFCFB] overflow-hidden group shadow-2xs hover:border-[#10B981]/50 transition-colors"
              >
                <div className="px-3.5 py-2 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-md bg-[#102E4D] text-white text-[10px] font-num font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <span className="font-bold text-xs text-[#102E4D] truncate">
                      {String(previewTitle)}
                    </span>
                    {isActivity && (itemObj.slug === "school-impact-summit-2026" || String(itemObj.slug || "").includes("summit")) && itemObj.regularPrice !== undefined && (
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                        {`PKR ${Number(itemObj.regularPrice).toLocaleString()}`}
                      </span>
                    )}
                  </div>

                  {/* CRUD Action controls on entry */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveUp(index)}
                      className="p-1 rounded-md text-slate-400 hover:text-[#102E4D] hover:bg-white disabled:opacity-30 cursor-pointer transition-colors"
                      title="Move up in list"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === value.length - 1}
                      onClick={() => handleMoveDown(index)}
                      className="p-1 rounded-md text-slate-400 hover:text-[#102E4D] hover:bg-white disabled:opacity-30 cursor-pointer transition-colors"
                      title="Move down in list"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicate(index)}
                      className="p-1 rounded-md text-slate-400 hover:text-[#005696] hover:bg-white cursor-pointer transition-colors"
                      title="Duplicate entry"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="p-1 rounded-md text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer transition-colors"
                      title="Delete this entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-3.5">
                  {isActivity ? (
                    <ActivityItemEditor
                      item={itemObj}
                      onChange={(updated) => handleItemChange(index, updated)}
                      onUploadMedia={onUploadMedia}
                      searchQuery={searchQuery}
                    />
                  ) : isObject ? (
                    <div className="space-y-3">
                      {Object.keys(itemObj).map((k) => (
                        <VisualField
                          key={k}
                          fieldKey={k}
                          value={itemObj[k]}
                          onChange={(newVal) => {
                            const copy = { ...itemObj, [k]: newVal };
                            handleItemChange(index, copy);
                          }}
                          depth={depth + 1}
                          onUploadMedia={onUploadMedia}
                          searchQuery={searchQuery}
                        />
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={String(item ?? "")}
                      onChange={(e) => handleItemChange(index, e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#C8EFE6] bg-white text-xs text-[#102E4D] focus:outline-none focus:border-[#FF7900]"
                    />
                  )}
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={handleAdd}
            className="w-full py-2.5 rounded-xl border-2 border-dashed border-[#C8EFE6] hover:border-[#FF7900] bg-[#EFFBF8]/40 hover:bg-[#EFFBF8] text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] hover:text-[#FF7900] inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Entry to List</span>
          </button>
        </div>
      )}
    </div>
  );
}

const PAGE_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  pricing: DollarSign,
  events: Calendar,
  services: Briefcase,
  summit: Calendar,
  about: Users,
  site: Globe,
  payment: CreditCard,
  forms: Sparkles,
  contact: Phone,
};

/* ─── Main CMS Page Editor Shell ─── */
interface CmsEditorShellProps {
  pageKey: CmsPageKey;
  pageLabel: string;
  pageCategory: string;
  categoryColor: string;
  iconBg: string;
  iconColor: string;
  PageIcon?: React.ComponentType<{ className?: string }>;
  livePath: string;
  hubPath?: string;
}

function CmsEditorShellInner({
  pageKey,
  pageLabel,
  pageCategory,
  categoryColor,
  iconBg,
  iconColor,
  PageIcon,
  livePath,
  hubPath = "/AD_Admin/cms",
}: CmsEditorShellProps) {
  const [currentContent, setCurrentContent] = useState<Record<string, unknown>>({});
  const [originalContent, setOriginalContent] = useState<string>("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadResolveRef = useRef<((url: string | null) => void) | null>(null);

  const loadPage = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.pages?.[pageKey]) {
          const pageData = json.pages[pageKey];
          const content = pageData.content || {};
          setCurrentContent(content);
          setOriginalContent(JSON.stringify(content));
          setIsVisible(content._visible !== false);
          setHasUnsavedChanges(false);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [pageKey]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  // Track unsaved changes
  useEffect(() => {
    if (!loading && originalContent) {
      const isDirty = JSON.stringify(currentContent) !== originalContent;
      setHasUnsavedChanges(isDirty);
    }
  }, [currentContent, originalContent, loading]);

  // Handle Ctrl+S / Cmd+S keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentContent, isVisible]);

  const handleToggleVisibility = async () => {
    const newStatus = !isVisible;
    setIsVisible(newStatus);
    const updatedContent = { ...currentContent, _visible: newStatus };
    try {
      const res = await fetch("/api/admin/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page_key: pageKey, content: updatedContent }),
      });
      if (res.ok) {
        setFeedback({
          type: "success",
          text: `"${pageLabel}" is now ${newStatus ? "LIVE on the website" : "HIDDEN from visitors"}.`,
        });
      }
    } catch {
      setIsVisible(!newStatus);
      setFeedback({ type: "error", text: "Failed to update visibility." });
    }
  };

  const handleSave = async () => {
    setFeedback(null);
    setSaving(true);
    try {
      const payloadContent = { ...currentContent, _visible: isVisible };
      const res = await fetch("/api/admin/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page_key: pageKey, content: payloadContent }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed to publish changes.");
      setCurrentContent(json.page.content);
      setOriginalContent(JSON.stringify(json.page.content));
      setHasUnsavedChanges(false);
      setFeedback({
        type: "success",
        text: `"${pageLabel}" changes published to the live website successfully!`,
      });
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to publish changes.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm(`Reset "${pageLabel}" back to original defaults?`)) return;
    setResetting(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset", page_key: pageKey }),
      });
      const json = await res.json();
      if (res.ok && json.page) {
        setCurrentContent(json.page.content);
        setOriginalContent(JSON.stringify(json.page.content));
        setIsVisible(json.page.content?._visible !== false);
        setHasUnsavedChanges(false);
        setFeedback({ type: "success", text: `"${pageLabel}" content restored to default.` });
      }
    } finally {
      setResetting(false);
    }
  };

  const handleUploadMedia = async (): Promise<string | null> => {
    return new Promise((resolve) => {
      uploadResolveRef.current = resolve;
      fileInputRef.current?.click();
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) { uploadResolveRef.current?.(null); return; }
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("purpose", "cms");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (res.ok && json.url) {
        uploadResolveRef.current?.(json.url);
        setFeedback({ type: "success", text: `Photo uploaded: ${json.url}` });
      } else {
        uploadResolveRef.current?.(null);
        setFeedback({ type: "error", text: json.error || "Upload failed." });
      }
    } catch {
      uploadResolveRef.current?.(null);
    }
    e.target.value = "";
  };

  const contentKeys = Object.keys(currentContent).filter((k) => !k.startsWith("_"));
  const ResolvedIcon = PageIcon || PAGE_ICON_MAP[pageKey] || Layers;

  return (
    <div className="space-y-5 pb-16">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* ── Top Bar: Navigation & Quick Status ── */}
      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Link
            href={hubPath}
            className="flex items-center gap-1.5 text-slate-500 hover:text-[#FF7900] font-bold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>CMS Overview Hub</span>
          </Link>
          <span>/</span>
          <span className="text-[#102E4D] font-extrabold truncate">{pageLabel}</span>
        </div>

        {hasUnsavedChanges && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 font-extrabold text-[10.5px] animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Unsaved Changes (Press Ctrl+S to Publish)</span>
          </div>
        )}
      </div>

      {/* ── Editor Panel ── */}
      <div className="rounded-3xl bg-white border-2 border-[#C8EFE6] shadow-xl overflow-hidden">
        {/* Editor header */}
        <div className="relative bg-gradient-to-r from-[#001B33] via-[#0B2540] to-[#001B33] px-5 py-5 sm:px-7">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#10B981]" />
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#FF7900]/8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Page identity */}
            <div className="flex items-center gap-3.5 min-w-0">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg} border border-white/15`}>
                <ResolvedIcon className={`w-5.5 h-5.5 ${iconColor}`} />
              </div>
              <div className="min-w-0">
                <h1 className="font-serif font-extrabold text-lg sm:text-xl text-white leading-tight truncate">
                  {pageLabel}
                </h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${categoryColor}`}>
                    {pageCategory}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Live at{" "}
                    <Link href={livePath} target="_blank" className="text-[#FF7900] hover:underline">
                      {livePath}
                    </Link>
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Visibility toggle */}
              <button
                type="button"
                onClick={handleToggleVisibility}
                className={`h-8.5 px-3 rounded-xl border font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 ${
                  isVisible
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30"
                    : "bg-white/8 border-white/15 text-slate-300 hover:bg-white/15"
                }`}
              >
                {isVisible ? (
                  <><Eye className="w-3.5 h-3.5" /><span>Live</span></>
                ) : (
                  <><EyeOff className="w-3.5 h-3.5" /><span>Hidden</span></>
                )}
              </button>

              {/* Preview */}
              <Link
                href={livePath}
                target="_blank"
                className="h-8.5 px-3 rounded-xl border border-white/15 bg-white/6 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Preview</span>
              </Link>

              {/* Reset */}
              <button
                type="button"
                onClick={handleReset}
                disabled={resetting}
                className="h-8.5 px-3 rounded-xl border border-white/15 bg-white/6 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{resetting ? "Resetting…" : "Reset"}</span>
              </button>

              {/* Publish */}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || loading}
                className={`h-8.5 px-4 rounded-xl text-white text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-60 transition-all hover:scale-102 active:scale-98 ${
                  hasUnsavedChanges
                    ? "bg-gradient-to-r from-[#FF7900] via-[#FF881A] to-[#E56D00] shadow-[#FF7900]/30 animate-pulse"
                    : "bg-gradient-to-r from-[#FF7900] to-[#E56D00]"
                }`}
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? "Publishing…" : "Publish Changes"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feedback toast */}
        {feedback && (
          <div
            className={`px-6 py-2.5 border-b flex items-center gap-2.5 text-xs font-semibold ${
              feedback.type === "success"
                ? "bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#15803D]" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            )}
            <span className="flex-1">{feedback.text}</span>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-xs font-extrabold opacity-50 hover:opacity-100 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="px-6 py-3 bg-[#F9FCFB] border-b border-[#C8EFE6] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search fields or content…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#C8EFE6] bg-white text-[#102E4D] placeholder:text-slate-400 focus:outline-none focus:border-[#FF7900]"
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

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {contentKeys.length} sections active
            </span>
            <span className="text-[10px] font-bold text-[#10B981] bg-[#DCFCE7] px-2 py-0.5 rounded-full">
              Full CRUD Enabled
            </span>
          </div>
        </div>

        {/* Visual Fields Form Body */}
        <div className="px-6 pb-6 pt-4 space-y-5">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="rounded-2xl border-2 border-[#C8EFE6] p-4 animate-pulse space-y-2">
                  <div className="h-3.5 bg-slate-200 rounded w-1/3" />
                  <div className="h-16 bg-slate-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : contentKeys.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#EFFBF8] border-2 border-[#C8EFE6] flex items-center justify-center mx-auto">
                <Layers className="w-6 h-6 text-[#FF7900]" />
              </div>
              <p className="font-bold text-sm text-[#102E4D]">No content fields found</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Click <strong>Reset</strong> above to populate this page with its default content template.
              </p>
            </div>
          ) : (
            contentKeys.map((k) => (
              <VisualField
                key={k}
                fieldKey={k}
                value={currentContent[k]}
                onChange={(newVal) => {
                  setCurrentContent((prev) => ({ ...prev, [k]: newVal }));
                }}
                depth={0}
                onUploadMedia={handleUploadMedia}
                searchQuery={searchQuery}
              />
            ))
          )}
        </div>

        {/* Footer publish bar */}
        {!loading && contentKeys.length > 0 && (
          <div className="px-6 py-4 bg-gradient-to-r from-[#EFFBF8] via-white to-[#EFFBF8] border-t border-[#C8EFE6] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-[#FF7900]" />
              <span className="font-semibold text-[#102E4D]">Professional Visual Studio:</span>
              <span>All changes publish in real time to the live site.</span>
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="h-9.5 px-6 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] hover:from-[#E56D00] hover:to-[#CC5F00] text-white text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-2 shadow-md shadow-[#FF7900]/25 cursor-pointer disabled:opacity-60 transition-all hover:scale-102 active:scale-98"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Publishing…" : "Publish All Changes"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CmsEditorShell(props: CmsEditorShellProps) {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center">
          <div className="inline-flex items-center gap-2.5 text-xs font-bold text-slate-400">
            <div className="w-4 h-4 border-2 border-[#FF7900] border-t-transparent rounded-full animate-spin" />
            Loading Content Studio…
          </div>
        </div>
      }
    >
      <CmsEditorShellInner {...props} />
    </Suspense>
  );
}

"use client";

import React, { useEffect, useState, useCallback, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Layers,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Globe,
  ExternalLink,
  ChevronRight,
  Upload,
  Eye,
  EyeOff,
  FileText,
  Settings,
  Calendar,
  DollarSign,
  CreditCard,
  MessageSquare,
  Home,
  Users,
  Briefcase,
  BookOpen,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Type,
  Image as ImageIcon,
  List,
  ToggleLeft,
  ToggleRight,
  Hash,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import type { CmsPageKey, CmsPageRecord } from "@/lib/supabase-store";

/* ─── Page Metadata with Client-Friendly Descriptions ─── */
interface PageMeta {
  key: CmsPageKey;
  label: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  livePath: string;
}

const CMS_PAGES_META: PageMeta[] = [
  {
    key: "home",
    label: "Home Page",
    category: "Main Website",
    icon: Home,
    description: "Hero headlines, impact numbers, value pillars & upcoming preview",
    livePath: "/",
  },
  {
    key: "summit",
    label: "School Impact Summit 2026",
    category: "Featured Summit",
    icon: Calendar,
    description: "Summit theme, key objectives, target roles & speaker highlights",
    livePath: "/summit",
  },
  {
    key: "services",
    label: "Services & Flagship Programs",
    category: "Core Offerings",
    icon: Briefcase,
    description: "Leader in Me, LeaderU, PD cohorts, Leadership Camps & Family Sessions",
    livePath: "/services",
  },
  {
    key: "about",
    label: "Our Story & CEO Message",
    category: "Brand & Vision",
    icon: BookOpen,
    description: "Vision, mission, four covenant promises and CEO statement",
    livePath: "/about",
  },
  {
    key: "events",
    label: "Activities & Cohorts Catalog",
    category: "Events Engine",
    icon: Calendar,
    description: "Workshops, cohorts, dates, cities, schedules and seat limits",
    livePath: "/activities",
  },
  {
    key: "pricing",
    label: "Pricing & Early Bird Rules",
    category: "Commercial Rules",
    icon: DollarSign,
    description: "Registration fees, discount percentages and countdown deadlines",
    livePath: "/apply",
  },
  {
    key: "payment",
    label: "Bank Account & QR Settings",
    category: "Finance & Accounts",
    icon: CreditCard,
    description: "UBL Bank corporate title, IBAN, account numbers & payment instructions",
    livePath: "/apply",
  },
  {
    key: "forms",
    label: "Forms Copy & Feedback",
    category: "Forms & Microcopy",
    icon: MessageSquare,
    description: "Validation messages, consent text and confirmation banners",
    livePath: "/contact",
  },
  {
    key: "site",
    label: "Site Settings & Contact Info",
    category: "Global Configuration",
    icon: Settings,
    description: "Official phone, WhatsApp numbers, email addresses and socials",
    livePath: "/",
  },
];

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
    seatLimit: "Seat Capacity Limit",
    startDate: "Start Date",
    schedule: "Daily Timing / Schedule",
    city: "City / Location",
    outcomes: "Expected Outcomes & Benefits",
    targetAudience: "Who Should Attend / Target Audience",
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
    regularPrice: "Enter the base fee in PKR without commas (e.g. 5000).",
    discountPercent: "Enter discount rate between 0 and 100 (e.g. 20 for 20% off).",
    earlyBirdDeadline: "The date after which the discount expires.",
    whatsapp: "Format: +923192091249 (with country code for direct chat).",
    iban: "Official 24-character Pakistani IBAN starting with PK.",
  };
  return helpers[key] || null;
}

/* ─── Visual Form Field Component (Zero Code Required) ─── */
function VisualField({
  fieldKey,
  value,
  onChange,
  depth = 0,
  onUploadMedia,
}: {
  fieldKey: string;
  value: unknown;
  onChange: (newVal: unknown) => void;
  depth?: number;
  onUploadMedia: () => Promise<string | null>;
}) {
  const label = formatFieldLabel(fieldKey);
  const helper = getFieldHelper(fieldKey);

  // Object editor (nested card)
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return (
      <ObjectEditor
        fieldKey={fieldKey}
        value={value as Record<string, unknown>}
        onChange={onChange}
        depth={depth}
        onUploadMedia={onUploadMedia}
      />
    );
  }

  // Array editor (list of items)
  if (Array.isArray(value)) {
    return (
      <ArrayEditor
        fieldKey={fieldKey}
        value={value}
        onChange={onChange}
        depth={depth}
        onUploadMedia={onUploadMedia}
      />
    );
  }

  // Boolean toggle switch
  if (typeof value === "boolean") {
    return (
      <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#C8EFE6] bg-[#EFFBF8]/50">
        <div>
          <span className="font-bold text-xs sm:text-sm text-[#102E4D] block">{label}</span>
          {helper && <span className="text-[11px] text-slate-500 block mt-0.5">{helper}</span>}
        </div>
        <button
          type="button"
          onClick={() => onChange(!value)}
          className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
            value ? "bg-[#16A34A]" : "bg-slate-300"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out mt-0.5 ${
              value ? "translate-x-6" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
    );
  }

  // Number input
  if (typeof value === "number") {
    return (
      <div className="space-y-1.5">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-[#102E4D]">
          {label}
        </label>
        {helper && <p className="text-[11px] text-slate-500">{helper}</p>}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#C8EFE6] bg-white font-num font-bold text-sm text-[#102E4D] focus:outline-none focus:border-[#FF7900] transition-colors"
        />
      </div>
    );
  }

  // Detect image path or URL
  const strVal = String(value ?? "");
  const isImage =
    fieldKey.toLowerCase().includes("image") ||
    fieldKey.toLowerCase().includes("logo") ||
    fieldKey.toLowerCase().includes("photo") ||
    fieldKey.toLowerCase().includes("qr") ||
    /\.(jpg|jpeg|png|webp|svg|gif)$/i.test(strVal);

  if (isImage) {
    return (
      <div className="space-y-2 p-3.5 rounded-xl border border-[#C8EFE6] bg-[#EFFBF8]/40">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-[#102E4D]">
          {label} (Photo / Image)
        </label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            value={strVal}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Image URL or /path.jpg"
            className="flex-1 px-3.5 py-2 rounded-xl border border-[#C8EFE6] bg-white text-xs text-[#102E4D] focus:outline-none focus:border-[#FF7900]"
          />
          <button
            type="button"
            onClick={async () => {
              const url = await onUploadMedia();
              if (url) onChange(url);
            }}
            className="h-9 px-3.5 rounded-xl bg-[#005696] hover:bg-[#004477] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image</span>
          </button>
        </div>
        {strVal && (
          <div className="mt-2 rounded-xl border border-[#C8EFE6] bg-white p-2 inline-block max-w-xs shadow-2xs">
            <img
              src={strVal}
              alt={label}
              className="max-h-24 w-auto rounded-lg object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
      </div>
    );
  }

  // Long text area
  const isLongText =
    strVal.length > 80 ||
    fieldKey.toLowerCase().includes("description") ||
    fieldKey.toLowerCase().includes("message") ||
    fieldKey.toLowerCase().includes("body") ||
    fieldKey.toLowerCase().includes("statement") ||
    fieldKey.toLowerCase().includes("instructions");

  if (isLongText) {
    return (
      <div className="space-y-1.5">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-[#102E4D]">
          {label}
        </label>
        {helper && <p className="text-[11px] text-slate-500">{helper}</p>}
        <textarea
          rows={3}
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#C8EFE6] bg-white text-sm text-[#102E4D] focus:outline-none focus:border-[#FF7900] leading-relaxed resize-y transition-colors"
        />
      </div>
    );
  }

  // Regular single-line text input
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-extrabold uppercase tracking-wider text-[#102E4D]">
        {label}
      </label>
      {helper && <p className="text-[11px] text-slate-500">{helper}</p>}
      <input
        type="text"
        value={strVal}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#C8EFE6] bg-white text-sm text-[#102E4D] focus:outline-none focus:border-[#FF7900] transition-colors"
      />
    </div>
  );
}

/* ─── Nested Object Card Section ─── */
function ObjectEditor({
  fieldKey,
  value,
  onChange,
  depth = 0,
  onUploadMedia,
}: {
  fieldKey: string;
  value: Record<string, unknown>;
  onChange: (newVal: unknown) => void;
  depth?: number;
  onUploadMedia: () => Promise<string | null>;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const label = formatFieldLabel(fieldKey);
  const keys = Object.keys(value).filter((k) => !k.startsWith("_"));

  return (
    <div className="rounded-2xl border-2 border-[#C8EFE6] bg-white shadow-2xs overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 bg-gradient-to-r from-[#EFFBF8] via-white to-[#EFFBF8] border-b border-[#C8EFE6] flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-[#E5F7F3] transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-[#FF7900]/15 text-[#FF7900] flex items-center justify-center shrink-0 font-bold text-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-[#102E4D] truncate">{label}</h4>
            <span className="text-[10.5px] text-slate-500">
              {keys.length} editable {keys.length === 1 ? "field" : "fields"}
            </span>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="p-5 space-y-4">
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
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── List / Array Items Card Section ─── */
function ArrayEditor({
  fieldKey,
  value,
  onChange,
  depth = 0,
  onUploadMedia,
}: {
  fieldKey: string;
  value: unknown[];
  onChange: (newVal: unknown) => void;
  depth?: number;
  onUploadMedia: () => Promise<string | null>;
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

  const handleAdd = () => {
    if (value.length > 0) {
      const template = value[0];
      if (typeof template === "object" && template !== null && !Array.isArray(template)) {
        const blank: Record<string, unknown> = {};
        for (const k of Object.keys(template as Record<string, unknown>)) {
          blank[k] = "";
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
        className="w-full px-5 py-3.5 bg-gradient-to-r from-[#EFFBF8] via-white to-[#EFFBF8] border-b border-[#C8EFE6] flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-[#E5F7F3] transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-[#005696]/15 text-[#005696] flex items-center justify-center shrink-0">
            <List className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-[#102E4D] truncate">{label}</h4>
            <span className="text-[10.5px] text-slate-500">
              {value.length} {value.length === 1 ? "entry" : "entries"} in this list
            </span>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="p-5 space-y-4">
          {value.map((item, index) => {
            const isObject = typeof item === "object" && item !== null && !Array.isArray(item);
            const itemObj = item as Record<string, unknown>;
            const previewTitle = isObject
              ? itemObj.title || itemObj.name || itemObj.label || itemObj.heading || `Item #${index + 1}`
              : String(item);

            return (
              <div
                key={index}
                className="rounded-xl border border-slate-200 bg-[#FAFCFB] overflow-hidden group shadow-2xs"
              >
                <div className="px-4 py-2.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-md bg-[#102E4D] text-white text-[10px] font-num font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <span className="font-bold text-xs text-[#102E4D] truncate">
                      {String(previewTitle)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="p-1 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer transition-colors"
                    title="Delete this entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-4">
                  {isObject ? (
                    <div className="space-y-3.5">
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
                        />
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={String(item ?? "")}
                      onChange={(e) => handleItemChange(index, e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#C8EFE6] bg-white text-sm text-[#102E4D] focus:outline-none focus:border-[#FF7900]"
                    />
                  )}
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={handleAdd}
            className="w-full py-3 rounded-xl border-2 border-dashed border-[#C8EFE6] hover:border-[#FF7900] bg-[#EFFBF8]/40 hover:bg-[#EFFBF8] text-xs font-extrabold uppercase tracking-wider text-[#102E4D] hover:text-[#FF7900] inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Another Entry</span>
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Main Website CMS Portal ─── */
function AdminCmsPageInner() {
  const searchParams = useSearchParams();
  const urlPage = searchParams?.get("page") as CmsPageKey | null;

  const [selectedKey, setSelectedKey] = useState<CmsPageKey>(
    urlPage && CMS_PAGES_META.some((m) => m.key === urlPage) ? urlPage : "home"
  );
  const [pages, setPages] = useState<Record<string, CmsPageRecord>>({});
  const [currentContent, setCurrentContent] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Sync selectedKey if URL query parameter changes
  useEffect(() => {
    if (urlPage && CMS_PAGES_META.some((m) => m.key === urlPage)) {
      setSelectedKey(urlPage);
    }
  }, [urlPage]);

  // Page display/visibility state: true = visible on site, false = hidden
  const [pageVisibility, setPageVisibility] = useState<Record<string, boolean>>({});

  // Hidden file input for one-click media uploads
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadResolveRef = useRef<((url: string | null) => void) | null>(null);

  const loadCmsPages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.pages) {
          setPages(json.pages);
          const current = json.pages[selectedKey];
          if (current) {
            setCurrentContent(current.content || {});
          }

          // Read page visibility
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
  }, [selectedKey]);

  useEffect(() => {
    loadCmsPages();
  }, [loadCmsPages]);

  const handleSelectPage = (key: CmsPageKey) => {
    setSelectedKey(key);
    setFeedback(null);
    const target = pages[key];
    if (target) {
      setCurrentContent(target.content || {});
    } else {
      setCurrentContent({});
    }
  };

  const handleToggleVisibility = async (key: CmsPageKey) => {
    const newStatus = !(pageVisibility[key] !== false);
    setPageVisibility((prev) => ({ ...prev, [key]: newStatus }));

    // Persist visibility in page content
    const targetPage = pages[key];
    const updatedContent = { ...(targetPage?.content || {}), _visible: newStatus };

    try {
      await fetch("/api/admin/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page_key: key,
          content: updatedContent,
        }),
      });
      setFeedback({
        type: "success",
        text: `Page "${CMS_PAGES_META.find((m) => m.key === key)?.label}" is now ${
          newStatus ? "LIVE on website" : "HIDDEN from website"
        }.`,
      });
    } catch {
      // Revert on failure
      setPageVisibility((prev) => ({ ...prev, [key]: !newStatus }));
    }
  };

  const handleSave = async () => {
    setFeedback(null);
    setSaving(true);
    try {
      const payloadContent = {
        ...currentContent,
        _visible: pageVisibility[selectedKey] !== false,
      };

      const res = await fetch("/api/admin/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page_key: selectedKey,
          content: payloadContent,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Failed to publish changes.");
      }

      setPages((prev) => ({ ...prev, [selectedKey]: json.page }));
      setCurrentContent(json.page.content);
      setFeedback({
        type: "success",
        text: `Changes to "${
          CMS_PAGES_META.find((m) => m.key === selectedKey)?.label
        }" have been published to the live website!`,
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
    const meta = CMS_PAGES_META.find((m) => m.key === selectedKey);
    if (!window.confirm(`Reset "${meta?.label}" back to original defaults?`)) {
      return;
    }

    setResetting(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset",
          page_key: selectedKey,
        }),
      });

      const json = await res.json();
      if (res.ok && json.page) {
        setPages((prev) => ({ ...prev, [selectedKey]: json.page }));
        setCurrentContent(json.page.content);
        setFeedback({
          type: "success",
          text: `"${meta?.label}" content restored to default.`,
        });
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
        setFeedback({
          type: "success",
          text: `Photo uploaded successfully: ${json.url}`,
        });
      } else {
        uploadResolveRef.current?.(null);
        setFeedback({
          type: "error",
          text: json.error || "Upload failed.",
        });
      }
    } catch {
      uploadResolveRef.current?.(null);
    }
    e.target.value = "";
  };

  const currentMeta =
    CMS_PAGES_META.find((m) => m.key === selectedKey) || CMS_PAGES_META[0];
  const currentPageRecord = pages[selectedKey];
  const isCurrentPageVisible = pageVisibility[selectedKey] !== false;
  const contentKeys = Object.keys(currentContent).filter((k) => !k.startsWith("_"));

  return (
    <div className="space-y-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Client Friendly Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#001B33] via-[#0B2540] to-[#001B33] text-white p-6 sm:p-7 shadow-xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#10B981]" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-extrabold uppercase tracking-wider text-[#FFC400] mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Easy Visual Website Editor (No Coding Required)
            </div>
            <h2 className="font-serif font-extrabold text-2xl sm:text-3xl text-white">
              Website Content &amp; Page Management
            </h2>
            <p className="text-xs sm:text-sm text-[#D7F5EF] max-w-2xl mt-1 leading-relaxed">
              Click any page below to edit its headings, text, photos, and settings.
              You can also choose which pages are displayed on your live website.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href={currentMeta.livePath}
              target="_blank"
              className="h-10 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white text-xs font-extrabold inline-flex items-center gap-2 transition-all shadow-sm"
            >
              <Eye className="w-4 h-4 text-[#FFC400]" />
              <span>Preview Live Page</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main CMS Layout: Pages Sidebar + Visual Form Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Pages List & Display Visibility Toggles */}
        <div className="lg:col-span-4 rounded-2xl bg-white border-2 border-[#C8EFE6] shadow-2xs overflow-hidden">
          <div className="px-5 py-4 bg-[#EFFBF8] border-b border-[#C8EFE6] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#FF7900]" />
              <span className="font-serif font-bold text-sm text-[#102E4D]">
                Website Pages ({CMS_PAGES_META.length})
              </span>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Display Status
            </span>
          </div>

          <div className="p-2 space-y-1">
            {CMS_PAGES_META.map((meta) => {
              const active = selectedKey === meta.key;
              const MetaIcon = meta.icon;
              const isVisible = pageVisibility[meta.key] !== false;

              return (
                <div
                  key={meta.key}
                  className={`rounded-xl transition-all flex items-center justify-between p-2.5 gap-2 cursor-pointer ${
                    active
                      ? "bg-gradient-to-r from-[#102E4D] to-[#001B33] text-white shadow-md"
                      : "hover:bg-[#EFFBF8] text-[#102E4D]"
                  }`}
                  onClick={() => handleSelectPage(meta.key)}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        active
                          ? "bg-white/15 text-[#FFC400]"
                          : "bg-[#EFFBF8] text-[#FF7900] border border-[#C8EFE6]"
                      }`}
                    >
                      <MetaIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs truncate">
                        {meta.label}
                      </div>
                      <div
                        className={`text-[10.5px] truncate ${
                          active ? "text-slate-300" : "text-slate-500"
                        }`}
                      >
                        {meta.description}
                      </div>
                    </div>
                  </div>

                  {/* Page Display Status Toggle Pill */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleVisibility(meta.key);
                    }}
                    className={`px-2 py-1 rounded-lg text-[9.5px] font-extrabold uppercase shrink-0 transition-colors flex items-center gap-1 ${
                      isVisible
                        ? active
                          ? "bg-[#34D399]/25 text-[#34D399]"
                          : "bg-[#DCFCE7] text-[#15803D]"
                        : active
                        ? "bg-amber-400/20 text-amber-300"
                        : "bg-slate-100 text-slate-500"
                    }`}
                    title={
                      isVisible
                        ? "Visible on live site (click to hide)"
                        : "Hidden from site (click to display)"
                    }
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isVisible ? "bg-emerald-400" : "bg-slate-400"
                      }`}
                    />
                    <span>{isVisible ? "Live" : "Hidden"}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Visual Content Form Editor */}
        <div className="lg:col-span-8 rounded-2xl bg-white border-2 border-[#C8EFE6] shadow-2xs overflow-hidden flex flex-col">
          {/* Editor Header Bar */}
          <div className="px-6 py-4 bg-gradient-to-r from-[#EFFBF8] via-white to-[#EFFBF8] border-b border-[#C8EFE6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#001B33] text-[#FFC400] flex items-center justify-center shrink-0">
                  {React.createElement(currentMeta.icon, {
                    className: "w-4 h-4",
                  })}
                </div>
                <div>
                  <h3 className="font-serif font-extrabold text-lg text-[#102E4D]">
                    {currentMeta.label}
                  </h3>
                  <div className="text-[11px] text-slate-500">
                    Category: <strong>{currentMeta.category}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Page Visibility Toggle Switch + Publish Button */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Live Display Switch */}
              <button
                type="button"
                onClick={() => handleToggleVisibility(selectedKey)}
                className={`h-9 px-3.5 rounded-xl border font-bold text-xs inline-flex items-center gap-2 cursor-pointer transition-colors ${
                  isCurrentPageVisible
                    ? "bg-[#DCFCE7] border-[#86EFAC] text-[#15803D]"
                    : "bg-slate-100 border-slate-300 text-slate-600"
                }`}
                title="Toggle whether this page is visible to visitors"
              >
                {isCurrentPageVisible ? (
                  <>
                    <Eye className="w-3.5 h-3.5 text-[#15803D]" />
                    <span>Page is Live</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                    <span>Page is Hidden</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={resetting}
                className="h-9 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Restore default content template"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving || loading}
                className="h-9 px-5 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] hover:from-[#E56D00] hover:to-[#CC5F00] text-white text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-60 transition-all hover:scale-102 active:scale-98"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Publishing…" : "Publish Changes"}</span>
              </button>
            </div>
          </div>

          {/* Feedback Alert Notification */}
          {feedback && (
            <div
              className={`px-6 py-3 border-b text-xs font-bold flex items-center gap-2.5 ${
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
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Visual Fields Form Body */}
          <div className="p-6 space-y-6">
            {loading ? (
              <div className="p-12 text-center text-xs font-bold text-slate-400 animate-pulse">
                Loading page content fields…
              </div>
            ) : contentKeys.length === 0 ? (
              <div className="p-12 text-center space-y-2 text-slate-500">
                <Layers className="w-8 h-8 text-[#FF7900] mx-auto" />
                <p className="font-bold text-sm">No content fields found</p>
                <p className="text-xs">
                  Click Reset above to populate with the standard page template.
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
                />
              ))
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-6 py-4 bg-[#F8FCFB] border-t border-[#C8EFE6] flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-semibold text-[#102E4D]">
              <Sparkles className="w-3.5 h-3.5 text-[#FF7900]" />
              Visual editor mode active. All edits are verified before publishing.
            </span>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="font-extrabold text-[#FF7900] hover:text-[#102E4D] cursor-pointer"
            >
              {saving ? "Saving…" : "Save Changes →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminCmsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs font-bold text-slate-400">
          Loading Website CMS Portal…
        </div>
      }
    >
      <AdminCmsPageInner />
    </Suspense>
  );
}

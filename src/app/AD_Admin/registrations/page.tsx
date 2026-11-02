"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  Suspense,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Download,
  Printer,
  RefreshCw,
  Plus,
  X,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  CalendarCheck2,
  Image as ImageIcon,
  UploadCloud,
  ExternalLink,
  ZoomIn,
  Save,
  Mail,
  Phone,
  Loader2,
  Building2,
  User,
  Tag,
  Copy,
  Check,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  LayoutGrid,
  List,
  CheckCheck,
  UserPlus,
  Layers,
  Lock,
  Unlock,
  AlertCircle,
  Eye,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import type { LeadershipEvent } from "@/content/events";
import {
  downloadOfficialReceipt,
  printOfficialReceipt,
  type ReceiptPayload,
} from "@/lib/receipt";
import type {
  ActivityRegistrationRecord,
  BookingModeType,
  VerificationStatus,
} from "@/lib/supabase-store";

const AVATAR_COLORS = [
  "bg-amber-100 text-amber-800 border-amber-300",
  "bg-emerald-100 text-emerald-800 border-emerald-300",
  "bg-sky-100 text-sky-800 border-sky-300",
  "bg-violet-100 text-violet-800 border-violet-300",
  "bg-rose-100 text-rose-800 border-rose-300",
  "bg-teal-100 text-teal-800 border-teal-300",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "TL";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getRelativeTimeString(dateStr: string): string {
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return "Just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

const QUICK_REG_SUGGESTIONS = [
  {
    icon: CreditCard,
    label: "Verified in UBL",
    appendNote: "• Payment verified against UBL account statement",
    color: "text-emerald-800 bg-emerald-50/80 border-emerald-200 hover:bg-emerald-100",
    iconBg: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: FaWhatsapp,
    label: "Receipt WhatsApped",
    appendNote: "• Official branded voucher & receipt sent via WhatsApp",
    color: "text-teal-800 bg-teal-50/80 border-teal-200 hover:bg-teal-100",
    iconBg: "bg-teal-100 text-teal-600",
  },
  {
    icon: Phone,
    label: "Spoke on Phone",
    appendNote: "• Spoke with participant to re-confirm schedule & venue",
    color: "text-blue-700 bg-blue-50/80 border-blue-200 hover:bg-blue-100",
    iconBg: "bg-blue-100 text-blue-600",
  },
  {
    icon: ShieldCheck,
    label: "Seat Confirmed",
    appendNote: "• Confirmed participant seat allocation for session cohort",
    color: "text-amber-800 bg-amber-50/80 border-amber-200 hover:bg-amber-100",
    iconBg: "bg-amber-100 text-amber-600",
  },
];

function RegistrationsCrmInner() {
  const searchParams = useSearchParams();
  const initialActivityParam = searchParams?.get("activity") || "all";

  const [registrations, setRegistrations] = useState<ActivityRegistrationRecord[]>([]);
  const [activities, setActivities] = useState<LeadershipEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Views
  const [activeActivityTab, setActiveActivityTab] = useState<string>(initialActivityParam);
  const [bookingFilter, setBookingFilter] = useState<"all" | BookingModeType>("all");
  const [verificationFilter, setVerificationFilter] = useState<"all" | VerificationStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Inspector Modal State
  const [selected, setSelected] = useState<ActivityRegistrationRecord | null>(null);
  const [editMode, setEditMode] = useState<BookingModeType>("reserve_later");
  const [editVerification, setEditVerification] = useState<VerificationStatus>("pending_callback");
  const [editTransactionRef, setEditTransactionRef] = useState("");
  const [editFeeLabel, setEditFeeLabel] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isStatusUnlocked, setIsStatusUnlocked] = useState(false);

  // Fullscreen Screenshot Lightbox
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Manual Add Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newReg, setNewReg] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "",
    organization: "",
    activity_slug: "school-impact-summit-2026",
    booking_mode: "reserve_later" as BookingModeType,
    transaction_ref: "",
    verification_status: "pending_callback" as VerificationStatus,
    fee_label: "",
    message: "",
  });

  // Restore saved view mode preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tlc_registrations_crm_view_mode");
      if (saved === "grid" || saved === "list") {
        setViewMode(saved);
      }
    }
  }, []);

  const handleSetViewMode = (mode: "grid" | "list") => {
    setViewMode(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("tlc_registrations_crm_view_mode", mode);
    }
  };

  useEffect(() => {
    if (initialActivityParam) {
      setActiveActivityTab(initialActivityParam);
    }
  }, [initialActivityParam]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/registrations", {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        setRegistrations(Array.isArray(json.registrations) ? json.registrations : []);
        setActivities(Array.isArray(json.activities) ? json.activities : []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Build dynamic Activity Tabs from CMS events + any custom slugs in DB
  const activityTabs = useMemo(() => {
    const map = new Map<string, { slug: string; title: string; count: number }>();
    for (const act of activities) {
      map.set(act.slug, { slug: act.slug, title: act.title, count: 0 });
    }
    for (const r of registrations) {
      const cur = map.get(r.activity_slug) || {
        slug: r.activity_slug,
        title: r.activity_title,
        count: 0,
      };
      cur.count += 1;
      map.set(r.activity_slug, cur);
    }
    return Array.from(map.values());
  }, [activities, registrations]);

  const tabFilteredByActivity = useMemo(() => {
    if (activeActivityTab === "all") return registrations;
    return registrations.filter((r) => r.activity_slug === activeActivityTab);
  }, [registrations, activeActivityTab]);

  // Executive KPI Metric Counts
  const kpiStats = useMemo(() => {
    const list = tabFilteredByActivity;
    return {
      total: list.length,
      confirmed: list.filter(
        (r) => r.verification_status === "verified_confirmed"
      ).length,
      adminReview: list.filter(
        (r) =>
          r.verification_status === "awaiting_verification" ||
          (Boolean(r.screenshot_url) &&
            r.verification_status !== "verified_confirmed" &&
            r.verification_status !== "cancelled")
      ).length,
      pendingCallback: list.filter(
        (r) =>
          r.verification_status === "pending_callback" ||
          (!r.screenshot_url &&
            r.booking_mode === "reserve_later" &&
            r.verification_status !== "verified_confirmed" &&
            r.verification_status !== "cancelled")
      ).length,
      cancelled: list.filter(
        (r) => r.verification_status === "cancelled"
      ).length,
    };
  }, [tabFilteredByActivity]);

  const filteredRegistrations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const result = tabFilteredByActivity.filter((r) => {
      if (bookingFilter !== "all" && r.booking_mode !== bookingFilter) {
        return false;
      }
      if (
        verificationFilter !== "all" &&
        r.verification_status !== verificationFilter
      ) {
        return false;
      }
      if (!q) return true;
      return (
        r.full_name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q) ||
        r.organization.toLowerCase().includes(q) ||
        r.reference_code.toLowerCase().includes(q) ||
        r.transaction_ref.toLowerCase().includes(q) ||
        r.activity_title.toLowerCase().includes(q)
      );
    });

    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === "name") {
        return a.full_name.localeCompare(b.full_name);
      }
      return 0;
    });

    return result;
  }, [tabFilteredByActivity, bookingFilter, verificationFilter, searchQuery, sortBy]);

  const openInspector = (reg: ActivityRegistrationRecord) => {
    setSelected(reg);
    setEditMode(reg.booking_mode);
    setEditVerification(reg.verification_status);
    setEditTransactionRef(reg.transaction_ref || "");
    setEditFeeLabel(reg.fee_label || "");
    setEditNotes(reg.admin_notes || "");
    setIsStatusUnlocked(false);
    setFeedback(null);
  };

  const copyToClipboard = (text: string, key: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const toReceiptPayload = (reg: ActivityRegistrationRecord): ReceiptPayload => {
    const matchedAct = activities.find((a) => a.slug === reg.activity_slug);
    return {
      referenceId: reg.reference_code,
      issuedAt: new Date(reg.created_at).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      fullName: reg.full_name,
      email: reg.email,
      phone: reg.phone,
      role: reg.role,
      activityTitle: reg.activity_title,
      activityCategory: reg.activity_category || "Leadership Program",
      activityDate: reg.activity_date || "2026 Schedule",
      activitySchedule: matchedAct?.schedule || "Full Day PKT",
      activityCity: reg.activity_city || matchedAct?.city || "Islamabad",
      isSecured: reg.booking_mode === "secure_seat",
      feeLabel: reg.fee_label || undefined,
      paymentMethodName: "United Bank Limited (UBL)",
      transactionRef: reg.transaction_ref || undefined,
      screenshotName: reg.screenshot_name || undefined,
      screenshotPreviewUrl: reg.screenshot_url || null,
    };
  };

  const handleSaveRecord = async (
    overridePatch?: Partial<ActivityRegistrationRecord>
  ) => {
    if (!selected) return;
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/registrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selected.id,
          booking_mode: overridePatch?.booking_mode ?? editMode,
          verification_status:
            overridePatch?.verification_status ?? editVerification,
          transaction_ref: overridePatch?.transaction_ref ?? editTransactionRef,
          fee_label: overridePatch?.fee_label ?? editFeeLabel,
          admin_notes: overridePatch?.admin_notes ?? editNotes,
          ...(overridePatch?.screenshot_url !== undefined
            ? {
                screenshot_url: overridePatch.screenshot_url,
                screenshot_public_id: overridePatch.screenshot_public_id,
                screenshot_name: overridePatch.screenshot_name,
              }
            : {}),
        }),
      });
      const json = await res.json();
      if (res.ok && json.registration) {
        const updated: ActivityRegistrationRecord = json.registration;
        setRegistrations((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
        setSelected(updated);
        setEditMode(updated.booking_mode);
        setEditVerification(updated.verification_status);
        setFeedback("Registration CRM record updated successfully!");
        setTimeout(() => setFeedback(null), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAdminProofUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !selected) return;
    setUploadingProof(true);
    setFeedback(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("purpose", "screenshot");
      if (selected?.activity_slug) {
        fd.append("activity_slug", selected.activity_slug);
      }
      const upRes = await fetch("/api/upload", { method: "POST", body: fd });
      const upJson = await upRes.json();
      if (upRes.ok && upJson.url) {
        await handleSaveRecord({
          booking_mode: "secure_seat",
          verification_status: "verified_confirmed",
          screenshot_url: upJson.url,
          screenshot_public_id: upJson.publicId || "",
          screenshot_name: file.name,
        });
        setFeedback("Payment screenshot uploaded & seat marked Verified!");
      }
    } finally {
      setUploadingProof(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Permanently delete this registration record and its stored screenshot? This cannot be undone."
      )
    ) {
      return;
    }
    const res = await fetch(
      `/api/admin/registrations?id=${encodeURIComponent(id)}`,
      { method: "DELETE" }
    );
    if (res.ok) {
      setRegistrations((prev) => prev.filter((r) => r.id !== id));
      if (selected?.id === id) setSelected(null);
    }
  };

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReg.full_name.trim() || !newReg.email.trim() || !newReg.phone.trim()) {
      alert("Full Name, Email, and Phone are required.");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReg),
      });
      const json = await res.json();
      if (res.ok && json.registration) {
        setRegistrations((prev) => [json.registration, ...prev]);
        setAddModalOpen(false);
        setNewReg({
          full_name: "",
          email: "",
          phone: "",
          role: "",
          organization: "",
          activity_slug:
            activeActivityTab !== "all"
              ? activeActivityTab
              : "school-impact-summit-2026",
          booking_mode: "reserve_later",
          transaction_ref: "",
          verification_status: "pending_callback",
          fee_label: "",
          message: "",
        });
        openInspector(json.registration);
      } else {
        alert(json.error || "Failed to create registration.");
      }
    } finally {
      setCreating(false);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      "Booking Ref",
      "Participant Name",
      "Email",
      "Phone",
      "Role",
      "Organization",
      "Activity",
      "Booking Mode",
      "Verification Status",
      "Fee",
      "Transaction Ref",
      "Screenshot URL",
      "Admin Notes",
      "Created At",
    ];
    const rows = filteredRegistrations.map((r) => [
      r.reference_code,
      r.full_name,
      r.email,
      r.phone,
      r.role,
      r.organization,
      r.activity_title,
      r.booking_mode === "secure_seat"
        ? "Secured Seat (UBL Paid)"
        : "Provisional Reservation (Pay Later)",
      r.verification_status,
      r.fee_label,
      r.transaction_ref,
      r.screenshot_url,
      (r.admin_notes || "").replace(/\r?\n/g, " "),
      r.created_at,
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `TLC-Registrations-${activeActivityTab}-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Colorful & Distinct Verification Badges with Locked State
  const verificationBadge = (status: VerificationStatus) => {
    switch (status) {
      case "verified_confirmed":
        return {
          cls: "bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold shadow-2xs",
          dot: "bg-emerald-500",
          label: "Confirmed",
          isLocked: true,
        };
      case "awaiting_verification":
        return {
          cls: "bg-sky-50 text-sky-800 border-sky-300 font-extrabold shadow-2xs",
          dot: "bg-sky-500",
          label: "Admin Review",
          isLocked: false,
        };
      case "pending_callback":
        return {
          cls: "bg-amber-50 text-amber-900 border-amber-300 font-bold shadow-2xs",
          dot: "bg-amber-500",
          label: "Pending Callback",
          isLocked: false,
        };
      case "cancelled":
        return {
          cls: "bg-rose-50 text-rose-800 border-rose-300 font-bold",
          dot: "bg-rose-500",
          label: "Cancelled",
          isLocked: true,
        };
      case "waitlisted":
      default:
        return {
          cls: "bg-amber-50 text-amber-900 border-amber-300 font-bold shadow-2xs",
          dot: "bg-amber-500",
          label: "Pending Callback",
          isLocked: false,
        };
    }
  };

  // Colorful & Distinct Activity Cohort Themes for filter tabs
  const getActivityTabTheme = (slug: string, index: number = 0) => {
    const s = slug.toLowerCase();
    if (s.includes("summit") || s.includes("impact")) {
      return {
        active: "bg-gradient-to-r from-[#FF7900] to-[#FF9E3B] text-white shadow-sm shadow-orange-500/25 border-transparent",
        inactive: "bg-orange-50/70 hover:bg-orange-100/90 text-orange-950 border-orange-200/90",
        dot: "bg-[#FF7900]",
        badgeActive: "bg-white/25 text-white",
        badgeInactive: "bg-orange-200/90 text-orange-900 font-extrabold",
      };
    }
    if (s.includes("7-habits") || s.includes("habits") || s.includes("teen")) {
      return {
        active: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-600/25 border-transparent",
        inactive: "bg-emerald-50/70 hover:bg-emerald-100/90 text-emerald-950 border-emerald-200/90",
        dot: "bg-emerald-500",
        badgeActive: "bg-white/25 text-white",
        badgeInactive: "bg-emerald-200/90 text-emerald-900 font-extrabold",
      };
    }
    if (s.includes("4-disciplines") || s.includes("4dx") || s.includes("execution")) {
      return {
        active: "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm shadow-amber-500/25 border-transparent",
        inactive: "bg-amber-50/70 hover:bg-amber-100/90 text-amber-950 border-amber-200/90",
        dot: "bg-amber-500",
        badgeActive: "bg-white/25 text-white",
        badgeInactive: "bg-amber-200/90 text-amber-900 font-extrabold",
      };
    }
    if (s.includes("swat") || s.includes("camp") || s.includes("bootcamp")) {
      return {
        active: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm shadow-purple-600/25 border-transparent",
        inactive: "bg-purple-50/70 hover:bg-purple-100/90 text-purple-950 border-purple-200/90",
        dot: "bg-purple-500",
        badgeActive: "bg-white/25 text-white",
        badgeInactive: "bg-purple-200/90 text-purple-900 font-extrabold",
      };
    }

    // Default colorful rotating palette
    const palettes = [
      {
        active: "bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-sm shadow-sky-600/25 border-transparent",
        inactive: "bg-sky-50/70 hover:bg-sky-100/90 text-sky-950 border-sky-200/90",
        dot: "bg-sky-500",
        badgeActive: "bg-white/25 text-white",
        badgeInactive: "bg-sky-200/90 text-sky-900 font-extrabold",
      },
      {
        active: "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-sm shadow-rose-600/25 border-transparent",
        inactive: "bg-rose-50/70 hover:bg-rose-100/90 text-rose-950 border-rose-200/90",
        dot: "bg-rose-500",
        badgeActive: "bg-white/25 text-white",
        badgeInactive: "bg-rose-200/90 text-rose-900 font-extrabold",
      },
      {
        active: "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-sm shadow-teal-600/25 border-transparent",
        inactive: "bg-teal-50/70 hover:bg-teal-100/90 text-teal-950 border-teal-200/90",
        dot: "bg-teal-500",
        badgeActive: "bg-white/25 text-white",
        badgeInactive: "bg-teal-200/90 text-teal-900 font-extrabold",
      },
    ];
    return palettes[index % palettes.length];
  };

  // Colorful & Distinct Booking Mode Styles (Compact & Streamlined)
  const bookingModeStyles = (mode: BookingModeType) => {
    if (mode === "secure_seat") {
      return {
        pill: "bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold shadow-2xs",
        dot: "bg-emerald-500",
        label: "Confirmed Seated",
        shortLabel: "Confirmed Seated",
        borderTop: "from-emerald-400 via-emerald-500 to-teal-500",
      };
    }
    return {
      pill: "bg-amber-50 text-amber-900 border-amber-300 font-extrabold shadow-2xs",
      dot: "bg-amber-500",
      label: "Reservation",
      shortLabel: "Reservation",
      borderTop: "from-amber-400 via-orange-400 to-amber-500",
    };
  };

  return (
    <div className="space-y-4">
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1. TOP HEADER & METRIC KPI STRIP (Cohesive, Sleek, Executive)      */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Brand Accent Top Stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#10B981]" />

        <div className="p-4 sm:p-5 space-y-3.5">
          {/* Header Title Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-extrabold text-xl sm:text-2xl text-[#102E4D] tracking-tight">
                  Activity Registrations CRM
                </h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-[#FF7900] border border-orange-200/80">
                  {registrations.length} Total Enrolled
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Track program enrollments, verify UBL payment proofs, issue official branded receipts, and manage seat allocations.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setAddModalOpen(true)}
                className="h-9 px-3.5 rounded-xl bg-[#FF7900] hover:bg-[#E56D00] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Registration</span>
              </button>

              <button
                type="button"
                onClick={handleExportCsv}
                disabled={filteredRegistrations.length === 0}
                className="h-9 px-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                title="Export filtered records to CSV"
              >
                <Download className="w-3.5 h-3.5 text-[#FF7900]" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={loadData}
                className="h-9 px-3 rounded-xl bg-[#102E4D] hover:bg-[#001B33] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Refresh Records"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#FFC400] ${loading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Sleek Horizontal KPI Metric Ribbon (Zero Bloat, High-Contrast Colors) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-100">
            {/* Total Enrolled */}
            <div className="rounded-xl p-2.5 bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total</span>
                <span className="font-num font-extrabold text-base text-[#102E4D] leading-none">{kpiStats.total}</span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-[#102E4D] text-white flex items-center justify-center">
                <User className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Confirmed (Locked) */}
            <div className="rounded-xl p-2.5 bg-emerald-50/80 border border-emerald-200/90 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">Confirmed</span>
                <span className="font-num font-extrabold text-base text-emerald-900 leading-none">{kpiStats.confirmed}</span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            {/* Admin Review (Screenshot Proof Uploaded) */}
            <div className="rounded-xl p-2.5 bg-sky-50/80 border border-sky-200/90 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-sky-800 block">Admin Review</span>
                <span className="font-num font-extrabold text-base text-sky-800 leading-none">{kpiStats.adminReview}</span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center">
                <ImageIcon className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Pending Callback (Reservations) */}
            <div className="rounded-xl p-2.5 bg-amber-50/80 border border-amber-200/90 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-900 block">Pending Callback</span>
                <span className="font-num font-extrabold text-base text-amber-900 leading-none">{kpiStats.pendingCallback}</span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                <Phone className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Cancelled (Locked) */}
            <div className="rounded-xl p-2.5 bg-rose-50/80 border border-rose-200/90 flex items-center justify-between col-span-2 sm:col-span-1">
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-900 block">Cancelled</span>
                <span className="font-num font-extrabold text-base text-rose-900 leading-none">{kpiStats.cancelled}</span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center">
                <Lock className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 2. ACTIVITY / COHORT TABS (Vibrant, Colorful, Sleek & Compact)     */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-3 shadow-2xs">
        <div className="flex items-center justify-between gap-2 mb-2 px-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Layers className="w-3.5 h-3.5 text-[#FF7900]" />
            <span>Filter by Activity / Cohort</span>
            <span className="text-[11px] text-slate-400 font-medium">
              ({activityTabs.length + 1} views)
            </span>
          </div>
          {activeActivityTab !== "all" && (
            <button
              type="button"
              onClick={() => setActiveActivityTab("all")}
              className="text-[11px] font-bold text-[#FF7900] hover:text-[#e06b00] cursor-pointer inline-flex items-center gap-1 transition-colors"
            >
              <span>Show All Activities</span>
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 [scrollbar-width:thin] [scrollbar-color:#FF7900_#f1f5f9] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-slate-100/80 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gradient-to-r [&::-webkit-scrollbar-thumb]:from-[#FF7900] [&::-webkit-scrollbar-thumb]:to-[#005696] [&::-webkit-scrollbar-thumb]:rounded-full">
          {/* All Activities Tab */}
          <button
            type="button"
            onClick={() => setActiveActivityTab("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap inline-flex items-center gap-2 transition-all cursor-pointer border ${
              activeActivityTab === "all"
                ? "bg-gradient-to-r from-[#102E4D] to-[#005696] text-white border-transparent shadow-xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                activeActivityTab === "all" ? "bg-sky-400" : "bg-slate-400"
              }`}
            />
            <span>All Activities</span>
            <span
              className={`font-num px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeActivityTab === "all"
                  ? "bg-white/20 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {registrations.length}
            </span>
          </button>

          {/* Dynamic Activity Cohort Tabs with Vibrant Themes */}
          {activityTabs.map((tab, idx) => {
            const active = activeActivityTab === tab.slug;
            const theme = getActivityTabTheme(tab.slug, idx);
            return (
              <button
                key={tab.slug}
                type="button"
                onClick={() => setActiveActivityTab(tab.slug)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap inline-flex items-center gap-2 transition-all cursor-pointer border ${
                  active ? theme.active : theme.inactive
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    active ? "bg-white" : theme.dot
                  }`}
                />
                <span className="max-w-[210px] truncate">{tab.title}</span>
                <span
                  className={`font-num px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    active ? theme.badgeActive : theme.badgeInactive
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 3. UNIFIED SINGLE-ROW TOOLBAR: Filter Tabs + Search + View Mode    */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-3 bg-slate-50/60 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2.5">
          {/* Left: Booking Mode Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setBookingFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                bookingFilter === "all"
                  ? "bg-[#102E4D] text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              All ({kpiStats.total})
            </button>

            <button
              type="button"
              onClick={() => setBookingFilter("secure_seat")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                bookingFilter === "secure_seat"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Confirmed ({kpiStats.confirmed})</span>
            </button>

            <button
              type="button"
              onClick={() => setBookingFilter("reserve_later")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                bookingFilter === "reserve_later"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200"
              }`}
            >
              <CalendarCheck2 className="w-3.5 h-3.5" />
              <span>Reservations ({kpiStats.pendingCallback})</span>
            </button>
          </div>

          {/* Right: Search + Verification Dropdown + View Toggle */}
          <div className="flex flex-wrap items-center gap-2 ml-auto">
            {/* Search Input */}
            <div className="relative w-48 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search participant, ref, TID…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-[#102E4D] focus:outline-none placeholder:text-slate-400 font-medium transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Verification Dropdown Filter */}
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value as "all" | VerificationStatus)}
              className="py-1.5 px-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:border-[#102E4D] cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="awaiting_verification">Admin Review</option>
              <option value="pending_callback">Pending Callback</option>
              <option value="verified_confirmed">Confirmed (Locked)</option>
              <option value="cancelled">Cancelled (Locked)</option>
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "name")}
              className="py-1.5 px-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:border-[#102E4D] cursor-pointer hidden md:block"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Participant Name</option>
            </select>

            {/* View Mode Toggle: Grid Cards vs Table List - Icon Only */}
            <div className="inline-flex h-8 p-0.5 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => handleSetViewMode("grid")}
                className={`h-full w-7 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white text-[#FF7900] shadow-2xs"
                    : "text-slate-400 hover:text-slate-700"
                }`}
                title="Card Grid View"
                aria-label="Card Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleSetViewMode("list")}
                className={`h-full w-7 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white text-[#005696] shadow-2xs"
                    : "text-slate-400 hover:text-slate-700"
                }`}
                title="Table List View"
                aria-label="Table List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        {loading && registrations.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <RefreshCw className="w-6 h-6 text-[#FF7900] animate-spin mx-auto" />
            <div className="font-bold text-xs text-slate-700">Loading Activity Registrations…</div>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CalendarCheck2 className="w-7 h-7 text-[#FF7900] mx-auto" />
            <div className="font-bold text-sm text-[#102E4D]">No registration records found</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || bookingFilter !== "all" || verificationFilter !== "all"
                ? "No participants matched your current search filters."
                : "No registrations recorded for this activity yet. Click 'Add Registration' to create one."}
            </p>
            {(searchQuery || bookingFilter !== "all" || verificationFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setBookingFilter("all");
                  setVerificationFilter("all");
                }}
                className="mt-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          /* ── CARDS / GRID VIEW (Lively & Colorful) ── */
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredRegistrations.map((r) => {
              const bStyle = bookingModeStyles(r.booking_mode);
              const vBadge = verificationBadge(r.verification_status);
              const avatarColor = getAvatarColor(r.full_name);
              const initials = getInitials(r.full_name);
              const relativeTime = getRelativeTimeString(r.created_at);

              return (
                <div
                  key={r.id}
                  onClick={() => openInspector(r)}
                  className="group relative rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition-all duration-150 flex flex-col justify-between overflow-hidden cursor-pointer"
                >
                  {/* Status Top Strip */}
                  <div className={`h-1.5 w-full bg-gradient-to-r ${bStyle.borderTop}`} />

                  <div className="p-4 space-y-3 flex-1">
                    {/* Top Row: Ref ID + Booking Mode Pill */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-num font-extrabold text-[11px] text-[#102E4D] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        #{r.reference_code}
                      </span>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${bStyle.pill}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${bStyle.dot}`} />
                        {bStyle.shortLabel}
                      </span>
                    </div>

                    {/* Participant Profile */}
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl border ${avatarColor} flex items-center justify-center font-bold text-xs shrink-0`}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-sm text-[#102E4D] truncate group-hover:text-[#FF7900] transition-colors">
                          {r.full_name}
                        </h3>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate mt-0.5">
                          <span className="font-semibold text-slate-700">{r.role}</span>
                          <span>•</span>
                          <span className="truncate">{r.organization || "Independent"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Activity Title Pill */}
                    <div className="rounded-xl bg-[#EFFBF8] border border-[#C8EFE6] p-2 text-xs">
                      <div className="font-bold text-[#005696] truncate">{r.activity_title}</div>
                      <div className="text-[10.5px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3 h-3 text-[#FF7900] shrink-0" />
                        <span>{r.activity_date || "2026 Schedule"}</span>
                        <span>•</span>
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{r.activity_city || "Islamabad"}</span>
                      </div>
                    </div>

                    {/* Screenshot Proof Preview or TID */}
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      {r.screenshot_url ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLightboxUrl(r.screenshot_url);
                          }}
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 font-bold text-[10.5px] transition-colors cursor-pointer"
                        >
                          <img
                            src={r.screenshot_url}
                            alt="Proof thumbnail"
                            className="w-5 h-5 rounded object-cover border border-white"
                          />
                          <span>Inspect Proof</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-mono font-medium text-slate-500">
                          {r.transaction_ref ? `TID: ${r.transaction_ref}` : "Pay Later Booking"}
                        </span>
                      )}

                      {/* Verification Pill */}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${vBadge.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${vBadge.dot}`} />
                        <span>{vBadge.label}</span>
                        {vBadge.isLocked && <Lock className="w-2.5 h-2.5 opacity-70 shrink-0" />}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="text-[11px] text-slate-400 font-num">
                      {relativeTime}
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {r.phone && (
                        <a
                          href={`https://wa.me/${r.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                            `Assalam-o-Alaikum ${r.full_name}, this is The Leadership Covenant regarding your registration (Ref #${r.reference_code}) for "${r.activity_title}".`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white flex items-center justify-center transition-colors border border-emerald-200"
                          title="WhatsApp Participant"
                        >
                          <FaWhatsapp className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => downloadOfficialReceipt(toReceiptPayload(r))}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-[#102E4D] text-slate-700 hover:text-white flex items-center justify-center transition-colors border border-slate-200"
                        title="Download Branded PNG Voucher"
                      >
                        <Download className="w-3.5 h-3.5 text-[#FF7900]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openInspector(r)}
                        className="px-2.5 py-1 rounded-lg bg-[#102E4D] hover:bg-[#001B33] text-white text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── RICH, COLORFUL & COMPACT TABLE LIST VIEW ── */
          <div className="overflow-x-auto [scrollbar-width:thin] [scrollbar-color:#FF7900_#f1f5f9] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-slate-100/80 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gradient-to-r [&::-webkit-scrollbar-thumb]:from-[#FF7900] [&::-webkit-scrollbar-thumb]:via-[#FFC400] [&::-webkit-scrollbar-thumb]:to-[#005696] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:from-[#e06b00] hover:[&::-webkit-scrollbar-thumb]:to-[#102E4D]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-2.5 px-3 w-28 whitespace-nowrap">Booking Ref</th>
                  <th className="py-2.5 px-3 min-w-[130px] max-w-[170px]">Participant</th>
                  <th className="py-2.5 px-3 min-w-[140px] max-w-[190px]">Activity Cohort</th>
                  <th className="py-2.5 px-3 w-36 whitespace-nowrap">Booking Mode</th>
                  <th className="py-2.5 px-3 w-28 whitespace-nowrap">Payment Proof</th>
                  <th className="py-2.5 px-3 w-36 whitespace-nowrap">Verification</th>
                  <th className="py-2.5 px-3 w-28 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRegistrations.map((r) => {
                  const bStyle = bookingModeStyles(r.booking_mode);
                  const vBadge = verificationBadge(r.verification_status);
                  const avatarColor = getAvatarColor(r.full_name);
                  const initials = getInitials(r.full_name);

                  return (
                    <tr
                      key={r.id}
                      onClick={() => openInspector(r)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      {/* Booking Ref */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <span className="font-num font-extrabold text-[11px] text-[#102E4D] bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200 inline-block">
                            #{r.reference_code}
                          </span>
                          <div className="text-[10px] text-slate-400 font-num">
                            {new Date(r.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                      </td>

                      {/* Participant Details */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-lg border ${avatarColor} flex items-center justify-center font-bold text-[10px] shrink-0`}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0 max-w-[150px]">
                            <div className="font-bold text-slate-900 group-hover:text-[#FF7900] transition-colors truncate text-xs">
                              {r.full_name}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">
                              {r.role || "Participant"} {r.organization ? `• ${r.organization}` : ""}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Activity Cohort (Compact & Less Bloated) */}
                      <td className="py-2.5 px-3">
                        <div className="min-w-0 max-w-[180px]">
                          <div className="font-semibold text-[#102E4D] truncate text-xs" title={r.activity_title}>
                            {r.activity_title}
                          </div>
                          <div className="text-[10px] text-slate-400 font-num truncate">
                            {r.activity_date || "2026 Schedule"} {r.activity_city ? `• ${r.activity_city}` : ""}
                          </div>
                        </div>
                      </td>

                      {/* Booking Mode */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full border text-[10.5px] font-bold inline-flex items-center gap-1.5 ${bStyle.pill}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${bStyle.dot}`} />
                          <span>{bStyle.label}</span>
                        </span>
                      </td>

                      {/* Payment Proof / Screenshot */}
                      <td
                        className="py-2.5 px-3 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {r.screenshot_url ? (
                          <button
                            type="button"
                            onClick={() => setLightboxUrl(r.screenshot_url)}
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 font-bold text-[10px] transition-colors cursor-pointer"
                            title="Click to view payment proof"
                          >
                            <img
                              src={r.screenshot_url}
                              alt="Proof"
                              className="w-4 h-4 rounded object-cover border border-white"
                            />
                            <span>View Proof</span>
                          </button>
                        ) : (
                          <span className="text-[10.5px] text-slate-400 font-mono">
                            {r.transaction_ref ? `TID: ${r.transaction_ref}` : "Pay Later"}
                          </span>
                        )}
                      </td>

                      {/* Verification Status */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold inline-flex items-center gap-1.5 ${vBadge.cls}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${vBadge.dot}`} />
                          <span>{vBadge.label}</span>
                          {vBadge.isLocked && <Lock className="w-2.5 h-2.5 opacity-70 shrink-0" />}
                        </span>
                      </td>

                      {/* Actions */}
                      <td
                        className="py-2.5 px-3 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          {r.phone && (
                            <a
                              href={`https://wa.me/${r.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                                `Assalam-o-Alaikum ${r.full_name}, thank you for registering with The Leadership Covenant (Ref #${r.reference_code}) for "${r.activity_title}".`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white flex items-center justify-center transition-colors border border-emerald-200"
                              title="Chat on WhatsApp"
                            >
                              <FaWhatsapp className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => downloadOfficialReceipt(toReceiptPayload(r))}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-[#102E4D] text-slate-700 hover:text-white flex items-center justify-center transition-colors border border-slate-200 cursor-pointer"
                            title="Download Branded PNG Voucher"
                          >
                            <Download className="w-3.5 h-3.5 text-[#FF7900]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openInspector(r)}
                            className="px-2.5 py-1 rounded-lg bg-[#102E4D] hover:bg-[#001B33] text-white text-[10.5px] font-bold transition-colors cursor-pointer shadow-2xs"
                          >
                            Manage
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 4. MODAL: REGISTRATION DETAILS INSPECTOR (Proper, Colorful & Modern) */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs transition-opacity"
            onClick={() => setSelected(null)}
          />

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92dvh] sm:max-h-[88vh]">
            {/* Top gradient accent line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#10B981]" />

            {/* Modal Header */}
            {(() => {
              const isRecordLocked =
                (selected.verification_status === "verified_confirmed" ||
                  selected.verification_status === "cancelled") &&
                !isStatusUnlocked;

              return (
                <div className="bg-[#102E4D] text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-2.5 shrink-0">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    {/* Reference ID Badge */}
                    <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-[#FF7900] text-white font-num font-extrabold text-xs sm:text-sm tracking-wider shadow-sm shadow-[#FF7900]/30">
                      <span className="text-orange-200 text-[10px] sm:text-xs font-sans font-bold">REF:</span>
                      <span>#{selected.reference_code}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selected.reference_code, "ref_modal")}
                        className="ml-0.5 sm:ml-1 p-1 hover:bg-black/10 rounded transition-colors cursor-pointer"
                        title="Copy Booking Reference"
                      >
                        {copiedKey === "ref_modal" ? (
                          <Check className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-white/80" />
                        )}
                      </button>
                    </div>

                    {/* Booking Mode Badge */}
                    {(() => {
                      const bStyle = bookingModeStyles(selected.booking_mode);
                      return (
                        <span className={`px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold border inline-flex items-center gap-1.5 ${bStyle.pill}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${bStyle.dot}`} />
                          <span>{bStyle.shortLabel}</span>
                        </span>
                      );
                    })()}

                    {/* Verification Status Badge */}
                    {(() => {
                      const vBadge = verificationBadge(selected.verification_status);
                      return (
                        <span className={`px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold border inline-flex items-center gap-1.5 ${vBadge.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${vBadge.dot}`} />
                          <span>{vBadge.label}</span>
                          {vBadge.isLocked && <Lock className="w-3 h-3 opacity-75 shrink-0" />}
                        </span>
                      );
                    })()}
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })()}

            {/* Modal Scrollable Body */}
            <div className="p-3.5 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto overscroll-contain flex-1 text-xs sm:text-sm">
              {/* SECTION 1: Participant Identity Profile */}
              <div className="rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200/90 p-3.5 sm:p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pb-2 border-b border-slate-200/70">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-[#102E4D] text-white flex items-center justify-center shrink-0">
                      <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#102E4D]">
                      Participant Profile
                    </span>
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 font-num flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>
                      Registered: {new Date(selected.created_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Name & Role */}
                  <div className="space-y-1">
                    <div className="text-[10px] sm:text-[10.5px] uppercase font-bold text-slate-400">
                      Participant Name & Role
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-lg border ${getAvatarColor(selected.full_name)} flex items-center justify-center font-bold text-xs shrink-0`}
                      >
                        {getInitials(selected.full_name)}
                      </div>
                      <div className="font-bold text-sm sm:text-base text-[#102E4D] leading-tight break-words">
                        {selected.full_name}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium pt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="break-words">
                        {selected.role} • {selected.organization || "Independent"}
                      </span>
                    </div>
                  </div>

                  {/* Direct Contact Buttons */}
                  <div className="space-y-2">
                    {/* Email Box */}
                    <div className="flex items-center justify-between gap-1.5 p-2 rounded-xl bg-white border border-slate-200 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <Mail className="w-3.5 h-3.5 text-[#005696] shrink-0" />
                        <span className="text-xs font-semibold text-slate-800 truncate block">
                          {selected.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(selected.email, "email_modal")}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                          title="Copy Email"
                        >
                          {copiedKey === "email_modal" ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <a
                          href={`mailto:${selected.email}?subject=${encodeURIComponent(
                            `Registration #${selected.reference_code} — ${selected.activity_title}`
                          )}`}
                          className="px-2 py-0.5 rounded-md bg-[#102E4D] hover:bg-[#001B33] text-white text-[10.5px] font-bold transition-colors"
                        >
                          Email
                        </a>
                      </div>
                    </div>

                    {/* WhatsApp Box */}
                    <div className="flex items-center justify-between gap-1.5 p-2 rounded-xl bg-white border border-slate-200 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <Phone className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                        <span className="text-xs font-semibold text-slate-800 truncate font-num block">
                          {selected.phone}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(selected.phone, "phone_modal")}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                          title="Copy Phone"
                        >
                          {copiedKey === "phone_modal" ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <a
                          href={`https://wa.me/${selected.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                            `Assalam-o-Alaikum ${selected.full_name}! Regarding your registration (Ref #${selected.reference_code}) for "${selected.activity_title}":`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 rounded-md bg-[#25D366] hover:bg-[#20BD5A] text-white text-[10.5px] font-bold inline-flex items-center gap-1 transition-colors"
                        >
                          <FaWhatsapp className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Enrolled Activity Cohort Details */}
              <div className="rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 p-3.5 sm:p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#FF7900]" />
                    <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#102E4D]">
                      Enrolled Activity Details
                    </span>
                  </div>
                  {selected.fee_label && (
                    <span className="px-2.5 py-0.5 rounded-md bg-[#EFFBF8] text-[#005696] font-extrabold text-[11px] border border-[#C8EFE6]">
                      {selected.fee_label}
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                  <div className="font-bold text-sm text-[#102E4D]">{selected.activity_title}</div>
                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#FF7900]" />
                      {selected.activity_date || "2026 Schedule"}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {selected.activity_city || "Islamabad"}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Official Customer Voucher Toolbar */}
              <div className="rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#001B33] via-[#102E4D] to-[#001B33] text-white p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#FFC400]">
                    Official Customer Voucher & Receipt
                  </div>
                  <div className="font-bold text-xs text-white mt-0.5">
                    Generate high-resolution PNG receipt or print official entry voucher
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => downloadOfficialReceipt(toReceiptPayload(selected))}
                    className="h-8.5 px-3 rounded-xl bg-[#FF7900] hover:bg-[#E56D00] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PNG</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => printOfficialReceipt(toReceiptPayload(selected))}
                    className="h-8.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Voucher</span>
                  </button>
                </div>
              </div>

              {/* SECTION 4: Payment Screenshot Proof Inspector */}
              <div className="rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 p-3.5 sm:p-4 space-y-3">
                <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-100">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#102E4D] inline-flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#005696]" />
                    Payment Proof & Bank Verification
                  </span>

                  <label className="h-8 px-3 rounded-xl bg-[#005696] hover:bg-[#004477] text-white text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors">
                    {uploadingProof ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <UploadCloud className="w-3.5 h-3.5" />
                    )}
                    <span>{selected.screenshot_url ? "Replace Screenshot" : "Upload Screenshot"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAdminProofUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {selected.screenshot_url ? (
                  <div className="space-y-2">
                    <div
                      onClick={() => setLightboxUrl(selected.screenshot_url)}
                      className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 max-h-56 flex items-center justify-center cursor-zoom-in"
                    >
                      <img
                        src={selected.screenshot_url}
                        alt="Payment Screenshot"
                        className="max-h-52 w-auto object-contain"
                      />
                      <div className="absolute inset-0 bg-[#001B33]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                        <ZoomIn className="w-4 h-4" />
                        <span>Click to Inspect Full Size</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="truncate">{selected.screenshot_name || "Bank Transfer Screenshot"}</span>
                      <a
                        href={selected.screenshot_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-[#005696] hover:underline inline-flex items-center gap-1 shrink-0"
                      >
                        <span>Open Original</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-4 text-center text-xs text-slate-500">
                    No payment screenshot attached yet (Provisional Reservation). Once received via WhatsApp or bank notification, upload it above.
                  </div>
                )}

                {/* Admin Review Decision / Status Lock Controller */}
                {(() => {
                  const isRecordLocked =
                    (selected.verification_status === "verified_confirmed" ||
                      selected.verification_status === "cancelled") &&
                    !isStatusUnlocked;

                  if (isRecordLocked) {
                    return selected.verification_status === "verified_confirmed" ? (
                      <div className="rounded-xl p-3 sm:p-3.5 bg-emerald-50 border border-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-start sm:items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                            <Lock className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-xs sm:text-sm text-emerald-950 flex items-center gap-2 flex-wrap">
                              <span>Seat Confirmed & Verified</span>
                              <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wide">
                                Status Locked
                              </span>
                            </div>
                            <div className="text-[11px] text-emerald-700 mt-0.5">
                              Payment confirmed. This record is locked against accidental changes.
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsStatusUnlocked(true)}
                          className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 shrink-0 shadow-2xs"
                        >
                          <Unlock className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Unlock Status</span>
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-xl p-3 sm:p-3.5 bg-rose-50 border border-rose-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-start sm:items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
                            <Lock className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-xs sm:text-sm text-rose-950 flex items-center gap-2 flex-wrap">
                              <span>Registration Cancelled</span>
                              <span className="text-[10px] bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wide">
                                Status Locked
                              </span>
                            </div>
                            <div className="text-[11px] text-rose-700 mt-0.5">
                              This booking has been cancelled and locked.
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsStatusUnlocked(true)}
                          className="px-3 py-1.5 rounded-xl bg-white border border-rose-300 hover:bg-rose-100 text-rose-900 text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 shrink-0 shadow-2xs"
                        >
                          <Unlock className="w-3.5 h-3.5 text-rose-700" />
                          <span>Unlock Status</span>
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="rounded-xl p-3 sm:p-3.5 bg-slate-50 border border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#102E4D] flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-[#005696]" />
                          <span>Admin Review Decision</span>
                        </span>
                        <span className="text-[10.5px] text-slate-500 font-medium">
                          Select status to apply:
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {/* 1. Payment Done -> Confirm & Lock */}
                        <button
                          type="button"
                          onClick={() =>
                            handleSaveRecord({
                              booking_mode: "secure_seat",
                              verification_status: "verified_confirmed",
                            })
                          }
                          className="h-10 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                          title="Confirm bank payment and lock seat"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Payment Done (Confirm)</span>
                        </button>

                        {/* 2. Move to Reserved / Pending Callback */}
                        <button
                          type="button"
                          onClick={() =>
                            handleSaveRecord({
                              booking_mode: "reserve_later",
                              verification_status: "pending_callback",
                            })
                          }
                          className="h-10 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                          title="Keep as provisional reservation for phone callback"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Reserve (Callback)</span>
                        </button>

                        {/* 3. Reject / Cancel & Lock */}
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              confirm(
                                `Cancel registration for ${selected.full_name}? The record will be locked as Cancelled.`
                              )
                            ) {
                              handleSaveRecord({
                                verification_status: "cancelled",
                              });
                            }
                          }}
                          className="h-10 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                          title="Cancel registration and lock record"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel & Lock</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* SECTION 5: CRM Controls (Booking Mode & Verification Status) */}
              <div className="rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 p-3.5 sm:p-4 space-y-3">
                {(() => {
                  const isRecordLocked =
                    (selected.verification_status === "verified_confirmed" ||
                      selected.verification_status === "cancelled") &&
                    !isStatusUnlocked;

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Booking Mode */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#102E4D]">
                          Booking Mode
                        </label>
                        <div className="grid grid-cols-2 gap-1.5 h-10">
                          <button
                            type="button"
                            disabled={isRecordLocked}
                            onClick={() => setEditMode("secure_seat")}
                            className={`h-10 px-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                              isRecordLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                            } ${
                              editMode === "secure_seat"
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-500/30"
                                : "bg-slate-50 text-slate-700 border-slate-200"
                            }`}
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Secured Seat</span>
                          </button>
                          <button
                            type="button"
                            disabled={isRecordLocked}
                            onClick={() => setEditMode("reserve_later")}
                            className={`h-10 px-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                              isRecordLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                            } ${
                              editMode === "reserve_later"
                                ? "bg-amber-600 text-white border-amber-600 shadow-xs ring-2 ring-amber-500/30"
                                : "bg-slate-50 text-slate-700 border-slate-200"
                            }`}
                          >
                            <CalendarCheck2 className="w-3.5 h-3.5" />
                            <span>Reservation</span>
                          </button>
                        </div>
                      </div>

                      {/* Verification Status */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#102E4D]">
                            Verification Status
                          </label>
                          {isRecordLocked && (
                            <span className="text-[10px] text-slate-400 font-semibold inline-flex items-center gap-1">
                              <Lock className="w-3 h-3 text-slate-400" />
                              <span>Locked</span>
                            </span>
                          )}
                        </div>
                        <select
                          disabled={isRecordLocked}
                          value={editVerification}
                          onChange={(e) => setEditVerification(e.target.value as VerificationStatus)}
                          className={`w-full h-10 px-3 rounded-xl border border-slate-200 font-bold text-xs focus:outline-none focus:border-[#102E4D] ${
                            isRecordLocked
                              ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                              : "bg-white text-[#102E4D] cursor-pointer"
                          }`}
                        >
                          <option value="awaiting_verification">Admin Review (Proof Uploaded)</option>
                          <option value="pending_callback">Pending Callback (Reservation)</option>
                          <option value="verified_confirmed">Confirmed (Seat Locked)</option>
                          <option value="cancelled">Cancelled (Booking Locked)</option>
                        </select>
                      </div>
                    </div>
                  );
                })()}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Transaction Ref */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#102E4D]">
                      UBL Transaction ID / Ref
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. RAAST-9482710"
                      value={editTransactionRef}
                      onChange={(e) => setEditTransactionRef(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-mono text-xs font-bold text-[#102E4D] focus:outline-none focus:border-[#102E4D]"
                    />
                  </div>

                  {/* Fee Label */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#102E4D]">
                      Fee Label
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. PKR 4,000 (Early Bird)"
                      value={editFeeLabel}
                      onChange={(e) => setEditFeeLabel(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-[#102E4D] focus:outline-none focus:border-[#102E4D]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 6: Internal Admin Notes with Quick Suggestions */}
              <div className="rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 p-3.5 sm:p-4 space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#005696]" />
                    <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#102E4D]">
                      Internal Admin Notes
                    </label>
                  </div>
                  <span className="text-[10px] text-slate-400">Private log for admin team</span>
                </div>

                {/* Quick Log Suggestions Grid */}
                <div className="space-y-1.5">
                  <div className="text-[10px] sm:text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                    Quick Log Suggestions:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {QUICK_REG_SUGGESTIONS.map((item) => {
                      const IconComp = item.icon;
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() =>
                            setEditNotes((prev) =>
                              prev ? `${prev}\n${item.appendNote}` : item.appendNote
                            )
                          }
                          className={`h-11 px-2.5 rounded-xl border text-left transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98] flex items-center gap-2 min-w-0 ${item.color}`}
                        >
                          <span className={`w-6 h-6 rounded-lg ${item.iconBg} flex items-center justify-center shrink-0`}>
                            <IconComp className="w-3.5 h-3.5" />
                          </span>
                          <span className="text-[11px] sm:text-xs font-bold leading-tight truncate">
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <textarea
                  rows={3}
                  placeholder="Record callback summary, bank verification notes, or seating adjustments…"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/40 focus:bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#102E4D] transition-colors leading-relaxed"
                />
              </div>

              {/* Feedback toast */}
              {feedback && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2 border border-emerald-200 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{feedback}</span>
                </div>
              )}
            </div>

            {/* Pinned Modal Footer */}
            <div className="px-4 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleDelete(selected.id)}
                className="h-9 px-3 sm:px-3.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="h-9 px-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveRecord()}
                  className="h-9 px-4 sm:px-5 rounded-xl bg-[#FF7900] hover:bg-[#E56D00] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? "Saving…" : "Save CRM Changes"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 5. FULLSCREEN PAYMENT SCREENSHOT LIGHTBOX                          */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[60] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer transition-colors"
            title="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxUrl}
            alt="Full Size Payment Proof"
            className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl border border-white/20 object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 6. CREATE MANUAL REGISTRATION MODAL (Structured & Modern)          */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs transition-opacity"
            onClick={() => setAddModalOpen(false)}
          />

          <div className="relative z-10 w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92dvh] sm:max-h-[88vh]">
            {/* Top gradient accent line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#10B981]" />

            {/* Header */}
            <div className="bg-[#102E4D] text-white px-5 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF7900] to-[#E56D00] flex items-center justify-center text-white shadow-md shadow-orange-500/25 shrink-0">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base sm:text-lg text-white leading-tight">
                      Add Manual Activity Registration
                    </h3>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/10 text-orange-300 uppercase tracking-wider">
                      Admin Entry
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-300 truncate mt-0.5">
                    Enroll a participant for an activity cohort, conference, or camp.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateManual} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="p-4 sm:p-6 space-y-4 overflow-y-auto overscroll-contain flex-1 text-xs sm:text-sm">
                {/* Participant Details */}
                <div className="rounded-xl sm:rounded-2xl bg-slate-50/80 border border-slate-200/90 p-3.5 sm:p-4 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200/70">
                    <div className="w-5 h-5 rounded-md bg-[#102E4D] text-white flex items-center justify-center shrink-0">
                      <User className="w-3 h-3" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#102E4D]">
                      Participant & Organization Details
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Full Name <span className="text-[#FF7900]">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Dr. Ayesha Khan"
                        value={newReg.full_name}
                        onChange={(e) => setNewReg({ ...newReg, full_name: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#FF7900] focus:ring-2 focus:ring-[#FF7900]/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Email Address <span className="text-[#FF7900]">*</span>
                      </label>
                      <input
                        required
                        type="email"
                        placeholder="ayesha@school.edu.pk"
                        value={newReg.email}
                        onChange={(e) => setNewReg({ ...newReg, email: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#FF7900] focus:ring-2 focus:ring-[#FF7900]/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Phone / WhatsApp <span className="text-[#FF7900]">*</span>
                      </label>
                      <input
                        required
                        type="tel"
                        placeholder="+92 300 1234567"
                        value={newReg.phone}
                        onChange={(e) => setNewReg({ ...newReg, phone: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#FF7900] focus:ring-2 focus:ring-[#FF7900]/20 font-num"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Role / Designation <span className="text-[#FF7900]">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="Principal / Coordinator"
                        value={newReg.role}
                        onChange={(e) => setNewReg({ ...newReg, role: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#FF7900] focus:ring-2 focus:ring-[#FF7900]/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-0.5">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      School / Organization
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Beaconhouse / Roots Millennium / Independent"
                      value={newReg.organization}
                      onChange={(e) => setNewReg({ ...newReg, organization: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#FF7900] focus:ring-2 focus:ring-[#FF7900]/20"
                    />
                  </div>
                </div>

                {/* Cohort & Booking Mode Selection */}
                <div className="rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 p-3.5 sm:p-4 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <div className="w-5 h-5 rounded-md bg-[#005696] text-white flex items-center justify-center shrink-0">
                      <Tag className="w-3 h-3" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#102E4D]">
                      Activity Cohort & Booking Mode
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Select Activity Cohort <span className="text-[#FF7900]">*</span>
                    </label>
                    <select
                      value={newReg.activity_slug}
                      onChange={(e) => setNewReg({ ...newReg, activity_slug: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-bold text-[#102E4D] focus:outline-none focus:border-[#FF7900] cursor-pointer"
                    >
                      {activities.map((a) => (
                        <option key={a.slug} value={a.slug}>
                          {a.title} ({a.city})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-end">
                    {/* Booking Mode Selector */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Booking Mode
                      </label>
                      <div className="grid grid-cols-2 gap-1.5 h-10">
                        <button
                          type="button"
                          onClick={() => setNewReg({ ...newReg, booking_mode: "secure_seat" })}
                          className={`h-10 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            newReg.booking_mode === "secure_seat"
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-500/30"
                              : "bg-slate-50 text-slate-700 border-slate-200"
                          }`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Secured Seat</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewReg({ ...newReg, booking_mode: "reserve_later" })}
                          className={`h-10 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            newReg.booking_mode === "reserve_later"
                              ? "bg-amber-600 text-white border-amber-600 shadow-xs ring-2 ring-amber-500/30"
                              : "bg-slate-50 text-slate-700 border-slate-200"
                          }`}
                        >
                          <CalendarCheck2 className="w-3.5 h-3.5" />
                          <span>Reservation</span>
                        </button>
                      </div>
                    </div>

                    {/* Verification Status */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Initial Verification Status
                      </label>
                      <select
                        value={newReg.verification_status}
                        onChange={(e) =>
                          setNewReg({ ...newReg, verification_status: e.target.value as VerificationStatus })
                        }
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-bold text-xs text-[#102E4D]"
                      >
                        <option value="pending_callback">Pending Callback (Reservation)</option>
                        <option value="awaiting_verification">Admin Review (Proof Uploaded)</option>
                        <option value="verified_confirmed">Confirmed (Seat Locked)</option>
                        <option value="cancelled">Cancelled (Booking Locked)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      UBL Transaction Ref <span className="text-slate-400 font-normal lowercase">(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. RAAST-839210 or Bank Transfer Ref"
                      value={newReg.transaction_ref}
                      onChange={(e) => setNewReg({ ...newReg, transaction_ref: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-mono text-xs font-semibold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Pinned Footer */}
              <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
                <span className="text-[11px] text-slate-500 hidden sm:inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Auto-generates a unique #TLC-26-XXXX reference ID
                </span>

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(false)}
                    className="h-9 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="h-9 px-5 rounded-xl bg-[#FF7900] hover:bg-[#E56D00] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60 transition-all"
                  >
                    {creating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Creating…</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Create Registration</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminRegistrationsCrmPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs font-bold text-slate-400">
          Loading Activity Registrations CRM…
        </div>
      }
    >
      <RegistrationsCrmInner />
    </Suspense>
  );
}

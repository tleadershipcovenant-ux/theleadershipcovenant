"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  useDeferredValue,
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
  Briefcase,
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
  ChevronDown,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import {
  CATEGORY_LABELS,
  getMonthTheme,
  type LeadershipEvent,
} from "@/content/events";
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

const VERIFICATION_DROPDOWN_OPTIONS: Array<{
  value: VerificationStatus;
  stepNum: string;
  label: string;
  shortDesc: string;
  icon: React.ComponentType<{ className?: string }>;
  dotColor: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  activeBg: string;
  requiresProof?: boolean;
}> = [
  {
    value: "pending_callback",
    stepNum: "1",
    label: "Pending Call Back",
    shortDesc: "Initial reservation • Phone callback required",
    icon: Phone,
    dotColor: "bg-amber-500",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-900",
    badgeBorder: "border-amber-200",
    activeBg: "bg-amber-500 text-white",
  },
  {
    value: "awaiting_verification",
    stepNum: "2",
    label: "Admin Review",
    shortDesc: "Secured seat proof uploaded • Verification pending",
    icon: Eye,
    dotColor: "bg-sky-500",
    badgeBg: "bg-sky-50",
    badgeText: "text-sky-900",
    badgeBorder: "border-sky-200",
    activeBg: "bg-sky-600 text-white",
    requiresProof: true,
  },
  {
    value: "verified_confirmed",
    stepNum: "3",
    label: "Confirm Seat",
    shortDesc: "Payment verified • Seat confirmed & locked",
    icon: CheckCircle2,
    dotColor: "bg-emerald-500",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-900",
    badgeBorder: "border-emerald-200",
    activeBg: "bg-emerald-600 text-white",
    requiresProof: true,
  },
  {
    value: "cancelled",
    stepNum: "4",
    label: "Canceled",
    shortDesc: "Registration rejected or cancelled • Locked",
    icon: X,
    dotColor: "bg-rose-500",
    badgeBg: "bg-rose-50",
    badgeText: "text-rose-900",
    badgeBorder: "border-rose-200",
    activeBg: "bg-rose-600 text-white",
  },
];

function RegistrationsCrmInner() {
  const searchParams = useSearchParams();
  const initialActivityParam = searchParams?.get("activity") || "all";

  const [registrations, setRegistrations] = useState<ActivityRegistrationRecord[]>([]);
  const [activities, setActivities] = useState<LeadershipEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Views
  const [activeActivityTab, setActiveActivityTab] = useState<string>(initialActivityParam);
  const [bookingFilter, setBookingFilter] = useState<"all" | BookingModeType>("all");
  const [verificationFilter, setVerificationFilter] = useState<"all" | VerificationStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
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
  const [proofRequirementWarning, setProofRequirementWarning] = useState<string | null>(null);
  const [isStatusUnlocked, setIsStatusUnlocked] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Close custom dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(e.target as Node)
      ) {
        setStatusDropdownOpen(false);
      }
    };
    if (statusDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [statusDropdownOpen]);

  // Fullscreen Screenshot Lightbox
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Manual Add Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [uploadingManualProof, setUploadingManualProof] = useState(false);
  const [manualFormError, setManualFormError] = useState<string | null>(null);
  const [manualActivityOpen, setManualActivityOpen] = useState(false);
  const [manualVerificationOpen, setManualVerificationOpen] = useState(false);
  const [newReg, setNewReg] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "",
    organization: "",
    school_name: "",
    address_with_city: "",
    activity_slug: "school-impact-summit-2026",
    booking_mode: "reserve_later" as BookingModeType,
    transaction_ref: "",
    verification_status: "pending_callback" as VerificationStatus,
    fee_label: "",
    message: "",
    screenshot_url: "",
    screenshot_public_id: "",
    screenshot_name: "",
  });

  // Batch Selection & Deletion State
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [recordsToDelete, setRecordsToDelete] = useState<ActivityRegistrationRecord[]>([]);

  // Lock background scroll when modal, lightbox or confirmation is active (smooth mobile touch performance)
  useEffect(() => {
    if (selected || addModalOpen || lightboxUrl || deleteConfirmOpen) {
      const prevOverflow = document.body.style.overflow;
      const prevTouchAction = document.body.style.touchAction;
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      return () => {
        document.body.style.overflow = prevOverflow;
        document.body.style.touchAction = prevTouchAction;
      };
    }
  }, [selected, addModalOpen, lightboxUrl, deleteConfirmOpen]);

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

  const loadData = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    try {
      const res = await fetch("/api/admin/registrations", {
        cache: "no-store",
      });
      if (res.status === 401) {
        if (typeof window !== "undefined") {
          window.location.href = window.location.pathname.startsWith("/AD_Admin")
            ? "/AD_Admin/login?reason=inactivity"
            : "/login?reason=inactivity";
        }
        return;
      }
      if (res.ok) {
        const json = await res.json();
        setRegistrations(Array.isArray(json.registrations) ? json.registrations : []);
        setActivities(Array.isArray(json.activities) ? json.activities : []);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(true);
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
    const q = deferredSearchQuery.trim().toLowerCase();
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
        (r.school_name && r.school_name.toLowerCase().includes(q)) ||
        (r.address_with_city && r.address_with_city.toLowerCase().includes(q)) ||
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
  }, [tabFilteredByActivity, bookingFilter, verificationFilter, deferredSearchQuery, sortBy]);

  // Selection helpers
  const isAllSelected = useMemo(() => {
    if (filteredRegistrations.length === 0) return false;
    return filteredRegistrations.every((r) => selectedIds.has(r.id));
  }, [filteredRegistrations, selectedIds]);

  const isSomeSelected = useMemo(() => {
    if (isAllSelected) return false;
    return filteredRegistrations.some((r) => selectedIds.has(r.id));
  }, [filteredRegistrations, selectedIds, isAllSelected]);

  const handleToggleSelectOne = (id: string, e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredRegistrations.forEach((r) => next.delete(r.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredRegistrations.forEach((r) => next.add(r.id));
        return next;
      });
    }
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const promptDeleteSingle = (record: ActivityRegistrationRecord, e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    setRecordsToDelete([record]);
    setDeleteConfirmOpen(true);
  };

  const promptBatchDelete = () => {
    const toDelete = registrations.filter((r) => selectedIds.has(r.id));
    if (toDelete.length === 0) return;
    setRecordsToDelete(toDelete);
    setDeleteConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (recordsToDelete.length === 0) return;
    setDeleting(true);
    try {
      const ids = recordsToDelete.map((r) => r.id);
      const res = await fetch("/api/admin/registrations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setRegistrations((prev) => prev.filter((r) => !ids.includes(r.id)));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          ids.forEach((id) => next.delete(id));
          return next;
        });
        setDeleteConfirmOpen(false);
        setRecordsToDelete([]);
        if (selected && ids.includes(selected.id)) {
          setSelected(null);
        }
        setFeedback(
          `Successfully deleted ${ids.length} registration record${ids.length > 1 ? "s" : ""} from the database.`
        );
        setTimeout(() => setFeedback(null), 4000);
      } else {
        alert(data.error || "Failed to delete records from database.");
      }
    } catch (err) {
      console.error("[DELETE REGISTRATIONS ERROR]", err);
      alert("An error occurred while deleting records.");
    } finally {
      setDeleting(false);
    }
  };

  const openInspector = (reg: ActivityRegistrationRecord) => {
    setSelected(reg);
    setEditMode(reg.booking_mode);
    setEditVerification(reg.verification_status);
    setEditTransactionRef(reg.transaction_ref || "");
    setEditFeeLabel(reg.fee_label || "");
    setEditNotes(reg.admin_notes || "");
    setIsStatusUnlocked(false);
    setStatusDropdownOpen(false);
    setProofRequirementWarning(null);
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
    const targetMode = overridePatch?.booking_mode ?? editMode;
    const targetVerification = overridePatch?.verification_status ?? editVerification;

    // Screenshot proof check before securing seat or confirming
    if (
      (targetMode === "secure_seat" ||
        targetVerification === "awaiting_verification" ||
        targetVerification === "verified_confirmed") &&
      !selected.screenshot_url
    ) {
      setProofRequirementWarning(
        "Payment proof screenshot required before saving as Secured Seat, Admin Review, or Confirmed. Please upload screenshot proof first."
      );
      return;
    }

    setSaving(true);
    setFeedback(null);
    setProofRequirementWarning(null);
    try {
      const res = await fetch("/api/admin/registrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selected.id,
          booking_mode: targetMode,
          verification_status: targetVerification,
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
        setIsStatusUnlocked(false);
        setFeedback("Registration CRM record updated successfully!");
        setTimeout(() => setFeedback(null), 3000);
      } else {
        alert("Save failed: " + (json.error || "Unknown server error"));
      }
    } catch (err: any) {
      alert("Save failed: " + (err?.message || "Network error"));
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
    setProofRequirementWarning(null);
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
        // Persist uploaded screenshot URL to database
        const saveRes = await fetch("/api/admin/registrations", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: selected.id,
            screenshot_url: upJson.url,
            screenshot_public_id: upJson.publicId || "",
            screenshot_name: file.name,
          }),
        });
        const saveJson = await saveRes.json();
        const updatedRecord: ActivityRegistrationRecord = saveJson.registration || {
          ...selected,
          screenshot_url: upJson.url,
          screenshot_public_id: upJson.publicId || "",
          screenshot_name: file.name,
        };

        setRegistrations((prev) =>
          prev.map((item) => (item.id === updatedRecord.id ? updatedRecord : item))
        );
        setSelected(updatedRecord);
        // Stage status to Admin Review (awaiting_verification) and Booking Mode to Secured Seat
        setEditMode("secure_seat");
        setEditVerification("awaiting_verification");
        setFeedback("Payment screenshot uploaded! You can now select Secured Seat & Confirmed, then click Save Changes.");
        setTimeout(() => setFeedback(null), 4000);
      } else {
        alert("Upload failed: " + (upJson.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Upload failed: " + (err?.message || "Network error"));
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
    setManualFormError(null);
    if (
      !newReg.full_name.trim() ||
      !newReg.email.trim() ||
      !newReg.phone.trim() ||
      !newReg.role.trim() ||
      !newReg.activity_slug
    ) {
      setManualFormError("Complete all required participant and activity fields.");
      return;
    }
    if (newReg.booking_mode === "secure_seat" && !newReg.screenshot_url) {
      setManualFormError(
        "Upload payment proof before creating a secured-seat registration."
      );
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
          school_name: "",
          address_with_city: "",
          activity_slug:
            activeActivityTab !== "all"
              ? activeActivityTab
              : "school-impact-summit-2026",
          booking_mode: "reserve_later",
          transaction_ref: "",
          verification_status: "pending_callback",
          fee_label: "",
          message: "",
          screenshot_url: "",
          screenshot_public_id: "",
          screenshot_name: "",
        });
        openInspector(json.registration);
      } else {
        alert(json.error || "Failed to create registration.");
      }
    } finally {
      setCreating(false);
    }
  };

  const handleManualProofUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingManualProof(true);
    setManualFormError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("purpose", "screenshot");
      fd.append("activity_slug", newReg.activity_slug);
      const response = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await response.json();
      if (!response.ok || !data.url) {
        setManualFormError(data.error || "Screenshot upload failed.");
        return;
      }
      setNewReg((prev) => ({
        ...prev,
        screenshot_url: data.url,
        screenshot_public_id: data.publicId || "",
        screenshot_name: file.name,
        booking_mode: "secure_seat",
        verification_status: "awaiting_verification",
      }));
    } catch (error) {
      setManualFormError(
        error instanceof Error ? error.message : "Screenshot upload failed."
      );
    } finally {
      setUploadingManualProof(false);
      e.target.value = "";
    }
  };

  const handleExportCsv = () => {
    const headers = [
      "Booking Ref",
      "Participant Name",
      "Email",
      "Phone",
      "Role",
      "School Name",
      "Address with City",
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
      r.school_name || r.organization || "",
      r.address_with_city || "",
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
  const bookingModeStyles = (
    mode: BookingModeType,
    verificationStatus?: VerificationStatus
  ) => {
    if (mode === "secure_seat" && verificationStatus !== "verified_confirmed") {
      return {
        pill: "bg-sky-50 text-sky-800 border-sky-300 font-extrabold shadow-2xs",
        dot: "bg-sky-500",
        label: "Admin Review",
        shortLabel: "Admin Review",
        borderTop: "from-sky-400 via-sky-500 to-blue-500",
      };
    }
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
                onClick={() => {
                  if (selectMode) {
                    setSelectMode(false);
                    setSelectedIds(new Set());
                  } else {
                    setSelectMode(true);
                  }
                }}
                className={`h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer border ${
                  selectMode
                    ? "bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100"
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
                title={selectMode ? "Exit selection mode" : "Select records to delete"}
              >
                <Trash2 className={`w-3.5 h-3.5 ${selectMode ? "text-rose-600" : "text-rose-500"}`} />
                <span>{selectMode ? "Exit Select" : "Delete Records"}</span>
                {selectedIds.size > 0 && (
                  <span className="font-num px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-rose-600 text-white">
                    {selectedIds.size}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setManualFormError(null);
                  setAddModalOpen(true);
                }}
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
                onClick={() => loadData(false)}
                disabled={refreshing || loading}
                className="h-9 px-3 rounded-xl bg-[#102E4D] hover:bg-[#001B33] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                title="Refresh Records"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#FFC400] ${refreshing || loading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">{refreshing ? "Refreshing…" : "Refresh"}</span>
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

          {/* BATCH SELECTION & ACTION BAR */}
          {(selectMode || selectedIds.size > 0) && (
            <div className="p-3 bg-gradient-to-r from-rose-50 via-amber-50 to-sky-50 border-b border-rose-200/90 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-2.5">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 select-none">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeSelected;
                    }}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded text-rose-600 border-slate-300 focus:ring-rose-500 cursor-pointer"
                  />
                  <span>Select All ({filteredRegistrations.length})</span>
                </label>

                <span className="h-4 w-px bg-slate-300 mx-1 hidden sm:inline-block" />

                <span className="text-xs font-bold text-slate-600">
                  <span className="font-num text-rose-700 font-extrabold">{selectedIds.size}</span> of{" "}
                  <span className="font-num">{filteredRegistrations.length}</span> records selected
                </span>

                {selectedIds.size > 0 && (
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Clear Selection
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={promptBatchDelete}
                  disabled={selectedIds.size === 0 || deleting}
                  className="h-8 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>
                    {deleting
                      ? "Deleting…"
                      : selectedIds.size > 0
                      ? `Delete Selected (${selectedIds.size})`
                      : "Delete Selected"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectMode(false);
                    setSelectedIds(new Set());
                  }}
                  className="h-8 px-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
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

        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 crm-scrollbar-x">
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

      {/* Toast Feedback for Actions */}
      {feedback && !selected && (
        <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center justify-between gap-2 border border-emerald-200 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{feedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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
              const bStyle = bookingModeStyles(r.booking_mode, r.verification_status);
              const vBadge = verificationBadge(r.verification_status);
              const avatarColor = getAvatarColor(r.full_name);
              const initials = getInitials(r.full_name);
              const relativeTime = getRelativeTimeString(r.created_at);
              const isSelected = selectedIds.has(r.id);

              return (
                <div
                  key={r.id}
                  onClick={() => openInspector(r)}
                  className={`group relative rounded-2xl bg-white border hover:border-slate-300 hover:shadow-md transition-all duration-150 flex flex-col justify-between overflow-hidden cursor-pointer ${
                    isSelected
                      ? "border-rose-400 ring-2 ring-rose-300/60 bg-rose-50/20"
                      : "border-slate-200/90"
                  }`}
                >
                  {/* Status Top Strip */}
                  <div className={`h-1.5 w-full bg-gradient-to-r ${bStyle.borderTop}`} />

                  <div className="p-4 space-y-3 flex-1">
                    {/* Top Row: Checkbox + Ref ID + Booking Mode Pill */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleToggleSelectOne(r.id, e)}
                          className="w-4 h-4 rounded text-rose-600 border-slate-300 focus:ring-rose-500 cursor-pointer"
                        />
                        <span className="font-num font-extrabold text-[11px] text-[#102E4D] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          #{r.reference_code}
                        </span>
                      </div>

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
                          <span className="truncate">{r.school_name || r.organization || "Independent"}</span>
                        </div>
                        {r.address_with_city && (
                          <div className="flex items-center gap-1 text-[10.5px] text-slate-400 truncate mt-0.5">
                            <MapPin className="w-2.5 h-2.5 shrink-0 text-slate-400" />
                            <span className="truncate">{r.address_with_city}</span>
                          </div>
                        )}
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
                      <button
                        type="button"
                        onClick={(e) => promptDeleteSingle(r, e)}
                        className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white flex items-center justify-center transition-colors border border-rose-200 cursor-pointer"
                        title="Delete Record from Database"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── RICH, COLORFUL & COMPACT TABLE LIST VIEW ── */
          <div className="overflow-x-auto crm-scrollbar-x">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-2.5 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeSelected;
                      }}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 rounded text-rose-600 border-slate-300 focus:ring-rose-500 cursor-pointer"
                      title="Select / Deselect all records"
                    />
                  </th>
                  <th className="py-2.5 px-3 w-28 whitespace-nowrap">Booking Ref</th>
                  <th className="py-2.5 px-3 min-w-[120px] max-w-[160px]">Participant</th>
                  <th className="py-2.5 px-3 min-w-[130px] max-w-[180px]">Activity Cohort</th>
                  <th className="py-2.5 px-3 w-32 whitespace-nowrap">Booking Mode</th>
                  <th className="py-2.5 px-3 w-28 whitespace-nowrap">Payment Proof</th>
                  <th className="py-2.5 px-3 w-32 whitespace-nowrap">Verification</th>
                  <th className="py-2.5 px-3 w-28 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRegistrations.map((r) => {
                  const bStyle = bookingModeStyles(r.booking_mode, r.verification_status);
                  const vBadge = verificationBadge(r.verification_status);
                  const avatarColor = getAvatarColor(r.full_name);
                  const initials = getInitials(r.full_name);
                  const isSelected = selectedIds.has(r.id);

                  return (
                    <tr
                      key={r.id}
                      onClick={() => openInspector(r)}
                      className={`transition-colors cursor-pointer group ${
                        isSelected
                          ? "bg-rose-50/60 hover:bg-rose-100/60"
                          : "hover:bg-slate-50/70"
                      }`}
                    >
                      {/* Selection Checkbox */}
                      <td
                        className="py-2.5 px-3 w-10 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleToggleSelectOne(r.id, e)}
                          className="w-4 h-4 rounded text-rose-600 border-slate-300 focus:ring-rose-500 cursor-pointer"
                        />
                      </td>

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
                          <div className="min-w-0 max-w-[155px]">
                            <div className="font-bold text-slate-900 group-hover:text-[#FF7900] transition-colors truncate text-xs">
                              {r.full_name}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">
                              {r.school_name || r.organization || r.role || "Independent"}
                            </div>
                            {r.address_with_city && (
                              <div className="text-[9.5px] text-slate-400 truncate flex items-center gap-0.5">
                                <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                <span className="truncate">{r.address_with_city}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Activity Cohort (Compact & Clean) */}
                      <td className="py-2.5 px-3">
                        <div className="min-w-0 max-w-[170px]">
                          <div className="font-semibold text-[#102E4D] truncate text-xs" title={r.activity_title}>
                            {r.activity_title}
                          </div>
                          <div className="text-[10px] text-slate-400 font-num truncate">
                            {r.activity_city ? `${r.activity_city} • ` : ""}{r.activity_date || "2026 Cohort"}
                          </div>
                        </div>
                      </td>

                      {/* Booking Mode */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold inline-flex items-center gap-1.5 ${bStyle.pill}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${bStyle.dot}`} />
                          <span>{bStyle.shortLabel}</span>
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
                              className="w-3.5 h-3.5 rounded object-cover border border-white"
                            />
                            <span>View Proof</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">
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
                            className="px-2 py-1 rounded-lg bg-[#102E4D] hover:bg-[#001B33] text-white text-[10.5px] font-bold transition-colors cursor-pointer shadow-2xs"
                          >
                            Manage
                          </button>
                          <button
                            type="button"
                            onClick={(e) => promptDeleteSingle(r, e)}
                            className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white flex items-center justify-center transition-colors border border-rose-200 cursor-pointer"
                            title="Delete Record from Database"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-hidden pointer-events-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs transition-opacity"
            onClick={() => setSelected(null)}
          />

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92dvh] sm:max-h-[88vh] will-change-transform">
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
                      const bStyle = bookingModeStyles(
                        selected.booking_mode,
                        selected.verification_status
                      );
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
            <div className="p-3.5 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto overscroll-contain touch-pan-y [WebkitOverflowScrolling:touch] [will-change:scroll-position] flex-1 text-xs sm:text-sm crm-scrollbar-y">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  {/* Name & Reference */}
                  <div className="space-y-1">
                    <div className="text-[10px] sm:text-[10.5px] uppercase font-bold text-slate-400">
                      Participant Full Name
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-10 h-10 rounded-xl border ${getAvatarColor(selected.full_name)} flex items-center justify-center font-black text-sm shrink-0 shadow-2xs`}
                      >
                        {getInitials(selected.full_name)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-extrabold text-base sm:text-lg text-[#102E4D] leading-tight break-words">
                          {selected.full_name}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-[#EFFBF8] text-[#005696] font-extrabold text-[10px] border border-[#C8EFE6] font-num">
                            Ref: #{selected.reference_code}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                              selected.booking_mode === "secure_seat"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {selected.booking_mode === "secure_seat"
                              ? "Priority Seat"
                              : "Provisional Reservation"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Direct Contact Buttons */}
                  <div className="space-y-2">
                    {/* Email Box */}
                    <div className="flex items-center justify-between gap-1.5 p-2 rounded-xl bg-white border border-slate-200 min-w-0 shadow-2xs">
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
                    <div className="flex items-center justify-between gap-1.5 p-2 rounded-xl bg-white border border-slate-200 min-w-0 shadow-2xs">
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

                {/* DEDICATED COLORFUL PARTICIPANT DETAILS CARDS: School Name, Role, Address */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1">
                  {/* 1. School Name Card */}
                  <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-br from-[#EFF6FF] via-[#F8FAFC] to-white border-2 border-[#BFDBFE] shadow-2xs flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#005696] to-[#003A66] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#005696] block">
                        School Name
                      </span>
                      <p className="text-xs sm:text-[13.5px] font-black text-[#102E4D] leading-snug break-words mt-0.5">
                        {selected.school_name || selected.organization || "Independent / Individual"}
                      </p>
                    </div>
                  </div>

                  {/* 2. Role Card */}
                  <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-br from-[#FFF7ED] via-[#F8FAFC] to-white border-2 border-[#FED7AA] shadow-2xs flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF7900] to-[#E56D00] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#EA580C] block">
                        Role / Designation
                      </span>
                      <p className="text-xs sm:text-[13.5px] font-black text-[#102E4D] leading-snug break-words mt-0.5">
                        {selected.role || "Participant"}
                      </p>
                    </div>
                  </div>

                  {/* 3. Address Card */}
                  <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-br from-[#ECFDF5] via-[#F8FAFC] to-white border-2 border-[#A7F3D0] shadow-2xs flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#059669] block">
                        Address with City
                      </span>
                      <p className="text-xs sm:text-[13.5px] font-black text-[#102E4D] leading-snug break-words mt-0.5">
                        {selected.address_with_city || "Not Specified"}
                      </p>
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
              <div className="rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 p-3.5 sm:p-4 space-y-4">
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
                  <div className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-4 sm:p-5 flex flex-col items-center justify-center text-center space-y-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-2xs">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="font-bold text-xs sm:text-sm text-[#102E4D]">
                        No Payment Proof Screenshot Uploaded (Reservation Mode)
                      </div>
                      <div className="text-[11px] text-slate-600 max-w-md">
                        Upload bank transfer screenshot or deposit slip to unlock <strong className="text-emerald-700">Secured Seat</strong> and <strong className="text-emerald-700">Confirmed</strong> status.
                      </div>
                    </div>
                    <label className="mt-1 h-9 px-4 rounded-xl bg-[#005696] hover:bg-[#004477] text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-xs transition-all active:scale-[0.98]">
                      {uploadingProof ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Uploading Proof...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-4 h-4" />
                          <span>Upload Payment Screenshot</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingProof}
                        onChange={handleAdminProofUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* SECTION 5: CRM Controls (Booking Mode & Verification Status) */}
              <div className="rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 p-3.5 sm:p-4 space-y-3.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#102E4D] inline-flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#005696]" />
                    CRM Booking & Verification Controls
                  </span>
                  {(() => {
                    const isRecordLocked =
                      (selected.verification_status === "verified_confirmed" ||
                        selected.verification_status === "cancelled") &&
                      !isStatusUnlocked;
                    return isRecordLocked ? (
                      <span className="text-[10.5px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md inline-flex items-center gap-1 border border-amber-200">
                        <Lock className="w-3 h-3 text-amber-700" />
                        <span>Status Locked</span>
                      </span>
                    ) : null;
                  })()}
                </div>

                {/* Locked Banner Notification */}
                {(() => {
                  const isRecordLocked =
                    (selected.verification_status === "verified_confirmed" ||
                      selected.verification_status === "cancelled") &&
                    !isStatusUnlocked;

                  if (!isRecordLocked) return null;

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
                            Payment verified. This record is protected from accidental modifications.
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
                            This booking is cancelled and locked against changes.
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
                })()}

                {/* Proof Requirement Warning Alert */}
                {proofRequirementWarning && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{proofRequirementWarning}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProofRequirementWarning(null)}
                      className="text-amber-700 hover:text-amber-900 font-bold p-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {(() => {
                  const isRecordLocked =
                    (selected.verification_status === "verified_confirmed" ||
                      selected.verification_status === "cancelled") &&
                    !isStatusUnlocked;
                  const hasProof = Boolean(selected.screenshot_url);

                  const currentStatusOpt =
                    VERIFICATION_DROPDOWN_OPTIONS.find(
                      (opt) => opt.value === editVerification
                    ) || VERIFICATION_DROPDOWN_OPTIONS[0];
                  const CurrentIcon = currentStatusOpt.icon;

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Left: Booking Mode */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#102E4D]">
                            Booking Mode
                          </label>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {editMode === "secure_seat" ? "Seat Guaranteed" : "Provisional Hold"}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 h-11">
                          <button
                            type="button"
                            disabled={isRecordLocked}
                            onClick={() => {
                              if (isRecordLocked) return;
                              if (!hasProof) {
                                setProofRequirementWarning(
                                  "Payment proof screenshot required before switching to Secured Seat. Please upload a screenshot proof first."
                                );
                                return;
                              }
                              setProofRequirementWarning(null);
                              setEditMode("secure_seat");
                              // If current status is pending callback, move to Admin Review (awaiting_verification)
                              if (editVerification === "pending_callback") {
                                setEditVerification("awaiting_verification");
                              }
                            }}
                            className={`h-11 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                              isRecordLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                            } ${
                              editMode === "secure_seat"
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-500/30 font-extrabold"
                                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            <ShieldCheck className="w-4 h-4 shrink-0" />
                            <span>Secured Seat</span>
                          </button>

                          <button
                            type="button"
                            disabled={isRecordLocked}
                            onClick={() => {
                              if (isRecordLocked) return;
                              setProofRequirementWarning(null);
                              setEditMode("reserve_later");
                              // Switch status to initial reservation status: Pending Call Back
                              if (editVerification !== "cancelled") {
                                setEditVerification("pending_callback");
                              }
                            }}
                            className={`h-11 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                              isRecordLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                            } ${
                              editMode === "reserve_later"
                                ? "bg-amber-500 text-white border-amber-500 shadow-xs ring-2 ring-amber-400/30 font-extrabold"
                                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            <CalendarCheck2 className="w-4 h-4 shrink-0" />
                            <span>Reservation</span>
                          </button>
                        </div>
                      </div>

                      {/* Right: Verification Status Dropdown List */}
                      <div className="space-y-1.5 relative" ref={statusDropdownRef}>
                        <div className="flex items-center justify-between">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#102E4D]">
                            Verification Status
                          </label>
                          {isRecordLocked ? (
                            <span className="text-[10px] text-slate-400 font-semibold inline-flex items-center gap-1">
                              <Lock className="w-3 h-3 text-slate-400" />
                              <span>Locked</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium">
                              Step {currentStatusOpt.stepNum} of 4
                            </span>
                          )}
                        </div>

                        {/* Dropdown Trigger Button */}
                        <button
                          type="button"
                          disabled={isRecordLocked}
                          onClick={() => {
                            if (isRecordLocked) return;
                            setStatusDropdownOpen((prev) => !prev);
                          }}
                          className={`w-full h-11 px-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                            isRecordLocked
                              ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed opacity-75"
                              : `${currentStatusOpt.badgeBg} ${currentStatusOpt.badgeBorder} hover:shadow-2xs cursor-pointer`
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-lg ${currentStatusOpt.dotColor} text-white flex items-center justify-center shrink-0 shadow-2xs`}
                            >
                              <CurrentIcon className="w-3.5 h-3.5" />
                            </div>
                            <div className="text-left min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-extrabold text-[#102E4D] truncate">
                                  {currentStatusOpt.label}
                                </span>
                                <span
                                  className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${currentStatusOpt.badgeBg} ${currentStatusOpt.badgeText} border ${currentStatusOpt.badgeBorder} shrink-0`}
                                >
                                  Step {currentStatusOpt.stepNum}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-500 truncate leading-none mt-0.5">
                                {currentStatusOpt.shortDesc}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 ml-1">
                            <ChevronDown
                              className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                                statusDropdownOpen ? "rotate-180 text-[#102E4D]" : ""
                              }`}
                            />
                          </div>
                        </button>

                        {/* Floating Dropdown Menu */}
                        {statusDropdownOpen && !isRecordLocked && (
                          <div className="absolute top-full left-0 right-0 mt-1.5 z-40 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden py-1 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
                            <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                              <span>Select Verification Status</span>
                              <span className="text-[9.5px] font-semibold text-slate-400">Stages locally until Save</span>
                            </div>

                            <div className="p-1 space-y-1">
                              {VERIFICATION_DROPDOWN_OPTIONS.map((opt) => {
                                const isSelected = editVerification === opt.value;
                                const IconComp = opt.icon;
                                return (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                      if (opt.requiresProof && !hasProof) {
                                        setProofRequirementWarning(
                                          "Payment proof screenshot required before Admin Review or confirming the seat. Please upload a screenshot proof first."
                                        );
                                        setStatusDropdownOpen(false);
                                        return;
                                      }
                                      setProofRequirementWarning(null);
                                      setEditVerification(opt.value);
                                      // Workflow synchronizations
                                      if (opt.value === "pending_callback") {
                                        setEditMode("reserve_later");
                                      } else if (
                                        opt.value === "awaiting_verification" ||
                                        opt.value === "verified_confirmed"
                                      ) {
                                        setEditMode("secure_seat");
                                      }
                                      setStatusDropdownOpen(false);
                                    }}
                                    className={`w-full px-2.5 py-2 rounded-lg text-left transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                                      isSelected
                                        ? `${opt.badgeBg} border ${opt.badgeBorder}`
                                        : "hover:bg-slate-50 border border-transparent"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div
                                        className={`w-7 h-7 rounded-lg ${
                                          isSelected ? opt.dotColor : "bg-slate-100"
                                        } ${
                                          isSelected ? "text-white" : "text-slate-600"
                                        } flex items-center justify-center shrink-0`}
                                      >
                                        <IconComp className="w-3.5 h-3.5" />
                                      </div>
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                          <span
                                            className={`text-xs font-bold ${
                                              isSelected ? "text-[#102E4D]" : "text-slate-800"
                                            }`}
                                          >
                                            {opt.stepNum}. {opt.label}
                                          </span>
                                          {opt.requiresProof && !hasProof && (
                                            <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-semibold shrink-0">
                                              Proof required
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-[10.5px] text-slate-500 truncate leading-snug">
                                          {opt.shortDesc}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <span
                                        className={`text-[9.5px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                                          isSelected
                                            ? `${opt.badgeBg} ${opt.badgeText} border ${opt.badgeBorder}`
                                            : "bg-slate-100 text-slate-500"
                                        }`}
                                      >
                                        Step {opt.stepNum}
                                      </span>
                                      {isSelected && (
                                        <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  {/* Transaction Ref */}
                  <div className="space-y-2">
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
                  <div className="space-y-2">
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
                    Quick Log Suggestions (Click to append):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
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
                          className={`min-h-[46px] h-auto py-2 px-3 rounded-xl border text-left transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98] flex items-center gap-2.5 ${item.color}`}
                        >
                          <span className={`w-6 h-6 rounded-lg ${item.iconBg} flex items-center justify-center shrink-0`}>
                            <IconComp className="w-3.5 h-3.5" />
                          </span>
                          <span className="text-xs font-bold leading-snug whitespace-normal break-words text-left">
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
                onClick={() => promptDeleteSingle(selected)}
                className="h-9 px-3 sm:px-3.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Permanently delete this registration record"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Record</span>
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
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes…</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-hidden pointer-events-auto">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs transition-opacity"
            onClick={() => setAddModalOpen(false)}
          />

          <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92dvh] sm:max-h-[88vh] will-change-transform">
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
              <div className="p-4 sm:p-6 space-y-5 overflow-y-auto overscroll-contain touch-pan-y [WebkitOverflowScrolling:touch] [will-change:scroll-position] flex-1 text-xs sm:text-sm crm-scrollbar-y">
                {/* Participant Details */}
                <section className="rounded-xl sm:rounded-2xl bg-slate-50/80 border border-slate-200/90 p-3.5 sm:p-4 space-y-3">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        School Name <span className="text-[#FF7900]">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Beaconhouse / Roots Millennium"
                        value={newReg.school_name || newReg.organization}
                        onChange={(e) =>
                          setNewReg({
                            ...newReg,
                            school_name: e.target.value,
                            organization: e.target.value,
                          })
                        }
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#FF7900] focus:ring-2 focus:ring-[#FF7900]/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Address with City <span className="text-[#FF7900]">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Sector F-8/4, Islamabad"
                        value={newReg.address_with_city}
                        onChange={(e) =>
                          setNewReg({
                            ...newReg,
                            address_with_city: e.target.value,
                          })
                        }
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#FF7900] focus:ring-2 focus:ring-[#FF7900]/20"
                      />
                    </div>
                  </div>
                </section>

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
                    {(() => {
                      const selectedActivity = activities.find(
                        (activity) => activity.slug === newReg.activity_slug
                      );
                      const selectedDate = selectedActivity
                        ? new Date(selectedActivity.startDate + "T00:00:00")
                        : null;
                      return (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => {
                              setManualActivityOpen((open) => !open);
                              setManualVerificationOpen(false);
                            }}
                            className="w-full min-h-[58px] rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left shadow-2xs hover:border-[#FF7900] focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 transition-all flex items-center gap-3"
                          >
                            {selectedDate && (
                              <span className="w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 text-center">
                                <span className="block bg-[#102E4D] px-1 py-0.5 text-[9px] font-black uppercase text-white">
                                  {selectedDate.toLocaleDateString("en-US", { month: "short" })}
                                </span>
                                <span className="block py-0.5 text-base font-black leading-none text-[#102E4D]">
                                  {selectedDate.getDate()}
                                </span>
                              </span>
                            )}
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-xs sm:text-sm font-extrabold text-[#102E4D]">
                                {selectedActivity?.title || "Choose an activity"}
                              </span>
                              <span className="mt-0.5 block truncate text-[10px] font-semibold text-slate-500">
                                {selectedActivity
                                  ? `${selectedActivity.city} • ${selectedActivity.schedule || selectedActivity.duration}`
                                  : "Select a cohort for this registration"}
                              </span>
                            </span>
                            <ChevronDown
                              className={`w-4 h-4 shrink-0 text-slate-400 transition-transform ${
                                manualActivityOpen ? "rotate-180 text-[#FF7900]" : ""
                              }`}
                            />
                          </button>
                          {manualActivityOpen && (
                            <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-y-auto rounded-2xl border-2 border-[#102E4D]/20 bg-white p-2 shadow-2xl">
                              <div className="border-b border-slate-100 px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                Available activity cohorts · {activities.length}
                              </div>
                              <div className="space-y-1 pt-1">
                                {[...activities]
                                  .sort((a, b) => a.startDate.localeCompare(b.startDate))
                                  .map((activity) => {
                                    const date = new Date(activity.startDate + "T00:00:00");
                                    const monthTheme = getMonthTheme(date.getMonth());
                                    const isSelected = activity.slug === newReg.activity_slug;
                                    return (
                                      <button
                                        key={activity.slug}
                                        type="button"
                                        onClick={() => {
                                          setNewReg({
                                            ...newReg,
                                            activity_slug: activity.slug,
                                            screenshot_url: "",
                                            screenshot_public_id: "",
                                            screenshot_name: "",
                                          });
                                          setManualActivityOpen(false);
                                        }}
                                        className={`flex w-full items-center gap-2.5 rounded-xl border p-2 text-left transition-all ${
                                          isSelected
                                            ? "border-[#102E4D] bg-[#EFFBF8] ring-2 ring-[#102E4D]/10"
                                            : "border-slate-100 hover:border-[#C8EFE6] hover:bg-[#EFFBF8]/60"
                                        }`}
                                      >
                                        <span className="w-11 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white text-center">
                                          <span className={`block bg-gradient-to-r ${monthTheme.gradient} px-1 py-0.5 text-[8px] font-black uppercase text-white`}>
                                            {date.toLocaleDateString("en-US", { month: "short" })}
                                          </span>
                                          <span className="block py-1 text-sm font-black leading-none text-[#102E4D]">
                                            {date.getDate()}
                                          </span>
                                        </span>
                                        <span className="min-w-0 flex-1">
                                          <span className="block truncate text-[12px] font-extrabold text-[#102E4D]">
                                            {activity.title}
                                          </span>
                                          <span className="block truncate text-[10px] font-semibold text-slate-500">
                                            {CATEGORY_LABELS[activity.category]} • {activity.city}
                                          </span>
                                        </span>
                                        {isSelected && <Check className="h-4 w-4 shrink-0 text-emerald-600" />}
                                      </button>
                                    );
                                  })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="space-y-4">
                    {/* Booking Mode Selector */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Booking Mode
                      </label>
                      <div className="grid grid-cols-2 gap-1.5 h-10">
                        <button
                          type="button"
                          onClick={() =>
                            newReg.screenshot_url
                              ? setNewReg({
                                  ...newReg,
                                  booking_mode: "secure_seat",
                                  verification_status: "awaiting_verification",
                                })
                              : setManualFormError(
                                  "Upload payment proof before selecting Secured Seat."
                                )
                          }
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
                          onClick={() =>
                            setNewReg({
                              ...newReg,
                              booking_mode: "reserve_later",
                              verification_status: "pending_callback",
                            })
                          }
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

                    <div
                        className={`rounded-2xl border p-3.5 sm:p-4 grid grid-cols-1 sm:grid-cols-[1fr_auto] items-center gap-3 ${
                          newReg.screenshot_url
                            ? "border-emerald-200 bg-emerald-50/70"
                            : "border-sky-200 bg-sky-50/70"
                        }`}
                      >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          newReg.screenshot_url
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-sky-100 text-sky-700"
                        }`}
                      >
                        <UploadCloud className="w-4 h-4" />
                    </div>
                      <div className="min-w-0">
                        <p
                          className={`text-xs font-extrabold uppercase tracking-wider ${
                            newReg.screenshot_url
                              ? "text-emerald-900"
                              : "text-sky-900"
                          }`}
                        >
                          Payment screenshot
                        </p>
                        <p
                          className={`text-[11px] leading-relaxed mt-1 ${
                            newReg.screenshot_url
                              ? "text-emerald-800/80"
                              : "text-sky-800/80"
                          }`}
                        >
                          Upload proof to enable Admin Review, Confirmed, and Secured Seat.
                        </p>
                      </div>
                    </div>

                    <label
                      className={`flex min-h-12 min-w-[220px] items-center justify-center gap-2 rounded-xl border border-dashed bg-white px-4 py-2.5 text-xs font-bold cursor-pointer transition-colors ${
                        newReg.screenshot_url
                          ? "border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                          : "border-sky-300 text-sky-800 hover:bg-sky-100"
                      }`}
                    >
                      {uploadingManualProof ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Uploading screenshot…
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-4 h-4" />
                          {newReg.screenshot_url
                            ? "Replace payment screenshot"
                            : "Upload payment screenshot"}
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/heic"
                        onChange={handleManualProofUpload}
                        disabled={uploadingManualProof}
                        className="sr-only"
                      />
                    </label>

                    {newReg.screenshot_url && (
                      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-[11px] text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                        <span className="truncate font-semibold">
                          {newReg.screenshot_name || "Payment screenshot uploaded"}
                        </span>
                      </div>
                    )}
                      </div>

                    {/* Verification Status */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Initial Verification Status
                      </label>
                        {(() => {
                          const selectedOption =
                            VERIFICATION_DROPDOWN_OPTIONS.find(
                              (option) => option.value === newReg.verification_status
                            ) || VERIFICATION_DROPDOWN_OPTIONS[0];
                          const SelectedIcon = selectedOption.icon;
                          return (
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => {
                                  setManualVerificationOpen((open) => !open);
                                  setManualActivityOpen(false);
                                }}
                                className={`w-full min-h-[58px] rounded-2xl border ${selectedOption.badgeBorder} ${selectedOption.badgeBg} px-3 py-2 text-left shadow-2xs hover:shadow-sm transition-all flex items-center gap-3`}
                              >
                                <span className={`w-9 h-9 rounded-xl ${selectedOption.dotColor} text-white flex items-center justify-center shrink-0`}>
                                  <SelectedIcon className="w-4 h-4" />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className={`block text-xs font-extrabold ${selectedOption.badgeText}`}>
                                    {selectedOption.label}
                                  </span>
                                  <span className="block mt-0.5 truncate text-[10px] font-semibold text-slate-600">
                                    {selectedOption.shortDesc}
                                  </span>
                                </span>
                                <ChevronDown
                                  className={`w-4 h-4 shrink-0 text-slate-500 transition-transform ${
                                    manualVerificationOpen ? "rotate-180" : ""
                                  }`}
                                />
                              </button>
                              {manualVerificationOpen && (
                                <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border-2 border-[#102E4D]/20 bg-white p-2 shadow-2xl">
                                  <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                    Select verification stage
                                  </div>
                                  <div className="space-y-1">
                                    {VERIFICATION_DROPDOWN_OPTIONS.map((option) => {
                                      const Icon = option.icon;
                                      const disabled =
                                        Boolean(option.requiresProof) &&
                                        !newReg.screenshot_url;
                                      const selectedStatus =
                                        newReg.verification_status === option.value;
                                      return (
                                        <button
                                          key={option.value}
                                          type="button"
                                          disabled={disabled}
                                          onClick={() => {
                                            if (disabled) {
                                              setManualFormError(
                                                "Upload payment proof before selecting Admin Review or Confirmed."
                                              );
                                              return;
                                            }
                                            setManualFormError(null);
                                            setNewReg({
                                              ...newReg,
                                              verification_status: option.value,
                                              booking_mode:
                                                option.value === "pending_callback"
                                                  ? "reserve_later"
                                                  : option.value === "cancelled"
                                                  ? newReg.booking_mode
                                                  : "secure_seat",
                                            });
                                            setManualVerificationOpen(false);
                                          }}
                                          className={`flex w-full items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all ${
                                            selectedStatus
                                              ? `${option.badgeBg} ${option.badgeBorder} ring-2 ring-[#102E4D]/10`
                                              : disabled
                                              ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-50"
                                              : "cursor-pointer border-transparent hover:border-slate-200 hover:bg-slate-50"
                                          }`}
                                        >
                                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selectedStatus ? `${option.dotColor} text-white` : "bg-slate-100 text-slate-600"}`}>
                                            <Icon className="w-4 h-4" />
                                          </span>
                                          <span className="min-w-0 flex-1">
                                            <span className="block text-[11px] font-extrabold text-[#102E4D]">
                                              {option.stepNum}. {option.label}
                                            </span>
                                            <span className="block text-[9.5px] leading-snug text-slate-500">
                                              {disabled ? "Upload proof first" : option.shortDesc}
                                            </span>
                                          </span>
                                          {selectedStatus && <Check className="h-4 w-4 shrink-0 text-emerald-600" />}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
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
                {manualFormError && (
                  <p className="max-w-[52%] text-[11px] font-semibold leading-relaxed text-rose-700">
                    {manualFormError}
                  </p>
                )}
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
                    disabled={
                      creating ||
                      uploadingManualProof ||
                      (newReg.booking_mode === "secure_seat" &&
                        !newReg.screenshot_url)
                    }
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

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 7. DELETE CONFIRMATION MODAL (Safe, Explicit & Professional)       */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-hidden pointer-events-auto">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs transition-opacity"
            onClick={() => !deleting && setDeleteConfirmOpen(false)}
          />

          <div className="relative z-10 w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Top red accent line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 rounded-full" />

            <div className="flex items-start gap-3.5 pt-1">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#102E4D]">
                  {recordsToDelete.length === 1
                    ? "Delete Registration Record?"
                    : `Delete ${recordsToDelete.length} Registration Records?`}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to permanently delete{" "}
                  {recordsToDelete.length === 1 ? (
                    <strong className="text-slate-800">
                      #{recordsToDelete[0].reference_code} ({recordsToDelete[0].full_name})
                    </strong>
                  ) : (
                    <strong className="text-slate-800">{recordsToDelete.length} selected records</strong>
                  )}{" "}
                  from the database?
                </p>
              </div>
            </div>

            {/* List preview if <= 4 records */}
            {recordsToDelete.length > 0 && recordsToDelete.length <= 4 && (
              <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 space-y-1.5 text-xs text-slate-600">
                {recordsToDelete.map((r) => (
                  <div key={r.id} className="flex items-center justify-between gap-2 truncate">
                    <span className="font-bold text-[#102E4D]">
                      #{r.reference_code} — {r.full_name}
                    </span>
                    <span className="text-[10.5px] text-slate-400 truncate">{r.activity_title}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="p-3 bg-rose-50/80 border border-rose-200/90 rounded-xl text-[11px] text-rose-800 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>
                This will permanently remove the record(s) from Supabase and delete any uploaded payment proof screenshots from Cloudinary. <strong>This action cannot be undone.</strong>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting from DB…</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Permanently Delete</span>
                  </>
                )}
              </button>
            </div>
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

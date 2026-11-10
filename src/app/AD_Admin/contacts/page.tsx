"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useDeferredValue,
} from "react";
import {
  Search,
  Download,
  RefreshCw,
  Mail,
  Phone,
  Building2,
  MapPin,
  X,
  Trash2,
  CheckCircle2,
  Clock,
  Archive,
  Save,
  LayoutGrid,
  List,
  Copy,
  Check,
  Plus,
  Calendar,
  Tag,
  CheckCheck,
  MessageSquare,
  ArrowUpDown,
  Filter,
  User,
  UserPlus,
  FileText,
  Lock,
  Unlock,
  Loader2,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import type {
  ContactCrmStatus,
  ContactSubmissionRecord,
} from "@/lib/supabase-store";

const STATUS_TABS: Array<{
  id: "all" | ContactCrmStatus;
  label: string;
  activeClass: string;
}> = [
  {
    id: "all",
    label: "All Inquiries",
    activeClass: "bg-[#102E4D] text-white shadow-xs",
  },
  {
    id: "new",
    label: "New / Unread",
    activeClass: "bg-[#FF7900] text-white shadow-xs",
  },
  {
    id: "in_progress",
    label: "In Progress",
    activeClass: "bg-[#D97706] text-white shadow-xs",
  },
  {
    id: "responded",
    label: "Responded",
    activeClass: "bg-[#059669] text-white shadow-xs",
  },
  {
    id: "archived",
    label: "Not Interested",
    activeClass: "bg-slate-700 text-white shadow-xs",
  },
];

const AVATAR_COLORS = [
  "bg-amber-100 text-amber-800 border-amber-300",
  "bg-emerald-100 text-emerald-800 border-emerald-300",
  "bg-sky-100 text-sky-800 border-sky-300",
  "bg-violet-100 text-violet-800 border-violet-300",
  "bg-rose-100 text-rose-800 border-rose-300",
  "bg-teal-100 text-teal-800 border-teal-300",
];

const QUICK_NOTE_SUGGESTIONS = [
  {
    icon: Phone,
    label: "Spoke on Phone",
    appendNote: "• Spoke on phone with sender",
    color: "text-blue-700 bg-blue-50/80 border-blue-200 hover:bg-blue-100/80 hover:border-blue-300",
    iconBg: "bg-blue-100 text-blue-600",
  },
  {
    icon: FaWhatsapp,
    label: "Sent WhatsApp",
    appendNote: "• Sent official brochure & details via WhatsApp",
    color: "text-emerald-800 bg-emerald-50/80 border-emerald-200 hover:bg-emerald-100/80 hover:border-emerald-300",
    iconBg: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: Calendar,
    label: "Meeting Booked",
    appendNote: "• Meeting scheduled with leadership team",
    color: "text-amber-800 bg-amber-50/80 border-amber-200 hover:bg-amber-100/80 hover:border-amber-300",
    iconBg: "bg-amber-100 text-amber-600",
  },
  {
    icon: CheckCircle2,
    label: "Inquiry Resolved",
    appendNote: "• Inquiry resolved and follow-up completed",
    color: "text-teal-800 bg-teal-50/80 border-teal-200 hover:bg-teal-100/80 hover:border-teal-300",
    iconBg: "bg-teal-100 text-teal-600",
  },
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

function formatTopicName(topic: string): string {
  if (!topic) return "General Inquiry";
  return topic
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminContactsCrmPage() {
  const [contacts, setContacts] = useState<ContactSubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filters & Sorting (Priority removed as requested)
  const [statusFilter, setStatusFilter] = useState<"all" | ContactCrmStatus>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name" | "status">("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  // Details Modal Inspector State
  const [selected, setSelected] = useState<ContactSubmissionRecord | null>(null);
  const [editStatus, setEditStatus] = useState<ContactCrmStatus>("new");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isStatusUnlocked, setIsStatusUnlocked] = useState(false);

  // Create Inquiry Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addingInquiry, setAddingInquiry] = useState(false);
  const [addForm, setAddForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    organization: "",
    address_with_city: "",
    interest: "school-impact-summit",
    crm_status: "new" as ContactCrmStatus,
    message: "",
    admin_notes: "",
  });

  // Lock background scroll when modal is active (smooth mobile touch performance)
  useEffect(() => {
    if (selected || addModalOpen) {
      const prevOverflow = document.body.style.overflow;
      const prevTouchAction = document.body.style.touchAction;
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      return () => {
        document.body.style.overflow = prevOverflow;
        document.body.style.touchAction = prevTouchAction;
      };
    }
  }, [selected, addModalOpen]);

  // Load view mode preference from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("tlc_contacts_crm_view_mode");
      if (savedMode === "list" || savedMode === "grid") {
        setViewMode(savedMode);
      }
    }
  }, []);

  const handleSetViewMode = (mode: "grid" | "list") => {
    setViewMode(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("tlc_contacts_crm_view_mode", mode);
    }
  };

  const loadContacts = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    try {
      const res = await fetch("/api/admin/contacts", { cache: "no-store" });
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
        setContacts(Array.isArray(json.contacts) ? json.contacts : []);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadContacts(true);
  }, [loadContacts]);

  // Automatic Real-Time Sync: refresh contacts on external changes, tab focus, and background interval
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleExternalSync = () => {
      loadContacts(false);
    };

    const handleFocusOrVisible = () => {
      if (document.visibilityState === "visible") {
        loadContacts(false);
      }
    };

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible" && !selected && !addModalOpen) {
        loadContacts(false);
      }
    }, 12000);

    window.addEventListener("tlc:admin-sync-external", handleExternalSync);
    window.addEventListener("focus", handleFocusOrVisible);
    document.addEventListener("visibilitychange", handleFocusOrVisible);

    return () => {
      window.removeEventListener("tlc:admin-sync-external", handleExternalSync);
      window.removeEventListener("focus", handleFocusOrVisible);
      document.removeEventListener("visibilitychange", handleFocusOrVisible);
      window.clearInterval(intervalId);
    };
  }, [loadContacts, selected, addModalOpen]);

  const openInspector = (record: ContactSubmissionRecord) => {
    setSelected(record);
    setEditStatus(record.crm_status);
    setEditNotes(record.admin_notes || "");
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

  const filteredContacts = useMemo(() => {
    const q = deferredSearchQuery.trim().toLowerCase();
    const result = contacts.filter((c) => {
      if (statusFilter !== "all" && c.crm_status !== statusFilter) return false;
      if (!q) return true;
      return (
        c.full_name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.organization.toLowerCase().includes(q) ||
        (c.address_with_city && c.address_with_city.toLowerCase().includes(q)) ||
        c.phone.toLowerCase().includes(q) ||
        c.interest.toLowerCase().includes(q) ||
        c.message.toLowerCase().includes(q) ||
        c.reference_code.toLowerCase().includes(q)
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
      if (sortBy === "status") {
        return a.crm_status.localeCompare(b.crm_status);
      }
      return 0;
    });

    return result;
  }, [contacts, statusFilter, deferredSearchQuery, sortBy]);

  const counts = useMemo(() => {
    const total = contacts.length;
    const newCount = contacts.filter((c) => c.crm_status === "new").length;
    const inProgressCount = contacts.filter((c) => c.crm_status === "in_progress").length;
    const respondedCount = contacts.filter((c) => c.crm_status === "responded").length;
    const archivedCount = contacts.filter((c) => c.crm_status === "archived").length;

    return {
      all: total,
      new: newCount,
      in_progress: inProgressCount,
      responded: respondedCount,
      archived: archivedCount,
      respondedPercent: total > 0 ? Math.round((respondedCount / total) * 100) : 0,
    };
  }, [contacts]);

  const handleSaveRecord = async (quickStatus?: ContactCrmStatus) => {
    if (!selected) return;
    setSaving(true);
    setFeedback(null);
    const targetStatus = quickStatus || editStatus;

    try {
      const res = await fetch("/api/admin/contacts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selected.id,
          crm_status: targetStatus,
          admin_notes: editNotes,
        }),
      });
      const json = await res.json();
      if (res.ok && json.contact) {
        setContacts((prev) =>
          prev.map((item) => (item.id === selected.id ? json.contact : item))
        );
        setSelected(json.contact);
        setEditStatus(json.contact.crm_status);
        setIsStatusUnlocked(false);
        const stLabel = statusStyles(json.contact.crm_status).label;
        setFeedback(`Contact inquiry updated to "${stLabel}" successfully!`);
        setTimeout(() => setFeedback(null), 3000);
      } else {
        loadContacts();
        alert(json?.error || "Failed to update inquiry.");
      }
    } catch (err) {
      loadContacts();
      console.error("Failed to update contact:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!window.confirm("Permanently delete this contact inquiry record? This action cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(
        `/api/admin/contacts?id=${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        alert(json?.error || "Failed to delete this inquiry.");
        return;
      }
      setContacts((prev) => prev.filter((c) => c.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (err) {
      console.error("Failed to delete contact:", err);
      alert("A network error occurred while deleting this inquiry.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.full_name.trim() || !addForm.email.trim()) {
      alert("Name and Email are required.");
      return;
    }
    setAddingInquiry(true);
    try {
      const res = await fetch("/api/admin/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const json = await res.json();
      if (res.ok && json.contact) {
        setContacts((prev) => [json.contact, ...prev]);
        setAddModalOpen(false);
        setAddForm({
          full_name: "",
          email: "",
          phone: "",
          organization: "",
          address_with_city: "",
          interest: "school-impact-summit",
          crm_status: "new",
          message: "",
          admin_notes: "",
        });
        openInspector(json.contact);
      } else {
        alert(json.error || "Failed to create inquiry.");
      }
    } finally {
      setAddingInquiry(false);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      "Reference",
      "Full Name",
      "Email",
      "Phone",
      "Organization",
      "Address with City",
      "Interest / Topic",
      "CRM Status",
      "Message",
      "Admin Notes",
      "Submitted At",
      "Responded At",
    ];
    const rows = filteredContacts.map((c) => [
      c.reference_code,
      c.full_name,
      c.email,
      c.phone,
      c.organization,
      c.address_with_city || "",
      c.interest,
      c.crm_status,
      c.message.replace(/\r?\n/g, " "),
      (c.admin_notes || "").replace(/\r?\n/g, " "),
      c.created_at,
      c.responded_at || "",
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
    link.download = `TLC-Contact-Inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Status visual themes
  const statusStyles = (s: ContactCrmStatus) => {
    switch (s) {
      case "new":
        return {
          pill: "bg-orange-50 text-[#E56D00] border-orange-200/80 font-bold",
          dot: "bg-[#FF7900]",
          label: "New",
          isLocked: false,
          borderTop: "from-[#FF7900] to-[#FF9E40]",
        };
      case "in_progress":
        return {
          pill: "bg-amber-50 text-amber-800 border-amber-200 font-bold",
          dot: "bg-amber-500",
          label: "In Progress",
          isLocked: false,
          borderTop: "from-amber-400 to-amber-600",
        };
      case "responded":
        return {
          pill: "bg-emerald-50 text-emerald-800 border-emerald-200 font-bold",
          dot: "bg-emerald-500",
          label: "Responded",
          isLocked: true,
          borderTop: "from-emerald-400 to-teal-500",
        };
      case "archived":
        return {
          pill: "bg-slate-100 text-slate-700 border-slate-300 font-bold",
          dot: "bg-slate-500",
          label: "Not Interested",
          isLocked: true,
          borderTop: "from-slate-400 to-slate-600",
        };
    }
  };

  return (
    <div className="space-y-3 pb-8 max-w-[1600px] mx-auto">
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1. COMPACT EXECUTIVE HEADER & METRIC STRIP (NO EMPTY VERTICAL SPACE)  */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3.5">
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-extrabold text-xl sm:text-2xl text-[#102E4D] tracking-tight">
                Contact Inquiries CRM
              </h1>
              <span className="font-num px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                {counts.all} {counts.all === 1 ? "Inquiry" : "Inquiries"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Review, qualify, and track responses to all school, corporate, and parent inquiries.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="h-8.5 px-3.5 rounded-lg bg-[#FF7900] hover:bg-[#E56D00] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Inquiry</span>
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={filteredContacts.length === 0}
              className="h-8.5 px-3 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Compact Integrated Metric Strip (Sleek, Not Bulky) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          {/* Total */}
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-2 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              statusFilter === "all"
                ? "bg-[#102E4D] text-white border-[#102E4D] shadow-xs"
                : "bg-slate-50 hover:bg-slate-100/80 text-slate-800 border-slate-200/80"
            }`}
          >
            <div>
              <div className={`text-[10.5px] font-bold uppercase tracking-wider ${statusFilter === "all" ? "text-slate-300" : "text-slate-500"}`}>
                Total Inquiries
              </div>
              <div className="font-num font-extrabold text-lg sm:text-xl leading-tight">
                {counts.all}
              </div>
            </div>
            <MessageSquare className={`w-4 h-4 shrink-0 ${statusFilter === "all" ? "text-[#FFC400]" : "text-slate-400"}`} />
          </button>

          {/* New */}
          <button
            type="button"
            onClick={() => setStatusFilter("new")}
            className={`px-3 py-2 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              statusFilter === "new"
                ? "bg-[#FF7900] text-white border-[#FF7900] shadow-xs"
                : "bg-orange-50/60 hover:bg-orange-50 text-orange-950 border-orange-200/80"
            }`}
          >
            <div>
              <div className={`text-[10.5px] font-bold uppercase tracking-wider ${statusFilter === "new" ? "text-orange-100" : "text-orange-700"}`}>
                New / Unread
              </div>
              <div className="font-num font-extrabold text-lg sm:text-xl leading-tight">
                {counts.new}
              </div>
            </div>
            <span className={`w-2 h-2 rounded-full ${statusFilter === "new" ? "bg-white" : "bg-[#FF7900]"}`} />
          </button>

          {/* In Progress */}
          <button
            type="button"
            onClick={() => setStatusFilter("in_progress")}
            className={`px-3 py-2 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              statusFilter === "in_progress"
                ? "bg-[#D97706] text-white border-[#D97706] shadow-xs"
                : "bg-amber-50/60 hover:bg-amber-50 text-amber-950 border-amber-200/80"
            }`}
          >
            <div>
              <div className={`text-[10.5px] font-bold uppercase tracking-wider ${statusFilter === "in_progress" ? "text-amber-100" : "text-amber-700"}`}>
                In Progress
              </div>
              <div className="font-num font-extrabold text-lg sm:text-xl leading-tight">
                {counts.in_progress}
              </div>
            </div>
            <Clock className={`w-4 h-4 shrink-0 ${statusFilter === "in_progress" ? "text-amber-200" : "text-amber-500"}`} />
          </button>

          {/* Responded */}
          <button
            type="button"
            onClick={() => setStatusFilter("responded")}
            className={`px-3 py-2 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              statusFilter === "responded"
                ? "bg-[#059669] text-white border-[#059669] shadow-xs"
                : "bg-emerald-50/60 hover:bg-emerald-50 text-emerald-950 border-emerald-200/80"
            }`}
          >
            <div>
              <div className={`text-[10.5px] font-bold uppercase tracking-wider ${statusFilter === "responded" ? "text-emerald-100" : "text-emerald-700"}`}>
                Responded
              </div>
              <div className="font-num font-extrabold text-lg sm:text-xl leading-tight">
                {counts.responded}
              </div>
            </div>
            <CheckCheck className={`w-4 h-4 shrink-0 ${statusFilter === "responded" ? "text-emerald-200" : "text-emerald-600"}`} />
          </button>

          {/* Not Interested */}
          <button
            type="button"
            onClick={() => setStatusFilter("archived")}
            className={`col-span-2 sm:col-span-1 px-3 py-2 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              statusFilter === "archived"
                ? "bg-slate-700 text-white border-slate-800 shadow-xs"
                : "bg-slate-50 hover:bg-slate-100/80 text-slate-800 border-slate-200/80"
            }`}
          >
            <div>
              <div className={`text-[10.5px] font-bold uppercase tracking-wider ${statusFilter === "archived" ? "text-slate-300" : "text-slate-500"}`}>
                Not Interested
              </div>
              <div className="font-num font-extrabold text-lg sm:text-xl leading-tight">
                {counts.archived}
              </div>
            </div>
            <Archive className={`w-4 h-4 shrink-0 ${statusFilter === "archived" ? "text-slate-300" : "text-slate-400"}`} />
          </button>
        </div>

        {/* Thin conversion pipeline line */}
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${counts.all > 0 ? (counts.new / counts.all) * 100 : 0}%` }}
            className="bg-[#FF7900] transition-all duration-300"
            title={`New (${counts.new})`}
          />
          <div
            style={{ width: `${counts.all > 0 ? (counts.in_progress / counts.all) * 100 : 0}%` }}
            className="bg-[#F59E0B] transition-all duration-300"
            title={`In Progress (${counts.in_progress})`}
          />
          <div
            style={{ width: `${counts.all > 0 ? (counts.responded / counts.all) * 100 : 0}%` }}
            className="bg-[#10B981] transition-all duration-300"
            title={`Responded (${counts.responded})`}
          />
          <div
            style={{ width: `${counts.all > 0 ? (counts.archived / counts.all) * 100 : 0}%` }}
            className="bg-slate-300 transition-all duration-300"
            title={`Archived (${counts.archived})`}
          />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 2. UNIFIED MAIN PANEL: COMPACT TOOLBAR + DATA VIEW (TABLE / CARDS)   */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Compact Single-Row Toolbar (Tabs + Compact Search + Sort + View) */}
        <div className="p-3 sm:px-4 sm:py-2.5 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-2.5">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 xl:pb-0 scrollbar-none shrink-0">
            {STATUS_TABS.map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`h-8 px-3 rounded-xl text-xs font-bold whitespace-nowrap inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                    active
                      ? tab.activeClass
                      : "bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/60"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`font-num px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-white text-slate-600 border border-slate-200"
                    }`}
                  >
                    {counts[tab.id]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Toolbar Controls (Compact Search, Sort, Layout) - Fixed Non-Wrapping Row */}
          <div className="flex items-center gap-2 flex-nowrap shrink-0 w-full xl:w-auto justify-between xl:justify-end">
            {/* Compact Search Bar */}
            <div className="relative flex-1 xl:flex-initial xl:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                placeholder="Search inquiries…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-7 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-[#102E4D] transition-all placeholder:text-slate-400"
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

            {/* Sort Menu */}
            <div className="relative w-32 sm:w-36 shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full h-8 px-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs text-slate-700 focus:outline-none focus:border-[#102E4D] cursor-pointer"
              >
                <option value="newest">🕒 Newest</option>
                <option value="oldest">⏳ Oldest</option>
                <option value="name">🔤 Name (A-Z)</option>
                <option value="status">📊 Status</option>
              </select>
            </div>

            {/* View Mode Toggle - Icon Only */}
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
        {loading && contacts.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <RefreshCw className="w-6 h-6 text-[#FF7900] animate-spin mx-auto" />
            <div className="font-bold text-xs text-slate-700">Loading Contact Inquiries…</div>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <div className="font-bold text-sm text-[#102E4D]">No inquiries found</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || statusFilter !== "all"
                ? "No records matched your search or status filter."
                : "Inquiries submitted via /contact will appear here automatically."}
            </p>
            {(searchQuery || statusFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                className="mt-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          /* ── CARDS / GRID VIEW ── */
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredContacts.map((c) => {
              const st = statusStyles(c.crm_status);
              const avatarColor = getAvatarColor(c.full_name);
              const initials = getInitials(c.full_name);
              const relativeTime = getRelativeTimeString(c.created_at);
              const topicLabel = formatTopicName(c.interest);

              return (
                <div
                  key={c.id}
                  onClick={() => openInspector(c)}
                  className="group relative rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition-all duration-150 flex flex-col justify-between overflow-hidden cursor-pointer"
                >
                  {/* Status Top Strip */}
                  <div className={`h-1.5 w-full bg-gradient-to-r ${st.borderTop}`} />

                  <div className="p-4 space-y-3 flex-1">
                    {/* Top Line: Ref code + Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-num font-extrabold text-[11px] text-[#FF7900] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/70 inline-flex items-center gap-1">
                        #{c.reference_code}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${st.pill}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                        <span>{st.label}</span>
                        {st.isLocked && <Lock className="w-2.5 h-2.5 opacity-70 shrink-0" />}
                      </span>
                    </div>

                    {/* Sender Profile */}
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl border ${avatarColor} flex items-center justify-center font-bold text-xs shrink-0`}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-sm text-[#102E4D] truncate group-hover:text-[#FF7900] transition-colors">
                          {c.full_name}
                        </h3>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{c.organization || "Independent"}</span>
                        </div>
                        {c.address_with_city && (
                          <div className="flex items-center gap-1 text-[10.5px] text-slate-400 truncate mt-0.5">
                            <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                            <span className="truncate">{c.address_with_city}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Topic Pill & Email */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EFFBF8] text-[#005696] font-bold text-[11px] border border-[#C8EFE6]">
                        <Tag className="w-3 h-3 text-[#FF7900] shrink-0" />
                        <span>{topicLabel}</span>
                      </span>

                      {c.email && (
                        <span className="text-[11px] text-slate-400 truncate max-w-[200px]" title={c.email}>
                          {c.email}
                        </span>
                      )}
                    </div>

                    {/* Message Snippet */}
                    <div className="rounded-xl bg-slate-50/80 border border-slate-200/60 p-2.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      <span className="italic">“{c.message}”</span>
                    </div>

                    {/* Admin Note */}
                    {c.admin_notes && (
                      <div className="text-[10.5px] font-medium text-amber-900 bg-amber-50/90 border border-amber-200/70 rounded-lg px-2.5 py-1 flex items-start gap-1">
                        <span className="shrink-0 font-bold">Note:</span>
                        <span className="truncate">{c.admin_notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="px-4 py-2.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="text-[11px] text-slate-400 font-num flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{relativeTime}</span>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {c.phone && (
                        <a
                          href={`https://wa.me/${c.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                            `Assalam-o-Alaikum ${c.full_name}, thank you for contacting The Leadership Covenant (Ref #${c.reference_code}).`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white flex items-center justify-center transition-colors border border-emerald-200"
                          title="Chat on WhatsApp"
                        >
                          <FaWhatsapp className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <a
                        href={`mailto:${c.email}?subject=${encodeURIComponent(
                          `Re: Inquiry #${c.reference_code} — The Leadership Covenant`
                        )}`}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-[#102E4D] text-slate-700 hover:text-white flex items-center justify-center transition-colors border border-slate-200"
                        title="Send Email"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => openInspector(c)}
                        className="px-2.5 py-1 rounded-lg bg-[#102E4D] hover:bg-[#001B33] text-white text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        Manage
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === c.id}
                        onClick={() => handleDeleteRecord(c.id)}
                        className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white flex items-center justify-center transition-colors border border-rose-200 disabled:opacity-50 cursor-pointer"
                        title="Delete inquiry"
                        aria-label={`Delete inquiry from ${c.full_name}`}
                      >
                        {deletingId === c.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── RICH, HIGH-DENSITY LIST TABLE (NO AWKWARD EMPTY SPACE!) ── */
          <div className="overflow-x-auto crm-scrollbar-x">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[10.5px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-2.5 px-4 w-36">Inquiry & Status</th>
                  <th className="py-2.5 px-4 w-52">Sender Details</th>
                  <th className="py-2.5 px-4 w-36">School / Org</th>
                  <th className="py-2.5 px-4 min-w-[260px]">Topic & Message Preview</th>
                  <th className="py-2.5 px-4 w-28">Received</th>
                  <th className="py-2.5 px-4 w-28 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContacts.map((c) => {
                  const st = statusStyles(c.crm_status);
                  const avatarColor = getAvatarColor(c.full_name);
                  const initials = getInitials(c.full_name);
                  const topicLabel = formatTopicName(c.interest);

                  return (
                    <tr
                      key={c.id}
                      onClick={() => openInspector(c)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      {/* Inquiry ID & Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className="font-num font-extrabold text-[11px] text-[#FF7900] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/70 inline-block">
                            #{c.reference_code}
                          </span>
                          <div>
                            <span
                              className={`px-2 py-0.5 rounded-full border text-[9.5px] font-bold uppercase inline-flex items-center gap-1 ${st.pill}`}
                            >
                              <span className={`w-1 h-1 rounded-full ${st.dot}`} />
                              <span>{st.label}</span>
                              {st.isLocked && <Lock className="w-2 h-2 opacity-70 shrink-0" />}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Sender Details */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7.5 h-7.5 rounded-lg border ${avatarColor} flex items-center justify-center font-bold text-[10px] shrink-0`}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 group-hover:text-[#FF7900] transition-colors truncate">
                              {c.full_name}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {c.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* School / Organization & Address */}
                      <td className="py-3 px-4 text-slate-700 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{c.organization || "Independent"}</span>
                        </div>
                        {c.address_with_city && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[180px]">{c.address_with_city}</span>
                          </div>
                        )}
                      </td>

                      {/* Topic & Message Preview (Fills empty space with meaningful context!) */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span className="px-2 py-0.5 rounded-md bg-[#EFFBF8] text-[#005696] font-bold text-[10.5px] border border-[#C8EFE6] inline-block">
                            {topicLabel}
                          </span>
                          <div className="text-xs text-slate-500 italic line-clamp-1 max-w-xl">
                            “{c.message}”
                          </div>
                        </div>
                      </td>

                      {/* Received Date */}
                      <td className="py-3 px-4 font-num text-slate-500 text-[11px] whitespace-nowrap">
                        <div>{new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                        <div className="text-[10px] text-slate-400">
                          {getRelativeTimeString(c.created_at)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          {c.phone && (
                            <a
                              href={`https://wa.me/${c.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                                `Assalam-o-Alaikum ${c.full_name}, thank you for contacting The Leadership Covenant (Ref #${c.reference_code}).`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white flex items-center justify-center transition-colors border border-emerald-200"
                              title="Chat on WhatsApp"
                            >
                              <FaWhatsapp className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <a
                            href={`mailto:${c.email}?subject=${encodeURIComponent(
                              `Re: Inquiry #${c.reference_code} — The Leadership Covenant`
                            )}`}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-[#102E4D] text-slate-600 hover:text-white flex items-center justify-center transition-colors border border-slate-200"
                            title="Send Email"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => openInspector(c)}
                            className="px-2.5 py-1 rounded-lg bg-[#102E4D] hover:bg-[#001B33] text-white text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
                          >
                            Manage
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === c.id}
                            onClick={() => handleDeleteRecord(c.id)}
                            className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white flex items-center justify-center transition-colors border border-rose-200 disabled:opacity-50 cursor-pointer"
                            title="Delete inquiry"
                            aria-label={`Delete inquiry from ${c.full_name}`}
                          >
                            {deletingId === c.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
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
      {/* 4. MODAL: INQUIRY DETAILS INSPECTOR (NO PRIORITY)                  */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-hidden pointer-events-auto">
          {/* Dimmed backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs transition-opacity"
            onClick={() => setSelected(null)}
          />

          {/* Centered Modal Card */}
          <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92dvh] sm:max-h-[88vh] will-change-transform">
            {/* Top gradient accent line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#10B981]" />

            {/* Modal Header with High-Visibility ID Number */}
            <div className="bg-[#102E4D] text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2.5 shrink-0">
              <div className="flex flex-wrap items-center gap-2 min-w-0">
                {/* Prominent High-Visibility Reference ID Badge */}
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-[#FF7900] text-white font-num font-extrabold text-xs sm:text-sm tracking-wider shadow-sm shadow-[#FF7900]/30">
                  <span className="text-orange-200 text-[10px] sm:text-xs font-sans font-bold">ID:</span>
                  <span>#{selected.reference_code}</span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(selected.reference_code, "ref_modal")
                    }
                    className="ml-0.5 sm:ml-1 p-1 hover:bg-black/10 rounded transition-colors cursor-pointer"
                    title="Copy Reference Code"
                  >
                    {copiedKey === "ref_modal" ? (
                      <Check className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-white/80" />
                    )}
                  </button>
                </div>

                {/* Status Pill Badge */}
                {(() => {
                  const st = statusStyles(selected.crm_status);
                  return (
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold border inline-flex items-center gap-1.5 ${st.pill}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      <span>{st.label}</span>
                      {st.isLocked && <Lock className="w-3 h-3 opacity-70 shrink-0" />}
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

            {/* Modal Scrollable Body with Clean Alignment & Spacing */}
            <div className="p-3.5 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto overscroll-contain touch-pan-y [WebkitOverflowScrolling:touch] [will-change:scroll-position] flex-1 text-xs sm:text-sm crm-scrollbar-y">
              {/* SECTION 1: Sender Profile (FROM) */}
              <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-50 via-white to-[#EFFBF8] border border-slate-200/90 p-3.5 sm:p-4 space-y-3.5 sm:space-y-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#102E4D] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </div>
                    <div>
                      <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-[0.12em] text-[#102E4D] block">
                        Sender Profile
                      </span>
                      <span className="text-[10px] text-slate-500">Contact details provided with this inquiry</span>
                    </div>
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 font-num flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>
                      {new Date(selected.created_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Sender Name & Organization */}
                  <div className="rounded-xl bg-white border border-slate-200/90 p-3.5 space-y-2.5 shadow-2xs">
                    <div className="text-[10px] uppercase font-extrabold tracking-[0.12em] text-slate-400">
                      Contact
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl border ${getAvatarColor(
                          selected.full_name
                        )} flex items-center justify-center font-extrabold text-sm shrink-0 shadow-2xs`}
                      >
                        {getInitials(selected.full_name)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-extrabold text-sm sm:text-base text-[#102E4D] leading-tight break-words">
                          {selected.full_name}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">Inquiry sender</div>
                      </div>
                    </div>
                    <div className="rounded-lg bg-slate-50 border border-slate-100 p-2.5">
                      <div className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 mb-1">Organization</div>
                      <div className="flex items-start gap-1.5 text-xs text-slate-700 font-semibold">
                        <Building2 className="w-3.5 h-3.5 text-[#005696] shrink-0 mt-0.5" />
                        <span className="break-words">{selected.organization || "Independent / Individual"}</span>
                      </div>
                    </div>
                    {selected.address_with_city && (
                      <div className="rounded-lg bg-slate-50 border border-slate-100 p-2.5">
                        <div className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 mb-1">Address</div>
                        <div className="flex items-start gap-1.5 text-xs text-slate-700 font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                          <span className="break-words">{selected.address_with_city}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Contact Channels: Email & WhatsApp */}
                  <div className="rounded-xl bg-white border border-slate-200/90 p-3.5 space-y-2.5 shadow-2xs">
                    <div className="text-[10px] uppercase font-extrabold tracking-[0.12em] text-slate-400">
                      Contact Channels
                    </div>
                    {/* Email row */}
                    <div className="flex items-center justify-between gap-1.5 p-2 rounded-xl bg-white border border-slate-200 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <Mail className="w-3.5 h-3.5 text-[#005696] shrink-0" />
                        <span
                          className="text-xs font-semibold text-slate-800 truncate block"
                          title={selected.email}
                        >
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
                            `Re: Inquiry #${selected.reference_code} — The Leadership Covenant`
                          )}`}
                          className="px-2 py-0.5 rounded-md bg-[#102E4D] hover:bg-[#001B33] text-white text-[10.5px] font-bold transition-colors"
                        >
                          Email
                        </a>
                      </div>
                    </div>

                    {/* Phone / WhatsApp row */}
                    <div className="flex items-center justify-between gap-1.5 p-2 rounded-xl bg-white border border-slate-200 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <Phone className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                        <span className="text-xs font-semibold text-slate-800 truncate font-num block">
                          {selected.phone || "No phone provided"}
                        </span>
                      </div>
                      {selected.phone && (
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
                              `Assalam-o-Alaikum ${selected.full_name}, thank you for contacting The Leadership Covenant regarding your inquiry (Ref #${selected.reference_code}).`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-0.5 rounded-md bg-[#25D366] hover:bg-[#20BD5A] text-white text-[10.5px] font-bold inline-flex items-center gap-1 transition-colors"
                          >
                            <FaWhatsapp className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Topic & Inquiry Message */}
              <div className="rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 p-3.5 sm:p-4 space-y-3">
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF7900] shrink-0" />
                    <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#102E4D]">
                      Inquiry Message
                    </span>
                  </div>
                </div>

                <div className="rounded-xl bg-gradient-to-r from-[#EFFBF8] to-[#F8FAFC] border border-[#BFE9DE] px-3.5 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#005696] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-[0.12em] font-extrabold text-[#005696]">
                      Contact Topic
                    </div>
                    <div className="text-sm sm:text-[15px] font-extrabold text-[#102E4D] leading-snug break-words mt-0.5">
                      {formatTopicName(selected.interest)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                    Message / Request
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selected.message, "msg_modal")}
                    className="text-[11px] font-semibold text-slate-500 hover:text-[#102E4D] inline-flex items-center gap-1 cursor-pointer"
                    title="Copy Message Text"
                  >
                    {copiedKey === "msg_modal" ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="rounded-xl bg-slate-50/90 border border-slate-200/70 p-3 sm:p-3.5 text-slate-800 leading-relaxed text-xs sm:text-sm whitespace-pre-wrap font-sans break-words">
                  {selected.message}
                </div>
              </div>

              {/* SECTION 3: CRM Workflow Status & Status Lock Controller */}
              <div className="rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 p-3.5 sm:p-4 space-y-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-[#102E4D] text-white flex items-center justify-center shrink-0">
                      <Clock className="w-3 h-3" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#102E4D]">
                      CRM Workflow Status
                    </span>
                  </div>
                  {((selected.crm_status === "archived" || selected.crm_status === "responded") && !isStatusUnlocked) && (
                    <span className="text-[10px] text-slate-500 font-bold inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full">
                      <Lock className="w-2.5 h-2.5 text-slate-500" />
                      <span>Status Locked</span>
                    </span>
                  )}
                </div>

                {(() => {
                  const isRecordLocked =
                    (selected.crm_status === "archived" || selected.crm_status === "responded") &&
                    !isStatusUnlocked;

                  if (isRecordLocked) {
                    return selected.crm_status === "archived" ? (
                      <div className="rounded-xl p-3 sm:p-3.5 bg-slate-100 border border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-start sm:items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center shrink-0">
                            <Lock className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2 flex-wrap">
                              <span>Inquiry Marked: Not Interested</span>
                              <span className="text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wide">
                                Status Locked
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-600 mt-0.5">
                              This inquiry is marked as Not Interested. Status is locked against accidental modifications.
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsStatusUnlocked(true)}
                          className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 shrink-0 shadow-2xs"
                        >
                          <Unlock className="w-3.5 h-3.5 text-slate-700" />
                          <span>Unlock Status</span>
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-xl p-3 sm:p-3.5 bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-start sm:items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                            <Lock className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-xs sm:text-sm text-emerald-950 flex items-center gap-2 flex-wrap">
                              <span>Inquiry Marked: Responded</span>
                              <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wide">
                                Status Locked
                              </span>
                            </div>
                            <div className="text-[11px] text-emerald-700 mt-0.5">
                              Inquiry response has been dispatched and completed. Record is protected.
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsStatusUnlocked(true)}
                          className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-900 text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 shrink-0 shadow-2xs"
                        >
                          <Unlock className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Unlock Status</span>
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10.5px]">
                        <span className="text-slate-500 font-medium">
                          Select status to stage (persists when Save Changes is clicked):
                        </span>
                        {editStatus !== selected.crm_status && (
                          <span className="font-bold text-[#FF7900] bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                            Staged: {statusStyles(editStatus).label}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(["new", "in_progress", "responded", "archived"] as ContactCrmStatus[]).map(
                          (st) => {
                            const active = editStatus === st;
                            const info = statusStyles(st);
                            return (
                              <button
                                key={st}
                                type="button"
                                disabled={saving}
                                onClick={() => setEditStatus(st)}
                                className={`h-10 px-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer flex items-center justify-center sm:justify-start gap-2 min-w-0 ${
                                  active
                                    ? "bg-[#102E4D] text-white border-[#102E4D] shadow-xs ring-2 ring-[#FF7900]/40"
                                    : "bg-slate-50/70 hover:bg-slate-100 text-slate-700 border-slate-200"
                                }`}
                              >
                                <span className={`w-2 h-2 rounded-full shrink-0 ${info.dot}`} />
                                <span className="truncate">{info.label}</span>
                                {active && (
                                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF7900] shrink-0" />
                                )}
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* SECTION 4: Internal Admin Notes with Full-Display Suggestions */}
              <div className="rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 p-3.5 sm:p-4 space-y-3">
                <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-[#005696] text-white flex items-center justify-center shrink-0">
                      <FileText className="w-3 h-3" />
                    </div>
                    <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#102E4D]">
                      Internal Admin Notes
                    </label>
                  </div>
                  <span className="text-[10px] sm:text-[10.5px] text-slate-400">Private log for portal team</span>
                </div>

                {/* Professional Quick Suggestion Grid with Full Sentence Visibility (Zero Truncation) */}
                <div className="space-y-1.5">
                  <div className="text-[10px] sm:text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                    Quick Log Suggestions (Click to append):
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {QUICK_NOTE_SUGGESTIONS.map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() =>
                            setEditNotes((prev) =>
                              prev ? `${prev}\n${item.appendNote}` : item.appendNote
                            )
                          }
                          className={`min-h-[46px] h-auto py-2 px-2.5 rounded-xl border transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98] flex items-center gap-2 w-full ${item.color}`}
                        >
                          <span
                            className={`w-6 h-6 rounded-lg ${item.iconBg} flex items-center justify-center shrink-0`}
                          >
                            <IconComponent className="w-3.5 h-3.5" />
                          </span>
                          <span className="text-[11px] sm:text-xs font-bold leading-snug whitespace-normal break-words text-left">
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <textarea
                  rows={3}
                  placeholder="Type detailed callback notes, follow-up dates, or action items…"
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

            {/* Modal Footer Controls - Responsive for all mobile screens */}
            <div className="px-4 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                disabled={deletingId === selected.id}
                onClick={() => handleDeleteRecord(selected.id)}
                className="h-9 px-3 sm:px-3.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
              >
                {deletingId === selected.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>{deletingId === selected.id ? "Deleting…" : "Delete"}</span>
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
      {/* 5. CREATE INQUIRY MODAL (Full Admin Support, No Priority)           */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-hidden pointer-events-auto">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs transition-opacity"
            onClick={() => setAddModalOpen(false)}
          />

          <div className="relative z-10 w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92dvh] sm:max-h-[88vh] will-change-transform">
            {/* Top gradient accent line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#10B981]" />

            {/* Modal Header */}
            <div className="bg-[#102E4D] text-white px-5 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF7900] to-[#E56D00] flex items-center justify-center text-white shadow-md shadow-orange-500/25 shrink-0">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base sm:text-lg text-white leading-tight">
                      Create Contact Inquiry
                    </h3>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/10 text-orange-300 uppercase tracking-wider">
                      Admin Log
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-300 truncate mt-0.5">
                    Log a walk-in, phone call, or new direct organization inquiry.
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

            {/* Form wrapping scrollable content + fixed pinned footer */}
            <form onSubmit={handleCreateInquiry} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Scrollable Form Body */}
              <div className="p-4 sm:p-6 space-y-4 overflow-y-auto overscroll-contain touch-pan-y [WebkitOverflowScrolling:touch] [will-change:scroll-position] flex-1 text-xs sm:text-sm crm-scrollbar-y">
                {/* SECTION 1: Sender & Organization Profile */}
                <div className="rounded-xl sm:rounded-2xl bg-slate-50/80 border border-slate-200/90 p-3.5 sm:p-4 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200/70">
                    <div className="w-5 h-5 rounded-md bg-[#102E4D] text-white flex items-center justify-center shrink-0">
                      <User className="w-3 h-3" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#102E4D]">
                      Sender & Organization Details
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Full Name <span className="text-[#FF7900]">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <input
                          required
                          type="text"
                          placeholder="e.g. Dr. Ayesha Khan"
                          value={addForm.full_name}
                          onChange={(e) =>
                            setAddForm({ ...addForm, full_name: e.target.value })
                          }
                          className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#FF7900] focus:ring-2 focus:ring-[#FF7900]/20 transition-all"
                        />
                      </div>
                    </div>

                    {/* Email Address */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Email Address <span className="text-[#FF7900]">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Mail className="w-3.5 h-3.5" />
                        </div>
                        <input
                          required
                          type="email"
                          placeholder="ayesha@school.edu.pk"
                          value={addForm.email}
                          onChange={(e) =>
                            setAddForm({ ...addForm, email: e.target.value })
                          }
                          className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#FF7900] focus:ring-2 focus:ring-[#FF7900]/20 transition-all"
                        />
                      </div>
                    </div>

                    {/* Phone / WhatsApp */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Phone / WhatsApp
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="tel"
                          placeholder="+92 300 1234567"
                          value={addForm.phone}
                          onChange={(e) =>
                            setAddForm({ ...addForm, phone: e.target.value })
                          }
                          className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#FF7900] focus:ring-2 focus:ring-[#FF7900]/20 transition-all font-num"
                        />
                      </div>
                    </div>

                    {/* Organization */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        School / Organization
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Building2 className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          placeholder="Beaconhouse / Roots / IBA"
                          value={addForm.organization}
                          onChange={(e) =>
                            setAddForm({ ...addForm, organization: e.target.value })
                          }
                          className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#FF7900] focus:ring-2 focus:ring-[#FF7900]/20 transition-all"
                        />
                      </div>
                    </div>

                    {/* Address with city */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Address with city
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          placeholder="Sector F-8/4, Islamabad"
                          value={addForm.address_with_city}
                          onChange={(e) =>
                            setAddForm({ ...addForm, address_with_city: e.target.value })
                          }
                          className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#FF7900] focus:ring-2 focus:ring-[#FF7900]/20 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: Topic & Workflow Status (Perfect Geometric Alignment) */}
                <div className="rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 p-3.5 sm:p-4 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <div className="w-5 h-5 rounded-md bg-[#005696] text-white flex items-center justify-center shrink-0">
                      <Tag className="w-3 h-3" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#102E4D]">
                      Program Interest & Intake Status
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    {/* Topic Dropdown */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Interest Topic
                      </label>
                      <div className="relative">
                        <select
                          value={addForm.interest}
                          onChange={(e) =>
                            setAddForm({ ...addForm, interest: e.target.value })
                          }
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#FF7900] focus:ring-2 focus:ring-[#FF7900]/20 transition-all cursor-pointer"
                        >
                          <option value="school-impact-summit">School Impact Summit</option>
                          <option value="teacher-training">Teacher Believed In Me</option>
                          <option value="leadership-camps">Leadership Camps</option>
                          <option value="family-covenant">7 Habits of Families</option>
                          <option value="institutional-partnership">Institutional Partnership</option>
                          <option value="general">General Inquiry</option>
                        </select>
                      </div>
                    </div>

                    {/* Initial Status Selector */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          Initial Status
                        </label>
                        <span className="text-[10px] font-medium text-slate-400">
                          Choose workflow stage
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {(["new", "in_progress", "responded"] as ContactCrmStatus[]).map((st) => {
                          const active = addForm.crm_status === st;
                          const info = statusStyles(st);
                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() =>
                                setAddForm({ ...addForm, crm_status: st })
                              }
                              className={`min-h-11 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                                active
                                  ? "bg-[#102E4D] text-white border-[#102E4D] shadow-xs ring-2 ring-[#FF7900]/30"
                                  : "bg-slate-50/70 hover:bg-slate-100 text-slate-700 border-slate-200"
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${info.dot}`} />
                              <span className="whitespace-nowrap text-center">{info.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: Inquiry Message & Admin Notes */}
                <div className="rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 p-3.5 sm:p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-[#FF7900] text-white flex items-center justify-center shrink-0">
                        <MessageSquare className="w-3 h-3" />
                      </div>
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#102E4D]">
                        Inquiry Details & Admin Notes
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">Click a template to auto-fill</span>
                  </div>

                  {/* Quick Intake Suggestions - Perfectly Aligned 2x2 Grid with Uniform Heights */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] sm:text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                      Quick Intake Templates:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        {
                          icon: Phone,
                          label: "Phone Call Inquiry",
                          text: "Inquired via phone call regarding upcoming program dates and registration details.",
                          color: "text-blue-700 bg-blue-50/80 border-blue-200/90 hover:bg-blue-100/80",
                        },
                        {
                          icon: Building2,
                          label: "School Walk-in Visit",
                          text: "Walk-in visitor inquired about institutional participation and customized cohort schedule.",
                          color: "text-amber-800 bg-amber-50/80 border-amber-200/90 hover:bg-amber-100/80",
                        },
                        {
                          icon: FaWhatsapp,
                          label: "WhatsApp Brochure Request",
                          text: "Sent inquiry via WhatsApp requesting fee structure and program brochure.",
                          color: "text-emerald-800 bg-emerald-50/80 border-emerald-200/90 hover:bg-emerald-100/80",
                        },
                        {
                          icon: Tag,
                          label: "Camp Enrollment Request",
                          text: "Inquired about student age criteria and batch timings for upcoming Leadership Camps.",
                          color: "text-purple-800 bg-purple-50/80 border-purple-200/90 hover:bg-purple-100/80",
                        },
                      ].map((tpl) => {
                        const IconComp = tpl.icon;
                        return (
                          <button
                            key={tpl.label}
                            type="button"
                            onClick={() =>
                              setAddForm((prev) => ({
                                ...prev,
                                message: prev.message ? `${prev.message}\n${tpl.text}` : tpl.text,
                              }))
                            }
                            className={`h-9 px-3 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98] ${tpl.color}`}
                            title="Click to insert template into message"
                          >
                            <IconComp className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{tpl.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Message Textarea */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Inquiry Message / Request Details <span className="text-[#FF7900]">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Describe the inquiry details, specific requests, batch sizes, or questions asked…"
                      value={addForm.message}
                      onChange={(e) =>
                        setAddForm({ ...addForm, message: e.target.value })
                      }
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/40 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#FF7900] focus:ring-2 focus:ring-[#FF7900]/20 transition-all leading-relaxed"
                    />
                  </div>

                  {/* Internal Admin Notes */}
                  <div className="space-y-1.5 pt-0.5">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Internal Admin Notes <span className="text-slate-400 font-normal lowercase">(optional team log)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Follow-up promised by Friday with customized proposal"
                        value={addForm.admin_notes}
                        onChange={(e) =>
                          setAddForm({ ...addForm, admin_notes: e.target.value })
                        }
                        className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50/40 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#FF7900] focus:ring-2 focus:ring-[#FF7900]/20 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pinned Modal Footer Controls - Stays visible during scroll */}
              <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
                <span className="text-[11px] text-slate-500 hidden sm:inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Auto-generates a unique #TLC-INQ reference code
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
                    disabled={addingInquiry}
                    className="h-9 px-5 rounded-xl bg-[#FF7900] hover:bg-[#E56D00] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60 shadow-xs transition-all"
                  >
                    {addingInquiry ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Creating…</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Create Inquiry</span>
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

"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Search,
  Download,
  RefreshCw,
  Mail,
  Phone,
  Building2,
  X,
  Trash2,
  CheckCircle2,
  Clock,
  Archive,
  Sparkles,
  Save,
  ExternalLink,
  LayoutGrid,
  List,
  Copy,
  Check,
  Plus,
  Filter,
  ArrowUpDown,
  MessageSquare,
  Calendar,
  AlertCircle,
  Tag,
  Share2,
  Flame,
  CheckCheck,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import type {
  ContactCrmStatus,
  ContactPriority,
  ContactSubmissionRecord,
} from "@/lib/supabase-store";

const STATUS_TABS: Array<{
  id: "all" | ContactCrmStatus;
  label: string;
  color: string;
  activeBg: string;
}> = [
  {
    id: "all",
    label: "All Inquiries",
    color: "#102E4D",
    activeBg: "bg-[#102E4D] text-white",
  },
  {
    id: "new",
    label: "New / Unread",
    color: "#FF7900",
    activeBg: "bg-gradient-to-r from-[#FF7900] to-[#E56D00] text-white",
  },
  {
    id: "in_progress",
    label: "In Progress",
    color: "#D97706",
    activeBg: "bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white",
  },
  {
    id: "responded",
    label: "Responded",
    color: "#059669",
    activeBg: "bg-gradient-to-r from-[#10B981] to-[#059669] text-white",
  },
  {
    id: "archived",
    label: "Archived",
    color: "#64748B",
    activeBg: "bg-slate-700 text-white",
  },
];

const AVATAR_GRADIENTS = [
  "from-amber-400 to-orange-500 text-white",
  "from-emerald-400 to-teal-600 text-white",
  "from-sky-400 to-blue-600 text-white",
  "from-violet-400 to-purple-600 text-white",
  "from-rose-400 to-pink-600 text-white",
  "from-cyan-400 to-teal-500 text-white",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
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

export default function AdminContactsCrmPage() {
  const [contacts, setContacts] = useState<ContactSubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filters & Sorting
  const [statusFilter, setStatusFilter] = useState<"all" | ContactCrmStatus>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | ContactPriority>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "priority" | "name">("newest");
  const [searchQuery, setSearchQuery] = useState("");

  // Details Modal Inspector State
  const [selected, setSelected] = useState<ContactSubmissionRecord | null>(null);
  const [editStatus, setEditStatus] = useState<ContactCrmStatus>("new");
  const [editPriority, setEditPriority] = useState<ContactPriority>("normal");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Manual Add Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addingInquiry, setAddingInquiry] = useState(false);
  const [addForm, setAddForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    organization: "",
    interest: "school-impact-summit",
    priority: "normal" as ContactPriority,
    message: "",
    admin_notes: "",
  });

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

  const loadContacts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/contacts", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setContacts(Array.isArray(json.contacts) ? json.contacts : []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const openInspector = (record: ContactSubmissionRecord) => {
    setSelected(record);
    setEditStatus(record.crm_status);
    setEditPriority(record.priority);
    setEditNotes(record.admin_notes || "");
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
    const q = searchQuery.trim().toLowerCase();
    let result = contacts.filter((c) => {
      if (statusFilter !== "all" && c.crm_status !== statusFilter) return false;
      if (priorityFilter !== "all" && c.priority !== priorityFilter) return false;
      if (!q) return true;
      return (
        c.full_name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.organization.toLowerCase().includes(q) ||
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
      if (sortBy === "priority") {
        const priorityScore: Record<ContactPriority, number> = {
          urgent: 4,
          high: 3,
          normal: 2,
          low: 1,
        };
        return (priorityScore[b.priority] || 0) - (priorityScore[a.priority] || 0);
      }
      if (sortBy === "name") {
        return a.full_name.localeCompare(b.full_name);
      }
      return 0;
    });

    return result;
  }, [contacts, statusFilter, priorityFilter, searchQuery, sortBy]);

  const counts = useMemo(() => {
    const total = contacts.length;
    const newCount = contacts.filter((c) => c.crm_status === "new").length;
    const inProgressCount = contacts.filter((c) => c.crm_status === "in_progress").length;
    const respondedCount = contacts.filter((c) => c.crm_status === "responded").length;
    const archivedCount = contacts.filter((c) => c.crm_status === "archived").length;
    const urgentCount = contacts.filter((c) => c.priority === "urgent" || c.priority === "high").length;

    return {
      all: total,
      new: newCount,
      in_progress: inProgressCount,
      responded: respondedCount,
      archived: archivedCount,
      urgent: urgentCount,
      respondedPercent: total > 0 ? Math.round((respondedCount / total) * 100) : 0,
      newPercent: total > 0 ? Math.round((newCount / total) * 100) : 0,
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
          priority: editPriority,
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
        setFeedback("Inquiry CRM details successfully updated!");
        setTimeout(() => setFeedback(null), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStatusChange = async (
    record: ContactSubmissionRecord,
    newStatus: ContactCrmStatus,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    try {
      const res = await fetch("/api/admin/contacts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: record.id,
          crm_status: newStatus,
        }),
      });
      const json = await res.json();
      if (res.ok && json.contact) {
        setContacts((prev) =>
          prev.map((item) => (item.id === record.id ? json.contact : item))
        );
        if (selected?.id === record.id) {
          setSelected(json.contact);
          setEditStatus(newStatus);
        }
      }
    } catch {
      // Ignored
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!window.confirm("Permanently delete this contact inquiry record? This action cannot be undone.")) return;
    const res = await fetch(
      `/api/admin/contacts?id=${encodeURIComponent(id)}`,
      { method: "DELETE" }
    );
    if (res.ok) {
      setContacts((prev) => prev.filter((c) => c.id !== id));
      if (selected?.id === id) setSelected(null);
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
          interest: "school-impact-summit",
          priority: "normal",
          message: "",
          admin_notes: "",
        });
        openInspector(json.contact);
      } else {
        alert(json.error || "Failed to log contact inquiry.");
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
      "Interest / Topic",
      "CRM Status",
      "Priority",
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
      c.interest,
      c.crm_status,
      c.priority,
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
          pill: "bg-gradient-to-r from-orange-50 to-amber-50 text-[#E56D00] border-orange-200",
          dot: "bg-[#FF7900] shadow-sm shadow-[#FF7900]/50",
          label: "New / Unread",
          borderTop: "from-[#FF7900] to-[#FFC400]",
        };
      case "in_progress":
        return {
          pill: "bg-amber-50 text-amber-800 border-amber-200",
          dot: "bg-amber-500",
          label: "In Progress",
          borderTop: "from-amber-400 to-amber-600",
        };
      case "responded":
        return {
          pill: "bg-emerald-50 text-emerald-800 border-emerald-200",
          dot: "bg-emerald-500",
          label: "Responded",
          borderTop: "from-emerald-400 to-teal-600",
        };
      case "archived":
        return {
          pill: "bg-slate-100 text-slate-700 border-slate-200",
          dot: "bg-slate-400",
          label: "Archived",
          borderTop: "from-slate-400 to-slate-600",
        };
    }
  };

  // Priority visual themes
  const priorityStyles = (p: ContactPriority) => {
    switch (p) {
      case "urgent":
        return "bg-rose-100 text-rose-700 border-rose-300 font-extrabold";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300 font-bold";
      case "normal":
        return "bg-sky-50 text-sky-700 border-sky-200 font-semibold";
      case "low":
        return "bg-slate-100 text-slate-600 border-slate-200 font-medium";
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1. HERO & EXECUTIVE CRM STATS SUMMARY                                */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="rounded-3xl bg-white border border-[#C8EFE6]/80 p-5 sm:p-7 shadow-sm space-y-6 relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-gradient-to-br from-[#FFC400]/10 via-[#FF7900]/5 to-transparent blur-2xl pointer-events-none" />

        {/* Top Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFFBF8] border border-[#C8EFE6] text-[#005696] text-[11px] font-extrabold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#FF7900]" />
              <span>Inbound Communications CRM</span>
            </div>
            <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-[#102E4D] tracking-tight">
              Contact Us Inquiries CRM
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Track, qualify, and respond to school leadership, corporate partners,
              and parent inquiries submitted through public portal contact forms.
            </p>
          </div>

          {/* Quick Action Toolbar Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="h-10 px-4 rounded-xl bg-gradient-to-r from-[#FF7900] via-[#FF6D00] to-[#E56D00] hover:from-[#E56D00] hover:to-[#CC5F00] text-white text-xs font-extrabold inline-flex items-center gap-2 shadow-md shadow-[#FF7900]/20 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Inquiry</span>
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={filteredContacts.length === 0}
              className="h-10 px-4 rounded-xl border border-slate-200 hover:border-[#102E4D] bg-white text-[#102E4D] text-xs font-bold inline-flex items-center gap-2 shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-[#FF7900]" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={loadContacts}
              className="h-10 px-4 rounded-xl bg-[#001B33] hover:bg-[#102E4D] text-white text-xs font-bold inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-[0.98]"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#FFC400] ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* 5 Colorful KPI Highlight Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 relative z-10">
          {/* Total Inquiries */}
          <div
            onClick={() => setStatusFilter("all")}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === "all"
                ? "bg-[#102E4D] text-white border-[#102E4D] shadow-md ring-2 ring-[#FF7900]/40"
                : "bg-[#F8FCFB] hover:bg-white text-slate-800 border-slate-200/80 hover:border-[#102E4D]/40"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[11px] font-extrabold uppercase tracking-wider ${statusFilter === "all" ? "text-slate-300" : "text-slate-500"}`}>
                Total Pipeline
              </span>
              <MessageSquare className={`w-4 h-4 ${statusFilter === "all" ? "text-[#FFC400]" : "text-[#005696]"}`} />
            </div>
            <div className="font-num font-extrabold text-2xl sm:text-3xl tracking-tight">
              {counts.all}
            </div>
            <div className={`text-[10.5px] mt-1 font-medium ${statusFilter === "all" ? "text-slate-300" : "text-slate-500"}`}>
              All inbound submissions
            </div>
          </div>

          {/* New / Unread */}
          <div
            onClick={() => setStatusFilter("new")}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
              statusFilter === "new"
                ? "bg-gradient-to-br from-[#FF7900] to-[#E56D00] text-white border-[#FF7900] shadow-md ring-2 ring-[#FF7900]/50"
                : "bg-orange-50/70 hover:bg-orange-50 text-orange-950 border-orange-200"
            }`}
          >
            {counts.new > 0 && (
              <span className="absolute top-2.5 right-2.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-600" />
              </span>
            )}
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[11px] font-extrabold uppercase tracking-wider ${statusFilter === "new" ? "text-orange-100" : "text-orange-700"}`}>
                New Unread
              </span>
            </div>
            <div className="font-num font-extrabold text-2xl sm:text-3xl tracking-tight">
              {counts.new}
            </div>
            <div className={`text-[10.5px] mt-1 font-semibold ${statusFilter === "new" ? "text-orange-100" : "text-orange-600"}`}>
              {counts.newPercent}% awaiting response
            </div>
          </div>

          {/* In Progress */}
          <div
            onClick={() => setStatusFilter("in_progress")}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === "in_progress"
                ? "bg-gradient-to-br from-amber-500 to-amber-700 text-white border-amber-600 shadow-md ring-2 ring-amber-400"
                : "bg-amber-50/60 hover:bg-amber-50 text-amber-950 border-amber-200"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[11px] font-extrabold uppercase tracking-wider ${statusFilter === "in_progress" ? "text-amber-100" : "text-amber-700"}`}>
                In Progress
              </span>
              <Clock className={`w-4 h-4 ${statusFilter === "in_progress" ? "text-amber-200" : "text-amber-600"}`} />
            </div>
            <div className="font-num font-extrabold text-2xl sm:text-3xl tracking-tight">
              {counts.in_progress}
            </div>
            <div className={`text-[10.5px] mt-1 font-semibold ${statusFilter === "in_progress" ? "text-amber-100" : "text-amber-700"}`}>
              Follow-ups & callbacks
            </div>
          </div>

          {/* Responded */}
          <div
            onClick={() => setStatusFilter("responded")}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === "responded"
                ? "bg-gradient-to-br from-emerald-600 to-teal-800 text-white border-emerald-700 shadow-md ring-2 ring-emerald-400"
                : "bg-emerald-50/60 hover:bg-emerald-50 text-emerald-950 border-emerald-200"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[11px] font-extrabold uppercase tracking-wider ${statusFilter === "responded" ? "text-emerald-100" : "text-emerald-700"}`}>
                Responded
              </span>
              <CheckCheck className={`w-4 h-4 ${statusFilter === "responded" ? "text-emerald-200" : "text-emerald-600"}`} />
            </div>
            <div className="font-num font-extrabold text-2xl sm:text-3xl tracking-tight">
              {counts.responded}
            </div>
            <div className={`text-[10.5px] mt-1 font-semibold ${statusFilter === "responded" ? "text-emerald-100" : "text-emerald-700"}`}>
              {counts.respondedPercent}% resolution rate
            </div>
          </div>

          {/* Archived / High Priority */}
          <div
            onClick={() => setStatusFilter("archived")}
            className={`col-span-2 sm:col-span-1 p-3.5 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === "archived"
                ? "bg-slate-800 text-white border-slate-900 shadow-md ring-2 ring-slate-400"
                : "bg-slate-50 hover:bg-slate-100/80 text-slate-800 border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[11px] font-extrabold uppercase tracking-wider ${statusFilter === "archived" ? "text-slate-300" : "text-slate-500"}`}>
                Archived
              </span>
              <Archive className={`w-4 h-4 ${statusFilter === "archived" ? "text-slate-300" : "text-slate-500"}`} />
            </div>
            <div className="font-num font-extrabold text-2xl sm:text-3xl tracking-tight">
              {counts.archived}
            </div>
            <div className={`text-[10.5px] mt-1 font-medium ${statusFilter === "archived" ? "text-slate-300" : "text-slate-500"}`}>
              {counts.urgent} urgent flagged
            </div>
          </div>
        </div>

        {/* Visual Pipeline Conversion Bar */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FF7900]" /> Unread ({counts.new})
              <span className="w-2 h-2 rounded-full bg-[#F59E0B] ml-2" /> In Progress ({counts.in_progress})
              <span className="w-2 h-2 rounded-full bg-[#10B981] ml-2" /> Responded ({counts.responded})
            </span>
            <span className="font-num text-[#102E4D]">{counts.respondedPercent}% Resolved</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${counts.all > 0 ? (counts.new / counts.all) * 100 : 0}%` }}
              className="bg-[#FF7900] transition-all duration-500"
              title="New / Unread"
            />
            <div
              style={{ width: `${counts.all > 0 ? (counts.in_progress / counts.all) * 100 : 0}%` }}
              className="bg-[#F59E0B] transition-all duration-500"
              title="In Progress"
            />
            <div
              style={{ width: `${counts.all > 0 ? (counts.responded / counts.all) * 100 : 0}%` }}
              className="bg-[#10B981] transition-all duration-500"
              title="Responded"
            />
            <div
              style={{ width: `${counts.all > 0 ? (counts.archived / counts.all) * 100 : 0}%` }}
              className="bg-slate-300 transition-all duration-500"
              title="Archived"
            />
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 2. CONTROLS TOOLBAR (SEARCH, TABS, FILTERS & GRID/LIST SWITCHER)     */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white border border-[#C8EFE6]/80 p-3 sm:p-4 shadow-2xs space-y-3">
        {/* Status Tabs and Grid/List Toggle Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Scrollable Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {STATUS_TABS.map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap inline-flex items-center gap-2 transition-all cursor-pointer ${
                    active
                      ? tab.activeBg + " shadow-xs ring-1 ring-black/5"
                      : "bg-[#EFFBF8] text-[#102E4D] hover:bg-[#D7F5EF]"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`font-num px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      active
                        ? "bg-white/90 text-[#001B33]"
                        : "bg-white text-slate-700 border border-slate-200/60"
                    }`}
                  >
                    {counts[tab.id]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* List vs Grid Switcher */}
          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">
              Layout:
            </span>
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => handleSetViewMode("grid")}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white text-[#102E4D] shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-[#FF7900]" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                type="button"
                onClick={() => handleSetViewMode("list")}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white text-[#102E4D] shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="Table List View"
              >
                <List className="w-3.5 h-3.5 text-[#005696]" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search, Priority Filter, and Sort Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 pt-2 border-t border-slate-100">
          {/* Search Box */}
          <div className="relative lg:col-span-6">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              placeholder="Search sender, email, school, topic, ref code…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-[#C8EFE6] bg-[#EFFBF8]/40 focus:bg-white text-xs font-semibold text-[#102E4D] focus:outline-none focus:border-[#102E4D] transition-colors"
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

          {/* Priority Filter */}
          <div className="relative lg:col-span-3">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as "all" | ContactPriority)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-xs text-[#102E4D] focus:outline-none focus:border-[#102E4D]"
            >
              <option value="all">⚡ All Priorities</option>
              <option value="urgent">🔥 Urgent Priority</option>
              <option value="high">🟠 High Priority</option>
              <option value="normal">🔵 Normal Priority</option>
              <option value="low">⚪ Low Priority</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="relative lg:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-xs text-[#102E4D] focus:outline-none focus:border-[#102E4D]"
            >
              <option value="newest">🕒 Newest Received</option>
              <option value="oldest">⏳ Oldest First</option>
              <option value="priority">🔥 Priority (Highest)</option>
              <option value="name">🔤 Name (A → Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 3. CONTENT AREA: GRID VIEW OR LIST VIEW                             */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {loading && contacts.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white border border-[#C8EFE6] text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#FF7900] animate-spin mx-auto" />
          <div className="font-bold text-sm text-[#102E4D]">
            Loading Contact Us Inquiries…
          </div>
          <p className="text-xs text-slate-400">Connecting to secure CRM data store</p>
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white border border-[#C8EFE6] text-center space-y-3">
          <Sparkles className="w-10 h-10 text-[#FF7900] mx-auto opacity-70" />
          <div className="font-serif font-bold text-base text-[#102E4D]">
            No matching Contact Inquiries found
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
              ? "Try adjusting your search query, status tab, or priority filters."
              : "Inquiries submitted through the /contact page and home contact form will automatically arrive here."}
          </p>
          {(searchQuery || statusFilter !== "all" || priorityFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setPriorityFilter("all");
              }}
              className="px-4 py-2 rounded-xl bg-[#EFFBF8] hover:bg-[#D7F5EF] text-[#005696] text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* ── GRID / CARD VIEW ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredContacts.map((c) => {
            const st = statusStyles(c.crm_status);
            const avatarGrad = getAvatarColor(c.full_name);
            const initials = getInitials(c.full_name);
            const relativeTime = getRelativeTimeString(c.created_at);

            return (
              <div
                key={c.id}
                onClick={() => openInspector(c)}
                className="group relative rounded-3xl bg-white border border-slate-200/90 hover:border-[#102E4D]/40 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer"
              >
                {/* Status-colored Top Edge Strip */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${st.borderTop}`} />

                <div className="p-4 sm:p-5 space-y-3.5 flex-1">
                  {/* Card Header: Ref code + Status badge + Priority */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-num font-extrabold text-xs text-[#FF7900] bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-200/60 inline-flex items-center gap-1">
                      #{c.reference_code}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border ${priorityStyles(
                          c.priority
                        )}`}
                      >
                        {c.priority}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${st.pill}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                        {st.label}
                      </span>
                    </div>
                  </div>

                  {/* Sender Profile: Avatar + Name + Organization */}
                  <div className="flex items-start gap-3 pt-1">
                    <div
                      className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${avatarGrad} flex items-center justify-center font-serif font-black text-xs shrink-0 shadow-xs`}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-serif font-bold text-sm sm:text-base text-[#102E4D] truncate group-hover:text-[#FF7900] transition-colors">
                        {c.full_name}
                      </h3>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate mt-0.5">
                        <Building2 className="w-3 h-3 text-[#005696] shrink-0" />
                        <span className="truncate">{c.organization || "Independent"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Topic / Interest Tag */}
                  <div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#EDF6FB] text-[#005696] font-extrabold text-[11px] capitalize border border-[#D0E6F5]">
                      <Tag className="w-3 h-3 text-[#FF7900]" />
                      <span className="truncate">{c.interest.replace(/-/g, " ")}</span>
                    </span>
                  </div>

                  {/* Inquiry Message Snippet */}
                  <div className="relative rounded-2xl bg-[#F8FCFB] border border-[#C8EFE6]/60 p-3 text-xs text-slate-600 line-clamp-3 leading-relaxed group-hover:bg-[#EFFBF8]/50 transition-colors">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-300 absolute right-2.5 top-2.5" />
                    <span className="italic">“{c.message}”</span>
                  </div>

                  {/* Internal Admin Note Indicator (if any) */}
                  {c.admin_notes && (
                    <div className="text-[11px] font-medium text-amber-800 bg-amber-50/80 border border-amber-200/60 rounded-xl px-2.5 py-1.5 flex items-start gap-1.5">
                      <span className="shrink-0 font-bold">📝 Note:</span>
                      <span className="truncate">{c.admin_notes}</span>
                    </div>
                  )}
                </div>

                {/* Card Footer: Timestamps & Quick Action Buttons */}
                <div className="px-4 sm:px-5 py-3 bg-[#FAFDFD] border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-400 font-num flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
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
                        className="w-7 h-7 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white flex items-center justify-center transition-colors shadow-2xs"
                        title="Chat on WhatsApp"
                      >
                        <FaWhatsapp className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <a
                      href={`mailto:${c.email}?subject=${encodeURIComponent(
                        `Re: Inquiry #${c.reference_code} — The Leadership Covenant`
                      )}`}
                      className="w-7 h-7 rounded-lg bg-[#102E4D]/10 hover:bg-[#102E4D] text-[#102E4D] hover:text-white flex items-center justify-center transition-colors shadow-2xs"
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
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── LIST / TABLE VIEW ── */
        <div className="rounded-3xl bg-white border border-[#C8EFE6]/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto scroll-smooth overscroll-x-contain">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#EFFBF8] border-b border-[#C8EFE6] text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D]">
                  <th className="py-3.5 px-4">Reference</th>
                  <th className="py-3.5 px-4">Sender Details</th>
                  <th className="py-3.5 px-4">School / Organization</th>
                  <th className="py-3.5 px-4">Interest Topic</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Received</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContacts.map((c) => {
                  const st = statusStyles(c.crm_status);
                  const avatarGrad = getAvatarColor(c.full_name);
                  const initials = getInitials(c.full_name);

                  return (
                    <tr
                      key={c.id}
                      onClick={() => openInspector(c)}
                      className="hover:bg-[#EFFBF8]/50 transition-colors cursor-pointer group"
                    >
                      {/* Ref code */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-num font-extrabold text-[#FF7900] bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200/80">
                          #{c.reference_code}
                        </span>
                      </td>

                      {/* Sender Details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-xl bg-gradient-to-br ${avatarGrad} flex items-center justify-center font-serif font-black text-[10px] shrink-0`}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-[#102E4D] group-hover:text-[#FF7900] transition-colors">
                              {c.full_name}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium">
                              {c.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Organization */}
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-[#005696] shrink-0" />
                          <span>{c.organization || "Independent"}</span>
                        </div>
                      </td>

                      {/* Interest Topic */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-[#EDF6FB] text-[#005696] font-bold capitalize text-[11px] inline-block max-w-[180px] truncate">
                          {c.interest.replace(/-/g, " ")}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border ${priorityStyles(
                            c.priority
                          )}`}
                        >
                          {c.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase whitespace-nowrap inline-flex items-center gap-1.5 ${st.pill}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </span>
                      </td>

                      {/* Received Date */}
                      <td className="py-3.5 px-4 font-num text-slate-500 whitespace-nowrap text-[11px]">
                        <div>{new Date(c.created_at).toLocaleDateString()}</div>
                        <div className="text-[10px] text-slate-400">
                          {getRelativeTimeString(c.created_at)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3.5 px-4 text-right whitespace-nowrap"
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
                              className="w-7 h-7 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white flex items-center justify-center transition-colors"
                              title="Chat on WhatsApp"
                            >
                              <FaWhatsapp className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <a
                            href={`mailto:${c.email}?subject=${encodeURIComponent(
                              `Re: Inquiry #${c.reference_code} — The Leadership Covenant`
                            )}`}
                            className="w-7 h-7 rounded-lg bg-[#102E4D]/10 hover:bg-[#102E4D] text-[#102E4D] hover:text-white flex items-center justify-center transition-colors"
                            title="Send Email"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => openInspector(c)}
                            className="px-3 py-1.5 rounded-lg bg-[#102E4D] hover:bg-[#001B33] text-white text-[11px] font-bold cursor-pointer"
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
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 4. MODAL: INQUIRY DETAILS INSPECTOR & CRM WORKFLOW                  */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          {/* Dimmed backdrop with smooth blur */}
          <div
            className="fixed inset-0 bg-[#001B33]/65 backdrop-blur-xs transition-opacity"
            onClick={() => setSelected(null)}
          />

          {/* Centered Modal Card */}
          <div className="relative z-10 w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-[#C8EFE6] my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
            {/* Colorful top gradient header strip */}
            <div className="h-2 w-full bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#10B981]" />

            {/* Modal Header */}
            <div className="bg-[#001B33] text-white px-5 sm:px-7 py-4 sm:py-5 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${getAvatarColor(
                    selected.full_name
                  )} flex items-center justify-center font-serif font-black text-sm shrink-0 shadow-sm`}
                >
                  {getInitials(selected.full_name)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-num text-[11px] font-extrabold uppercase tracking-wider text-[#FFC400]">
                      Inquiry #{selected.reference_code}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(selected.reference_code, "ref_modal")
                      }
                      className="text-white/60 hover:text-white transition-colors"
                      title="Copy Reference Code"
                    >
                      {copiedKey === "ref_modal" ? (
                        <Check className="w-3.5 h-3.5 text-[#10B981]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <h2 className="font-serif font-bold text-lg sm:text-xl text-white truncate">
                    {selected.full_name}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Close Inspector"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 sm:p-7 space-y-6 overflow-y-auto flex-1 text-xs sm:text-sm">
              {/* SECTION 1: Sender & Direct Communication Channels */}
              <div className="space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
                  Contact Information & Channels
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Email Channel */}
                  <div className="p-3.5 rounded-2xl bg-[#EFFBF8] border border-[#C8EFE6] space-y-1.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#005696]">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" /> Email
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(selected.email, "email_modal")}
                          className="text-slate-400 hover:text-[#005696]"
                          title="Copy Email"
                        >
                          {copiedKey === "email_modal" ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <div className="font-bold text-[#102E4D] truncate mt-1 text-xs">
                        {selected.email}
                      </div>
                    </div>
                    <a
                      href={`mailto:${selected.email}?subject=${encodeURIComponent(
                        `Re: Inquiry #${selected.reference_code} — The Leadership Covenant`
                      )}`}
                      className="mt-2 py-1.5 px-2.5 rounded-lg bg-[#102E4D] hover:bg-[#001B33] text-white text-[11px] font-bold inline-flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Mail className="w-3 h-3 text-[#FFC400]" />
                      <span>Compose Email</span>
                    </a>
                  </div>

                  {/* Phone & WhatsApp Channel */}
                  <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-1.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#16A34A]">
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" /> Phone / WhatsApp
                        </span>
                        {selected.phone && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selected.phone, "phone_modal")}
                            className="text-slate-400 hover:text-emerald-700"
                            title="Copy Phone"
                          >
                            {copiedKey === "phone_modal" ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                      <div className="font-num font-bold text-[#102E4D] truncate mt-1 text-xs">
                        {selected.phone || "Not provided"}
                      </div>
                    </div>
                    {selected.phone ? (
                      <a
                        href={`https://wa.me/${selected.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                          `Assalam-o-Alaikum ${selected.full_name}, thank you for contacting The Leadership Covenant regarding your inquiry (Ref #${selected.reference_code}). How may we assist your institution?`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 py-1.5 px-2.5 rounded-lg bg-[#25D366] hover:bg-[#20BD5A] text-white text-[11px] font-bold inline-flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <FaWhatsapp className="w-3.5 h-3.5" />
                        <span>Chat on WhatsApp</span>
                      </a>
                    ) : (
                      <span className="mt-2 text-[11px] text-slate-400 italic">No phone given</span>
                    )}
                  </div>

                  {/* School / Organization Card */}
                  <div className="p-3.5 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] space-y-1.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#D97706]">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5" /> School / Org
                        </span>
                      </div>
                      <div className="font-bold text-[#102E4D] truncate mt-1 text-xs">
                        {selected.organization || "Independent / Individual"}
                      </div>
                    </div>
                    <div className="mt-2 text-[10.5px] text-slate-500 font-num flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{new Date(selected.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Inquiry Content & Message */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    Inquiry Message & Discussion Topic
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#EDF6FB] text-[#005696] font-extrabold text-[11px] capitalize border border-[#D0E6F5]">
                    Interest: {selected.interest.replace(/-/g, " ")}
                  </span>
                </div>

                <div className="relative rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 text-slate-700 leading-relaxed space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 text-[11px] text-slate-400 font-num">
                    <span>Submitted on: {new Date(selected.created_at).toLocaleString()}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selected.message, "msg_modal")}
                      className="text-[#005696] hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      {copiedKey === "msg_modal" ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy Message
                        </>
                      )}
                    </button>
                  </div>
                  <p className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-[#001B33]">
                    {selected.message}
                  </p>
                </div>
              </div>

              {/* SECTION 3: CRM Status & Priority Selection Chips */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] block">
                  CRM Workflow Status & Priority
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Status Options */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600 block">
                      Current Stage:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["new", "in_progress", "responded", "archived"] as ContactCrmStatus[]).map(
                        (st) => {
                          const active = editStatus === st;
                          const info = statusStyles(st);
                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setEditStatus(st)}
                              className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer flex items-center gap-2 ${
                                active
                                  ? "bg-[#102E4D] text-white border-[#102E4D] shadow-xs ring-2 ring-[#FF7900]/40"
                                  : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full ${info.dot}`} />
                              <span>{info.label}</span>
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>

                  {/* Priority Options */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600 block">
                      Priority Level:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["urgent", "high", "normal", "low"] as ContactPriority[]).map(
                        (pr) => {
                          const active = editPriority === pr;
                          return (
                            <button
                              key={pr}
                              type="button"
                              onClick={() => setEditPriority(pr)}
                              className={`p-2.5 rounded-xl border text-xs font-bold capitalize text-left transition-all cursor-pointer flex items-center justify-between ${
                                active
                                  ? "bg-[#005696] text-white border-[#005696] shadow-xs ring-2 ring-sky-300"
                                  : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                              }`}
                            >
                              <span>{pr}</span>
                              {pr === "urgent" && <span>🔥</span>}
                              {pr === "high" && <span>⚡</span>}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Internal CRM Notes */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D]">
                    Internal CRM Notes & Log
                  </label>
                  <span className="text-[11px] text-slate-400">Visible to admins only</span>
                </div>

                {/* Quick note snippet helpers */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "📞 Spoke on phone — interested in teacher training",
                    "💬 Sent brochure via WhatsApp",
                    "📅 Meeting scheduled for next Tuesday",
                    "✅ Fully answered & resolved",
                  ].map((snippet) => (
                    <button
                      key={snippet}
                      type="button"
                      onClick={() =>
                        setEditNotes((prev) => (prev ? `${prev}\n• ${snippet}` : `• ${snippet}`))
                      }
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10.5px] font-medium transition-colors cursor-pointer"
                    >
                      + {snippet}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  placeholder="Record callback details, dates, or team action items…"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-[#C8EFE6] bg-[#EFFBF8]/30 focus:bg-white text-xs sm:text-sm text-[#102E4D] focus:outline-none focus:border-[#102E4D] transition-colors leading-relaxed"
                />
              </div>

              {/* Feedback toast banner */}
              {feedback && (
                <div className="p-3.5 rounded-2xl bg-[#DCFCE7] text-[#15803D] text-xs font-bold flex items-center gap-2 border border-[#86EFAC] animate-in fade-in duration-150">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16A34A]" />
                  <span>{feedback}</span>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="px-5 sm:px-7 py-4 bg-[#F8FCFB] border-t border-[#C8EFE6] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => handleDeleteRecord(selected.id)}
                className="w-full sm:w-auto h-10 px-4 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Inquiry</span>
              </button>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="w-full sm:w-auto h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveRecord("responded")}
                  className="w-full sm:w-auto h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold inline-flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  title="Save and set status to Responded"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Save as Responded</span>
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveRecord()}
                  className="w-full sm:w-auto h-10 px-5 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] hover:from-[#E56D00] hover:to-[#CC5F00] text-white text-xs font-extrabold inline-flex items-center justify-center gap-2 shadow-md shadow-[#FF7900]/25 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? "Saving…" : "Save Changes"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 5. MANUAL ADD INBOUND INQUIRY MODAL                                 */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div
            className="fixed inset-0 bg-[#001B33]/65 backdrop-blur-xs"
            onClick={() => setAddModalOpen(false)}
          />

          <div className="relative z-10 w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#C8EFE6] my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="h-2 w-full bg-gradient-to-r from-[#FF7900] to-[#FFC400]" />

            <div className="bg-[#001B33] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#FFC400]">
                  Offline / Phone Lead Log
                </span>
                <h3 className="font-serif font-bold text-lg text-white">
                  Log Inbound Contact Inquiry
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInquiry} className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#102E4D] mb-1">
                    Full Name *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Dr. Ayesha Khan"
                    value={addForm.full_name}
                    onChange={(e) =>
                      setAddForm({ ...addForm, full_name: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-semibold text-xs text-[#102E4D] focus:outline-none focus:border-[#102E4D]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#102E4D] mb-1">
                    Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="ayesha@school.edu.pk"
                    value={addForm.email}
                    onChange={(e) =>
                      setAddForm({ ...addForm, email: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-semibold text-xs text-[#102E4D] focus:outline-none focus:border-[#102E4D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#102E4D] mb-1">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+92 300 1234567"
                    value={addForm.phone}
                    onChange={(e) =>
                      setAddForm({ ...addForm, phone: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-semibold text-xs text-[#102E4D] focus:outline-none focus:border-[#102E4D]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#102E4D] mb-1">
                    School / Organization
                  </label>
                  <input
                    type="text"
                    placeholder="Roots Millennium / Beaconhouse"
                    value={addForm.organization}
                    onChange={(e) =>
                      setAddForm({ ...addForm, organization: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-semibold text-xs text-[#102E4D] focus:outline-none focus:border-[#102E4D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#102E4D] mb-1">
                    Interest Topic
                  </label>
                  <select
                    value={addForm.interest}
                    onChange={(e) =>
                      setAddForm({ ...addForm, interest: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-[#102E4D]"
                  >
                    <option value="school-impact-summit">School Impact Summit</option>
                    <option value="teacher-training">Teacher Believed In Me</option>
                    <option value="leadership-camps">Leadership Camps</option>
                    <option value="family-covenant">7 Habits of Families</option>
                    <option value="institutional-partnership">Institutional Partnership</option>
                    <option value="general">General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#102E4D] mb-1">
                    Initial Priority
                  </label>
                  <select
                    value={addForm.priority}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        priority: e.target.value as ContactPriority,
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-[#102E4D]"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#102E4D] mb-1">
                  Inquiry Message / Lead Details
                </label>
                <textarea
                  rows={3}
                  placeholder="Details of what the person is requesting or inquired about…"
                  value={addForm.message}
                  onChange={(e) =>
                    setAddForm({ ...addForm, message: e.target.value })
                  }
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-[#102E4D] focus:outline-none focus:border-[#102E4D]"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingInquiry}
                  className="px-5 py-2.5 rounded-xl bg-[#102E4D] hover:bg-[#001B33] text-white text-xs font-extrabold inline-flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                >
                  <Save className="w-4 h-4 text-[#FFC400]" />
                  <span>{addingInquiry ? "Saving…" : "Create Inquiry"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

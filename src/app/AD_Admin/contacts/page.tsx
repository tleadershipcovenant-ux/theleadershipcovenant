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
    label: "Archived",
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
    label: "Spoke on phone",
    appendNote: "• Spoke on phone with sender",
    color: "text-blue-700 bg-blue-50/80 border-blue-200/90 hover:bg-blue-100/80 hover:border-blue-300",
    iconBg: "bg-blue-100 text-blue-600",
  },
  {
    icon: FaWhatsapp,
    label: "Sent WhatsApp brochure",
    appendNote: "• Sent official brochure & details via WhatsApp",
    color: "text-emerald-800 bg-emerald-50/80 border-emerald-200/90 hover:bg-emerald-100/80 hover:border-emerald-300",
    iconBg: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: Calendar,
    label: "Meeting scheduled",
    appendNote: "• Meeting scheduled with leadership team",
    color: "text-amber-800 bg-amber-50/80 border-amber-200/90 hover:bg-amber-100/80 hover:border-amber-300",
    iconBg: "bg-amber-100 text-amber-600",
  },
  {
    icon: CheckCircle2,
    label: "Inquiry resolved",
    appendNote: "• Inquiry resolved and follow-up completed",
    color: "text-teal-800 bg-teal-50/80 border-teal-200/90 hover:bg-teal-100/80 hover:border-teal-300",
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filters & Sorting (Priority removed as requested)
  const [statusFilter, setStatusFilter] = useState<"all" | ContactCrmStatus>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name" | "status">("newest");
  const [searchQuery, setSearchQuery] = useState("");

  // Details Modal Inspector State
  const [selected, setSelected] = useState<ContactSubmissionRecord | null>(null);
  const [editStatus, setEditStatus] = useState<ContactCrmStatus>("new");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Create Inquiry Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addingInquiry, setAddingInquiry] = useState(false);
  const [addForm, setAddForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    organization: "",
    interest: "school-impact-summit",
    crm_status: "new" as ContactCrmStatus,
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
    const result = contacts.filter((c) => {
      if (statusFilter !== "all" && c.crm_status !== statusFilter) return false;
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
      if (sortBy === "name") {
        return a.full_name.localeCompare(b.full_name);
      }
      if (sortBy === "status") {
        return a.crm_status.localeCompare(b.crm_status);
      }
      return 0;
    });

    return result;
  }, [contacts, statusFilter, searchQuery, sortBy]);

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
        setFeedback("Inquiry details updated successfully!");
        setTimeout(() => setFeedback(null), 3000);
      }
    } finally {
      setSaving(false);
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
          pill: "bg-orange-50 text-[#E56D00] border-orange-200/80",
          dot: "bg-[#FF7900]",
          label: "New",
          borderTop: "from-[#FF7900] to-[#FF9E40]",
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
          borderTop: "from-emerald-400 to-teal-500",
        };
      case "archived":
        return {
          pill: "bg-slate-100 text-slate-700 border-slate-200",
          dot: "bg-slate-400",
          label: "Archived",
          borderTop: "from-slate-400 to-slate-500",
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
            <button
              type="button"
              onClick={loadContacts}
              className="h-8.5 px-3 rounded-lg bg-[#102E4D] hover:bg-[#001B33] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-[0.98]"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#FFC400] ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
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

          {/* Archived */}
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
                Archived
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
        <div className="p-3 sm:px-4 sm:py-3 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
            {STATUS_TABS.map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                    active
                      ? tab.activeClass
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-transparent"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`font-num px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
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

          {/* Right Toolbar Controls (Compact Search, Sort, Layout) */}
          <div className="flex flex-wrap items-center gap-2 self-end lg:self-auto">
            {/* Compact Search Bar */}
            <div className="relative w-56 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                placeholder="Search inquiries…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7.5 pr-7 py-1.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-[#102E4D] transition-colors"
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
            <div className="relative w-36">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-xs text-slate-700 focus:outline-none focus:border-[#102E4D] cursor-pointer"
              >
                <option value="newest">🕒 Newest</option>
                <option value="oldest">⏳ Oldest</option>
                <option value="name">🔤 Name (A-Z)</option>
                <option value="status">📊 Status</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => handleSetViewMode("grid")}
                className={`px-2 py-1 rounded-md text-xs font-bold inline-flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white text-[#102E4D] shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-[#FF7900]" />
                <span className="text-[11px]">Cards</span>
              </button>
              <button
                type="button"
                onClick={() => handleSetViewMode("list")}
                className={`px-2 py-1 rounded-md text-xs font-bold inline-flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white text-[#102E4D] shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="Table List View"
              >
                <List className="w-3.5 h-3.5 text-[#005696]" />
                <span className="text-[11px]">List</span>
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
                        {st.label}
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
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── RICH, HIGH-DENSITY LIST TABLE (NO AWKWARD EMPTY SPACE!) ── */
          <div className="overflow-x-auto">
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
                              {st.label}
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

                      {/* School / Organization */}
                      <td className="py-3 px-4 text-slate-700 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{c.organization || "Independent"}</span>
                        </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          {/* Dimmed backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs transition-opacity"
            onClick={() => setSelected(null)}
          />

          {/* Centered Modal Card */}
          <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            {/* Top gradient accent line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#10B981]" />

            {/* Modal Header with High-Visibility ID Number */}
            <div className="bg-[#102E4D] text-white px-5 sm:px-6 py-4 flex items-center justify-between gap-3 shrink-0">
              <div className="flex flex-wrap items-center gap-2.5 min-w-0">
                {/* Prominent High-Visibility Reference ID Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FF7900] text-white font-num font-extrabold text-sm sm:text-base tracking-wider shadow-sm shadow-[#FF7900]/30">
                  <span className="text-orange-200 text-xs font-sans font-bold">ID:</span>
                  <span>#{selected.reference_code}</span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(selected.reference_code, "ref_modal")
                    }
                    className="ml-1 p-1 hover:bg-black/10 rounded transition-colors cursor-pointer"
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
                      className={`px-2.5 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 ${st.pill}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      <span>{st.label}</span>
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
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm">
              {/* SECTION 1: Sender Profile (FROM) */}
              <div className="rounded-2xl bg-slate-50 border border-slate-200/90 p-4 space-y-3.5">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#102E4D] text-white flex items-center justify-center">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#102E4D]">
                      Inquiry From (Sender Profile)
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-num flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Sender Name & Organization */}
                  <div className="space-y-1.5">
                    <div className="text-[10.5px] uppercase font-bold text-slate-400">
                      Sender Name
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-lg border ${getAvatarColor(
                          selected.full_name
                        )} flex items-center justify-center font-bold text-xs shrink-0`}
                      >
                        {getInitials(selected.full_name)}
                      </div>
                      <div className="font-bold text-base text-[#102E4D] leading-tight">
                        {selected.full_name}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium pt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{selected.organization || "Independent / Individual"}</span>
                    </div>
                  </div>

                  {/* Contact Channels: Email & WhatsApp */}
                  <div className="space-y-2">
                    {/* Email row */}
                    <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-slate-200">
                      <div className="flex items-center gap-2 min-w-0">
                        <Mail className="w-3.5 h-3.5 text-[#005696] shrink-0" />
                        <span
                          className="text-xs font-semibold text-slate-800 truncate"
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
                    <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-slate-200">
                      <div className="flex items-center gap-2 min-w-0">
                        <Phone className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                        <span className="text-xs font-semibold text-slate-800 truncate font-num">
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
              <div className="rounded-2xl bg-white border border-slate-200/90 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-[#FF7900]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#102E4D]">
                      Inquiry Message
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#EFFBF8] text-[#005696] font-bold text-[11px] border border-[#C8EFE6]">
                      Topic: {formatTopicName(selected.interest)}
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
                </div>

                <div className="rounded-xl bg-slate-50/90 border border-slate-200/70 p-3.5 text-slate-800 leading-relaxed text-xs sm:text-sm whitespace-pre-wrap font-sans">
                  {selected.message}
                </div>
              </div>

              {/* SECTION 3: CRM Workflow Status */}
              <div className="rounded-2xl bg-white border border-slate-200/90 p-4 space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#102E4D] block">
                  CRM Workflow Status
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                              ? "bg-[#102E4D] text-white border-[#102E4D] shadow-xs ring-2 ring-[#FF7900]/30"
                              : "bg-slate-50/70 hover:bg-slate-100/70 text-slate-700 border-slate-200"
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

              {/* SECTION 4: Internal Admin Notes with Professional Suggestion Grid */}
              <div className="rounded-2xl bg-white border border-slate-200/90 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#102E4D]">
                      Internal Admin Notes
                    </label>
                  </div>
                  <span className="text-[10.5px] text-slate-400">Private log for portal team</span>
                </div>

                {/* Professional Quick Suggestion Grid */}
                <div className="space-y-1.5">
                  <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                    Quick Log Suggestions (Click to append):
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                          className={`p-2 rounded-xl border text-left transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98] flex items-center gap-2 ${item.color}`}
                        >
                          <span
                            className={`w-6 h-6 rounded-lg ${item.iconBg} flex items-center justify-center shrink-0`}
                          >
                            <IconComponent className="w-3.5 h-3.5" />
                          </span>
                          <span className="text-[11px] font-bold truncate">
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
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/40 focus:bg-white text-xs text-slate-800 focus:outline-none focus:border-[#102E4D] transition-colors leading-relaxed"
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

            {/* Modal Footer Controls */}
            <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleDeleteRecord(selected.id)}
                className="h-9 px-3.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="h-9 px-3.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveRecord("responded")}
                  className="h-9 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors shadow-2xs"
                  title="Mark as Responded and Save"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Responded</span>
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveRecord()}
                  className="h-9 px-4.5 rounded-lg bg-[#FF7900] hover:bg-[#E56D00] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? "Saving…" : "Save"}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs"
            onClick={() => setAddModalOpen(false)}
          />

          <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="h-1.5 w-full bg-[#FF7900]" />

            <div className="bg-[#102E4D] text-white px-5 py-3.5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white">
                  Create Contact Inquiry
                </h3>
                <p className="text-[11px] text-slate-300">
                  Log a walk-in, phone call, or new direct organization inquiry.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInquiry} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
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
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#102E4D]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
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
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#102E4D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    placeholder="+92 300 1234567"
                    value={addForm.phone}
                    onChange={(e) =>
                      setAddForm({ ...addForm, phone: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#102E4D]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    School / Organization
                  </label>
                  <input
                    type="text"
                    placeholder="Beaconhouse / Roots"
                    value={addForm.organization}
                    onChange={(e) =>
                      setAddForm({ ...addForm, organization: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#102E4D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Interest Topic
                  </label>
                  <select
                    value={addForm.interest}
                    onChange={(e) =>
                      setAddForm({ ...addForm, interest: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-semibold text-xs text-slate-700"
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
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={addForm.crm_status}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        crm_status: e.target.value as ContactCrmStatus,
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-semibold text-xs text-slate-700"
                  >
                    <option value="new">New / Unread</option>
                    <option value="in_progress">In Progress</option>
                    <option value="responded">Responded</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Inquiry Message / Request Details
                </label>
                <textarea
                  rows={2}
                  placeholder="Details of inquiry or phone call conversation…"
                  value={addForm.message}
                  onChange={(e) =>
                    setAddForm({ ...addForm, message: e.target.value })
                  }
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#102E4D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Internal Admin Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Follow-up promised by Friday"
                  value={addForm.admin_notes}
                  onChange={(e) =>
                    setAddForm({ ...addForm, admin_notes: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#102E4D]"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingInquiry}
                  className="px-4 py-1.5 rounded-lg bg-[#FF7900] hover:bg-[#E56D00] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{addingInquiry ? "Creating…" : "Create Inquiry"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

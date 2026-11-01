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
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import type {
  ContactCrmStatus,
  ContactPriority,
  ContactSubmissionRecord,
} from "@/lib/supabase-store";

const STATUS_TABS: Array<{ id: "all" | ContactCrmStatus; label: string }> = [
  { id: "all", label: "All Inquiries" },
  { id: "new", label: "New / Unread" },
  { id: "in_progress", label: "In Progress" },
  { id: "responded", label: "Responded" },
  { id: "archived", label: "Archived" },
];

export default function AdminContactsCrmPage() {
  const [contacts, setContacts] = useState<ContactSubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | ContactCrmStatus>(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<ContactSubmissionRecord | null>(
    null
  );
  const [editStatus, setEditStatus] = useState<ContactCrmStatus>("new");
  const [editPriority, setEditPriority] = useState<ContactPriority>("normal");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

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

  const filteredContacts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return contacts.filter((c) => {
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
  }, [contacts, statusFilter, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: contacts.length,
      new: contacts.filter((c) => c.crm_status === "new").length,
      in_progress: contacts.filter((c) => c.crm_status === "in_progress")
        .length,
      responded: contacts.filter((c) => c.crm_status === "responded").length,
      archived: contacts.filter((c) => c.crm_status === "archived").length,
    };
  }, [contacts]);

  const handleSaveRecord = async () => {
    if (!selected) return;
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/contacts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selected.id,
          crm_status: editStatus,
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
        setFeedback("Contact CRM record updated.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!window.confirm("Delete this Contact Us inquiry permanently?")) return;
    const res = await fetch(
      `/api/admin/contacts?id=${encodeURIComponent(id)}`,
      { method: "DELETE" }
    );
    if (res.ok) {
      setContacts((prev) => prev.filter((c) => c.id !== id));
      if (selected?.id === id) setSelected(null);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      "Reference",
      "Full Name",
      "Email",
      "Phone",
      "Organization",
      "Interest",
      "Status",
      "Priority",
      "Message",
      "Admin Notes",
      "Created At",
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
    link.download = `TLC-Contact-Inquiries-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const statusBadge = (s: ContactCrmStatus) => {
    switch (s) {
      case "new":
        return "bg-[#FF7900]/15 text-[#E56D00] border-[#FF7900]/30";
      case "in_progress":
        return "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]";
      case "responded":
        return "bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]";
      case "archived":
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const priorityBadge = (p: ContactPriority) => {
    switch (p) {
      case "urgent":
        return "bg-red-100 text-red-700";
      case "high":
        return "bg-orange-100 text-orange-700";
      case "normal":
        return "bg-sky-100 text-sky-700";
      case "low":
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Toolbar & Status Pipeline Tabs */}
      <div className="rounded-2xl bg-white border-2 border-[#C8EFE6] p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif font-extrabold text-xl sm:text-2xl text-[#102E4D]">
              Contact Us Inquiries CRM
            </h2>
            <p className="text-xs text-slate-500">
              All school, educator, and partner inquiries submitted through{" "}
              <code>/contact</code> and Home Contact forms
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={filteredContacts.length === 0}
              className="h-9 px-3.5 rounded-xl border border-[#102E4D]/20 hover:border-[#102E4D] bg-white text-[#102E4D] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-[#FF7900]" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={loadContacts}
              className="h-9 px-3.5 rounded-xl bg-[#001B33] hover:bg-[#102E4D] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#FFC400] ${
                  loading ? "animate-spin" : ""
                }`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Status Filter Tabs + Search Input */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {STATUS_TABS.map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap inline-flex items-center gap-2 transition-all cursor-pointer ${
                    active
                      ? "bg-[#102E4D] text-white shadow-xs"
                      : "bg-[#EFFBF8] text-[#102E4D] hover:bg-[#D7F5EF]"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`font-num px-1.5 py-0.5 rounded-full text-[10px] ${
                      active
                        ? "bg-[#FFC400] text-[#001B33]"
                        : "bg-white text-slate-600"
                    }`}
                  >
                    {counts[tab.id]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              placeholder="Search name, school, email, ref…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#C8EFE6] bg-[#EFFBF8]/40 focus:bg-white text-xs font-semibold text-[#102E4D] focus:outline-none focus:border-[#102E4D]"
            />
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="rounded-2xl bg-white border-2 border-[#C8EFE6] shadow-2xs overflow-hidden">
        {loading && contacts.length === 0 ? (
          <div className="p-12 text-center text-xs font-semibold text-slate-400">
            Loading Contact Us records…
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Sparkles className="w-8 h-8 text-[#FF7900] mx-auto" />
            <div className="font-bold text-sm text-[#102E4D]">
              No matching Contact Us records
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              New inquiries submitted on the website will appear here
              automatically with reference codes and status tracking.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#EFFBF8] border-b border-[#C8EFE6] text-[10.5px] font-extrabold uppercase tracking-wider text-[#102E4D]">
                  <th className="py-3.5 px-4">Reference</th>
                  <th className="py-3.5 px-4">Sender</th>
                  <th className="py-3.5 px-4">School / Organization</th>
                  <th className="py-3.5 px-4">Interest</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Received</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContacts.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => openInspector(c)}
                    className="hover:bg-[#EFFBF8]/55 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-num font-extrabold text-[#FF7900] whitespace-nowrap">
                      #{c.reference_code}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#102E4D]">
                        {c.full_name}
                      </div>
                      <div className="text-[11px] text-slate-500">{c.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {c.organization}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-[#EDF6FB] text-[#005696] font-bold capitalize">
                        {c.interest.replace(/-/g, " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${priorityBadge(
                          c.priority
                        )}`}
                      >
                        {c.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full border text-[10px] font-extrabold uppercase whitespace-nowrap ${statusBadge(
                          c.crm_status
                        )}`}
                      >
                        {c.crm_status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-num text-slate-500 whitespace-nowrap">
                      {new Date(c.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td
                      className="py-3.5 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => openInspector(c)}
                        className="px-3 py-1.5 rounded-lg bg-[#102E4D] hover:bg-[#001B33] text-white font-bold text-[11px] cursor-pointer"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-Over Contact Inspector & CRM Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-[#001B33]/55 backdrop-blur-xs"
            onClick={() => setSelected(null)}
          />
          <div className="relative z-10 w-full max-w-lg bg-white h-full shadow-2xl border-l-2 border-[#BCE8DF] flex flex-col overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#10B981]" />

            {/* Drawer Header */}
            <div className="bg-[#001B33] text-white px-6 py-4 flex items-center justify-between gap-3">
              <div>
                <span className="font-num text-[10.5px] font-extrabold uppercase tracking-wider text-[#FFC400] block">
                  Inquiry #{selected.reference_code}
                </span>
                <h3 className="font-serif font-bold text-lg text-white">
                  {selected.full_name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs sm:text-sm">
              {/* Sender Profile Card */}
              <div className="rounded-2xl bg-[#EFFBF8] border border-[#C8EFE6] p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-[#102E4D] font-bold">
                  <Building2 className="w-4 h-4 text-[#FF7900] shrink-0" />
                  <span>{selected.organization}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-4 h-4 text-[#005696] shrink-0" />
                  <a
                    href={`mailto:${selected.email}?subject=${encodeURIComponent(
                      `Re: Your Inquiry (#${selected.reference_code}) — The Leadership Covenant`
                    )}`}
                    className="font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    {selected.email}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                {selected.phone && (
                  <div className="flex items-center gap-2 text-slate-700 font-num">
                    <Phone className="w-4 h-4 text-[#16A34A] shrink-0" />
                    <span>{selected.phone}</span>
                  </div>
                )}

                <div className="pt-2 flex flex-wrap gap-2">
                  <a
                    href={`mailto:${selected.email}?subject=${encodeURIComponent(
                      `Re: Inquiry #${selected.reference_code} — The Leadership Covenant`
                    )}`}
                    className="h-8 px-3 rounded-lg bg-[#102E4D] text-white text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#FFC400]" />
                    <span>Reply via Email</span>
                  </a>
                  {selected.phone && (
                    <a
                      href={`https://wa.me/${selected.phone.replace(
                        /[^0-9]/g,
                        ""
                      )}?text=${encodeURIComponent(
                        `Assalam-o-Alaikum ${selected.full_name}, thank you for contacting The Leadership Covenant (Ref #${selected.reference_code}).`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 px-3 rounded-lg bg-[#25D366] text-white text-xs font-bold inline-flex items-center gap-1.5"
                    >
                      <FaWhatsapp className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Inquiry Message */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    Inquiry Message
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EDF6FB] text-[#005696] text-[10.5px] font-bold capitalize">
                    Topic: {selected.interest.replace(/-/g, " ")}
                  </span>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {selected.message}
                </div>
                <div className="font-num text-[11px] text-slate-400 flex justify-between">
                  <span>
                    Submitted: {new Date(selected.created_at).toLocaleString()}
                  </span>
                  {selected.responded_at && (
                    <span className="text-[#15803D] font-semibold">
                      Responded:{" "}
                      {new Date(selected.responded_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* CRM Workflow Controls */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1">
                    CRM Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) =>
                      setEditStatus(e.target.value as ContactCrmStatus)
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#C8EFE6] bg-[#EFFBF8]/50 font-bold text-xs text-[#102E4D]"
                  >
                    <option value="new">New / Unread</option>
                    <option value="in_progress">In Progress</option>
                    <option value="responded">Responded</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1">
                    Priority Level
                  </label>
                  <select
                    value={editPriority}
                    onChange={(e) =>
                      setEditPriority(e.target.value as ContactPriority)
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#C8EFE6] bg-[#EFFBF8]/50 font-bold text-xs text-[#102E4D]"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Quick One-Click Status Chips */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setEditStatus("in_progress")}
                  className="px-2.5 py-1 rounded-lg bg-[#FEF3C7] text-[#B45309] text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Clock className="w-3 h-3" /> Mark In Progress
                </button>
                <button
                  type="button"
                  onClick={() => setEditStatus("responded")}
                  className="px-2.5 py-1 rounded-lg bg-[#DCFCE7] text-[#15803D] text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-3 h-3" /> Mark Responded
                </button>
                <button
                  type="button"
                  onClick={() => setEditStatus("archived")}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Archive className="w-3 h-3" /> Archive
                </button>
              </div>

              {/* Admin Internal Notes */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1.5">
                  Internal CRM Notes
                </label>
                <textarea
                  rows={4}
                  placeholder="Add call notes, follow-up dates, or assigned team member…"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#C8EFE6] bg-[#EFFBF8]/35 focus:bg-white text-xs text-[#102E4D] focus:outline-none focus:border-[#102E4D]"
                />
              </div>

              {feedback && (
                <div className="p-3 rounded-xl bg-[#DCFCE7] text-[#15803D] text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{feedback}</span>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="px-6 py-4 bg-[#F8FCFB] border-t border-[#C8EFE6] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleDeleteRecord(selected.id)}
                className="h-9 px-3 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <button
                type="button"
                onClick={handleSaveRecord}
                disabled={saving}
                className="h-9 px-5 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] text-white text-xs font-extrabold inline-flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-60"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? "Saving…" : "Save CRM Changes"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


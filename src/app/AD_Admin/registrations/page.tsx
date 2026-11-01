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

function RegistrationsCrmInner() {
  const searchParams = useSearchParams();
  const initialActivityParam = searchParams?.get("activity") || "all";

  const [registrations, setRegistrations] = useState<
    ActivityRegistrationRecord[]
  >([]);
  const [activities, setActivities] = useState<LeadershipEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [activeActivityTab, setActiveActivityTab] =
    useState<string>(initialActivityParam);
  const [bookingFilter, setBookingFilter] = useState<"all" | BookingModeType>(
    "all"
  );
  const [verificationFilter, setVerificationFilter] = useState<
    "all" | VerificationStatus
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Inspector Drawer State
  const [selected, setSelected] = useState<ActivityRegistrationRecord | null>(
    null
  );
  const [editMode, setEditMode] = useState<BookingModeType>("reserve_later");
  const [editVerification, setEditVerification] =
    useState<VerificationStatus>("pending_callback");
  const [editTransactionRef, setEditTransactionRef] = useState("");
  const [editFeeLabel, setEditFeeLabel] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

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
  });

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
        setRegistrations(
          Array.isArray(json.registrations) ? json.registrations : []
        );
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
    const map = new Map<
      string,
      { slug: string; title: string; count: number }
    >();
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

  const modeCounts = useMemo(() => {
    return {
      all: tabFilteredByActivity.length,
      reserve_later: tabFilteredByActivity.filter(
        (r) => r.booking_mode === "reserve_later"
      ).length,
      secure_seat: tabFilteredByActivity.filter(
        (r) => r.booking_mode === "secure_seat"
      ).length,
    };
  }, [tabFilteredByActivity]);

  const filteredRegistrations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tabFilteredByActivity.filter((r) => {
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
  }, [tabFilteredByActivity, bookingFilter, verificationFilter, searchQuery]);

  const openInspector = (reg: ActivityRegistrationRecord) => {
    setSelected(reg);
    setEditMode(reg.booking_mode);
    setEditVerification(reg.verification_status);
    setEditTransactionRef(reg.transaction_ref || "");
    setEditFeeLabel(reg.fee_label || "");
    setEditNotes(reg.admin_notes || "");
    setFeedback(null);
  };

  const toReceiptPayload = (
    reg: ActivityRegistrationRecord
  ): ReceiptPayload => {
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
        setFeedback("Registration CRM record saved.");
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
        "Delete this registration and its stored screenshot permanently?"
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
        });
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

  const verificationBadge = (status: VerificationStatus) => {
    switch (status) {
      case "verified_confirmed":
        return {
          cls: "bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]",
          label: "Verified & Confirmed",
        };
      case "awaiting_verification":
        return {
          cls: "bg-[#E0F2FE] text-[#0369A1] border-[#7DD3FC]",
          label: "Verify Screenshot",
        };
      case "pending_callback":
        return {
          cls: "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]",
          label: "Pending Callback",
        };
      case "waitlisted":
        return {
          cls: "bg-purple-100 text-purple-700 border-purple-200",
          label: "Waitlisted",
        };
      case "cancelled":
        return {
          cls: "bg-red-100 text-red-700 border-red-200",
          label: "Cancelled",
        };
    }
  };

  return (
    <div className="space-y-5">
      {/* Header + Actions */}
      <div className="rounded-2xl bg-white border-2 border-[#C8EFE6] p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif font-extrabold text-xl sm:text-2xl text-[#102E4D]">
              Activity Registrations, Screenshots &amp; Receipts CRM
            </h2>
            <p className="text-xs text-slate-500">
              Organized by Activity Cohort tabs • Filter Provisional
              Reservations vs Secured UBL Payments, inspect screenshots &amp;
              issue official receipts
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="h-9 px-3.5 rounded-xl bg-[#FF7900] hover:bg-[#E56D00] text-white text-xs font-extrabold inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Registration</span>
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={filteredRegistrations.length === 0}
              className="h-9 px-3.5 rounded-xl border border-[#102E4D]/20 hover:border-[#102E4D] bg-white text-[#102E4D] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-[#FF7900]" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={loadData}
              className="h-9 px-3 rounded-xl bg-[#001B33] hover:bg-[#102E4D] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#FFC400] ${
                  loading ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Dynamic Activity Cohort Tabs */}
        <div className="pt-2 border-t border-slate-100">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
            Select Activity / Cohort Tab
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5">
            <button
              type="button"
              onClick={() => setActiveActivityTab("all")}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap inline-flex items-center gap-2 transition-all cursor-pointer ${
                activeActivityTab === "all"
                  ? "bg-gradient-to-r from-[#001B33] to-[#102E4D] text-white shadow-sm"
                  : "bg-[#EFFBF8] text-[#102E4D] hover:bg-[#D7F5EF] border border-[#C8EFE6]"
              }`}
            >
              <span>All Activities</span>
              <span
                className={`font-num px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeActivityTab === "all"
                    ? "bg-[#FFC400] text-[#001B33]"
                    : "bg-white text-[#102E4D]"
                }`}
              >
                {registrations.length}
              </span>
            </button>

            {activityTabs.map((tab) => {
              const active = activeActivityTab === tab.slug;
              return (
                <button
                  key={tab.slug}
                  type="button"
                  onClick={() => setActiveActivityTab(tab.slug)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap inline-flex items-center gap-2 transition-all cursor-pointer ${
                    active
                      ? "bg-gradient-to-r from-[#001B33] to-[#102E4D] text-white shadow-sm"
                      : "bg-[#EFFBF8] text-[#102E4D] hover:bg-[#D7F5EF] border border-[#C8EFE6]"
                  }`}
                >
                  <span className="max-w-[220px] truncate">{tab.title}</span>
                  <span
                    className={`font-num px-1.5 py-0.5 rounded-full text-[10px] ${
                      active
                        ? "bg-[#FFC400] text-[#001B33]"
                        : "bg-white text-[#102E4D]"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sub-Filters: Reservation vs Secured Payment + Status + Search */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setBookingFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                bookingFilter === "all"
                  ? "bg-[#102E4D] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Bookings ({modeCounts.all})
            </button>
            <button
              type="button"
              onClick={() => setBookingFilter("reserve_later")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer ${
                bookingFilter === "reserve_later"
                  ? "bg-[#D97706] text-white"
                  : "bg-[#FEF3C7] text-[#B45309] hover:bg-[#FDE68A]"
              }`}
            >
              <CalendarCheck2 className="w-3.5 h-3.5" />
              <span>Provisional Reservations ({modeCounts.reserve_later})</span>
            </button>
            <button
              type="button"
              onClick={() => setBookingFilter("secure_seat")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer ${
                bookingFilter === "secure_seat"
                  ? "bg-[#15803D] text-white"
                  : "bg-[#DCFCE7] text-[#15803D] hover:bg-[#BBF7D0]"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Secured Payments • UBL ({modeCounts.secure_seat})</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <select
              value={verificationFilter}
              onChange={(e) =>
                setVerificationFilter(
                  e.target.value as "all" | VerificationStatus
                )
              }
              className="px-3 py-2 rounded-xl border border-[#C8EFE6] bg-[#EFFBF8]/50 text-xs font-bold text-[#102E4D]"
            >
              <option value="all">All Verification States</option>
              <option value="pending_callback">Pending Callback</option>
              <option value="awaiting_verification">
                Awaiting Screenshot Verification
              </option>
              <option value="verified_confirmed">Verified &amp; Confirmed</option>
              <option value="waitlisted">Waitlisted</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                placeholder="Search name, phone, #TLC-26-…, TID…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#C8EFE6] bg-[#EFFBF8]/40 focus:bg-white text-xs font-semibold text-[#102E4D] focus:outline-none focus:border-[#102E4D]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="rounded-2xl bg-white border-2 border-[#C8EFE6] shadow-2xs overflow-hidden">
        {loading && registrations.length === 0 ? (
          <div className="p-12 text-center text-xs font-semibold text-slate-400">
            Loading Activity Registrations…
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CalendarCheck2 className="w-8 h-8 text-[#FF7900] mx-auto" />
            <div className="font-bold text-sm text-[#102E4D]">
              No registrations in this view yet
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Switch activity tabs above, clear filters, or click{" "}
              <strong>Add Registration</strong> to record a participant
              manually.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#EFFBF8] border-b border-[#C8EFE6] text-[10.5px] font-extrabold uppercase tracking-wider text-[#102E4D]">
                  <th className="py-3.5 px-4">Booking Ref</th>
                  <th className="py-3.5 px-4">Participant</th>
                  <th className="py-3.5 px-4">Activity / Cohort</th>
                  <th className="py-3.5 px-4">Booking Mode</th>
                  <th className="py-3.5 px-4">Screenshot / Proof</th>
                  <th className="py-3.5 px-4">Verification</th>
                  <th className="py-3.5 px-4 text-right">Receipt &amp; CRM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRegistrations.map((r) => {
                  const vBadge = verificationBadge(r.verification_status);
                  return (
                    <tr
                      key={r.id}
                      onClick={() => openInspector(r)}
                      className="hover:bg-[#EFFBF8]/55 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-num font-extrabold text-[#102E4D]">
                          #{r.reference_code}
                        </div>
                        <div className="font-num text-[10.5px] text-slate-400">
                          {new Date(r.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#102E4D]">
                          {r.full_name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {r.role} • <span className="font-num">{r.phone}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-[230px]">
                        <div className="font-bold text-[#102E4D] truncate">
                          {r.activity_title}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {r.fee_label || r.activity_city}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {r.booking_mode === "secure_seat" ? (
                          <span className="px-2.5 py-1 rounded-lg bg-[#DCFCE7] text-[#15803D] font-extrabold text-[10.5px] inline-flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Secured (UBL)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-[#FEF3C7] text-[#B45309] font-extrabold text-[10.5px] inline-flex items-center gap-1">
                            <CalendarCheck2 className="w-3.5 h-3.5" />
                            Reservation
                          </span>
                        )}
                      </td>

                      <td
                        className="py-3.5 px-4 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {r.screenshot_url ? (
                          <button
                            type="button"
                            onClick={() => setLightboxUrl(r.screenshot_url)}
                            className="inline-flex items-center gap-2 px-2 py-1 rounded-lg bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD] text-[#0369A1] font-bold text-[11px] cursor-pointer"
                          >
                            <img
                              src={r.screenshot_url}
                              alt="Proof"
                              className="w-7 h-7 rounded object-cover border border-white"
                            />
                            <span>View Proof</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            {r.transaction_ref
                              ? `TID: ${r.transaction_ref}`
                              : "Pay Later"}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full border text-[10px] font-extrabold uppercase ${vBadge.cls}`}
                        >
                          {vBadge.label}
                        </span>
                      </td>

                      <td
                        className="py-3.5 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              downloadOfficialReceipt(toReceiptPayload(r))
                            }
                            title="Download Official PNG Receipt"
                            className="p-1.5 rounded-lg border border-[#C8EFE6] bg-[#EFFBF8] hover:bg-[#D7F5EF] text-[#102E4D] cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5 text-[#FF7900]" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              printOfficialReceipt(toReceiptPayload(r))
                            }
                            title="Print Official Voucher"
                            className="p-1.5 rounded-lg border border-[#C8EFE6] bg-[#EFFBF8] hover:bg-[#D7F5EF] text-[#102E4D] cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5 text-[#102E4D]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openInspector(r)}
                            className="px-3 py-1.5 rounded-lg bg-[#102E4D] hover:bg-[#001B33] text-white font-bold text-[11px] cursor-pointer"
                          >
                            Inspect
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

      {/* Full Registrant CRM Inspector Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-[#001B33]/55 backdrop-blur-xs"
            onClick={() => setSelected(null)}
          />
          <div className="relative z-10 w-full max-w-xl bg-white h-full shadow-2xl border-l-2 border-[#BCE8DF] flex flex-col overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#10B981]" />

            <div className="bg-[#001B33] text-white px-6 py-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="font-num text-[10.5px] font-extrabold uppercase tracking-wider text-[#FFC400] block">
                  Booking Ref #{selected.reference_code}
                </span>
                <h3 className="font-serif font-bold text-lg text-white truncate">
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

            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs sm:text-sm">
              {/* Official Receipt Generation Toolbar inside Drawer */}
              <div className="rounded-2xl bg-gradient-to-r from-[#001B33] via-[#102E4D] to-[#001B33] text-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#FFC400]">
                    Official Customer Voucher
                  </div>
                  <div className="font-bold text-xs text-white mt-0.5">
                    Generate branded PNG or Print Receipt (#
                    {selected.reference_code})
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      downloadOfficialReceipt(toReceiptPayload(selected))
                    }
                    className="h-8 px-3 rounded-lg bg-[#FFC400] hover:bg-[#FFD033] text-[#001B33] text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PNG Receipt</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      printOfficialReceipt(toReceiptPayload(selected))
                    }
                    className="h-8 px-3 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                </div>
              </div>

              {/* Participant & Activity Details Grid */}
              <div className="rounded-2xl bg-[#EFFBF8] border border-[#C8EFE6] p-4 space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                      Role / Designation
                    </span>
                    <span className="font-bold text-[#102E4D]">
                      {selected.role}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                      Organization / School
                    </span>
                    <span className="font-bold text-[#102E4D]">
                      {selected.organization || "Individual Participant"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                      Email Address
                    </span>
                    <a
                      href={`mailto:${selected.email}`}
                      className="font-semibold text-[#005696] hover:underline inline-flex items-center gap-1 break-all"
                    >
                      <Mail className="w-3 h-3 shrink-0" />
                      {selected.email}
                    </a>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                      Phone / WhatsApp
                    </span>
                    <span className="font-num font-bold text-[#102E4D] inline-flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#16A34A]" />
                      {selected.phone}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#C8EFE6] flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-[#FF7900] block">
                      Selected Activity
                    </span>
                    <span className="font-bold text-[#102E4D] text-xs sm:text-sm">
                      {selected.activity_title}
                    </span>
                    <span className="font-num text-[11px] text-slate-500 block">
                      {selected.activity_date} • {selected.activity_city}
                    </span>
                  </div>

                  <a
                    href={`https://wa.me/${selected.phone.replace(
                      /[^0-9]/g,
                      ""
                    )}?text=${encodeURIComponent(
                      `Assalam-o-Alaikum ${selected.full_name}! Regarding your registration (Ref #${selected.reference_code}) for "${selected.activity_title}" with The Leadership Covenant:`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 px-3 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <FaWhatsapp className="w-3.5 h-3.5" />
                    <span>Message Participant</span>
                  </a>
                </div>
              </div>

              {/* Cloudinary Payment Screenshot & Proof Section */}
              <div className="rounded-2xl bg-[#F8FAFC] border-2 border-[#CFE6F3] p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#102E4D] inline-flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#005696]" />
                    Payment Screenshot &amp; UBL Proof
                  </span>

                  <label className="h-8 px-3 rounded-lg bg-[#005696] hover:bg-[#004477] text-white text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer">
                    {uploadingProof ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <UploadCloud className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {selected.screenshot_url
                        ? "Replace Proof"
                        : "Attach Screenshot"}
                    </span>
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
                      className="relative group rounded-xl overflow-hidden border border-[#BAE6FD] bg-white max-h-64 flex items-center justify-center cursor-zoom-in"
                    >
                      <img
                        src={selected.screenshot_url}
                        alt="Payment Screenshot"
                        className="max-h-60 w-auto object-contain"
                      />
                      <div className="absolute inset-0 bg-[#001B33]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                        <ZoomIn className="w-4 h-4" />
                        <span>Click to Inspect Full Size</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="truncate">
                        {selected.screenshot_name || "Uploaded Screenshot"}
                      </span>
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
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center text-xs text-slate-500">
                    No payment screenshot attached yet (Provisional Pay-Later
                    Reservation). You can upload a screenshot above once
                    received via WhatsApp.
                  </div>
                )}

                {selected.verification_status !== "verified_confirmed" && (
                  <button
                    type="button"
                    onClick={() =>
                      handleSaveRecord({
                        verification_status: "verified_confirmed",
                      })
                    }
                    className="w-full py-2.5 px-4 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-extrabold uppercase tracking-wider inline-flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify Payment &amp; Confirm Seat Now</span>
                  </button>
                )}
              </div>

              {/* Editable CRM Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1">
                    Booking Mode
                  </label>
                  <select
                    value={editMode}
                    onChange={(e) =>
                      setEditMode(e.target.value as BookingModeType)
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#C8EFE6] bg-[#EFFBF8]/50 font-bold text-xs text-[#102E4D]"
                  >
                    <option value="reserve_later">
                      Provisional Reservation (Pay Later)
                    </option>
                    <option value="secure_seat">
                      Secured Seat (UBL Transfer)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1">
                    Verification Status
                  </label>
                  <select
                    value={editVerification}
                    onChange={(e) =>
                      setEditVerification(e.target.value as VerificationStatus)
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#C8EFE6] bg-[#EFFBF8]/50 font-bold text-xs text-[#102E4D]"
                  >
                    <option value="pending_callback">Pending Callback</option>
                    <option value="awaiting_verification">
                      Awaiting Proof Verification
                    </option>
                    <option value="verified_confirmed">
                      Verified &amp; Confirmed
                    </option>
                    <option value="waitlisted">Waitlisted</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1">
                    UBL Transaction ID / Ref
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. RAAST-9482710"
                    value={editTransactionRef}
                    onChange={(e) => setEditTransactionRef(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#C8EFE6] bg-[#EFFBF8]/40 font-num text-xs font-bold text-[#102E4D]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1">
                    Applicable Fee Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PKR 4,000 (Early Bird)"
                    value={editFeeLabel}
                    onChange={(e) => setEditFeeLabel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#C8EFE6] bg-[#EFFBF8]/40 font-num text-xs font-bold text-[#102E4D]"
                  />
                </div>
              </div>

              {selected.message && (
                <div>
                  <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                    Participant Note
                  </span>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                    {selected.message}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D] mb-1">
                  Internal Admin CRM Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Record payment verification notes, group discount details, or callback summary…"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#C8EFE6] bg-[#EFFBF8]/35 focus:bg-white text-xs text-[#102E4D]"
                />
              </div>

              {feedback && (
                <div className="p-3 rounded-xl bg-[#DCFCE7] text-[#15803D] text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{feedback}</span>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-[#F8FCFB] border-t border-[#C8EFE6] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleDelete(selected.id)}
                className="h-9 px-3 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveRecord()}
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

      {/* Fullscreen Payment Screenshot Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[60] bg-[#001B33]/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute top-5 right-5 p-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxUrl}
            alt="Full Size Payment Proof"
            className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl border-2 border-white/20 object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Add Manual Registration Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#001B33]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white border-2 border-[#BCE8DF] shadow-2xl overflow-hidden">
            <div className="bg-[#001B33] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg">
                Add Manual Activity Registration
              </h3>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateManual} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold uppercase text-[#102E4D] mb-1">
                    Full Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={newReg.full_name}
                    onChange={(e) =>
                      setNewReg({ ...newReg, full_name: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#C8EFE6] bg-[#EFFBF8]/40 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-extrabold uppercase text-[#102E4D] mb-1">
                    Email *
                  </label>
                  <input
                    required
                    type="email"
                    value={newReg.email}
                    onChange={(e) =>
                      setNewReg({ ...newReg, email: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#C8EFE6] bg-[#EFFBF8]/40 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-extrabold uppercase text-[#102E4D] mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    required
                    type="text"
                    value={newReg.phone}
                    onChange={(e) =>
                      setNewReg({ ...newReg, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#C8EFE6] bg-[#EFFBF8]/40 font-num font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-extrabold uppercase text-[#102E4D] mb-1">
                    Role / Designation *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Principal / Coordinator"
                    value={newReg.role}
                    onChange={(e) =>
                      setNewReg({ ...newReg, role: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#C8EFE6] bg-[#EFFBF8]/40 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-extrabold uppercase text-[#102E4D] mb-1">
                  School / Organization
                </label>
                <input
                  type="text"
                  value={newReg.organization}
                  onChange={(e) =>
                    setNewReg({ ...newReg, organization: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#C8EFE6] bg-[#EFFBF8]/40 font-semibold"
                />
              </div>

              <div>
                <label className="block font-extrabold uppercase text-[#102E4D] mb-1">
                  Activity / Cohort *
                </label>
                <select
                  value={newReg.activity_slug}
                  onChange={(e) =>
                    setNewReg({ ...newReg, activity_slug: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#C8EFE6] bg-[#EFFBF8]/50 font-bold text-[#102E4D]"
                >
                  {activities.map((a) => (
                    <option key={a.slug} value={a.slug}>
                      {a.title} ({a.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold uppercase text-[#102E4D] mb-1">
                    Booking Mode
                  </label>
                  <select
                    value={newReg.booking_mode}
                    onChange={(e) =>
                      setNewReg({
                        ...newReg,
                        booking_mode: e.target.value as BookingModeType,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#C8EFE6] bg-[#EFFBF8]/50 font-bold"
                  >
                    <option value="reserve_later">
                      Provisional Reservation
                    </option>
                    <option value="secure_seat">Secured Seat (UBL Paid)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-extrabold uppercase text-[#102E4D] mb-1">
                    Verification Status
                  </label>
                  <select
                    value={newReg.verification_status}
                    onChange={(e) =>
                      setNewReg({
                        ...newReg,
                        verification_status: e.target
                          .value as VerificationStatus,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#C8EFE6] bg-[#EFFBF8]/50 font-bold"
                  >
                    <option value="pending_callback">Pending Callback</option>
                    <option value="awaiting_verification">
                      Awaiting Verification
                    </option>
                    <option value="verified_confirmed">
                      Verified &amp; Confirmed
                    </option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="h-9 px-4 rounded-xl border border-slate-200 font-bold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="h-9 px-5 rounded-xl bg-[#FF7900] hover:bg-[#E56D00] text-white font-extrabold cursor-pointer disabled:opacity-60"
                >
                  {creating ? "Creating…" : "Create Registration"}
                </button>
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


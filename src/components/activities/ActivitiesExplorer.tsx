"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  PRECOMPUTED_EVENTS,
  AVAILABLE_EVENT_MONTHS,
  OPEN_ENROLLMENT_COUNT,
  CATEGORY_LABELS,
  getMonthTheme,
  type LeadershipEvent,
} from "@/content/events";
import {
  MdLocationOn,
  MdArrowForward,
  MdCheckCircle,
  MdFilterList,
  MdInfoOutline,
  MdCalendarToday,
  MdAccessTime,
  MdSearch,
  MdClose,
} from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";

const EventDetailModal = dynamic(
  () => import("@/components/EventDetailModal"),
  { ssr: false }
);

const CATEGORY_FILTERS = [
  { id: "all", label: "All Categories" },
  { id: "professional_development", label: "Professional Development" },
  { id: "lim_community", label: "LiM Community Event" },
  { id: "wellness", label: "Wellness" },
  { id: "leaderu", label: "LeaderU" },
  { id: "family_session", label: "Family Session" },
  { id: "summit", label: "Summit" },
  { id: "student_camp", label: "Student Camp" },
] as const;

type EnrollmentFilter = "all" | "open_enrollment";

const STATUS_DOT: Record<LeadershipEvent["statusTone"], string> = {
  open: "bg-[#16A34A]",
  limited: "bg-[#FF7900]",
  free: "bg-[#2563EB]",
};

export default function ActivitiesExplorer() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [enrollmentFilter, setEnrollmentFilter] =
    useState<EnrollmentFilter>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [selectedModalEvent, setSelectedModalEvent] =
    useState<LeadershipEvent | null>(null);

  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const monthNum = selectedMonth === "all" ? null : Number(selectedMonth);

    return PRECOMPUTED_EVENTS.filter((evt) => {
      if (selectedCategory !== "all" && evt.category !== selectedCategory) {
        return false;
      }
      if (enrollmentFilter === "open_enrollment" && !evt.isOpenEnrollment) {
        return false;
      }
      if (monthNum !== null && evt.monthIndex !== monthNum) {
        return false;
      }
      if (q && !evt.searchHaystack.includes(q)) {
        return false;
      }
      return true;
    });
  }, [selectedCategory, enrollmentFilter, selectedMonth, searchQuery]);

  const resetAllFilters = useCallback(() => {
    setSelectedCategory("all");
    setEnrollmentFilter("all");
    setSelectedMonth("all");
    setSearchQuery("");
  }, []);

  return (
    <>
      {/* 2. Smart Activity Explorer + Calendar Events Grid */}
      <section
        className="w-full py-10 sm:py-16 relative overflow-hidden scroll-mt-20 sm:scroll-mt-24"
        id="calendar"
      >
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#D7F5EF]/60 blur-3xl pointer-events-none transform-gpu" />

        <div className="max-w-[1280px] mx-auto px-3.5 sm:px-6 lg:px-8 relative z-10 space-y-6 sm:space-y-8">
          {/* Executive Smart Activity Explorer Console */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl sm:rounded-3xl bg-white border border-[#C8EFE6] shadow-[0_14px_40px_-14px_rgba(16,46,77,0.1)] overflow-hidden transform-gpu"
          >
            {/* Top Signature Accent Bar */}
            <div className="h-1 w-full bg-gradient-to-r from-[#102E4D] via-[#FFC400] to-[#FF7900]" />

            {/* Top Header Bar: Title + Search Input + Enrollment Status Toggle */}
            <div className="px-4 sm:px-7 py-4 sm:py-5 bg-gradient-to-r from-[#EFFBF8]/75 via-white to-[#EFFBF8]/40 border-b border-[#D7F5EF]/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 sm:gap-4">
              {/* Left: Explorer Identity & Live Count */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#102E4D] text-[#FFC400] flex items-center justify-center shrink-0 shadow-xs">
                  <MdFilterList className="text-lg sm:text-xl" />
                </div>
                <div>
                  <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                    <h2 className="font-serif font-extrabold text-base sm:text-xl text-[#102E4D] tracking-tight">
                      Smart Activity Explorer
                    </h2>
                    <span className="font-num text-[11px] sm:text-xs font-extrabold px-2 sm:px-2.5 py-0.5 rounded-full bg-[#EFFBF8] border border-[#C8EFE6] text-[#102E4D]">
                      {filteredEvents.length} of {PRECOMPUTED_EVENTS.length}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-snug line-clamp-2 sm:line-clamp-none">
                    Browse scheduled 2026 experiences by month, category, enrollment status, or keyword.
                  </p>
                </div>
              </div>

              {/* Right: Search Bar + Status Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 w-full lg:w-auto">
                {/* Clean Search Input */}
                <div className="relative w-full sm:w-64 xl:w-72">
                  <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search topic, workshop, city..."
                    aria-label="Search activities"
                    className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-[#C8EFE6] bg-white text-xs sm:text-[13px] font-medium text-[#102E4D] placeholder:text-slate-400 focus:outline-none focus:border-[#FF7900] focus:ring-2 focus:ring-[#FF7900]/15 transition-all shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      aria-label="Clear search"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <MdClose className="text-xs" />
                    </button>
                  )}
                </div>

                {/* Status Toggle Group (Full width symmetrical 50/50 on mobile) */}
                <div className="w-full sm:w-auto grid grid-cols-2 sm:flex p-1 rounded-xl bg-[#EFFBF8] border border-[#D7F5EF] shrink-0 text-center">
                  <button
                    type="button"
                    onClick={() => setEnrollmentFilter("all")}
                    className={`w-full sm:w-auto justify-center text-center px-3 sm:px-3.5 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition-colors duration-150 cursor-pointer ${
                      enrollmentFilter === "all"
                        ? "bg-[#102E4D] text-white shadow-xs"
                        : "text-slate-600 hover:text-[#102E4D]"
                    }`}
                  >
                    All Statuses
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setEnrollmentFilter((prev) =>
                        prev === "open_enrollment" ? "all" : "open_enrollment"
                      )
                    }
                    className={`w-full sm:w-auto justify-center text-center px-3 sm:px-3.5 py-2 sm:py-1.5 rounded-lg text-xs font-extrabold transition-colors duration-150 cursor-pointer inline-flex items-center gap-1.5 sm:gap-2 ${
                      enrollmentFilter === "open_enrollment"
                        ? "bg-[#16A34A] text-white shadow-xs"
                        : "text-[#047857] hover:bg-[#D7F5EF]/70"
                    }`}
                  >
                    <span className="relative flex h-2 w-2">
                      <span
                        className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                          enrollmentFilter === "open_enrollment"
                            ? "bg-white"
                            : "bg-[#16A34A]"
                        }`}
                      />
                      <span
                        className={`relative inline-flex rounded-full h-2 w-2 ${
                          enrollmentFilter === "open_enrollment"
                            ? "bg-white"
                            : "bg-[#16A34A]"
                        }`}
                      />
                    </span>
                    <span>Enrollments Open</span>
                    <span
                      className={`font-num text-[10.5px] px-1.5 py-0.2 rounded-md ${
                        enrollmentFilter === "open_enrollment"
                          ? "bg-white/20 text-white"
                          : "bg-white border border-[#A7F3D0] text-[#047857]"
                      }`}
                    >
                      {OPEN_ENROLLMENT_COUNT}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Pills Body: Months + Categories (Swipeable on mobile, wrapped on tablet/desktop) */}
            <div className="px-4 sm:px-7 py-3.5 sm:py-5 space-y-3 sm:space-y-4">
              {/* Row 1: Month-Wise Coloured Filter Pills */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3.5">
                <div className="flex items-center justify-between sm:justify-start gap-2 shrink-0 sm:w-24">
                  <span className="text-[10.5px] sm:text-[11px] font-extrabold uppercase tracking-widest text-[#102E4D]/70">
                    By Month
                  </span>
                  <span className="sm:hidden text-[10px] font-semibold text-slate-400 inline-flex items-center gap-1">
                    Swipe <span className="text-[11px]">→</span>
                  </span>
                </div>
                <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex items-center gap-1.5 sm:gap-2 overflow-x-auto sm:overflow-visible sm:flex-wrap no-scrollbar py-0.5 overscroll-x-contain [-webkit-overflow-scrolling:touch]">
                  <button
                    type="button"
                    onClick={() => setSelectedMonth("all")}
                    className={`shrink-0 whitespace-nowrap px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer border active:scale-97 ${
                      selectedMonth === "all"
                        ? "bg-[#102E4D] text-[#FFC400] border-[#102E4D] shadow-xs"
                        : "bg-[#EFFBF8] text-[#102E4D] border-[#D7F5EF] hover:bg-[#D7F5EF]"
                    }`}
                  >
                    All Months (
                    <span className="font-num">{PRECOMPUTED_EVENTS.length}</span>
                    )
                  </button>

                  {AVAILABLE_EVENT_MONTHS.map((m) => {
                    const mTheme = getMonthTheme(m.monthIndex);
                    const isActive = selectedMonth === String(m.monthIndex);
                    return (
                      <button
                        key={m.monthIndex}
                        type="button"
                        onClick={() =>
                          setSelectedMonth(
                            isActive ? "all" : String(m.monthIndex)
                          )
                        }
                        className={`shrink-0 whitespace-nowrap px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer inline-flex items-center gap-1.5 sm:gap-2 border active:scale-97 ${
                          isActive
                            ? `bg-gradient-to-r ${mTheme.gradient} text-white border-transparent shadow-sm`
                            : "bg-white border-[#D7F5EF] text-[#102E4D] hover:bg-[#EFFBF8]"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full bg-gradient-to-r ${
                            isActive ? "from-white to-white" : mTheme.gradient
                          }`}
                        />
                        <span>{m.label}</span>
                        <span
                          className={`font-num text-[10.5px] px-1.5 rounded-md ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-[#EFFBF8] text-slate-600"
                          }`}
                        >
                          {m.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-[1px] bg-slate-100" />

              {/* Row 2: Program Category Pills */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3.5">
                <div className="flex items-center justify-between sm:justify-start gap-2 shrink-0 sm:w-24">
                  <span className="text-[10.5px] sm:text-[11px] font-extrabold uppercase tracking-widest text-[#102E4D]/70">
                    Category
                  </span>
                  <span className="sm:hidden text-[10px] font-semibold text-slate-400 inline-flex items-center gap-1">
                    Swipe <span className="text-[11px]">→</span>
                  </span>
                </div>
                <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex items-center gap-1.5 sm:gap-2 overflow-x-auto sm:overflow-visible sm:flex-wrap no-scrollbar py-0.5 overscroll-x-contain [-webkit-overflow-scrolling:touch]">
                  {CATEGORY_FILTERS.map((cat) => {
                    const active = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`shrink-0 whitespace-nowrap px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer border active:scale-97 ${
                          active
                            ? "bg-[#102E4D] text-[#FFC400] border-[#102E4D] shadow-xs"
                            : "bg-[#EFFBF8] text-[#102E4D] border-[#D7F5EF] hover:bg-[#D7F5EF]"
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Filtered Event Cards Grid — Smooth Framer Motion (initial={false} for instant reload + popLayout glide on filter) */}
          {filteredEvents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="rounded-2xl sm:rounded-3xl bg-white border border-[#D7F5EF] p-8 sm:p-14 text-center shadow-sm space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#EFFBF8] border border-[#D7F5EF] text-[#FF7900] flex items-center justify-center mx-auto">
                <MdCalendarToday className="text-2xl" />
              </div>
              <h3 className="font-serif font-extrabold text-xl sm:text-2xl text-[#102E4D]">
                No activities match these filters
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Try clearing one of the active month, category, status, or keyword filters to explore all scheduled 2026 experiences.
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-6 py-3 rounded-xl bg-[#102E4D] hover:bg-[#001B33] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>Show All Activities</span>
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5 sm:gap-7 relative">
              <AnimatePresence mode="popLayout" initial={false}>
                {filteredEvents.map((evt) => {
                  const isSummit = evt.slug === "school-impact-summit-2026";
                  const {
                    theme,
                    isOpenEnrollment,
                    monthStr,
                    dayStr,
                    weekdayStr,
                    yearStr,
                  } = evt;
                  const statusDot = STATUS_DOT[evt.statusTone];

                  return (
                    <motion.article
                      layout="position"
                      initial={{ opacity: 0, scale: 0.96, y: 12 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      whileHover={{
                        y: -5,
                        transition: { duration: 0.18, ease: "easeOut" },
                      }}
                      transition={{
                        layout: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
                        opacity: { duration: 0.18, ease: "easeOut" },
                        scale: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
                        y: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
                      }}
                      key={evt.slug}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedModalEvent(evt)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedModalEvent(evt);
                        }
                      }}
                      aria-label={`View full details for ${evt.title}`}
                      className={`rounded-2xl transition-[box-shadow,border-color] duration-200 flex flex-col overflow-hidden relative group cursor-pointer transform-gpu will-change-transform ${
                        isOpenEnrollment
                          ? "bg-gradient-to-b from-[#F0FDF4] via-white to-[#F0FDF4] border-[3px] border-[#16A34A] ring-4 ring-[#16A34A]/25 shadow-[0_22px_45px_-8px_rgba(22,163,74,0.45)] hover:shadow-[0_28px_55px_-8px_rgba(22,163,74,0.55)]"
                          : `bg-white border border-[#D7F5EF] shadow-md hover:shadow-xl hover:border-[#FFC400] ${theme.ring}`
                      }`}
                    >
                    {/* Top Accent Band — Green for Live Enrollments, Month Gradient for others */}
                    <div
                      className={`w-full ${
                        isOpenEnrollment
                          ? "h-2 bg-gradient-to-r from-[#16A34A] via-[#22C55E] to-[#15803D]"
                          : `h-1.5 bg-gradient-to-r ${theme.gradient}`
                      }`}
                    />

                    {/* Highlighted Open Enrollment Status Banner — Match Home Upcoming Section */}
                    {isOpenEnrollment && (
                      <div className="px-4 sm:px-5 py-2 bg-gradient-to-r from-[#16A34A] via-[#15803D] to-[#16A34A] text-white flex items-center justify-between gap-2 shadow-xs">
                        <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                          </span>
                          <span>ENROLLMENTS OPEN</span>
                        </span>
                        <span className="font-num text-[10.5px] font-black px-2.5 py-0.5 rounded-full bg-white text-[#15803D] shadow-xs uppercase tracking-wider">
                          Live Now
                        </span>
                      </div>
                    )}

                    <div className="p-4 sm:p-5.5 lg:p-6 flex flex-col flex-1">
                      {/* Date Box + Category Badge & Heading — Accented by Month Theme */}
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div
                          className={`w-[64px] sm:w-[68px] shrink-0 rounded-xl overflow-hidden border shadow-xs text-center bg-white ${theme.borderAccent}`}
                        >
                          <div
                            className={`bg-gradient-to-r ${theme.gradient} text-white text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest py-0.5 sm:py-1`}
                          >
                            {monthStr}
                          </div>
                          <div className="font-num font-extrabold text-[20px] sm:text-[22px] leading-tight text-[#102E4D] tracking-tight pt-1 sm:pt-1.5">
                            {dayStr}
                          </div>
                          <div className="font-num text-[8.5px] sm:text-[9px] font-semibold uppercase tracking-tight sm:tracking-wider text-slate-500 pb-1.5 pt-0.5 whitespace-nowrap px-0.5">
                            {weekdayStr} · {yearStr}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 pt-0.5">
                          <p
                            className={`text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider ${theme.text} mb-1 leading-snug`}
                          >
                            {CATEGORY_LABELS[evt.category]}
                          </p>
                          <h3
                            className={`font-serif font-bold text-[17px] sm:text-[19px] text-[#102E4D] ${theme.hoverText} transition-colors duration-150 leading-[1.28] tracking-tight`}
                          >
                            {evt.title}
                          </h3>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="mt-3 sm:mt-3.5 text-[12.5px] sm:text-[13.5px] text-slate-600 leading-relaxed">
                        {evt.description}
                      </p>

                      {/* Footer Meta (Location + Schedule Time + Status) & Actions */}
                      <div className="mt-auto pt-4 sm:pt-5">
                        <div className="pt-3.5 border-t border-slate-100 space-y-2.5">
                          {/* Schedule / Time Row */}
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <MdAccessTime
                              className={`${theme.text} text-sm shrink-0`}
                            />
                            <span className="font-num font-medium">
                              {evt.schedule || evt.duration}
                            </span>
                          </div>

                          {/* Location + Status Row */}
                          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 text-xs">
                            <span className="font-semibold text-[#102E4D] inline-flex items-center gap-1.5">
                              <MdLocationOn
                                className={`${theme.text} text-[15px] shrink-0`}
                              />
                              <span className="font-num">
                                {evt.locationNote || evt.city}
                              </span>
                            </span>
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] ${
                                isOpenEnrollment
                                  ? "font-extrabold text-[#15803D] bg-[#DCFCE7] border border-[#86EFAC]"
                                  : "font-semibold text-slate-600 bg-slate-50 border border-slate-200"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${statusDot} shrink-0`}
                              />
                              <span>{evt.statusLabel}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-2 sm:gap-2.5 pt-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedModalEvent(evt);
                              }}
                              className="flex-1 py-2.5 px-2.5 sm:px-3 rounded-xl border border-[#D7F5EF] bg-[#EFFBF8]/80 hover:bg-[#D7F5EF]/70 text-[#102E4D] text-[11px] sm:text-[11.5px] font-bold tracking-wide transition-all duration-150 inline-flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer active:scale-98"
                            >
                              <MdInfoOutline className="text-sm text-[#FF7900]" />
                              <span>Full details</span>
                            </button>

                            {isSummit ? (
                              <Link
                                href="/summit"
                                onClick={(e) => e.stopPropagation()}
                                className={`flex-1 py-2.5 px-3 sm:px-3.5 rounded-xl bg-gradient-to-r ${theme.gradient} text-white text-[11px] sm:text-[11.5px] font-bold uppercase tracking-wider shadow-xs hover:shadow-md transition-all duration-150 inline-flex items-center justify-center gap-1 group/btn active:scale-98`}
                              >
                                <span>Event details</span>
                                <MdArrowForward className="text-sm group-hover/btn:translate-x-0.5 transition-transform duration-150" />
                              </Link>
                            ) : (
                              <Link
                                href={`/apply?activity=${evt.slug}#apply-form`}
                                onClick={(e) => e.stopPropagation()}
                                className={`flex-1 py-2.5 px-3 sm:px-3.5 rounded-xl ${
                                  isOpenEnrollment
                                    ? "bg-gradient-to-r from-[#16A34A] via-[#15803D] to-[#166534] shadow-xs hover:shadow-md"
                                    : `bg-gradient-to-r ${theme.gradient} shadow-xs hover:shadow-md`
                                } text-white text-[11px] sm:text-[11.5px] font-bold uppercase tracking-wider transition-all duration-150 inline-flex items-center justify-center gap-1 cursor-pointer group/btn active:scale-98`}
                              >
                                <span>{isOpenEnrollment ? "Enroll now" : "Apply now"}</span>
                                <MdArrowForward className="text-sm group-hover/btn:translate-x-0.5 transition-transform duration-150" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      {/* 3. How to Apply Section — Comprehensive Guidance, Steps & Direct Portal Link */}
      <section
        className="w-full py-16 sm:py-22 relative overflow-hidden scroll-mt-24"
        id="how-to-apply"
      >
        {/* Preserved #apply anchor for backward compatibility */}
        <div id="apply" className="absolute -top-24 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-[#D7F5EF]" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#DDEFF7]/60 blur-3xl pointer-events-none transform-gpu" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#D7F5EF]/50 blur-3xl pointer-events-none transform-gpu" />

        <div className="max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
          {/* Header + Eyebrow + Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-3xl mx-auto space-y-4 transform-gpu"
          >
            <div className="inline-flex items-center justify-center gap-2.5 text-xs sm:text-sm font-bold uppercase tracking-widest text-[#FF7900]">
              <span className="w-7 h-[2px] bg-[#FF7900] inline-block" />
              <span>How to Apply</span>
              <span className="w-7 h-[2px] bg-[#FF7900] inline-block" />
            </div>

            <h2 className="font-serif font-extrabold text-3xl sm:text-4xl lg:text-[44px] text-[#102E4D] tracking-tight leading-tight">
              Simple, transparent 4-step registration.
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Step-by-step guidance for individual educators, student leaders, and school delegations to secure their seats with complete confidence.
            </p>

            {/* Trust Highlights Row */}
            <div className="pt-1 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm font-semibold text-[#102E4D]">
              <span className="inline-flex items-center gap-2">
                <MdCheckCircle className="text-[#FF7900] text-lg shrink-0" />
                <span>
                  Applications reviewed within{" "}
                  <span className="font-num font-bold">24</span> hours
                </span>
              </span>
              <span className="inline-flex items-center gap-2">
                <MdCheckCircle className="text-[#FF7900] text-lg shrink-0" />
                <span>Free Provisional Reservation Available</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <MdCheckCircle className="text-[#FF7900] text-lg shrink-0" />
                <span>Group &amp; School Discounts Supported</span>
              </span>
            </div>
          </motion.div>

          {/* 4 Professional Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.16 } }}
              className="p-5 sm:p-6 rounded-2xl bg-white/95 border border-[#C8EFE6] shadow-xs flex flex-col justify-between hover:shadow-md hover:border-[#FFC400] transition-colors duration-200 transform-gpu cursor-default"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#102E4D] text-[#FFC400] font-num font-extrabold text-sm flex items-center justify-center mb-4 shadow-2xs">
                  01
                </div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#102E4D] tracking-tight">
                  Choose Your Program
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-600 mt-2 leading-relaxed">
                  Browse our upcoming calendar above. Select the workshop, cohort, camp, or summit that aligns with your leadership and educational goals.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11.5px] font-semibold text-[#102E4D]">
                <MdCalendarToday className="text-sm text-[#FF7900] shrink-0" />
                <span>Explore 2026 Calendar</span>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.16 } }}
              className="p-5 sm:p-6 rounded-2xl bg-white/95 border border-[#C8EFE6] shadow-xs flex flex-col justify-between hover:shadow-md hover:border-[#FFC400] transition-colors duration-200 transform-gpu cursor-default"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#FF7900] text-white font-num font-extrabold text-sm flex items-center justify-center mb-4 shadow-2xs">
                  02
                </div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#102E4D] tracking-tight">
                  Pick Booking Option
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-600 mt-2 leading-relaxed">
                  Select <strong>Free Provisional Reservation</strong> to hold your seat with zero upfront payment, or <strong>Secure Seat</strong> for instant priority placement.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11.5px] font-semibold text-[#102E4D]">
                <MdCheckCircle className="text-sm text-[#16A34A] shrink-0" />
                <span>Flexible Confirmation</span>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: 0.19, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.16 } }}
              className="p-5 sm:p-6 rounded-2xl bg-white/95 border border-[#C8EFE6] shadow-xs flex flex-col justify-between hover:shadow-md hover:border-[#FFC400] transition-colors duration-200 transform-gpu cursor-default"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#16A34A] text-white font-num font-extrabold text-sm flex items-center justify-center mb-4 shadow-2xs">
                  03
                </div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#102E4D] tracking-tight">
                  Complete Application
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-600 mt-2 leading-relaxed">
                  Fill your contact details in 2 minutes. For priority seats, transfer via Bank, JazzCash, or Easypaisa and attach your payment receipt.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11.5px] font-semibold text-[#102E4D]">
                <MdAccessTime className="text-sm text-[#16A34A] shrink-0" />
                <span>2-Minute Online Form</span>
              </div>
            </motion.div>

            {/* Step 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.16 } }}
              className="p-5 sm:p-6 rounded-2xl bg-white/95 border border-[#C8EFE6] shadow-xs flex flex-col justify-between hover:shadow-md hover:border-[#FFC400] transition-colors duration-200 transform-gpu cursor-default"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#FFC400] to-[#FF7900] text-[#001B33] font-num font-extrabold text-sm flex items-center justify-center mb-4 shadow-2xs">
                  04
                </div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#102E4D] tracking-tight">
                  Instant Confirmation
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-600 mt-2 leading-relaxed">
                  Download your official booking receipt instantly. Our admissions team sends your session schedule, orientation packet, and venue pass.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11.5px] font-semibold text-[#102E4D]">
                <MdCheckCircle className="text-sm text-[#FF7900] shrink-0" />
                <span>Official Verified Pass</span>
              </div>
            </motion.div>
          </div>

          {/* High-Impact CTA Deck Leading to Dedicated Booking Page */}
          <motion.div
            initial={{ opacity: 0, y: 22, scale: 0.99 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl bg-gradient-to-br from-[#001B33] via-[#102E4D] to-[#001B33] text-white p-6 sm:p-8 lg:p-10 shadow-xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden transform-gpu"
          >
            {/* Ambient Lighting */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#FFC400]/10 rounded-full blur-3xl pointer-events-none transform-gpu" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FF7900]/10 rounded-full blur-3xl pointer-events-none transform-gpu" />

            <div className="relative z-10 max-w-xl space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#FFC400]">
                <span>Dedicated Online Booking Portal</span>
              </div>
              <h3 className="font-serif font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                Ready to Reserve Your Seat?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Open our dedicated booking page to complete your provisional reservation or priority seat confirmation in under 2 minutes.
              </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
              <Link
                href="/apply#apply-form"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] hover:from-[#E56D00] hover:to-[#CC5F00] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-black/30 hover:shadow-xl hover:-translate-y-0.5 transition-all inline-flex items-center justify-center gap-2 active:scale-98"
              >
                <span>Proceed to Online Booking</span>
                <MdArrowForward className="text-base" />
              </Link>
              <a
                href="https://wa.me/923192091249"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-colors shrink-0"
              >
                <FaWhatsapp className="text-[#25D366] text-base" />
                <span>WhatsApp Help</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Lazy-Loaded Event Details Modal — mounted only when an event is selected */}
      {selectedModalEvent && (
        <EventDetailModal
          event={selectedModalEvent}
          onClose={() => setSelectedModalEvent(null)}
        />
      )}
    </>
  );
}


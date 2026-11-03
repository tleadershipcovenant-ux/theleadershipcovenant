"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdClose,
  MdLocationOn,
  MdCalendarToday,
  MdAccessTime,
  MdWorkspacePremium,
  MdCheckCircle,
  MdGroups,
  MdRecordVoiceOver,
  MdArrowForward,
  MdMailOutline,
} from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";
import {
  CATEGORY_LABELS,
  getMonthTheme,
  getEventLifecycle,
  type LeadershipEvent,
} from "@/content/events";

/** Dynamic scrollbar thumb and hover colors matching each calendar month's identity */
const MONTH_SCROLLBAR_COLORS: Record<number, { thumb: string; hover: string }> = {
  0: { thumb: "rgba(79, 70, 229, 0.50)", hover: "rgba(67, 56, 202, 0.85)" }, // Jan Indigo
  1: { thumb: "rgba(225, 29, 72, 0.50)", hover: "rgba(190, 18, 60, 0.85)" },  // Feb Rose
  2: { thumb: "rgba(5, 150, 105, 0.50)", hover: "rgba(4, 120, 87, 0.85)" },   // Mar Emerald
  3: { thumb: "rgba(2, 132, 199, 0.50)", hover: "rgba(3, 105, 161, 0.85)" },  // Apr Cyan
  4: { thumb: "rgba(217, 119, 6, 0.50)", hover: "rgba(180, 83, 9, 0.85)" },   // May Amber
  5: { thumb: "rgba(234, 88, 12, 0.50)", hover: "rgba(194, 65, 12, 0.85)" },  // Jun Coral
  6: { thumb: "rgba(255, 121, 0, 0.60)", hover: "rgba(229, 109, 0, 0.90)" },  // Jul Signature Orange
  7: { thumb: "rgba(22, 163, 74, 0.60)", hover: "rgba(21, 128, 61, 0.90)" },  // Aug Green
  8: { thumb: "rgba(16, 46, 77, 0.50)", hover: "rgba(0, 27, 51, 0.85)" },     // Sep Navy
  9: { thumb: "rgba(217, 119, 6, 0.50)", hover: "rgba(180, 83, 9, 0.85)" },   // Oct Amber
  10: { thumb: "rgba(37, 99, 235, 0.55)", hover: "rgba(29, 78, 216, 0.90)" }, // Nov Royal Blue
  11: { thumb: "rgba(13, 148, 136, 0.55)", hover: "rgba(15, 118, 110, 0.90)" },// Dec Teal
};

interface EventDetailModalProps {
  event: LeadershipEvent | null;
  onClose: () => void;
  /** Optional handler used on /activities to prefill & scroll to the inline Apply form */
  onApply?: (slug: string) => void;
}

export default function EventDetailModal({
  event,
  onClose,
  onApply,
}: EventDetailModalProps) {
  const [todayIsoDate] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (!event) return;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const originalOverscroll = document.body.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "contain";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      document.body.style.overscrollBehavior = originalOverscroll;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [event, onClose]);

  const formatFullDateRange = (evt: LeadershipEvent) => {
    const start = new Date(evt.startDate + "T00:00:00");
    const end = new Date(evt.endDate + "T00:00:00");
    if (evt.startDate === evt.endDate) {
      return start.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
    const startPart = start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const endPart = end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${startPart} – ${endPart}`;
  };

  return (
    <AnimatePresence>
      {event && (() => {
        const startObj = new Date(event.startDate + "T00:00:00");
        const monthStr = startObj.toLocaleDateString("en-US", { month: "short" });
        const dayStr = startObj.getDate().toString().padStart(2, "0");
        const weekdayStr = startObj.toLocaleDateString("en-US", { weekday: "short" });
        const yearStr = startObj.getFullYear();
        const theme = getMonthTheme(startObj.getMonth());
        const lifecycle = getEventLifecycle(event, todayIsoDate);
        const isOpenEnrollment = lifecycle === "enrollment_open";
        const isPreviousEvent = lifecycle === "previous";
        const scrollbarColors = MONTH_SCROLLBAR_COLORS[startObj.getMonth()] || {
          thumb: "rgba(16, 46, 77, 0.45)",
          hover: "rgba(16, 46, 77, 0.85)",
        };
        const isSummit = event.slug === "school-impact-summit-2026";
        const targetLink = isSummit
          ? "/summit"
          : `/apply?activity=${event.slug}#apply-form`;
        const enrollmentLink = `/apply?activity=${event.slug}#apply-form`;

        return (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-[#001B33]/75 backdrop-blur-sm overscroll-contain"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-modal-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 14 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl max-h-[92vh] sm:max-h-[88vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-[#D7F5EF] overflow-hidden flex flex-col transform-gpu will-change-transform"
            >
              {/* Top Accent Band — Green for Live Enrollments, Month Gradient for others */}
              <div
                className={`w-full shrink-0 ${
                  isOpenEnrollment
                    ? "h-2 bg-gradient-to-r from-[#16A34A] via-[#22C55E] to-[#15803D]"
                    : `h-1.5 sm:h-2 bg-gradient-to-r ${theme.gradient}`
                }`}
              />

              {/* Close Button — Compact, Sleek & Pinned at Top Right */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close event details"
                className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full bg-black/45 hover:bg-black/75 text-white/90 hover:text-white border border-white/25 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer z-30 shadow-xs active:scale-90"
              >
                <MdClose className="text-base sm:text-[17px]" />
              </button>

              {/* Open Enrollment Status Strip for Live Activities */}
              {isOpenEnrollment && (
                <div className="px-4 sm:px-6 py-2 bg-gradient-to-r from-[#16A34A] via-[#15803D] to-[#16A34A] text-white flex items-center gap-2 shadow-xs shrink-0">
                  <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-black uppercase tracking-wider text-white">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-85" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                    </span>
                    <span>ENROLLMENTS OPEN · LIVE NOW</span>
                  </span>
                </div>
              )}

              {/* Seamless Scrollable Interior with Month-Themed Dynamic Scrollbar */}
              <div
                className="flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] modal-scrollbar transform-gpu"
                style={
                  {
                    "--scrollbar-thumb": scrollbarColors.thumb,
                    "--scrollbar-hover": scrollbarColors.hover,
                  } as React.CSSProperties
                }
              >
                {/* Hero Header */}
                <div className="relative min-h-[175px] sm:min-h-[210px] w-full bg-[#001B33] overflow-hidden flex flex-col justify-end p-4 sm:p-6 lg:p-7">
                  <img
                    src={event.image}
                    alt={event.title}
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover object-center transform-gpu"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#001B33] via-[#001B33]/70 to-[#001B33]/30" />

                  {/* Header Content: Date Box + Category Overline + Title */}
                  <div className="relative z-10 flex items-start sm:items-end gap-3 sm:gap-4.5 pt-8">
                    {/* Calendar Date Box */}
                    <div className="w-[62px] sm:w-[68px] shrink-0 rounded-xl overflow-hidden border border-white/30 shadow-lg text-center bg-white">
                      <div
                        className={`bg-gradient-to-r ${theme.gradient} text-white text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest py-0.5 sm:py-1`}
                      >
                        {monthStr}
                      </div>
                      <div className="font-num font-extrabold text-[20px] sm:text-[24px] leading-tight text-[#102E4D] tracking-tight pt-1 sm:pt-1.5">
                        {dayStr}
                      </div>
                      <div className="font-num text-[8.5px] sm:text-[9.5px] font-semibold uppercase tracking-tight text-slate-500 pb-1.5 pt-0.5 whitespace-nowrap px-0.5">
                        {weekdayStr} · {yearStr}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 text-white">
                      <p className="text-[10.5px] sm:text-xs font-bold uppercase tracking-widest text-[#FFC400] mb-1">
                        {CATEGORY_LABELS[event.category]}
                      </p>
                      <h2
                        id="event-modal-title"
                        className="font-serif font-extrabold text-lg sm:text-2xl md:text-[26px] text-white leading-tight tracking-tight drop-shadow-sm pr-8 sm:pr-0"
                      >
                        {event.title}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Modal Body Content */}
                <div className="p-4 sm:p-6 lg:p-7 space-y-6">
                  {/* Dedicated Executive Enrollment Callout for Live Activities */}
                  {isOpenEnrollment && (
                    <div className="p-4 sm:p-4.5 rounded-2xl bg-gradient-to-r from-[#F0FDF4] via-white to-[#F0FDF4] border-2 border-[#16A34A]/30 ring-2 ring-[#16A34A]/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#16A34A] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                          <MdCheckCircle className="text-xl" />
                        </div>
                        <div>
                          <div className="text-xs sm:text-[13px] font-extrabold text-[#15803D] uppercase tracking-wide">
                            Enrollment Live Now
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            Individual &amp; school registrations are currently open. Hold a provisional seat or confirm priority placement.
                          </p>
                        </div>
                      </div>

                      <Link
                        href={enrollmentLink}
                        onClick={onClose}
                        className="self-start sm:self-auto shrink-0 px-4 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer active:scale-98"
                      >
                        Enroll Now
                      </Link>
                    </div>
                  )}
                  {/* 4-Card Key Information Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                    <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#EFFBF8]/80 border border-[#D7F5EF] flex items-start gap-3">
                      <MdCalendarToday
                        className={`${theme.text} text-lg shrink-0 mt-0.5`}
                      />
                      <div>
                        <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                          Date &amp; Schedule
                        </div>
                        <div className="font-num text-xs sm:text-[13px] font-bold text-[#102E4D] mt-0.5">
                          {formatFullDateRange(event)}
                        </div>
                        <div className="font-num text-[11.5px] text-slate-600 font-medium flex items-center gap-1 mt-0.5">
                          {event.schedule && !isSummit && (
                            <MdAccessTime className="text-xs text-slate-400 shrink-0" />
                          )}
                          <span>
                            {event.schedule && !isSummit
                              ? `${event.duration} • ${event.schedule}`
                              : event.duration}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#EFFBF8]/80 border border-[#D7F5EF] flex items-start gap-3">
                      <MdLocationOn
                        className={`${theme.text} text-xl shrink-0 mt-0.5`}
                      />
                      <div>
                        <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                          Location &amp; Venue
                        </div>
                        <div className="font-num text-xs sm:text-[13px] font-bold text-[#102E4D] mt-0.5">
                          {event.locationNote || `${event.city}, Pakistan`}
                        </div>
                        <div className="text-[11.5px] text-slate-600 font-medium mt-0.5">
                          {event.venue}
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#EFFBF8]/80 border border-[#D7F5EF] flex items-start gap-3">
                      <MdWorkspacePremium
                        className={`${theme.text} text-xl shrink-0 mt-0.5`}
                      />
                      <div>
                        <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                          Format &amp; Recognition
                        </div>
                        <div className="text-xs sm:text-[13px] font-bold text-[#102E4D] mt-0.5">
                          {event.format}
                        </div>
                        <div className="text-[11.5px] text-slate-600 font-medium mt-0.5">
                          {event.certificate}
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#EFFBF8]/80 border border-[#D7F5EF] flex items-start gap-3">
                      <MdRecordVoiceOver
                        className={`${theme.text} text-xl shrink-0 mt-0.5`}
                      />
                      <div>
                        <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                          Facilitated By
                        </div>
                        <div className="text-xs sm:text-[13px] font-bold text-[#102E4D] mt-0.5">
                          {event.facilitator}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* About This Event */}
                  <div className="space-y-2">
                    <h3 className="font-serif font-bold text-base sm:text-lg text-[#102E4D] tracking-tight">
                      About This Event
                    </h3>
                    {isPreviousEvent ? null : isSummit ? (
                      <p className="font-num text-xs sm:text-[13.5px] text-slate-700 leading-relaxed text-justify">
                        Themed <strong className="font-bold text-[#102E4D]">Discover | Voice | Impact</strong>, the <strong className="font-bold text-[#102E4D]">School Impact Summit 2026</strong> brings together school owners, principals, academic leaders, educators, and changemakers to explore the ideas, practices, and possibilities shaping the future of education. It is a platform for discovering fresh perspectives, sharing voices and experiences from across the education landscape, and engaging in meaningful conversations around effective school leadership, student development, and educational transformation. More than a gathering, the Summit aims to inspire collaboration, strengthen connections, and turn shared insights into purposeful action for stronger schools and a greater impact on education.
                      </p>
                    ) : event.modalDescription ? (
                      <p className="font-num text-xs sm:text-[13.5px] text-slate-700 leading-relaxed text-justify">
                        {event.modalDescription}
                      </p>
                    ) : (
                      <>
                        <p className="text-xs sm:text-sm text-[#102E4D] font-semibold leading-relaxed">
                          {event.description}
                        </p>
                        <p className="font-num text-xs sm:text-[13.5px] text-slate-600 leading-relaxed text-justify">
                          {event.overview}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Key Highlights & Outcomes */}
                  {!isSummit && event.highlights?.length > 0 && (
                    <div className="space-y-2.5">
                      <h3 className="font-serif font-bold text-base sm:text-lg text-[#102E4D] tracking-tight">
                        What You Will Experience &amp; Gain
                      </h3>
                      <ul className="space-y-2">
                        {event.highlights.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-2.5 text-xs sm:text-[13.5px] text-slate-700 font-medium leading-relaxed"
                          >
                            <MdCheckCircle
                              className={`${theme.text} text-[17px] shrink-0 mt-0.5`}
                            />
                            <span className="font-num">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Who Should Attend */}
                  {!isSummit && event.whoShouldAttend?.length > 0 && (
                    <div className="space-y-2.5">
                      <h3 className="font-serif font-bold text-base sm:text-lg text-[#102E4D] tracking-tight flex items-center gap-2">
                        <MdGroups className={`${theme.text} text-xl shrink-0`} />
                        <span>Who Should Attend</span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                        {event.whoShouldAttend.map((role) => (
                          <div
                            key={role}
                            className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-[13px] font-semibold text-[#102E4D] flex items-center gap-2"
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${theme.gradient} shrink-0`}
                            />
                            <span>{role}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Group & Direct Support Strip */}
                  {!isSummit && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#EFFBF8] border border-[#D7F5EF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-[#102E4D]">
                          Questions or Group / School Bookings?
                        </div>
                        <div className="text-[11.5px] sm:text-xs text-slate-600 mt-0.5">
                          Our activities team responds within{" "}
                          <span className="font-num font-bold">24</span> hours
                          with seat availability &amp; joining details.
                        </div>
                      </div>
                      <div className="shrink-0 flex flex-wrap items-center gap-2">
                        <Link
                          href="/contact#enquiry-form"
                          onClick={onClose}
                          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#C8EFE6] bg-white hover:bg-[#EFFBF8] text-[#102E4D] text-xs sm:text-[12.5px] font-bold shadow-2xs transition-colors cursor-pointer active:scale-98"
                        >
                          <MdMailOutline className="text-base text-[#FF7900]" />
                          <span>Contact Us</span>
                        </Link>
                        <a
                          href={`https://wa.me/923192091249?text=${encodeURIComponent(
                            `Hello! I would like to enquire about "${event.title}" (${event.startDate}).`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs sm:text-[12.5px] font-bold shadow-xs transition-colors active:scale-98"
                        >
                          <FaWhatsapp className="text-base" />
                          <span className="font-num">+92 319 2091249</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Clean Sticky Footer Action Bar */}
              <div className="px-4 sm:px-7 py-3.5 sm:py-4 bg-slate-50/95 backdrop-blur-sm border-t border-slate-200/90 flex items-center justify-end shrink-0">
                {isSummit ? (
                  <Link
                    href="/summit"
                    onClick={onClose}
                    className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded-xl bg-gradient-to-r ${theme.gradient} text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all inline-flex items-center justify-center gap-2 active:scale-98`}
                  >
                    <span>Explore Summit &amp; Register</span>
                    <MdArrowForward className="text-base shrink-0" />
                  </Link>
                ) : (
                  <Link
                    href={targetLink}
                    onClick={onClose}
                    className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded-xl ${
                      isOpenEnrollment
                        ? "bg-gradient-to-r from-[#16A34A] via-[#15803D] to-[#166534] shadow-[0_4px_14px_rgba(22,163,74,0.35)]"
                        : `bg-gradient-to-r ${theme.gradient} shadow-md`
                    } text-white text-xs sm:text-sm font-bold uppercase tracking-wider hover:shadow-lg transition-all inline-flex items-center justify-center gap-2 active:scale-98`}
                  >
                    <span>
                      {isOpenEnrollment ? "Enroll Now" : "Apply Online"}
                    </span>
                    <MdArrowForward className="text-base shrink-0" />
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        );
      })()}
    </AnimatePresence>
  );
}

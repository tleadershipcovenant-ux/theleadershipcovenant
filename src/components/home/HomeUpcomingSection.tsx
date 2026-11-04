"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  MdLocationOn,
  MdArrowForward,
  MdInfoOutline,
} from "react-icons/md";
import {
  EVENTS,
  PRECOMPUTED_EVENTS,
  CATEGORY_LABELS,
  EVENT_LIFECYCLE_LABELS,
  getEventLifecycle,
  precomputeLeadershipEvents,
  type LeadershipEvent,
} from "@/content/events";
import { useCmsContent, useHomePageContent } from "@/lib/cms-client";

const EventDetailModal = dynamic(
  () => import("@/components/EventDetailModal"),
  { ssr: false }
);

const todayIso = new Date().toISOString().split("T")[0];

const STATUS_DOT: Record<LeadershipEvent["statusTone"], string> = {
  open: "bg-[#16A34A]",
  limited: "bg-[#FF7900]",
  free: "bg-[#2563EB]",
};

export default function HomeUpcomingSection() {
  const [selectedEvent, setSelectedEvent] = useState<LeadershipEvent | null>(null);
  const { upcoming } = useHomePageContent();
  const { content: eventsCms } = useCmsContent<{ events?: LeadershipEvent[] }>(
    "events",
    { events: EVENTS }
  );

  const MARQUEE_EVENTS = useMemo(() => {
    const list =
      Array.isArray(eventsCms.events) && eventsCms.events.length > 0
        ? eventsCms.events.filter((event) => !event.hidden)
        : EVENTS.filter((event) => !event.hidden);
    const upcomingEvents = precomputeLeadershipEvents(list).filter(
      (event) => event.endDate >= todayIso
    );
    const source = upcomingEvents.length > 0 ? upcomingEvents : PRECOMPUTED_EVENTS.filter(
      (event) => event.endDate >= todayIso
    );
    return [...source, ...source];
  }, [eventsCms]);

  return (
    <section className="w-full py-10 sm:py-12 lg:py-14 relative overflow-hidden" id="upcoming">
      {/* Subtle top divider line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-[#D7F5EF]" />

      {/* Background ambient accents */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#D7F5EF]/60 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#DDEFF7]/60 blur-3xl pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Centered Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-10"
        >
          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#FF7900] mb-2">
            {upcoming.eyebrow}
          </p>
          <h2 className="font-serif font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#102E4D] tracking-tight">
            {upcoming.heading}
          </h2>
          <div className="w-20 h-1 bg-[#FFC400] mx-auto mt-3.5 rounded-full" />
        </motion.div>
      </div>

      {/* CONTINUOUS MOVING MARQUEE SLIDER */}
      <div className="relative w-full overflow-hidden mask-fade-x py-6 sm:py-7">
        <div
          className="flex items-center gap-5 sm:gap-6.5 w-max animate-marquee hover:[animation-play-state:paused] px-4"
          style={
            {
              "--marquee-duration": "48s",
              animationPlayState: selectedEvent ? "paused" : undefined,
            } as React.CSSProperties
          }
        >
          {MARQUEE_EVENTS.map((event, idx) => {
            const {
              monthStr,
              dayStr,
              yearStr,
              weekdayStr,
              theme,
              isOpenEnrollment,
            } = event;
            const isSummit = event.slug === "school-impact-summit-2026";
            const targetLink = isSummit
              ? "/summit"
              : `/apply?activity=${event.slug}#apply-form`;
            const buttonLabel = isSummit ? "Event details" : "Apply now";
            const statusDot = STATUS_DOT[event.statusTone];

            return (
              <article
                key={`${event.slug}-${idx}`}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedEvent(event)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedEvent(event);
                  }
                }}
                aria-label={`View full details for ${event.title}`}
                className={`shrink-0 rounded-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer ${
                  isOpenEnrollment
                    ? "w-[365px] sm:w-[395px] h-[256px] -translate-y-3 z-10 bg-gradient-to-b from-[#F0FDF4] via-white to-[#F0FDF4] border-[3px] border-[#16A34A] ring-4 ring-[#16A34A]/25 shadow-[0_22px_45px_-8px_rgba(22,163,74,0.45)] hover:shadow-[0_28px_55px_-8px_rgba(22,163,74,0.55)] hover:-translate-y-4"
                    : `w-[325px] sm:w-[350px] h-[230px] translate-y-0 z-0 bg-white border border-[#D7F5EF] shadow-md hover:shadow-xl hover:-translate-y-1.5 ${theme.ring}`
                }`}
              >
                {/* Top Announcement Strip */}
                <div className="shrink-0">
                  <div
                    className={`w-full ${
                      isOpenEnrollment
                        ? "h-2 bg-gradient-to-r from-[#16A34A] via-[#22C55E] to-[#15803D]"
                        : `h-1.5 bg-gradient-to-r ${theme.gradient}`
                    }`}
                  />
                  {isOpenEnrollment ? (
                    <div className="px-4 py-2 bg-gradient-to-r from-[#16A34A] via-[#15803D] to-[#16A34A] text-white flex items-center justify-between gap-2 shadow-sm">
                      <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider">
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
                  ) : (
                    <div className="px-4 py-1.5 bg-[#EFFBF8] border-b border-[#D7F5EF] flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                      <span className="uppercase tracking-wider">Scheduled Event</span>
                      <span className="font-num font-bold text-[#102E4D]">2026</span>
                    </div>
                  )}
                </div>

                {/* Card Body: Left Date Badge + Center/Right Title & Details */}
                <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
                  {/* Main Row */}
                  <div className="flex items-center gap-3.5">
                    {/* Left: Date Box */}
                    <div
                      className={`${
                        isOpenEnrollment
                          ? "w-[64px] sm:w-[68px] border-2 border-[#16A34A] ring-2 ring-[#16A34A]/25 shadow-md"
                          : `w-[64px] sm:w-[68px] border ${theme.borderAccent} shadow-xs`
                      } shrink-0 rounded-xl overflow-hidden text-center bg-white`}
                    >
                      <div
                        className={`bg-gradient-to-r ${theme.gradient} text-white text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest ${
                          isOpenEnrollment ? "py-1" : "py-0.5 sm:py-1"
                        }`}
                      >
                        {monthStr}
                      </div>
                      <div
                        className={`font-num font-extrabold leading-tight text-[#102E4D] tracking-tight ${
                          isOpenEnrollment
                            ? "text-[21px] sm:text-[23px] pt-1"
                            : "text-[20px] sm:text-[22px] pt-1 sm:pt-1.5"
                        }`}
                      >
                        {dayStr}
                      </div>
                      <div
                        className="font-num text-[8.5px] sm:text-[9px] font-semibold uppercase tracking-tight sm:tracking-wider text-slate-500 pb-1.5 pt-0.5 whitespace-nowrap px-0.5"
                      >
                        {weekdayStr} · {yearStr}
                      </div>
                    </div>

                    {/* Center & Right: Category + Aligned Bold Title */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p
                        className={`text-[10.5px] font-extrabold uppercase tracking-wider mb-1 leading-none ${theme.text}`}
                      >
                        {CATEGORY_LABELS[event.category]}
                      </p>
                      <h3
                        className={`font-serif font-extrabold text-[#102E4D] ${theme.hoverText} transition-colors leading-[1.25] tracking-tight line-clamp-2 ${
                          isOpenEnrollment ? "text-[17.5px] sm:text-[18.5px]" : "text-[16px] sm:text-[17px]"
                        }`}
                      >
                        {event.title}
                      </h3>
                    </div>
                  </div>

                  {/* Bottom Meta & Action Controls */}
                  <div className="pt-2.5 mt-2 border-t border-slate-100 flex flex-col gap-2">
                    {/* Location & Status Line */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="inline-flex items-center gap-1 font-semibold text-[#102E4D]">
                        <MdLocationOn className={`${theme.text} text-[15px] shrink-0`} />
                        <span className="font-num truncate max-w-[180px]">
                          {event.locationNote || event.city}
                        </span>
                      </div>

                      <div
                        className="inline-flex items-center gap-1.5 font-semibold text-slate-600"
                      >
                        <span className={`w-2 h-2 rounded-full ${statusDot} shrink-0`} />
                        <span>
                          {EVENT_LIFECYCLE_LABELS[getEventLifecycle(event)]}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                        }}
                        className={`flex-1 rounded-xl border border-[#D7F5EF] bg-[#EFFBF8]/80 hover:bg-[#D7F5EF] text-[#102E4D] font-bold tracking-wide transition-colors inline-flex items-center justify-center gap-1 cursor-pointer ${
                          isOpenEnrollment ? "py-2 text-xs" : "py-1.5 text-[11px]"
                        }`}
                      >
                        <MdInfoOutline className="text-sm text-[#FF7900]" />
                        <span>Details</span>
                      </button>

                      <Link
                        href={targetLink}
                        onClick={(e) => e.stopPropagation()}
                        className={`flex-1 rounded-xl text-white font-black uppercase tracking-wider hover:shadow-md transition-all inline-flex items-center justify-center gap-1 group/btn ${
                          isOpenEnrollment
                            ? "py-2 text-xs bg-gradient-to-r from-[#16A34A] to-[#15803D] hover:from-[#15803D] hover:to-[#0F652E] shadow-sm ring-1 ring-[#16A34A]/50"
                            : `py-1.5 text-[11px] bg-gradient-to-r ${theme.gradient} shadow-xs`
                        }`}
                      >
                        <span>{buttonLabel}</span>
                        <MdArrowForward className="text-sm group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Centered Professional "View all activities" CTA */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mt-6 sm:mt-7 flex justify-center">
        <Link
          href="/activities"
          className="inline-flex items-center justify-center gap-2.5 px-7 py-3 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] hover:from-[#E56D00] hover:to-[#CC5F00] text-white text-xs sm:text-sm font-bold tracking-wide shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-98 transition-all duration-300 group"
        >
          <span>View all activities</span>
          <MdArrowForward className="text-base sm:text-lg group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Lazy-Loaded Event Details Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </section>
  );
}

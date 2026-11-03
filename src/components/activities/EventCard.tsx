import React from "react";
import Link from "next/link";
import {
  LeadershipEvent,
  CATEGORY_LABELS,
  EVENT_LIFECYCLE_LABELS,
  getEventLifecycle,
} from "@/content/events";
import { ArrowRight, MapPin } from "lucide-react";

interface EventCardProps {
  event: LeadershipEvent;
  onSelect?: (slug: string) => void;
  className?: string;
}

export function EventCard({ event, onSelect, className = "" }: EventCardProps) {
  // Format date: e.g. "Jul 19"
  const start = new Date(event.startDate + "T00:00:00");
  const monthStr = start.toLocaleDateString("en-US", { month: "short" });
  const dayStr = start.getDate().toString().padStart(2, "0");
  const weekdayStr = start.toLocaleDateString("en-US", { weekday: "short" });
  const yearStr = start.getFullYear();

  const categoryLabel = CATEGORY_LABELS[event.category] || event.category;

  const isSummit = event.detailPath === "/summit";
  const lifecycle = getEventLifecycle(event);
  const isPreviousEvent = lifecycle === "previous";
  const statusDotClass =
    lifecycle === "previous"
      ? "bg-[#F97316]"
      : lifecycle === "enrollment_open"
      ? "bg-[#16A34A]"
      : "bg-[#2563EB]";
  const ctaHref = isSummit ? "/summit" : `/apply?activity=${event.slug}#apply-form`;
  const ctaLabel = isSummit || isPreviousEvent ? "More details" : "Apply now";

  return (
    <article
      className={`card card-hover p-6 sm:p-7 flex flex-col justify-between h-full bg-white group ${className}`}
    >
      <div>
        {/* Top Header: Date Block & Category */}
        <div className="flex items-start justify-between gap-3 mb-4">
          {/* Calendar Date Badge */}
          <div className="w-[64px] sm:w-[68px] shrink-0 rounded-xl overflow-hidden border border-slate-200/90 shadow-xs text-center bg-white">
            <div className="bg-[#102E4D] text-white text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest py-0.5 sm:py-1 leading-none">
              {monthStr}
            </div>
            <div className="font-num font-extrabold text-[20px] sm:text-[22px] leading-tight text-[#102E4D] tracking-tight pt-1 sm:pt-1.5">
              {dayStr}
            </div>
            <div className="font-num text-[8.5px] sm:text-[9px] font-semibold uppercase tracking-tight text-slate-500 pb-1.5 pt-0.5 whitespace-nowrap px-0.5">
              {weekdayStr} · {yearStr}
            </div>
          </div>

          {/* Category Chip */}
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-canvas text-navy-900 border border-line/80 truncate">
            {categoryLabel}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-display font-bold text-lg sm:text-xl text-navy-900 mb-2 leading-snug group-hover:text-teal-800 transition-colors">
          {event.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted mb-3">
          <MapPin className="w-3.5 h-3.5 text-teal shrink-0" />
          <span>{event.locationNote || event.city}</span>
        </div>

        {/* Description */}
        <p className="text-sm text-ink/75 leading-relaxed mb-6">
          {event.description}
        </p>
      </div>

      {/* Footer: Status Badge & CTA Link */}
      <div className="pt-4 border-t border-line flex items-center justify-between gap-3 text-xs">
        {/* Status Dot */}
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-extrabold tracking-wide whitespace-nowrap ${
            isPreviousEvent
              ? "bg-[#FFEDD5] border-[#FB923C] text-[#C2410C]"
              : lifecycle === "enrollment_open"
              ? "bg-[#DCFCE7] border-[#4ADE80] text-[#166534]"
              : "bg-[#E0F2FE] border-[#7DD3FC] text-[#075985]"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${statusDotClass}`} aria-hidden="true" />
          <span>{EVENT_LIFECYCLE_LABELS[lifecycle]}</span>
        </div>

        {/* Action Link */}
        {onSelect && !isSummit ? (
          <button
            type="button"
            onClick={() => onSelect(event.slug)}
            className="link-arrow font-bold text-navy-900 group-hover:text-teal-800 text-sm cursor-pointer"
          >
            <span>{ctaLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : isPreviousEvent ? null : (
          <Link
            href={ctaHref}
            className={`link-arrow font-bold text-sm ${
              isSummit ? "text-teal-800 hover:text-navy-900 font-extrabold" : "text-navy-900"
            }`}
          >
            <span>{ctaLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </article>
  );
}

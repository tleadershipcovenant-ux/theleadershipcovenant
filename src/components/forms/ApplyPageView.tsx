"use client";

import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import ApplyBookingView from "@/components/forms/ApplyBookingView";
import ApplyCookieBanner from "@/components/forms/ApplyCookieBanner";
import { useApplyPageContent } from "@/lib/cms-client";
import type { LeadershipEvent } from "@/content/events";

export default function ApplyPageView({
  initialEvents,
}: {
  initialEvents: LeadershipEvent[];
}) {
  const copy = useApplyPageContent();

  return (
    <main className="w-full pt-[68px] md:pt-[112px]">
      <section className="relative w-full overflow-hidden bg-[#001B33] text-white py-14 sm:py-18 lg:py-22 min-h-[360px] sm:min-h-[400px] flex items-center justify-center border-b border-white/10">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#FFC400] z-20" />

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src={copy.hero.image}
            alt={copy.hero.imageAlt}
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover object-center opacity-40 transform-gpu"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#001B33]/80 via-[#001B33]/75 to-[#001B33]/90" />
          <div className="absolute -top-24 left-1/4 w-96 h-48 bg-[#FFC400]/12 rounded-full blur-3xl transform-gpu" />
          <div className="absolute -bottom-24 right-1/4 w-96 h-48 bg-[#FF7900]/12 rounded-full blur-3xl transform-gpu" />
        </div>

        <div className="max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center w-full">
          <h1 className="font-serif font-extrabold text-3xl sm:text-5xl lg:text-[54px] text-white leading-[1.14] tracking-tight max-w-4xl mx-auto drop-shadow-[0_2px_14px_rgba(0,0,0,0.8)]">
            {copy.hero.heading} <br />
            <span className="text-[#FFC400]">{copy.hero.headingHighlight}</span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-white/95 mt-5 max-w-2xl mx-auto leading-relaxed font-normal drop-shadow-[0_1px_8px_rgba(0,0,0,0.7)]">
            {copy.hero.body}
          </p>
        </div>
      </section>

      <section className="w-full py-12 sm:py-16 relative z-30 bg-[#EFFBF8]">
        <div className="max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
          <div
            id="apply-form"
            className="scroll-mt-24 md:scroll-mt-32 bg-white rounded-3xl border border-[#C8EFE6] shadow-[0_24px_60px_-15px_rgba(16,46,77,0.12)] relative z-20"
          >
            <span id="booking-form" className="absolute -top-32 opacity-0 pointer-events-none" />
            <span id="seat-booking-form" className="absolute -top-32 opacity-0 pointer-events-none" />

            <div className="h-2 w-full bg-gradient-to-r from-[#102E4D] via-[#FFC400] to-[#FF7900] rounded-t-3xl" />

            <div className="p-6 sm:p-8 lg:p-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-100">
                <div>
                  <h2 className="font-serif font-extrabold text-2xl sm:text-3xl text-[#102E4D]">
                    {copy.formHeader.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    {copy.formHeader.subtitle}
                  </p>
                </div>

                <a
                  href={copy.formHeader.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-[#EFFBF8] hover:bg-[#D7F5EF] border border-[#C8EFE6] text-xs font-bold text-[#102E4D] inline-flex items-center gap-2 transition-colors shrink-0"
                >
                  <FaWhatsapp className="text-[#25D366] text-base" />
                  <span>{copy.formHeader.whatsappLabel}</span>
                </a>
              </div>

              <ApplyBookingView initialEvents={initialEvents} />
            </div>
          </div>
        </div>
      </section>

      {/* Accept / Reject Cookies Bottom Banner */}
      <ApplyCookieBanner />
    </main>
  );
}

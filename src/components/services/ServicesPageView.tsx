"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { MdArrowForward } from "react-icons/md";
import { useCmsContent } from "@/lib/cms-client";
import {
  SERVICES_PAGE,
  normalizeServicesCms,
} from "@/content/services";
import ServiceCard from "@/components/services/ServiceCard";

export default function ServicesPageView() {
  const { content: raw } = useCmsContent<Record<string, unknown>>(
    "services",
    SERVICES_PAGE as unknown as Record<string, unknown>
  );
  const content = useMemo(() => normalizeServicesCms(raw), [raw]);
  const isVisible = (raw as { _visible?: boolean })._visible !== false;
  const services = isVisible ? content.services : [];

  return (
    <main className="w-full pt-[68px] md:pt-[112px]">
      <section className="relative w-full overflow-hidden bg-[#001B33] text-white py-14 sm:py-18 lg:py-22 min-h-[360px] sm:min-h-[400px] flex items-center justify-center border-b border-white/10">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#FFC400] z-20" />

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src={content.hero.image}
            alt={content.hero.imageAlt}
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover object-center opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#001B33]/80 via-[#001B33]/75 to-[#001B33]/90" />
          <div className="absolute -top-24 left-1/4 w-96 h-48 bg-[#FFC400]/12 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 right-1/4 w-96 h-48 bg-[#FF7900]/12 rounded-full blur-3xl" />
        </div>

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center w-full">
          <h1 className="font-serif font-extrabold text-3xl sm:text-5xl lg:text-[54px] text-white leading-[1.12] tracking-tight max-w-4xl mx-auto drop-shadow-[0_2px_14px_rgba(0,0,0,0.8)]">
            {content.hero.heading}{" "}
            <span className="text-[#FFC400]">{content.hero.headingHighlight}</span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-white/95 mt-5 max-w-2xl mx-auto leading-relaxed font-normal drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)]">
            {content.hero.body}
          </p>
        </div>
      </section>

      <section className="w-full py-14 sm:py-20 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#D7F5EF]/60 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 rounded-full bg-[#DDEFF7]/60 blur-3xl pointer-events-none" />

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14 relative z-10">
          {services.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={index}
              imageSrc={service.image || "/images/hero-students.jpg"}
            />
          ))}
        </div>
      </section>

      <section className="w-full pb-14 sm:pb-20 pt-2 relative overflow-hidden">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#001B33] via-[#0B2540] to-[#001B33] text-white p-8 sm:p-10 lg:p-12 shadow-xl border border-white/15 text-center">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFC400] to-transparent opacity-90" />
            <div className="absolute -top-24 right-1/4 w-80 h-32 bg-[#FFC400]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 left-1/4 w-80 h-32 bg-[#FF7900]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-2xl mx-auto relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest text-[#FFC400] mb-2">
                {content.cta.eyebrow}
              </p>
              <h2 className="font-serif font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight">
                {content.cta.heading}
              </h2>
              <div className="w-16 h-1 bg-[#FFC400] mx-auto mt-3 rounded-full" />
              <p className="text-xs sm:text-sm text-slate-300 mt-3 max-w-xl mx-auto leading-relaxed">
                {content.cta.bodyBefore}{" "}
                <span className="font-num font-bold text-white">
                  {content.cta.minutes}
                </span>
                -{content.cta.bodyAfter}
              </p>
              <div className="pt-6 flex flex-wrap items-center justify-center gap-3.5">
                <Link
                  href={content.cta.primaryCta.href}
                  className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] hover:from-[#E56D00] hover:to-[#CC5F00] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 group"
                >
                  <span>{content.cta.primaryCta.label}</span>
                  <MdArrowForward className="text-base group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href={content.cta.secondaryCta.href}
                  className="px-6 py-3.5 rounded-xl border border-white/25 hover:border-[#FFC400] bg-white/5 hover:bg-white/10 text-white font-semibold text-xs sm:text-sm uppercase tracking-wider transition-all"
                >
                  <span>{content.cta.secondaryCta.label}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

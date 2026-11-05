"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MdCheckCircle, MdArrowForward } from "react-icons/md";
import type { Service } from "@/content/services";

interface ServiceCardProps {
  service: Service;
  index: number;
  imageSrc: string;
}

export default function ServiceCard({
  service,
  index,
  imageSrc,
}: ServiceCardProps) {
  const isReversed = index % 2 === 1;

  return (
    <motion.article
      id={service.id}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.42,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className="scroll-mt-32 bg-white rounded-3xl border border-[#D7F5EF] shadow-md hover:shadow-xl hover:border-[#FFC400] transition-[box-shadow,border-color] duration-300 overflow-hidden relative group transform-gpu will-change-[transform,opacity]"
    >
      <div className="h-1.5 w-full bg-gradient-to-r from-[#102E4D] via-[#FFC400] to-[#FF7900]" />

      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
        {/* Image Column */}
        <div
          className={`lg:col-span-5 relative min-h-[290px] sm:min-h-[360px] lg:min-h-full bg-slate-100 overflow-hidden ${
            isReversed ? "order-2 lg:order-2" : "order-2 lg:order-1"
          }`}
        >
          <img
            src={imageSrc || service.image || "/images/hero-students.jpg"}
            alt={service.imageAlt || service.title || "Leadership Program"}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#001B33]/45 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Content Column */}
        <div
          className={`lg:col-span-7 p-6 sm:p-9 lg:p-11 flex flex-col justify-between ${
            isReversed ? "order-1 lg:order-1" : "order-1 lg:order-2"
          }`}
        >
          <div className="space-y-4">
            {/* Step Number & Clean Category Overline */}
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-[#EFFBF8] border border-[#D7F5EF] font-num font-extrabold text-xs text-[#FF7900] inline-flex items-center justify-center">
                0{index + 1}
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-[#FF7900]">
                {service.badge}
              </span>
            </div>

            <h2 className="font-serif font-extrabold text-2xl sm:text-3xl lg:text-[34px] text-[#102E4D] leading-tight tracking-tight">
              {service.title}
            </h2>

            {service.tagline && (
              <p className="text-sm sm:text-base font-bold text-[#102E4D] leading-snug border-l-4 border-[#FFC400] pl-3.5 py-0.5">
                {service.tagline}
              </p>
            )}

            <p className="font-num text-xs sm:text-[14.5px] text-slate-600 leading-relaxed font-normal">
              {service.body}
            </p>

            <div className="pt-2">
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2.5 text-xs sm:text-[13px] text-slate-700 font-medium">
                {(Array.isArray(service.bullets) ? service.bullets : []).map(
                  (bullet, bIdx) => (
                    <li
                      key={`${service.id}-b-${bIdx}`}
                      className="flex items-start gap-2 leading-snug"
                    >
                      <MdCheckCircle className="text-[#FF7900] text-[16px] shrink-0 mt-0.5" />
                      <span className="font-num">{bullet}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold text-slate-400">
              Tailored for schools, educators &amp; learners
            </span>
            <Link
              href={`/contact?interest=${encodeURIComponent(
                service.interest || service.id || "program"
              )}#enquiry-form`}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] hover:from-[#E56D00] hover:to-[#CC5F00] text-white font-bold text-xs sm:text-sm tracking-wide transition-all inline-flex items-center gap-2 shadow-md hover:shadow-lg group/btn"
            >
              <span>{service.ctaLabel || "Enquire about this Program"}</span>
              <MdArrowForward className="text-[16px] group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}


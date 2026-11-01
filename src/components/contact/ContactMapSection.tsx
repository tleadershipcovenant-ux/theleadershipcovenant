"use client";

import React from "react";
import { motion } from "framer-motion";
import { MdLocationOn, MdOpenInNew } from "react-icons/md";
import { SITE } from "@/config/site";

export default function ContactMapSection() {
  return (
    <section
      className="w-full pb-16 sm:pb-20 pt-2 relative overflow-hidden scroll-mt-24"
      id="location-map"
    >
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-[#D7F5EF]" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl mx-auto mb-10 transform-gpu"
        >
          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#FF7900] mb-2">
            Location
          </p>
          <h2 className="font-serif font-extrabold text-3xl sm:text-4xl text-[#102E4D] tracking-tight">
            Find us in Islamabad
          </h2>
          <div className="w-20 h-1 bg-[#FFC400] mx-auto mt-3.5 rounded-full" />
          <p className="text-xs sm:text-sm text-slate-600 mt-3.5 leading-relaxed">
            <span className="font-num font-bold text-[#102E4D]">
              171, St. 68, F-10/3
            </span>
            , Islamabad, Pakistan. Detailed directions provided upon booking or enquiry.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white p-3 sm:p-4 rounded-3xl border border-[#D7F5EF] shadow-xl transform-gpu"
        >
          <div className="rounded-2xl overflow-hidden border border-slate-200/80 h-80 sm:h-96 w-full">
            <iframe
              title="The Leadership Covenant Islamabad Location"
              src={SITE.mapsEmbedUrl}
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="pt-3.5 px-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#102E4D]">
              <MdLocationOn className="text-[#FF7900] text-base" />
              <span className="font-num">{SITE.address.full}</span>
            </span>
            <a
              href={SITE.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-[#FF7900] hover:text-[#E56D00] transition-colors"
            >
              <span>Open in Google Maps</span>
              <MdOpenInNew className="text-sm" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


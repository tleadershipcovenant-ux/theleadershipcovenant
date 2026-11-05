"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MdArrowForward } from "react-icons/md";
import { useHomePageContent } from "@/lib/cms-client";

export default function HomeCtaSection() {
  const { cta } = useHomePageContent();

  return (
    <section className="w-full py-10 sm:py-14 relative overflow-hidden" id="cta-banner">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Floating Compact Rounded Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#001B33] via-[#0B2540] to-[#001B33] text-white p-7 sm:p-9 lg:p-11 shadow-xl border border-white/15 transform-gpu"
        >
          {/* Ambient Glows inside the Card */}
          <div className="absolute -top-24 right-1/4 w-80 h-32 bg-[#FFC400]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 left-1/4 w-80 h-32 bg-[#FF7900]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Gold Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFC400] to-transparent opacity-90" />

          <div className="max-w-2xl mx-auto text-center relative z-10">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#FFC400] mb-2 sm:mb-2.5">
              {cta.eyebrow}
            </p>
            <h2 className="font-serif font-extrabold text-2xl sm:text-3xl lg:text-[34px] text-white tracking-tight leading-snug">
              {cta.heading}
            </h2>
            <div className="w-16 h-1 bg-[#FFC400] mx-auto mt-2.5 rounded-full" />
            <p className="text-xs sm:text-sm text-slate-300 mt-2.5 max-w-xl mx-auto leading-relaxed font-medium">
              {cta.subtext}
            </p>

            <div className="pt-6 sm:pt-7 flex flex-wrap items-center justify-center gap-3.5">
              {cta.buttons[0] ? (
                <Link
                  href={cta.buttons[0].href}
                  className="h-11 px-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] hover:from-[#E56D00] hover:to-[#CC5F00] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer"
                >
                  <span>{cta.buttons[0].label}</span>
                  <MdArrowForward className="text-base" />
                </Link>
              ) : null}
              {cta.buttons[1] ? (
                <Link
                  href={cta.buttons[1].href}
                  className="h-11 px-6 inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 hover:border-[#FFC400] bg-white/5 hover:bg-white/10 text-white font-semibold text-xs uppercase tracking-wider transition-all active:scale-98"
                >
                  <span>{cta.buttons[1].label}</span>
                </Link>
              ) : null}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

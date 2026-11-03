"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ABOUT_CONTENT } from "@/content/about";
import GovernanceSection from "@/components/GovernanceSection";
import {
  MdCheckCircle,
  MdVisibility,
  MdFlag,
  MdArrowForward,
} from "react-icons/md";

const PROMISE_CARD_STYLES = [
  {
    gradient: "from-[#E11D48] to-[#BE123C]",
    numBg: "bg-rose-50 text-rose-600 border-rose-200",
  },
  {
    gradient: "from-[#16A34A] to-[#15803D]",
    numBg: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  {
    gradient: "from-[#FF7900] to-[#E56D00]",
    numBg: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    gradient: "from-[#2563EB] to-[#1D4ED8]",
    numBg: "bg-blue-50 text-blue-600 border-blue-200",
  },
];

export default function AboutAnimatedView() {
  const { visionMission, covenant, principles, closingCtas } = ABOUT_CONTENT;

  return (
    <main className="w-full pt-[68px] md:pt-[112px]">
      {/* 1. Executive Hero Section — Photographic Backdrop + Midnight Navy Overlay */}
      <section className="relative w-full overflow-hidden bg-[#001B33] text-white py-14 sm:py-18 lg:py-22 min-h-[360px] sm:min-h-[400px] flex items-center justify-center border-b border-white/10">
        {/* Top Signature Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#FFC400] z-20" />

        {/* Atmospheric Background Image */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src="/Our%20story/S1.png"
            alt="The Leadership Covenant - Our Story"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover object-center opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#001B33]/80 via-[#001B33]/75 to-[#001B33]/90" />
          <div className="absolute -top-24 left-1/4 w-96 h-48 bg-[#FFC400]/12 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 right-1/4 w-96 h-48 bg-[#FF7900]/12 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center will-change-[transform,opacity] w-full"
        >
          <h1 className="font-serif font-extrabold text-3xl sm:text-5xl lg:text-[54px] text-white leading-[1.14] tracking-tight max-w-4xl mx-auto">
            Everyone has the potential to lead. <br />
            <span className="text-[#FFC400]">We help them discover and develop it.</span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-slate-200 mt-5 max-w-2xl mx-auto leading-relaxed font-normal">
            {visionMission.mission.text}
          </p>
        </motion.div>
      </section>

      {/* 2. Vision & Mission */}
      <section
        className="w-full py-16 sm:py-20 lg:py-24 relative overflow-hidden bg-slate-50/60"
        id="overview"
      >
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[#D7F5EF]/60 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-[#DDEFF7]/60 blur-3xl pointer-events-none" />

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
            {/* Vision Card */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="bg-white rounded-3xl border border-[#D7F5EF] p-7 sm:p-10 shadow-md hover:shadow-xl hover:border-[#FFC400] hover:-translate-y-1 transition-[box-shadow,border-color,transform] duration-300 relative overflow-hidden flex flex-col justify-between group will-change-[transform,opacity]"
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-[#102E4D] via-[#FFC400] to-[#FF7900] absolute top-0 left-0" />
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#EFFBF8] text-[#FF7900] border border-[#D7F5EF] flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <MdVisibility className="text-2xl" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#FF7900] block">
                      Purpose &amp; Direction
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">Our Aspiration</span>
                  </div>
                </div>
                <h2 className="font-serif font-extrabold text-2xl sm:text-3xl text-[#102E4D] mb-3.5 tracking-tight leading-snug">
                  {visionMission.vision.title}
                </h2>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
                  {visionMission.vision.text}
                </p>
              </div>
            </motion.div>

            {/* Mission Card */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="bg-white rounded-3xl border border-[#D7F5EF] p-7 sm:p-10 shadow-md hover:shadow-xl hover:border-[#FFC400] hover:-translate-y-1 transition-[box-shadow,border-color,transform] duration-300 relative overflow-hidden flex flex-col justify-between group will-change-[transform,opacity]"
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-[#FF7900] via-[#FFC400] to-[#102E4D] absolute top-0 left-0" />
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#EFFBF8] text-[#FF7900] border border-[#D7F5EF] flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <MdFlag className="text-2xl" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#FF7900] block">
                      Institutional Mandate
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">Our Action</span>
                  </div>
                </div>
                <h2 className="font-serif font-extrabold text-2xl sm:text-3xl text-[#102E4D] mb-3.5 tracking-tight leading-snug">
                  {visionMission.mission.title}
                </h2>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
                  {visionMission.mission.text}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. The Covenant — Four promises. One covenant. */}
      <section
        className="w-full py-16 sm:py-20 lg:py-24 bg-white relative overflow-hidden"
        id="covenant"
      >
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D7F5EF] to-transparent" />
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 will-change-[transform,opacity]"
          >
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#FF7900] mb-2">
              {covenant.eyebrow}
            </p>
            <h2 className="font-serif font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#102E4D] tracking-tight">
              {covenant.heading}
            </h2>
            <div className="w-20 h-1 bg-[#FFC400] mx-auto mt-3.5 rounded-full" />
            <p className="text-sm sm:text-base text-slate-600 mt-3.5 max-w-2xl mx-auto leading-relaxed font-medium">
              Our solemn pledge to students, educators, and communities is reflected in four enduring commitments that guide everything we do.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {covenant.promises.map((p, idx) => {
              const cardStyle = PROMISE_CARD_STYLES[idx % PROMISE_CARD_STYLES.length];
              return (
                <motion.div
                  key={p.number}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{
                    duration: 0.4,
                    delay: idx * 0.08,
                    ease: [0.21, 0.47, 0.32, 0.98],
                  }}
                  className="bg-white rounded-2xl border border-[#D7F5EF] shadow-md hover:shadow-xl hover:border-[#FFC400] hover:-translate-y-1.5 transition-[box-shadow,border-color,transform] duration-300 flex flex-col justify-between overflow-hidden group will-change-[transform,opacity]"
                >
                  <div className={`h-1.5 w-full bg-gradient-to-r ${cardStyle.gradient}`} />
                  <div className="p-6 sm:p-7 flex flex-col flex-1 justify-between">
                    <div>
                      <div className={`w-10 h-10 rounded-xl border font-num font-extrabold text-xs flex items-center justify-center mb-5 ${cardStyle.numBg}`}>
                        {p.number}
                      </div>
                      <h3 className="font-serif font-extrabold text-2xl text-[#102E4D] mb-2.5 leading-snug tracking-tight group-hover:text-[#FF7900] transition-colors">
                        {p.word}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {p.promise}
                      </p>
                    </div>
                    <div className="pt-4 mt-6 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-[#102E4D]">
                      <MdCheckCircle className="text-[16px] text-[#FF7900]" />
                      <span>The Covenant Promise</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. What We Believe — Principles we lead by */}
      <section
        className="w-full py-16 sm:py-20 lg:py-24 bg-slate-50/60 relative overflow-hidden"
        id="principles"
      >
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D7F5EF] to-transparent" />
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 will-change-[transform,opacity]"
          >
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#FF7900] mb-2">
              {principles.eyebrow}
            </p>
            <h2 className="font-serif font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#102E4D] tracking-tight">
              {principles.heading}
            </h2>
            <div className="w-20 h-1 bg-[#FFC400] mx-auto mt-3.5 rounded-full" />
            <p className="text-sm sm:text-base text-slate-600 mt-3.5 max-w-2xl mx-auto leading-relaxed font-medium">
              Timeless principles grounded in frameworks that shape character and institutional culture.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {principles.items.map((principle, idx) => (
              <motion.div
                key={principle.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{
                  duration: 0.42,
                  delay: idx * 0.1,
                  ease: [0.21, 0.47, 0.32, 0.98],
                }}
                className="p-7 sm:p-9 rounded-2xl bg-white border border-[#D7F5EF] hover:border-[#FFC400] hover:shadow-xl hover:-translate-y-1.5 shadow-md transition-[box-shadow,border-color,transform] duration-300 flex flex-col justify-between relative overflow-hidden group will-change-[transform,opacity]"
              >
                <div className="h-1 w-full bg-gradient-to-r from-[#FF7900] via-[#FFC400] to-[#FF7900] absolute top-0 left-0" />
                <div>
                  <span className="font-num font-extrabold text-xs uppercase tracking-widest text-[#FF7900] block mb-3">
                    Principle 0{idx + 1}
                  </span>
                  <h3 className="font-serif font-extrabold text-xl sm:text-2xl text-[#102E4D] mb-3 leading-snug tracking-tight group-hover:text-[#FF7900] transition-colors">
                    {principle.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {principle.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CEO Message & Leadership — Guidance & Governance */}
      <GovernanceSection />

      {/* 6. Closing Call to Action — Styled Floating Rounded Card */}
      <section className="w-full py-12 sm:py-16 lg:py-20 relative overflow-hidden" id="cta-journey">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#001B33] via-[#0B2540] to-[#001B33] text-white p-8 sm:p-11 lg:p-14 shadow-2xl border border-white/15 text-center will-change-[transform,opacity]"
          >
            {/* Top Gold Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFC400] to-transparent opacity-90" />

            {/* Ambient Radial Glows */}
            <div className="absolute -top-24 right-1/4 w-80 h-32 bg-[#FFC400]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 left-1/4 w-80 h-32 bg-[#FF7900]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-2xl mx-auto relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest text-[#FFC400] mb-2 sm:mb-2.5">
                Start Your Transformation
              </p>
              <h2 className="font-serif font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-snug">
                Ready to Begin the Journey?
              </h2>
              <div className="w-16 h-1 bg-[#FFC400] mx-auto mt-3 rounded-full" />
              <p className="text-xs sm:text-sm text-slate-300 mt-3 max-w-xl mx-auto leading-relaxed font-medium">
                Join hundreds of visionary educators and institutions transforming lives through the power of principled leadership.
              </p>

              <div className="pt-7 flex flex-wrap items-center justify-center gap-3.5">
                <Link
                  href={closingCtas[0].href}
                  className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] hover:from-[#E56D00] hover:to-[#CC5F00] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 group active:scale-98 cursor-pointer"
                >
                  <span>{closingCtas[0].label}</span>
                  <MdArrowForward className="text-base group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href={closingCtas[1].href}
                  className="px-6 py-3.5 rounded-xl border border-white/25 hover:border-[#FFC400] bg-white/5 hover:bg-white/10 text-white font-semibold text-xs sm:text-sm uppercase tracking-wider transition-all active:scale-98"
                >
                  <span>{closingCtas[1].label}</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

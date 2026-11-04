"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  SUMMIT_CONTENT,
  type SummitSpeakersContent,
  type SummitVideosContent,
  type SummitCtaContent,
} from "@/content/summit";
import SummitVideoSlider from "@/components/summit/SummitVideoSlider";
import { MdArrowForward } from "react-icons/md";

interface SummitInteractiveSectionsProps {
  speakers?: SummitSpeakersContent;
  videos?: SummitVideosContent;
  registration?: SummitCtaContent;
}

export default function SummitInteractiveSections({
  speakers: propSpeakers,
  videos: propVideos,
  registration: propRegistration,
}: SummitInteractiveSectionsProps = {}) {
  const speakers = propSpeakers || SUMMIT_CONTENT.speakers;
  const videos = propVideos || SUMMIT_CONTENT.videos;
  const registration = propRegistration || SUMMIT_CONTENT.registration;
  const speakerList = speakers.items && speakers.items.length > 0 ? speakers.items : SUMMIT_CONTENT.speakers.items;

  return (
    <>
      {/* ────────────────────────────────────────────────────────── */}
      {/* 5. SPEAKERS & FACILITATORS                                */}
      {/* ────────────────────────────────────────────────────────── */}
      <section
        className="w-full py-9 sm:py-12 lg:py-14 relative overflow-hidden"
        id="speakers"
      >
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-[#D7F5EF]" />

        {/* Ambient GPU blur accents */}
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[#D7F5EF]/50 blur-3xl pointer-events-none transform-gpu" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-[#DDEFF7]/50 blur-3xl pointer-events-none transform-gpu" />

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 transform-gpu"
          >
            <div className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest text-[#FF7900] mb-2">
              <span className="w-5 h-[2px] bg-[#FF7900] inline-block" />
              <span>{speakers.eyebrow}</span>
              <span className="w-5 h-[2px] bg-[#FF7900] inline-block" />
            </div>
            <h2 className="font-serif font-extrabold text-2xl sm:text-4xl lg:text-5xl text-[#102E4D] tracking-tight">
              {speakers.heading}
            </h2>
            <div className="w-20 h-1 bg-[#FFC400] mx-auto mt-3.5 rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8 max-w-6xl mx-auto items-stretch">
            {speakerList.map((spk, idx) => (
              <motion.div
                key={spk.name || `speaker-${idx}`}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{
                  duration: 0.45,
                  delay: 0.08 * idx,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ y: -4, transition: { duration: 0.18 } }}
                className="rounded-3xl bg-white border border-[#D7F5EF] hover:border-[#FFC400] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group transform-gpu cursor-default"
              >
                {/* Top Colored Accent Stripe */}
                <div
                  className={`h-1.5 w-full bg-gradient-to-r ${spk.topAccent ||
                    (idx % 2 === 0
                      ? "from-[#102E4D] via-[#001B33] to-[#FFC400]"
                      : "from-[#FF7900] via-[#E56D00] to-[#FFC400]")
                    }`}
                />

                <div className="flex flex-col sm:flex-row flex-1">
                  {/* Speaker Image Presentation Area */}
                  <div className="w-full h-64 sm:h-auto sm:w-[38%] lg:w-[36%] relative overflow-hidden bg-[#E8F7F1] border-b sm:border-b-0 sm:border-r border-[#D7F5EF] flex items-center justify-center shrink-0">
                    <img
                      src={spk.image || "/Submit/fazal.jpeg"}
                      alt={spk.name}
                      className="w-full h-full object-cover object-center select-none transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  {/* Speaker Information Body */}
                  <div className="w-full sm:w-[62%] lg:w-[64%] p-5 sm:p-7 lg:p-8 flex flex-col justify-center flex-1">
                    <div>
                      {/* Speaker Badge */}
                      <span
                        className={`text-[10px] sm:text-[10.5px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${spk.badgeColor ||
                          (idx % 2 === 0
                            ? "bg-[#102E4D] text-[#FFC400] border-[#102E4D]/30"
                            : "bg-[#FF7900] text-white border-[#FF7900]/30")
                          } inline-block mb-2.5`}
                      >
                        {spk.role}
                      </span>

                      {/* Speaker Name */}
                      <h3 className="font-serif font-extrabold text-xl sm:text-[23px] text-[#102E4D] group-hover:text-[#FF7900] transition-colors leading-tight tracking-tight">
                        {spk.name}
                      </h3>

                      {/* Speaker Designation */}
                      <p className="text-xs sm:text-[12.5px] font-bold text-[#FF7900] mt-1.5 leading-snug">
                        {spk.title}
                      </p>

                      {/* Bio */}
                      <p className="text-xs sm:text-[13px] text-slate-600 mt-3 leading-relaxed font-normal text-left">
                        {spk.bio}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 6. WATCH & RELIVE — EMBEDDED VIDEO PLAYERS                 */}
      {/* ────────────────────────────────────────────────────────── */}
      <section
        className="w-full py-9 sm:py-12 lg:py-14 relative overflow-hidden"
        id="videos"
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-3xl mx-auto mb-6 sm:mb-8 transform-gpu"
          >
            <div className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest text-[#FF7900] mb-2">
              <span className="w-5 h-[2px] bg-[#FF7900] inline-block" />
              <span>{videos.eyebrow}</span>
              <span className="w-5 h-[2px] bg-[#FF7900] inline-block" />
            </div>
            <h2 className="font-serif font-extrabold text-2xl sm:text-4xl lg:text-5xl text-[#102E4D] tracking-tight">
              {videos.heading}
            </h2>
            <div className="w-20 h-1 bg-[#FFC400] mx-auto mt-3 rounded-full" />

          </motion.div>

          {/* Interactive 3D Video Slider (Reference Matching) */}
          <SummitVideoSlider videos={videos.items} />
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 9. RESERVE YOUR SEAT — READY SECTION CTA BANNER            */}
      {/* ────────────────────────────────────────────────────────── */}
      <section
        className="w-full py-9 sm:py-12 lg:py-14 relative overflow-hidden scroll-mt-24"
        id="register"
      >
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#001B33] via-[#0B2540] to-[#001B33] text-white p-8 sm:p-12 lg:p-14 shadow-xl border border-white/15 transform-gpu"
          >
            {/* Ambient Glows */}
            <div className="absolute -top-24 right-1/4 w-80 h-32 bg-[#FFC400]/15 rounded-full blur-3xl pointer-events-none transform-gpu" />
            <div className="absolute -bottom-24 left-1/4 w-80 h-32 bg-[#FF7900]/15 rounded-full blur-3xl pointer-events-none transform-gpu" />

            {/* Top Gold Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFC400] to-transparent opacity-90" />

            <div className="max-w-2xl mx-auto text-center relative z-10">
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#FFC400] mb-2 sm:mb-2.5">
                {registration.eyebrow}
              </p>
              <h2 className="font-serif font-extrabold text-2xl sm:text-3xl lg:text-[34px] text-white tracking-tight leading-snug">
                {registration.heading}
              </h2>
              <div className="w-16 h-1 bg-[#FFC400] mx-auto mt-2.5 rounded-full" />
              <p className="text-xs sm:text-sm text-slate-300 mt-2.5 max-w-md mx-auto leading-relaxed font-medium">
                {registration.subtext}
              </p>

              <div className="pt-6 sm:pt-7 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-3.5">
                <Link
                  href={registration.primaryCtaHref}
                  className="h-11 px-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] hover:from-[#E56D00] hover:to-[#CC5F00] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer w-full sm:w-auto"
                >
                  <span>{registration.primaryCtaLabel}</span>
                  <MdArrowForward className="text-base" />
                </Link>
                <Link
                  href={registration.secondaryCtaHref}
                  className="h-11 px-6 inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 hover:border-[#FFC400] bg-white/5 hover:bg-white/10 text-white font-semibold text-xs uppercase tracking-wider transition-all active:scale-98 w-full sm:w-auto"
                >
                  <span>{registration.secondaryCtaLabel}</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

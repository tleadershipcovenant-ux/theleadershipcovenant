"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import AnimatedCounter from "@/components/AnimatedCounter";
import { SUMMIT_CONTENT } from "@/content/summit";
import {
  MdArrowForward,
  MdGroups,
  MdSchool,
  MdWorkspacePremium,
  MdStar,
} from "react-icons/md";
import { FaQuoteLeft } from "react-icons/fa";

const SUMMIT_SPEAKERS = [
  {
    name: "Mr. Fazal Niazi",
    role: "Keynote Speaker",
    title: "Practice Lead, FranklinCovey Education Pakistan, Türkiye & Azerbaijan",
    bio: "Leads the FranklinCovey Education practice across Pakistan, Türkiye, and Azerbaijan. An executive advisor partnering with school leaders on leadership cultures, student empowerment, and the 4DX operating system.",
    image: "/Submit/SP1.png",
    badgeColor: "bg-[#102E4D] text-[#FFC400] border-[#102E4D]/30",
    topAccent: "from-[#102E4D] via-[#001B33] to-[#FFC400]",
  },
  {
    name: "Mr. Ubaid ur Rehman",
    role: "Lead Facilitator",
    title: "Regional Manager, FranklinCovey Education North Region",
    bio: "Partners with educational leaders and faculties across the North Region to foster sustainable character-based environments. Leads the summit's intensive working sessions, goal scorecards, and institutional commitment pledges.",
    image: "/Submit/SP1.png",
    badgeColor: "bg-[#FF7900] text-white border-[#FF7900]/30",
    topAccent: "from-[#FF7900] via-[#E56D00] to-[#FFC400]",
  },
];

const HIGHLIGHT_STATS = [
  {
    target: 200,
    suffix: "+",
    label: "Educators & Leaders",
    description: "Gathered for intensive coaching, strategic planning, and peer exchange.",
    icon: MdGroups,
    tone: {
      accentTop: "from-[#FFC400] to-[#E5A800]",
      iconBox: "bg-[#FFC400]/15 text-[#FFC400] border-[#FFC400]/30",
      accentNumber: "text-[#FFC400]",
      cardBorder: "border-[#FFC400]/25",
    },
  },
  {
    target: 40,
    suffix: "+",
    label: "Schools Represented",
    description: "Schools across Islamabad, Peshawar, and the North Region participated.",
    icon: MdSchool,
    tone: {
      accentTop: "from-[#22C55E] to-[#16A34A]",
      iconBox: "bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30",
      accentNumber: "text-[#22C55E]",
      cardBorder: "border-[#22C55E]/25",
    },
  },
  {
    target: 90,
    suffix: " Days",
    label: "Impact Roadmaps",
    description: "Every team left with a written 90-day action plan ready for execution.",
    icon: MdWorkspacePremium,
    tone: {
      accentTop: "from-[#FF7900] to-[#E56D00]",
      iconBox: "bg-[#FF7900]/15 text-[#FF7900] border-[#FF7900]/30",
      accentNumber: "text-[#FF7900]",
      cardBorder: "border-[#FF7900]/25",
    },
  },
];

const SUMMIT_VIDEOS = [
  {
    title: "School Impact Summit — Event Highlights",
    tag: "Keynotes & Sessions",
    description:
      "A look inside the room: keynote addresses, coaching corners, and leadership teams formulating 90-day whole-school action plans.",
    embedUrl: "https://www.youtube.com/embed/e-zgk1VWN1s?si=C3m09Q0_5N-aGVJC",
  },
  {
    title: "Leader Voices & Classroom Transformation",
    tag: "Participant Reflections",
    description:
      "School heads and educators share firsthand how FranklinCovey Education leadership principles transformed student agency and staff culture.",
    embedUrl: "https://www.youtube.com/embed/omlFZklTLV8?si=xl6BLeWru6bz2bG1",
  },
];

const PARTICIPANT_VOICES = [
  {
    quote:
      "We came back from the last event with a goal, a scorecard, and the energy to actually follow through. For the first time, our leadership plan survived the semester.",
    topAccent: "from-[#102E4D] via-[#001B33] to-[#FFC400]",
    quoteColor: "text-[#102E4D]",
    tag: "School Leadership",
  },
  {
    quote:
      "The coaching day gave our leadership team a common language. Six months later, students are still actively leading their own classroom goals.",
    topAccent: "from-[#16A34A] via-[#15803D] to-[#22C55E]",
    quoteColor: "text-[#16A34A]",
    tag: "Culture Shift",
  },
  {
    quote:
      "I have attended many educational conferences. This was the first one where I walked away having already made concrete strategic decisions with my team.",
    topAccent: "from-[#FF7900] via-[#E56D00] to-[#FFC400]",
    quoteColor: "text-[#FF7900]",
    tag: "Team Execution",
  },
  {
    quote:
      "The case studies were refreshingly honest: real schools, real setbacks, and real numbers. That is why our team trusts and implements their frameworks.",
    topAccent: "from-[#2563EB] via-[#1D4ED8] to-[#60A5FA]",
    quoteColor: "text-[#2563EB]",
    tag: "Practical Rigor",
  },
];

export default function SummitInteractiveSections() {
  const { speakers, highlights, videos, voices } = SUMMIT_CONTENT;

  return (
    <>
      {/* ────────────────────────────────────────────────────────── */}
      {/* 5. SPEAKERS & FACILITATORS                                */}
      {/* ────────────────────────────────────────────────────────── */}
      <section
        className="w-full py-10 sm:py-14 relative overflow-hidden"
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
            className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 transform-gpu"
          >
            <div className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest text-[#FF7900] mb-2">
              <span className="w-5 h-[2px] bg-[#FF7900] inline-block" />
              <span>{speakers.eyebrow}</span>
              <span className="w-5 h-[2px] bg-[#FF7900] inline-block" />
            </div>
            <h2 className="font-serif font-extrabold text-2xl sm:text-4xl lg:text-5xl text-[#102E4D] tracking-tight">
              {speakers.heading}
            </h2>
            <div className="w-20 h-1 bg-[#FFC400] mx-auto mt-3 rounded-full" />
            <p className="text-xs sm:text-sm text-slate-600 mt-2.5 max-w-xl mx-auto leading-relaxed">
              Learn directly from certified FranklinCovey Education master facilitators who have coached thousands of educators.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8 max-w-6xl mx-auto items-stretch">
            {SUMMIT_SPEAKERS.map((spk, idx) => (
              <motion.div
                key={spk.name}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{
                  duration: 0.45,
                  delay: 0.08 * idx,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ y: -5, transition: { duration: 0.18 } }}
                className="rounded-3xl bg-white border border-[#D7F5EF] hover:border-[#FFC400] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group transform-gpu cursor-default"
              >
                {/* Top Colored Accent Stripe */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${spk.topAccent}`} />

                <div className="flex flex-col sm:flex-row flex-1">
                  {/* Speaker Image Presentation Area — Seamless Edge-to-Edge Fit */}
                  <div className="w-full h-64 sm:h-auto sm:w-[38%] lg:w-[36%] relative overflow-hidden bg-[#C2F9D2] border-b sm:border-b-0 sm:border-r border-[#D7F5EF] flex items-end justify-center shrink-0">
                    <img
                      src={spk.image}
                      alt={spk.name}
                      className="w-full h-full object-contain object-bottom select-none transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  {/* Speaker Information Body */}
                  <div className="w-full sm:w-[62%] lg:w-[64%] p-5 sm:p-7 lg:p-8 flex flex-col justify-center flex-1">
                    <div>
                      {/* Speaker Badge */}
                      <span
                        className={`text-[10px] sm:text-[10.5px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${spk.badgeColor} inline-block mb-2.5`}
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

                      {/* Short Description / Bio */}
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
      {/* 6. HIGHLIGHTS FROM PAST EVENTS — ANIMATED COUNTER STATS    */}
      {/* ────────────────────────────────────────────────────────── */}
      <section
        className="w-full bg-[#001B33] text-white py-10 sm:py-14 relative overflow-hidden border-y border-white/10"
        id="highlights"
      >
        {/* Ambient Glows */}
        <div className="absolute -top-24 right-1/4 w-80 h-32 bg-[#FFC400]/15 rounded-full blur-3xl pointer-events-none transform-gpu" />
        <div className="absolute -bottom-24 left-1/4 w-80 h-32 bg-[#FF7900]/15 rounded-full blur-3xl pointer-events-none transform-gpu" />

        {/* Top Gold Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFC400] to-transparent opacity-90" />

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 transform-gpu"
          >
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#FFC400] mb-2">
              {highlights.eyebrow}
            </p>
            <h2 className="font-serif font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
              {highlights.heading}
            </h2>
            <div className="w-20 h-1 bg-[#FFC400] mx-auto mt-3.5 rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 max-w-5xl mx-auto items-stretch">
            {HIGHLIGHT_STATS.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{
                    duration: 0.45,
                    delay: 0.08 * idx,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={{ y: -4, transition: { duration: 0.16 } }}
                  className={`relative overflow-hidden rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] backdrop-blur-sm border ${stat.tone.cardBorder} p-4 sm:p-5 transition-all duration-300 flex flex-col items-center text-center shadow-lg group transform-gpu cursor-default`}
                >
                  {/* Top gradient accent line */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.tone.accentTop}`}
                  />

                  {/* Icon Container */}
                  <div
                    className={`w-10 h-10 rounded-xl ${stat.tone.iconBox} border flex items-center justify-center mb-2.5 shadow-inner group-hover:scale-105 transition-transform duration-300`}
                  >
                    <Icon className="text-xl" />
                  </div>

                  {/* Number + Animated Counter + Suffix */}
                  <div className="font-num font-extrabold text-2xl sm:text-[28px] lg:text-[30px] text-white tracking-tight leading-none flex items-baseline justify-center">
                    <AnimatedCounter target={stat.target} duration={1.2} />
                    <span
                      className={`font-num text-xl sm:text-2xl font-extrabold ml-0.5 ${stat.tone.accentNumber}`}
                    >
                      {stat.suffix}
                    </span>
                  </div>

                  {/* Label */}
                  <div className="text-[11.5px] sm:text-xs font-semibold uppercase tracking-wider text-slate-300 mt-2 leading-snug">
                    {stat.label}
                  </div>

                  {/* Description */}
                  <p className="font-num text-xs text-slate-300/80 mt-1.5 leading-relaxed max-w-[260px]">
                    {stat.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 7. WATCH & RELIVE — EMBEDDED VIDEO PLAYERS                 */}
      {/* ────────────────────────────────────────────────────────── */}
      <section
        className="w-full py-10 sm:py-14 relative overflow-hidden"
        id="videos"
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 transform-gpu"
          >
            <div className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest text-[#FF7900] mb-2">
              <span className="w-5 h-[2px] bg-[#FF7900] inline-block" />
              <span>{videos.eyebrow}</span>
              <span className="w-5 h-[2px] bg-[#FF7900] inline-block" />
            </div>
            <h2 className="font-serif font-extrabold text-2xl sm:text-4xl text-[#102E4D] tracking-tight">
              {videos.heading}
            </h2>
            <div className="w-20 h-1 bg-[#FFC400] mx-auto mt-3 rounded-full" />
            <p className="text-xs sm:text-sm text-slate-600 mt-2.5 max-w-xl mx-auto leading-relaxed">
              Watch official highlight reels and participant reflections from our previous educational leadership summits.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 max-w-5xl mx-auto">
            {SUMMIT_VIDEOS.map((video, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{
                  duration: 0.45,
                  delay: 0.1 * idx,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ y: -4, transition: { duration: 0.18 } }}
                className="rounded-3xl bg-white border border-[#D7F5EF] hover:border-[#FFC400] shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group transform-gpu cursor-default"
              >
                {/* 16:9 Responsive Video Embed Container */}
                <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                  <iframe
                    className="w-full h-full border-0"
                    src={video.embedUrl}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>

                {/* Video Information Body */}
                <div className="p-4 sm:p-6 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#FF7900] bg-[#FF7900]/10 border border-[#FF7900]/20 px-2.5 py-0.5 rounded-full">
                        {video.tag}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-lg text-[#102E4D] group-hover:text-[#FF7900] transition-colors leading-snug">
                      {video.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2 font-normal">
                      {video.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 8. PARTICIPANT VOICES — COMPACT TESTIMONIAL CARDS          */}
      {/* ────────────────────────────────────────────────────────── */}
      <section
        className="w-full py-10 sm:py-14 relative overflow-hidden"
        id="voices"
      >
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-[#D7F5EF]" />

        {/* Ambient GPU blur accents */}
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-[#D7F5EF]/50 blur-3xl pointer-events-none transform-gpu" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-[#DDEFF7]/50 blur-3xl pointer-events-none transform-gpu" />

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 transform-gpu"
          >
            <div className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest text-[#FF7900] mb-2">
              <span className="w-5 h-[2px] bg-[#FF7900] inline-block" />
              <span>{voices.eyebrow}</span>
              <span className="w-5 h-[2px] bg-[#FF7900] inline-block" />
            </div>
            <h2 className="font-serif font-extrabold text-2xl sm:text-4xl text-[#102E4D] tracking-tight">
              {voices.heading}
            </h2>
            <div className="w-20 h-1 bg-[#FFC400] mx-auto mt-3 rounded-full" />
            <p className="text-xs sm:text-sm text-slate-600 mt-2.5 max-w-xl mx-auto leading-relaxed">
              Reflections from educators and school leaders who joined our previous FranklinCovey Education sessions.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5 max-w-4xl mx-auto items-stretch">
            {PARTICIPANT_VOICES.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{
                  duration: 0.45,
                  delay: 0.08 * idx,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ y: -4, transition: { duration: 0.16 } }}
                className="rounded-2xl bg-white border border-[#D7F5EF] hover:border-[#FFC400] shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group transform-gpu cursor-default"
              >
                {/* Top Colored Accent Stripe */}
                <div className={`h-1 w-full bg-gradient-to-r ${item.topAccent}`} />

                <div className="p-4 sm:p-6 flex flex-col justify-between flex-1">
                  {/* Header Row: Quote Icon + Rating & Category Tag */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 border border-slate-100 ${item.quoteColor} shadow-2xs group-hover:scale-105 transition-transform`}
                    >
                      <FaQuoteLeft className="text-xs" />
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5 text-[#FFC400] text-xs">
                        {[...Array(5)].map((_, i) => (
                          <MdStar key={i} />
                        ))}
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200/60">
                        {item.tag}
                      </span>
                    </div>
                  </div>

                  {/* Testimonial Quote Message */}
                  <p className="font-serif italic text-xs sm:text-[13.5px] text-slate-700 leading-relaxed font-normal">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 9. RESERVE YOUR SEAT — READY SECTION CTA BANNER            */}
      {/* ────────────────────────────────────────────────────────── */}
      <section
        className="w-full py-10 sm:py-14 relative overflow-hidden scroll-mt-24"
        id="register"
      >
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#001B33] via-[#0B2540] to-[#001B33] text-white p-6 sm:p-9 lg:p-12 shadow-xl border border-white/15 transform-gpu"
          >
            {/* Ambient Glows */}
            <div className="absolute -top-24 right-1/4 w-80 h-32 bg-[#FFC400]/15 rounded-full blur-3xl pointer-events-none transform-gpu" />
            <div className="absolute -bottom-24 left-1/4 w-80 h-32 bg-[#FF7900]/15 rounded-full blur-3xl pointer-events-none transform-gpu" />

            {/* Top Gold Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFC400] to-transparent opacity-90" />

            <div className="max-w-2xl mx-auto text-center relative z-10">
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#FFC400] mb-2 sm:mb-2.5">
                The School Impact Summit 2026
              </p>
              <h2 className="font-serif font-extrabold text-2xl sm:text-3xl lg:text-[34px] text-white tracking-tight leading-snug">
                Reserve your seat
              </h2>
              <div className="w-16 h-1 bg-[#FFC400] mx-auto mt-2.5 rounded-full" />
              <p className="text-xs sm:text-sm text-slate-300 mt-2.5 max-w-md mx-auto leading-relaxed font-medium">
                Join school leaders on 28 November 2026 in Islamabad. Secure your seat today.
              </p>

              <div className="pt-6 sm:pt-7 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-3.5">
                <Link
                  href="/apply?activity=school-impact-summit-2026#apply-form"
                  className="h-11 px-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] hover:from-[#E56D00] hover:to-[#CC5F00] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer w-full sm:w-auto"
                >
                  <span>Apply Now</span>
                  <MdArrowForward className="text-base" />
                </Link>
                <Link
                  href="/contact#contact"
                  className="h-11 px-6 inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 hover:border-[#FFC400] bg-white/5 hover:bg-white/10 text-white font-semibold text-xs uppercase tracking-wider transition-all active:scale-98 w-full sm:w-auto"
                >
                  <span>Contact Us</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}


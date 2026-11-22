"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  SUMMIT_CONTENT,
  type SummitSpeakersContent,
  type SummitPanelDiscussionContent,
  type SummitParticipatingSchoolsContent,
  type SummitVideosContent,
  type SummitCtaContent,
} from "@/content/summit";
import SummitVideoSlider from "@/components/summit/SummitVideoSlider";
import { MdArrowForward } from "react-icons/md";

interface SummitInteractiveSectionsProps {
  speakers?: SummitSpeakersContent;
  panelDiscussion?: SummitPanelDiscussionContent;
  participatingSchools?: SummitParticipatingSchoolsContent;
  videos?: SummitVideosContent;
  registration?: SummitCtaContent;
}

export default function SummitInteractiveSections({
  speakers: propSpeakers,
  panelDiscussion: propPanelDiscussion,
  participatingSchools: propParticipatingSchools,
  videos: propVideos,
  registration: propRegistration,
}: SummitInteractiveSectionsProps = {}) {
  const speakers = propSpeakers || SUMMIT_CONTENT.speakers;
  const panelDiscussion =
    propPanelDiscussion || SUMMIT_CONTENT.panelDiscussion;
  const participatingSchools =
    propParticipatingSchools || SUMMIT_CONTENT.participatingSchools;
  const videos = propVideos || SUMMIT_CONTENT.videos;
  const registration = propRegistration || SUMMIT_CONTENT.registration;

  const speakerList =
    speakers.items && speakers.items.length > 0
      ? speakers.items
      : SUMMIT_CONTENT.speakers.items;

  const panelMembers =
    panelDiscussion.items && panelDiscussion.items.length > 0
      ? panelDiscussion.items
      : SUMMIT_CONTENT.panelDiscussion.items;

  // Separate Moderators (Left Frame) and Panelists (Right Main Frame)
  const explicitModerators = panelMembers.filter((m) =>
    m.role?.toLowerCase().includes("moderator")
  );
  const explicitPanelists = panelMembers.filter(
    (m) => !m.role?.toLowerCase().includes("moderator")
  );
  const moderators =
    explicitModerators.length > 0
      ? explicitModerators
      : panelMembers.slice(0, 1);
  const panelists =
    explicitModerators.length > 0
      ? explicitPanelists
      : panelMembers.slice(1);

  const schoolList =
    participatingSchools.items && participatingSchools.items.length > 0
      ? participatingSchools.items
      : SUMMIT_CONTENT.participatingSchools.items;

  // Ensure each half of the full-width infinite marquee has at least 12 cards so even 2K/4K full-width screens never have gaps
  const repeatFactor = Math.max(
    1,
    Math.ceil(12 / Math.max(schoolList.length, 1))
  );
  const singleHalfSchools = Array.from({ length: repeatFactor }).flatMap(
    (_, rIdx) =>
      schoolList.map((school, sIdx) => ({
        ...school,
        _trackKey: `r${rIdx}-s${sIdx}-${school.id}`,
      }))
  );

  return (
    <>
      {/* ────────────────────────────────────────────────────────── */}
      {/* 5. SPEAKERS & FACILITATORS                                */}
      {/* ────────────────────────────────────────────────────────── */}
      <section
        className="w-full py-9 sm:py-12 lg:py-14 relative overflow-hidden scroll-mt-20 md:scroll-mt-28"
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
                  className={`h-1.5 w-full bg-gradient-to-r ${
                    spk.topAccent ||
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
                      decoding="async"
                      width={400}
                      height={400}
                    />
                  </div>

                  {/* Speaker Information Body */}
                  <div className="w-full sm:w-[62%] lg:w-[64%] p-5 sm:p-7 lg:p-8 flex flex-col justify-center flex-1">
                    <div>
                      {/* Speaker Badge */}
                      <span
                        className={`text-[10px] sm:text-[10.5px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                          spk.badgeColor ||
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
      {/* 5B. PANEL DISCUSSION — COMPACT, EQUAL-SIZE ALIGNED CARDS  */}
      {/* ────────────────────────────────────────────────────────── */}
      <section
        className="w-full py-9 sm:py-12 lg:py-14 relative overflow-hidden scroll-mt-20 md:scroll-mt-28"
        id="panel-discussion"
      >
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-[#D7F5EF]" />
        <div className="absolute -top-28 left-1/4 w-72 h-72 rounded-full bg-[#D7F5EF]/45 blur-3xl pointer-events-none transform-gpu" />
        <div className="absolute -bottom-28 right-1/4 w-72 h-72 rounded-full bg-[#DDEFF7]/45 blur-3xl pointer-events-none transform-gpu" />

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-3xl mx-auto mb-8 sm:mb-11 transform-gpu"
          >
            {panelDiscussion.eyebrow ? (
              <div className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest text-[#FF7900] mb-2.5">
                <span className="w-5 h-[2px] bg-[#FF7900] inline-block" />
                <span>{panelDiscussion.eyebrow}</span>
                <span className="w-5 h-[2px] bg-[#FF7900] inline-block" />
              </div>
            ) : null}

            <h2 className="font-serif font-extrabold text-2xl sm:text-4xl lg:text-5xl text-[#102E4D] tracking-tight leading-tight">
              {panelDiscussion.heading}
            </h2>
            <div className="w-20 h-1 bg-[#FFC400] mx-auto mt-3.5 rounded-full" />

            {panelDiscussion.subtitle ? (
              <p className="mt-4 text-xs sm:text-base lg:text-lg font-bold text-[#1B3A5C] max-w-2xl mx-auto leading-relaxed">
                {panelDiscussion.subtitle}
              </p>
            ) : null}
          </motion.div>

          {/* Side-by-Side Framed Layout: Left Brand Navy Blue Moderator Card + Right Brand Orange Unified Panelists Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-3xl bg-white border border-[#D7F5EF] shadow-md p-5 sm:p-7 lg:p-8 overflow-hidden"
          >
            {/* Top Signature Accent Bar matching Speakers & Objectives */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#102E4D] via-[#FFC400] to-[#FF7900]" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-7 items-stretch pt-3 relative z-10">
              {/* LEFT FRAME: MODERATOR(S) — BRAND NAVY BLUE THEME */}
              <div className="lg:col-span-4 xl:col-span-3 flex flex-col">
                <div className="relative h-full rounded-2xl border-2 border-[#102E4D]/30 bg-white pt-8 pb-5 px-4 sm:px-5 flex flex-col justify-between shadow-xs">
                  {/* Top Border Cutout Pill ("Moderator" / "Moderators") in Brand Navy Blue */}
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                    <div className="px-5 py-1 rounded-full bg-[#102E4D] text-[#FFC400] font-serif font-extrabold text-xs sm:text-sm uppercase tracking-widest shadow-xs ring-4 ring-white whitespace-nowrap">
                      {moderators.length > 1 ? "Moderators" : "Moderator"}
                    </div>
                  </div>

                  {/* Moderator Cards Stack (1 or 2+ Moderators, expanding vertically to match Panelists height) */}
                  <div
                    className={`flex-1 flex flex-col ${
                      moderators.length > 1 ? "gap-5" : ""
                    } h-full`}
                  >
                    {moderators.map((mod, mIdx) => (
                      <div
                        key={mod.id || `mod-${mIdx}`}
                        className="flex-1 flex flex-col group"
                      >
                        {/* Full-Covered Portrait Container that Expands with Card Height */}
                        <div className="relative flex-1 w-full min-h-[250px] sm:min-h-[270px] rounded-xl overflow-hidden border border-[#D7F5EF] bg-[#EAF6F3] shadow-2xs">
                          <img
                            src={mod.image || "/Submit/Panalist/moderator.jpg"}
                            alt={mod.name}
                            className="absolute inset-0 w-full h-full object-cover object-top select-none group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>

                        {/* Moderator Details Below Image */}
                        <div className="pt-4 text-center shrink-0">
                          <h4 className="font-serif font-extrabold text-lg sm:text-xl text-[#102E4D] group-hover:text-[#FF7900] transition-colors leading-snug">
                            {mod.name}
                          </h4>
                          <div className="w-10 h-0.5 bg-[#102E4D] rounded-full my-1.5 mx-auto opacity-80" />
                          <p className="text-xs sm:text-[13px] font-semibold text-slate-600 leading-snug whitespace-pre-line">
                            {mod.designation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT FRAME: ALL PANELISTS IN ONE UNIFIED MAIN CARD — BRAND ORANGE THEME */}
              <div className="lg:col-span-8 xl:col-span-9 flex flex-col">
                <div className="relative h-full rounded-2xl border-2 border-[#FF7900]/35 bg-white pt-8 pb-6 px-4 sm:px-6 lg:px-7 flex flex-col justify-center shadow-xs">
                  {/* Top Border Cutout Pill ("Panelists") in Brand Orange */}
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                    <div className="px-6 py-1 rounded-full bg-[#FF7900] text-white font-serif font-extrabold text-xs sm:text-sm uppercase tracking-widest shadow-xs ring-4 ring-white whitespace-nowrap">
                      Panelists
                    </div>
                  </div>

                  {/* Unified Panelists Grid Inside One Main Card */}
                  <div
                    className={`grid grid-cols-1 ${
                      panelists.length === 1
                        ? "sm:grid-cols-1 max-w-sm"
                        : panelists.length === 2
                        ? "sm:grid-cols-2 max-w-2xl"
                        : panelists.length === 4
                        ? "sm:grid-cols-2 xl:grid-cols-4"
                        : "sm:grid-cols-2 md:grid-cols-3"
                    } gap-4 sm:gap-5 w-full mx-auto items-stretch my-auto`}
                  >
                    {panelists.map((panelist, pIdx) => (
                      <div
                        key={panelist.id || `${panelist.name}-${pIdx}`}
                        className="relative rounded-2xl bg-[#FAFCFB] border border-[#D7F5EF] hover:border-[#FFC400] p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col items-center justify-between text-center group overflow-hidden"
                      >
                        {/* Top Brand Orange Accent Bar */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF7900] to-[#FFC400]" />

                        <div className="flex flex-col items-center w-full pt-1">
                          {/* Circular Portrait with Subtle Brand Orange & Mint Border */}
                          <div className="w-28 h-28 sm:w-30 sm:h-30 rounded-full overflow-hidden border-[3px] border-[#FF7900]/25 ring-4 ring-[#EAF6F3] shadow-sm bg-[#EAF6F3] mb-3.5 shrink-0 group-hover:scale-105 group-hover:border-[#FF7900] transition-all duration-200">
                            <img
                              src={panelist.image || "/anonymous-female.svg"}
                              alt={panelist.name}
                              className="w-full h-full object-cover object-top select-none"
                              loading="lazy"
                              decoding="async"
                              width={160}
                              height={160}
                            />
                          </div>
                        </div>

                        {/* Panelist Name & Designation */}
                        <div className="w-full flex-1 flex flex-col items-center justify-center">
                          <h4 className="font-serif font-extrabold text-base sm:text-[17px] text-[#102E4D] group-hover:text-[#FF7900] transition-colors leading-snug">
                            {panelist.name}
                          </h4>

                          <div className="w-8 h-0.5 bg-[#FF7900] rounded-full my-2 opacity-80" />

                          <p className="text-xs sm:text-[12.5px] font-semibold text-slate-600 leading-snug max-w-[235px] mx-auto whitespace-pre-line">
                            {panelist.designation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 5C. PARTICIPATING SCHOOLS — FULL-WIDTH CONTINUOUS SLIDER   */}
      {/* ────────────────────────────────────────────────────────── */}
      <section
        className="w-full py-9 sm:py-12 lg:py-14 relative overflow-hidden scroll-mt-20 md:scroll-mt-28"
        id="participating-schools"
      >
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-[#D7F5EF]" />
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-96 h-56 bg-[#D7F5EF]/45 rounded-full blur-3xl pointer-events-none transform-gpu" />

        {/* Centered Section Header — Matching Typography & Scale of All Summit Sections */}
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 transform-gpu"
          >
            {participatingSchools.eyebrow ? (
              <div className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest text-[#FF7900] mb-2">
                <span className="w-5 h-[2px] bg-[#FF7900] inline-block" />
                <span>{participatingSchools.eyebrow}</span>
                <span className="w-5 h-[2px] bg-[#FF7900] inline-block" />
              </div>
            ) : null}

            {participatingSchools.heading ? (
              <>
                <h2 className="font-serif font-extrabold text-2xl sm:text-4xl lg:text-5xl text-[#102E4D] tracking-tight leading-tight">
                  {participatingSchools.heading}
                </h2>
                <div className="w-20 h-1 bg-[#FFC400] mx-auto mt-3.5 rounded-full" />
              </>
            ) : null}

            {participatingSchools.subtext ? (
              <p className="text-xs sm:text-[15px] text-slate-600 leading-relaxed font-normal max-w-3xl mx-auto mt-4 sm:mt-5">
                {participatingSchools.subtext}
              </p>
            ) : null}
          </motion.div>
        </div>

        {/* Full-Viewport-Width Edge-to-Edge Marquee Slider Track */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full overflow-hidden border-y border-[#D7F5EF] bg-white/95 shadow-md py-6 sm:py-8 z-10"
        >
          {/* Top Subtle Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#102E4D] via-[#FFC400] to-[#FF7900] opacity-85" />

          {/* Left & Right Soft Edge Fade Overlays */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-24 lg:w-32 bg-gradient-to-r from-white via-white/85 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-24 lg:w-32 bg-gradient-to-l from-white via-white/85 to-transparent z-10" />

          <div
            className="flex w-max animate-marquee items-center hover:[animation-play-state:paused]"
            style={{ "--marquee-duration": "40s" } as React.CSSProperties}
          >
            {[0, 1].map((halfIdx) => (
              <div
                key={`marquee-half-${halfIdx}`}
                className="flex items-center shrink-0"
                aria-hidden={halfIdx === 1 ? true : undefined}
              >
                {singleHalfSchools.map((school) => (
                  <div
                    key={`half-${halfIdx}-${school._trackKey}`}
                    title={school.name}
                    className="mx-3 sm:mx-4 flex h-28 w-52 sm:h-32 sm:w-60 shrink-0 items-center justify-center rounded-2xl border border-[#D7F5EF] hover:border-[#FFC400] bg-white px-5 py-3.5 shadow-sm hover:shadow-lg transition-all duration-200 group"
                  >
                    <img
                      src={school.logo}
                      alt={halfIdx === 0 ? school.name : ""}
                      className="max-h-20 sm:max-h-24 max-w-[170px] sm:max-w-[205px] w-auto h-auto object-contain object-center select-none group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 6. WATCH & RELIVE — EMBEDDED VIDEO PLAYERS                 */}
      {/* ────────────────────────────────────────────────────────── */}
      <section
        className="w-full py-9 sm:py-12 lg:py-14 relative overflow-hidden scroll-mt-20 md:scroll-mt-28"
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

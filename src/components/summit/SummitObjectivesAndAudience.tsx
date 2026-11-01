"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Target,
  Lightbulb,
  Compass,
  Users,
  Building2,
  GraduationCap,
  BookOpen,
  HeartHandshake,
  Rocket,
  CheckCircle2,
} from "lucide-react";
import { SUMMIT_CONTENT } from "@/content/summit";

const OBJECTIVE_ICONS = [Target, Lightbulb, Compass, Users];

const OBJECTIVE_THEMES = [
  {
    numBadge: "bg-[#102E4D] text-[#FFC400]",
    iconColor: "text-[#FF7900]",
    iconBg: "bg-[#FF7900]/10 border-[#FF7900]/25",
    tag: "Strategic Focus",
    takeaway: "1 Wildly Important Goal (WIG)",
  },
  {
    numBadge: "bg-[#FF7900] text-white",
    iconColor: "text-[#FFC400]",
    iconBg: "bg-[#FFC400]/15 border-[#FFC400]/30",
    tag: "Proven Practice",
    takeaway: "Real Pakistani Case Studies",
  },
  {
    numBadge: "bg-[#16A34A] text-white",
    iconColor: "text-[#16A34A]",
    iconBg: "bg-[#16A34A]/10 border-[#16A34A]/25",
    tag: "Cultural Shift",
    takeaway: "Staff & Student Ownership",
  },
  {
    numBadge: "bg-gradient-to-r from-[#FFC400] to-[#FF7900] text-[#001B33]",
    iconColor: "text-[#2563EB]",
    iconBg: "bg-[#2563EB]/10 border-[#2563EB]/25",
    tag: "Peer Alliance",
    takeaway: "Long-Term Regional Network",
  },
];

const AUDIENCE_ROLES = [
  {
    role: "School Owners & Directors",
    icon: Building2,
    badgeText: "Governance & Vision",
    badgeStyle: "bg-[#102E4D] text-[#FFC400] border-[#102E4D]/30",
    iconColor: "text-[#102E4D]",
    iconBg: "bg-[#102E4D]/10 border-[#102E4D]/20",
    topGradient: "from-[#102E4D] via-[#001B33] to-[#FFC400]",
    tagline: "Strategic Vision & Governance",
    deliverable: "Align institutional vision, strategic goals, and long-term reputational excellence across campuses.",
    takeaway: "Institutional Vision & Longevity",
  },
  {
    role: "Principals & School Heads",
    icon: GraduationCap,
    badgeText: "Executive Leadership",
    badgeStyle: "bg-[#16A34A] text-white border-[#16A34A]/30",
    iconColor: "text-[#16A34A]",
    iconBg: "bg-[#16A34A]/10 border-[#16A34A]/25",
    topGradient: "from-[#16A34A] via-[#15803D] to-[#22C55E]",
    tagline: "Culture & Instructional Leadership",
    deliverable: "Lead instructional culture, empower section coordinators, and sustain staff accountability rhythms.",
    takeaway: "Whole-School Culture Alignment",
  },
  {
    role: "Educators & Teacher Leaders",
    icon: BookOpen,
    badgeText: "Classroom & Pedagogy",
    badgeStyle: "bg-[#FF7900] text-white border-[#FF7900]/30",
    iconColor: "text-[#FF7900]",
    iconBg: "bg-[#FF7900]/10 border-[#FF7900]/25",
    topGradient: "from-[#FF7900] via-[#E56D00] to-[#FFC400]",
    tagline: "Pedagogy & Student Agency",
    deliverable: "Transform classroom dynamics, mentor student agency, and bring leadership principles alive daily.",
    takeaway: "Student Ownership in Practice",
  },
  {
    role: "Well-being & Student Support",
    icon: HeartHandshake,
    badgeText: "Pastoral & Well-Being",
    badgeStyle: "bg-[#E11D48] text-white border-[#E11D48]/30",
    iconColor: "text-[#E11D48]",
    iconBg: "bg-[#E11D48]/10 border-[#E11D48]/25",
    topGradient: "from-[#E11D48] via-[#BE123C] to-[#FB7185]",
    tagline: "Whole-Child Flourishing",
    deliverable: "Foster psychological safety, emotional resilience, and constructive student-faculty rapport.",
    takeaway: "Safe & Thriving School Climate",
  },
  {
    role: "Curriculum & Academic Leads",
    icon: Compass,
    badgeText: "Academic Strategy",
    badgeStyle: "bg-[#2563EB] text-white border-[#2563EB]/30",
    iconColor: "text-[#2563EB]",
    iconBg: "bg-[#2563EB]/10 border-[#2563EB]/25",
    topGradient: "from-[#2563EB] via-[#1D4ED8] to-[#60A5FA]",
    tagline: "Academic & Competency Alignment",
    deliverable: "Embed character competencies seamlessly alongside academic rigor and national benchmarks.",
    takeaway: "Rigorous Character Integration",
  },
  {
    role: "Education Changemakers",
    icon: Rocket,
    badgeText: "Innovation & Ecosystem",
    badgeStyle: "bg-[#7C3AED] text-white border-[#7C3AED]/30",
    iconColor: "text-[#7C3AED]",
    iconBg: "bg-[#7C3AED]/10 border-[#7C3AED]/25",
    topGradient: "from-[#7C3AED] via-[#6D28D9] to-[#FF7900]",
    tagline: "Trustees & Visionary Partners",
    deliverable: "Dedicate guidance, energy, and community partnerships to elevate whole-school transformation.",
    takeaway: "Catalytic School Innovation",
  },
];

export default function SummitObjectivesAndAudience() {
  const { objectives, audience } = SUMMIT_CONTENT;

  return (
    <>
      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. OBJECTIVES SECTION ("What this summit is for")         */}
      {/* ────────────────────────────────────────────────────────── */}
      <section
        className="w-full py-10 sm:py-14 relative overflow-hidden scroll-mt-20"
        id="objective"
      >
        {/* Subtle top divider line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-[#D7F5EF]" />

        {/* Ambient GPU blur spheres */}
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[#D7F5EF]/60 blur-3xl pointer-events-none transform-gpu" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-[#DDEFF7]/60 blur-3xl pointer-events-none transform-gpu" />

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 transform-gpu"
          >
            <div className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest text-[#FF7900] mb-3">
              <span className="w-6 h-[2px] bg-[#FF7900] inline-block" />
              <span>{objectives.eyebrow}</span>
              <span className="w-6 h-[2px] bg-[#FF7900] inline-block" />
            </div>

            <h2 className="font-serif font-extrabold text-2xl sm:text-4xl lg:text-5xl text-[#102E4D] tracking-tight">
              {objectives.heading}
            </h2>
            <div className="w-20 h-1 bg-[#FFC400] mx-auto mt-3.5 rounded-full" />

            <p className="text-xs sm:text-base text-slate-600 mt-3 sm:mt-4 leading-relaxed font-normal">
              A high-impact, one-day working summit equipping educational leaders with practical frameworks, peer case studies, and execution scorecards to transform school culture.
            </p>
          </motion.div>

          {/* 4 Professional Equal-Height Objective Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-stretch">
            {objectives.items.map((obj, idx) => {
              const IconComp = OBJECTIVE_ICONS[idx] || Target;
              const theme = OBJECTIVE_THEMES[idx] || OBJECTIVE_THEMES[0];

              return (
                <motion.div
                  key={obj.title}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{
                    duration: 0.45,
                    delay: 0.06 * idx,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={{ y: -5, transition: { duration: 0.18 } }}
                  className="bg-white rounded-2xl border border-[#D7F5EF] p-5 sm:p-7 shadow-md hover:shadow-xl hover:border-[#FFC400] transition-all duration-200 flex flex-col justify-between group transform-gpu cursor-default"
                >
                  <div>
                    {/* Top Row: Number Badge + Category Icon */}
                    <div className="flex items-center justify-between mb-5">
                      <div
                        className={`font-num font-extrabold text-xs px-2.5 py-1 rounded-md shadow-2xs ${theme.numBadge}`}
                      >
                        0{idx + 1}
                      </div>

                      <div
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center ${theme.iconBg} ${theme.iconColor} group-hover:scale-105 transition-transform duration-200`}
                      >
                        <IconComp className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Category Tag */}
                    <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                      {theme.tag}
                    </span>

                    {/* Card Title */}
                    <h3 className="font-serif font-bold text-lg sm:text-[19px] text-[#102E4D] group-hover:text-[#FF7900] transition-colors leading-snug tracking-tight mb-2.5">
                      {obj.title}
                    </h3>

                    {/* Card Description */}
                    <p className="text-xs sm:text-[13.5px] text-slate-600 leading-relaxed font-normal">
                      {obj.text}
                    </p>
                  </div>

                  {/* Card Bottom Outcome */}
                  <div className="pt-4 mt-5 border-t border-slate-100 flex items-center gap-1.5 text-[11px] sm:text-[11.5px] font-bold text-[#102E4D]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                    <span className="truncate">{theme.takeaway}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. WHO SHOULD ATTEND? ("This day is built for you")        */}
      {/* ────────────────────────────────────────────────────────── */}
      <section
        className="w-full py-10 sm:py-14 relative overflow-hidden scroll-mt-20"
        id="audience"
      >
        {/* Subtle top divider line matching other sections */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-[#D7F5EF]" />

        {/* Ambient GPU blur spheres */}
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-[#D7F5EF]/60 blur-3xl pointer-events-none transform-gpu" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-[#DDEFF7]/60 blur-3xl pointer-events-none transform-gpu" />

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 transform-gpu"
          >
            <div className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest text-[#FF7900] mb-3">
              <span className="w-6 h-[2px] bg-[#FF7900] inline-block" />
              <span>{audience.eyebrow}</span>
              <span className="w-6 h-[2px] bg-[#FF7900] inline-block" />
            </div>

            <h2 className="font-serif font-extrabold text-2xl sm:text-4xl lg:text-5xl text-[#102E4D] tracking-tight">
              {audience.heading}
            </h2>
            <div className="w-20 h-1 bg-[#FFC400] mx-auto mt-3.5 rounded-full" />

            {/* Stylized Executive Pull Quote Box */}
            <div className="mt-5 sm:mt-6 max-w-3xl mx-auto p-3.5 sm:p-5 rounded-2xl bg-white border border-[#C8EFE6] shadow-sm">
              <p className="font-serif italic text-xs sm:text-base text-[#102E4D] font-semibold leading-relaxed">
                &ldquo;{audience.pullQuote}&rdquo;
              </p>
            </div>
          </motion.div>

          {/* 6 Balanced, Colorful Audience Cards (3x2 Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch max-w-6xl mx-auto">
            {AUDIENCE_ROLES.map((item, idx) => {
              const RoleIcon = item.icon;

              return (
                <motion.div
                  key={item.role}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{
                    duration: 0.45,
                    delay: 0.05 * idx,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={{ y: -5, transition: { duration: 0.18 } }}
                  className="rounded-2xl bg-white border border-[#D7F5EF] hover:border-[#FFC400] shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between group transform-gpu cursor-default h-full overflow-hidden"
                >
                  {/* Colorful Top Accent Stripe */}
                  <div
                    className={`h-1.5 w-full bg-gradient-to-r ${item.topGradient}`}
                  />

                  <div className="p-5 sm:p-7 flex flex-col justify-between flex-1">
                    <div>
                      {/* Top Row: Colorful Icon + Category Badge */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div
                          className={`w-12 h-12 rounded-xl border flex items-center justify-center ${item.iconBg} ${item.iconColor} group-hover:scale-105 transition-transform duration-200 shadow-2xs`}
                        >
                          <RoleIcon className="w-6 h-6" />
                        </div>

                        <span
                          className={`text-[10px] sm:text-[10.5px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${item.badgeStyle}`}
                        >
                          {item.badgeText}
                        </span>
                      </div>

                      {/* Role Title */}
                      <h3 className="font-serif font-extrabold text-base sm:text-lg text-[#102E4D] group-hover:text-[#FF7900] transition-colors leading-snug tracking-tight">
                        {item.role}
                      </h3>

                      {/* Tagline */}
                      <span className="text-xs font-bold text-[#FF7900] block mt-1">
                        {item.tagline}
                      </span>

                      {/* Deliverable Description */}
                      <p className="text-xs sm:text-[13.5px] text-slate-600 mt-2.5 leading-relaxed font-normal">
                        {item.deliverable}
                      </p>
                    </div>

                    {/* Bottom Takeaway Strip (Zero Generic Boilerplate) */}
                    <div className="pt-3.5 mt-5 border-t border-slate-100 flex items-center gap-2 text-[11.5px] font-bold text-[#102E4D]">
                      <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                      <span className="truncate">{item.takeaway}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

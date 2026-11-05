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
  MessageSquareText,
  TrendingUp,
} from "lucide-react";
import {
  SUMMIT_CONTENT,
  type SummitObjectivesContent,
  type SummitAudienceContent,
} from "@/content/summit";

const OBJECTIVE_ICONS = [Compass, MessageSquareText, TrendingUp];

const OBJECTIVE_THEMES = [
  {
    numBadge: "bg-[#102E4D] text-[#FFC400]",
    iconColor: "text-[#FF7900]",
    iconBg: "bg-[#FF7900]/10 border-[#FF7900]/25",
    takeaway: "Practices • Perspectives • Possibilities",
  },
  {
    numBadge: "bg-[#FF7900] text-white",
    iconColor: "text-[#FFC400]",
    iconBg: "bg-[#FFC400]/15 border-[#FFC400]/30",
    takeaway: "LiM Schools • Journeys • Learning",
  },
  {
    numBadge: "bg-[#16A34A] text-white",
    iconColor: "text-[#16A34A]",
    iconBg: "bg-[#16A34A]/10 border-[#16A34A]/25",
    takeaway: "Purposeful Leadership & Intentional Action",
  },
];

const AUDIENCE_ROLES = [
  {
    role: "School Owners and Directors",
    icon: Building2,
    iconColor: "text-[#102E4D]",
    iconBg: "bg-[#102E4D]/10 border-[#102E4D]/20",
    topGradient: "from-[#102E4D] to-[#FFC400]",
  },
  {
    role: "Principals and School Heads",
    icon: GraduationCap,
    iconColor: "text-[#16A34A]",
    iconBg: "bg-[#16A34A]/10 border-[#16A34A]/25",
    topGradient: "from-[#16A34A] to-[#22C55E]",
  },
  {
    role: "Educators and Teacher Leaders",
    icon: BookOpen,
    iconColor: "text-[#FF7900]",
    iconBg: "bg-[#FF7900]/10 border-[#FF7900]/25",
    topGradient: "from-[#FF7900] to-[#FFC400]",
  },
  {
    role: "Well-being and Student support Leaders",
    icon: HeartHandshake,
    iconColor: "text-[#E11D48]",
    iconBg: "bg-[#E11D48]/10 border-[#E11D48]/25",
    topGradient: "from-[#E11D48] to-[#FB7185]",
  },
  {
    role: "Curriculum and Academic Leaders",
    icon: Compass,
    iconColor: "text-[#2563EB]",
    iconBg: "bg-[#2563EB]/10 border-[#2563EB]/25",
    topGradient: "from-[#2563EB] to-[#60A5FA]",
  },
];

interface SummitObjectivesAndAudienceProps {
  objectives?: SummitObjectivesContent;
  audience?: SummitAudienceContent;
}

const AUDIENCE_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  building: Building2,
  graduation: GraduationCap,
  book: BookOpen,
  heart: HeartHandshake,
  compass: Compass,
};

export default function SummitObjectivesAndAudience({
  objectives: propObjectives,
  audience: propAudience,
}: SummitObjectivesAndAudienceProps = {}) {
  const objectives = propObjectives || SUMMIT_CONTENT.objectives;
  const audience = propAudience || SUMMIT_CONTENT.audience;

  return (
    <>
      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. OBJECTIVES SECTION ("What this summit is for")         */}
      {/* ────────────────────────────────────────────────────────── */}
      <section
        className="w-full py-9 sm:py-12 lg:py-14 relative overflow-hidden scroll-mt-20 md:scroll-mt-28"
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
            className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 transform-gpu"
          >
            {objectives.eyebrow ? (
              <div className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest text-[#FF7900] mb-3">
                <span className="w-6 h-[2px] bg-[#FF7900] inline-block" />
                <span>{objectives.eyebrow}</span>
                <span className="w-6 h-[2px] bg-[#FF7900] inline-block" />
              </div>
            ) : null}

            <h2 className="font-serif font-extrabold text-2xl sm:text-4xl lg:text-5xl text-[#102E4D] tracking-tight">
              {objectives.heading}
            </h2>
            <div className="w-20 h-1 bg-[#FFC400] mx-auto mt-3.5 mb-5 sm:mb-6 rounded-full" />

            <p className="text-xs sm:text-[15px] text-slate-600 leading-relaxed font-normal max-w-3xl mx-auto">
              {objectives.body}
            </p>
          </motion.div>

          {/* 3 Compact Theme Cards: Discover • Voice • Impact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-stretch max-w-5xl mx-auto">
            {objectives.items.map((obj, idx) => {
              const IconComp = OBJECTIVE_ICONS[idx] || Target;
              const theme = OBJECTIVE_THEMES[idx] || OBJECTIVE_THEMES[0];

              return (
                <motion.div
                  key={obj.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{
                    duration: 0.45,
                    delay: 0.08 * idx,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={{ y: -4, transition: { duration: 0.18 } }}
                  className="bg-white rounded-2xl border border-[#D7F5EF] hover:border-[#FFC400] p-5 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-start group transform-gpu cursor-default relative overflow-hidden"
                >
                  {/* Top Gradient Accent on Hover */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#10B981] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                  {/* Top Row: Number Badge + Category Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`font-num font-extrabold text-[11px] px-2.5 py-1 rounded-md shadow-2xs ${theme.numBadge}`}
                    >
                      0{idx + 1}
                    </div>

                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center ${theme.iconBg} ${theme.iconColor} group-hover:scale-105 transition-transform duration-200 shadow-2xs`}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Card Title */}
                  <h3 className="font-serif font-black text-lg sm:text-xl text-[#102E4D] group-hover:text-[#FF7900] transition-colors leading-snug tracking-wider mb-2">
                    {obj.title}
                  </h3>

                  {/* Card Description */}
                  <p className="text-xs sm:text-[13.5px] text-slate-600 leading-relaxed font-normal">
                    {obj.text}
                  </p>
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
        className="w-full py-9 sm:py-12 lg:py-14 relative overflow-hidden scroll-mt-20 md:scroll-mt-28"
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
            className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 transform-gpu"
          >
            {audience.eyebrow ? (
              <div className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest text-[#FF7900] mb-3">
                <span className="w-6 h-[2px] bg-[#FF7900] inline-block" />
                <span>{audience.eyebrow}</span>
                <span className="w-6 h-[2px] bg-[#FF7900] inline-block" />
              </div>
            ) : null}

            <h2 className="font-serif font-extrabold text-2xl sm:text-4xl lg:text-5xl text-[#102E4D] tracking-tight">
              {audience.heading}
            </h2>
            <div className="w-20 h-1 bg-[#FFC400] mx-auto mt-3.5 rounded-full" />

            {/* Stylized Executive Pull Quote Box */}
            <div className="mt-5 sm:mt-6 max-w-3xl mx-auto p-4 sm:p-5 rounded-2xl bg-white border border-[#C8EFE6] shadow-sm">
              <p className="font-serif italic text-xs sm:text-base text-[#102E4D] font-semibold leading-relaxed">
                &ldquo;{audience.pullQuote.replace(/^[“”"]+|[“”"]+$/g, "")}&rdquo;
              </p>
            </div>
          </motion.div>

          {/* Compact, Balanced Audience Role Cards (Icon + Title Only) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 items-stretch max-w-6xl mx-auto">
            {audience.items.map((item, idx) => {
              const defaultStyle = AUDIENCE_ROLES[idx % AUDIENCE_ROLES.length];
              const RoleIcon = AUDIENCE_ICON_MAP[item.icon] || defaultStyle.icon;
              const topGradient = item.topGradient || defaultStyle.topGradient;

              return (
                <motion.div
                  key={`${item.role}-${idx}`}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{
                    duration: 0.4,
                    delay: 0.05 * idx,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={{ y: -4, transition: { duration: 0.18 } }}
                  className={`rounded-2xl bg-white border border-[#D7F5EF] hover:border-[#FFC400] shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col items-center text-center justify-center p-5 sm:p-6 group transform-gpu cursor-default relative overflow-hidden ${
                    idx === 4 ? "sm:col-span-2 md:col-span-1" : ""
                  }`}
                >
                  {/* Colorful Top Accent Stripe */}
                  <div
                    className={`h-1 w-full absolute top-0 left-0 right-0 bg-gradient-to-r ${topGradient}`}
                  />

                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${defaultStyle.iconBg} ${defaultStyle.iconColor} group-hover:scale-110 transition-transform duration-200 shadow-2xs mb-3.5`}
                  >
                    <RoleIcon className="w-6 h-6" />
                  </div>

                  {/* Title Only */}
                  <h3 className="font-serif font-bold text-sm sm:text-[15px] text-[#102E4D] group-hover:text-[#FF7900] transition-colors leading-snug tracking-tight">
                    {item.role}
                  </h3>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

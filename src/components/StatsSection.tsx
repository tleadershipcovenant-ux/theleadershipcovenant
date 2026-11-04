"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";
import {
  MdSchool,
  MdPublic,
  MdLocationCity,
  MdPlace,
  MdGroups,
  MdHistoryEdu,
  MdWorkspacePremium,
} from "react-icons/md";
import { useHomePageContent } from "@/lib/cms-client";
import type { StatIconKey } from "@/content/home";

const STAT_ICONS: Record<StatIconKey, React.ComponentType<{ className?: string }>> = {
  school: MdSchool,
  public: MdPublic,
  city: MdLocationCity,
  place: MdPlace,
  groups: MdGroups,
  history: MdHistoryEdu,
  premium: MdWorkspacePremium,
};

const TONE_STYLES = {
  gold: {
    cardBorder: "border-[#FFC400]/30 hover:border-[#FFC400]/70",
    glow: "bg-[#FFC400]/10",
    iconBox: "bg-[#FFC400]/15 text-[#FFC400] border-[#FFC400]/30",
    accentNumber: "text-[#FFC400]",
    accentTop: "from-[#FFC400] to-[#E5A800]",
  },
  orange: {
    cardBorder: "border-[#FF7900]/30 hover:border-[#FF7900]/70",
    glow: "bg-[#FF7900]/10",
    iconBox: "bg-[#FF7900]/15 text-[#FF7900] border-[#FF7900]/30",
    accentNumber: "text-[#FF7900]",
    accentTop: "from-[#FF7900] to-[#E56D00]",
  },
  mint: {
    cardBorder: "border-[#16A34A]/30 hover:border-[#22C55E]/70",
    glow: "bg-[#16A34A]/10",
    iconBox: "bg-[#16A34A]/15 text-[#22C55E] border-[#16A34A]/30",
    accentNumber: "text-[#22C55E]",
    accentTop: "from-[#22C55E] to-[#16A34A]",
  },
  cyan: {
    cardBorder: "border-[#0284C7]/30 hover:border-[#38BDF8]/70",
    glow: "bg-[#0284C7]/10",
    iconBox: "bg-[#0284C7]/15 text-[#38BDF8] border-[#0284C7]/30",
    accentNumber: "text-[#38BDF8]",
    accentTop: "from-[#38BDF8] to-[#0284C7]",
  },
};

export default function StatsSection() {
  const { stats } = useHomePageContent();
  const [activeTab, setActiveTab] = useState(0);
  const tabs = stats.tabs;
  const currentTabData = tabs[activeTab] ?? tabs[0];
  if (!currentTabData) return null;

  return (
    <section className="w-full py-6 sm:py-8 lg:py-10 relative overflow-hidden" id="stats">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Floating Compact Rounded Master Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#001B33] via-[#0B2540] to-[#001B33] text-white p-5 sm:p-7 lg:p-8 shadow-2xl border border-white/15">
          {/* Top Gold Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFC400] to-transparent opacity-90" />

          {/* Ambient Glows inside the Card */}
          <div className="absolute -top-24 right-1/4 w-80 h-32 bg-[#FFC400]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 left-1/4 w-80 h-32 bg-[#FF7900]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Segmented Pill Switcher */}
          <div className="flex items-center justify-center mb-5 sm:mb-6 relative z-10">
            <div className="inline-flex items-center p-1 rounded-full bg-white/[0.08] border border-white/15 backdrop-blur-md shadow-inner max-w-full overflow-x-auto">
              {tabs.map((tab, idx) => {
                const isActive = activeTab === idx;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(idx)}
                    className={`relative px-3.5 sm:px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap z-10 ${
                      isActive ? "text-white" : "text-slate-300 hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="statsActivePill"
                        className="absolute inset-0 bg-gradient-to-r from-[#FF7900] to-[#E56D00] rounded-full shadow-md -z-10"
                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                      />
                    )}
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Metrics Grid Cards with Full Formatted Numbers */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTabData.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 items-stretch relative z-10"
            >
              {currentTabData.stats.map((stat, idx) => {
                const Icon = STAT_ICONS[stat.icon] || MdSchool;
                const tone = TONE_STYLES[stat.tone] || TONE_STYLES.gold;

                return (
                  <div
                    key={`${currentTabData.id}-${stat.label}-${idx}`}
                    className={`relative overflow-hidden rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] backdrop-blur-sm border ${tone.cardBorder} p-4 sm:p-5 transition-all duration-300 flex flex-col items-center text-center shadow-lg hover:-translate-y-0.5 group`}
                  >
                    {/* Top gradient accent line for card */}
                    <div
                      className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${tone.accentTop}`}
                    />

                    {/* Icon container */}
                    <div
                      className={`w-10 h-10 rounded-xl ${tone.iconBox} border flex items-center justify-center mb-2.5 shadow-inner group-hover:scale-105 transition-transform duration-300`}
                    >
                      <Icon className="text-xl" />
                    </div>

                    {/* Exact Formatted Number + Suffix */}
                    <div className="font-num font-extrabold text-2xl sm:text-[28px] lg:text-[30px] text-white tracking-tight leading-none transition-colors flex items-baseline justify-center">
                      <AnimatedCounter target={stat.value} duration={1.1} />
                      <span className={`font-num text-xl sm:text-2xl font-extrabold ml-0.5 ${tone.accentNumber}`}>
                        {stat.suffix}
                      </span>
                    </div>

                    {/* Label */}
                    <div className="text-[11.5px] sm:text-xs font-semibold uppercase tracking-wider text-slate-300 mt-2 leading-snug">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

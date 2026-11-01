"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MdShield,
  MdExplore,
  MdEmojiEvents,
  MdStars,
  MdArrowForward,
} from "react-icons/md";

export default function CoCurricularSection() {
  return (
    <section className="w-full py-16 sm:py-20 lg:py-24 relative overflow-hidden" id="activities">
      {/* Subtle top divider line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-[#D7F5EF]" />

      {/* Background ambient blurs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#D7F5EF]/60 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#DDEFF7]/60 blur-3xl pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Centered Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12 sm:mb-16"
        >
          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#FF7900] mb-2">
            Beyond the Classroom
          </p>
          <h2 className="font-serif font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#102E4D] tracking-tight">
            Cultivating Well-Rounded Leaders
          </h2>
          <div className="w-20 h-1 bg-[#FFC400] mx-auto mt-3.5 rounded-full" />
          <p className="text-sm sm:text-base text-slate-600 mt-3.5 font-medium leading-relaxed">
            Character formation, oratorical eloquence, experiential retreats, and family cohesion are integral to our leadership DNA. We empower every scholar to lead with distinction.
          </p>
        </motion.div>

        {/* 4 Compact Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 items-stretch">
          {/* Card 1: Student Leadership Councils */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="bg-white rounded-2xl border border-[#D7F5EF] shadow-md hover:shadow-xl hover:border-[#FFC400] hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden h-full"
          >
            <div className="h-1 w-full bg-gradient-to-r from-[#102E4D] via-[#FFC400] to-[#FF7900] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-[#EFFBF8] text-[#FF7900] group-hover:bg-[#FF7900] group-hover:text-white flex items-center justify-center shrink-0 border border-[#D7F5EF] transition-colors duration-300 shadow-xs">
                  <MdShield className="text-[24px]" />
                </div>
                <span className="text-[10.5px] font-bold text-[#102E4D] uppercase tracking-wider bg-[#EFFBF8] px-2.5 py-1 rounded-md border border-[#D7F5EF]">
                  Student Voice
                </span>
              </div>

              <div>
                <h3 className="font-serif font-bold text-lg text-[#102E4D] group-hover:text-[#FF7900] transition-colors leading-snug min-h-[44px] flex items-center">
                  Student Leadership Councils
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium mt-1.5 min-h-[54px]">
                  Fostering self-governance, peer mentorship, and schoolwide service through elected student councils and classroom leadership roles.
                </p>
              </div>

              <div className="space-y-1 pt-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Core Facets</div>
                <div className="grid grid-cols-2 gap-1.5 text-xs font-semibold">
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#EFFBF8] border border-[#D7F5EF]">
                    <span className="w-2 h-2 rounded-full bg-[#102E4D] shrink-0" />
                    <span className="text-[#102E4D] text-[11px] font-bold truncate">Student Roles</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#EFFBF8] border border-[#D7F5EF]">
                    <span className="w-2 h-2 rounded-full bg-[#FF7900] shrink-0" />
                    <span className="text-[#102E4D] text-[11px] font-bold truncate">Goal Portfolios</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#EFFBF8] border border-[#D7F5EF]">
                    <span className="w-2 h-2 rounded-full bg-[#102E4D] shrink-0" />
                    <span className="text-[#102E4D] text-[11px] font-bold truncate">Public Speaking</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#EFFBF8] border border-[#D7F5EF]">
                    <span className="w-2 h-2 rounded-full bg-[#FFC400] shrink-0" />
                    <span className="text-[#102E4D] text-[11px] font-bold truncate">Peer Mediation</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0">
              <div className="pt-3 border-t border-slate-100">
                <Link
                  className="text-xs font-bold text-[#102E4D] group-hover:text-[#FF7900] inline-flex items-center gap-1.5 transition-colors"
                  href="/activities"
                >
                  <span>View Student Activities</span>
                  <MdArrowForward className="text-[16px] group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Outdoor Wilderness Camps */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl border border-[#D7F5EF] shadow-md hover:shadow-xl hover:border-[#FFC400] hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden h-full"
          >
            <div className="h-1 w-full bg-gradient-to-r from-[#102E4D] via-[#FFC400] to-[#FF7900] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-[#EFFBF8] text-[#FF7900] group-hover:bg-[#FF7900] group-hover:text-white flex items-center justify-center shrink-0 border border-[#D7F5EF] transition-colors duration-300 shadow-xs">
                  <MdExplore className="text-[24px]" />
                </div>
                <span className="text-[10.5px] font-bold text-[#102E4D] uppercase tracking-wider bg-[#EFFBF8] px-2.5 py-1 rounded-md border border-[#D7F5EF]">
                  Experiential
                </span>
              </div>

              <div>
                <h3 className="font-serif font-bold text-lg text-[#102E4D] group-hover:text-[#FF7900] transition-colors leading-snug min-h-[44px] flex items-center">
                  Outdoor Wilderness Camps
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium mt-1.5 min-h-[54px]">
                  Challenging nature retreats in Swat and Murree designed to instill resilience, team problem-solving, and emotional maturity away from digital noise.
                </p>
              </div>

              <div className="space-y-1 pt-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Highlights</div>
                <div className="grid grid-cols-2 gap-1.5 text-xs font-semibold">
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#EFFBF8] border border-[#D7F5EF]">
                    <span className="w-2 h-2 rounded-full bg-[#102E4D] shrink-0" />
                    <span className="text-[#102E4D] text-[11px] font-bold truncate">Swat Valley</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#EFFBF8] border border-[#D7F5EF]">
                    <span className="w-2 h-2 rounded-full bg-[#FF7900] shrink-0" />
                    <span className="text-[#102E4D] text-[11px] font-bold truncate">Trekking &amp; Grit</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#EFFBF8] border border-[#D7F5EF]">
                    <span className="w-2 h-2 rounded-full bg-[#102E4D] shrink-0" />
                    <span className="text-[#102E4D] text-[11px] font-bold truncate">Team Missions</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#EFFBF8] border border-[#D7F5EF]">
                    <span className="w-2 h-2 rounded-full bg-[#FFC400] shrink-0" />
                    <span className="text-[#102E4D] text-[11px] font-bold truncate">Campfire Debrief</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0">
              <div className="pt-3 border-t border-slate-100">
                <Link
                  className="text-xs font-bold text-[#102E4D] group-hover:text-[#FF7900] inline-flex items-center gap-1.5 transition-colors"
                  href="/activities"
                >
                  <span>Explore Camp Itineraries</span>
                  <MdArrowForward className="text-[16px] group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Card 3: School Impact Summit */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-white rounded-2xl border border-[#D7F5EF] shadow-md hover:shadow-xl hover:border-[#FFC400] hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden h-full"
          >
            <div className="h-1 w-full bg-gradient-to-r from-[#102E4D] via-[#FFC400] to-[#FF7900] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-[#EFFBF8] text-[#FF7900] group-hover:bg-[#FF7900] group-hover:text-white flex items-center justify-center shrink-0 border border-[#D7F5EF] transition-colors duration-300 shadow-xs">
                  <MdEmojiEvents className="text-[24px]" />
                </div>
                <span className="text-[10.5px] font-bold text-[#102E4D] uppercase tracking-wider bg-[#EFFBF8] px-2.5 py-1 rounded-md border border-[#D7F5EF]">
                  National Summit
                </span>
              </div>

              <div>
                <h3 className="font-serif font-bold text-lg text-[#102E4D] group-hover:text-[#FF7900] transition-colors leading-snug min-h-[44px] flex items-center">
                  School Impact Summit 2026
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium mt-1.5 min-h-[54px]">
                  Pakistan&apos;s landmark education leadership summit bringing together 300+ visionary trustees, principals, and thought leaders in Islamabad.
                </p>
              </div>

              <div className="space-y-1 pt-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Summit Stats</div>
                <div className="grid grid-cols-2 gap-1.5 text-xs font-semibold">
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#EFFBF8] border border-[#D7F5EF]">
                    <span className="w-2 h-2 rounded-full bg-[#102E4D] shrink-0" />
                    <span className="text-[#102E4D] text-[11px] font-bold truncate">300+ Delegates</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#EFFBF8] border border-[#D7F5EF]">
                    <span className="w-2 h-2 rounded-full bg-[#FF7900] shrink-0" />
                    <span className="text-[#102E4D] text-[11px] font-bold truncate">20+ Keynotes</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#EFFBF8] border border-[#D7F5EF]">
                    <span className="w-2 h-2 rounded-full bg-[#102E4D] shrink-0" />
                    <span className="text-[#102E4D] text-[11px] font-bold truncate">3 Days</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#EFFBF8] border border-[#D7F5EF]">
                    <span className="w-2 h-2 rounded-full bg-[#FFC400] shrink-0" />
                    <span className="text-[#102E4D] text-[11px] font-bold truncate">Islamabad</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0">
              <div className="pt-3 border-t border-slate-100">
                <Link
                  className="text-xs font-bold text-[#102E4D] group-hover:text-[#FF7900] inline-flex items-center gap-1.5 transition-colors"
                  href="/summit"
                >
                  <span>Explore Summit 2026</span>
                  <MdArrowForward className="text-[16px] group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Card 4: Family Leadership Circles */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl border border-[#D7F5EF] shadow-md hover:shadow-xl hover:border-[#FFC400] hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden h-full"
          >
            <div className="h-1 w-full bg-gradient-to-r from-[#102E4D] via-[#FFC400] to-[#FF7900] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-[#EFFBF8] text-[#FF7900] group-hover:bg-[#FF7900] group-hover:text-white flex items-center justify-center shrink-0 border border-[#D7F5EF] transition-colors duration-300 shadow-xs">
                  <MdStars className="text-[24px]" />
                </div>
                <span className="text-[10.5px] font-bold text-[#102E4D] uppercase tracking-wider bg-[#EFFBF8] px-2.5 py-1 rounded-md border border-[#D7F5EF]">
                  Community
                </span>
              </div>

              <div>
                <h3 className="font-serif font-bold text-lg text-[#102E4D] group-hover:text-[#FF7900] transition-colors leading-snug min-h-[44px] flex items-center">
                  Family Leadership Circles
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium mt-1.5 min-h-[54px]">
                  Monthly parent circles and interactive seminars reinforcing empathy, active listening, and consistent habits between home and school.
                </p>
              </div>

              <div className="space-y-1 pt-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Themes</div>
                <div className="grid grid-cols-2 gap-1.5 text-xs font-semibold">
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#EFFBF8] border border-[#D7F5EF]">
                    <span className="w-2 h-2 rounded-full bg-[#102E4D] shrink-0" />
                    <span className="text-[#102E4D] text-[11px] font-bold truncate">Parent Circles</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#EFFBF8] border border-[#D7F5EF]">
                    <span className="w-2 h-2 rounded-full bg-[#FF7900] shrink-0" />
                    <span className="text-[#102E4D] text-[11px] font-bold truncate">Emotional Bank</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#EFFBF8] border border-[#D7F5EF]">
                    <span className="w-2 h-2 rounded-full bg-[#102E4D] shrink-0" />
                    <span className="text-[#102E4D] text-[11px] font-bold truncate">Active Listening</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#EFFBF8] border border-[#D7F5EF]">
                    <span className="w-2 h-2 rounded-full bg-[#FFC400] shrink-0" />
                    <span className="text-[#102E4D] text-[11px] font-bold truncate">Home Mission</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0">
              <div className="pt-3 border-t border-slate-100">
                <Link
                  className="text-xs font-bold text-[#102E4D] group-hover:text-[#FF7900] inline-flex items-center gap-1.5 transition-colors"
                  href="/activities"
                >
                  <span>View Family Circles</span>
                  <MdArrowForward className="text-[16px] group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

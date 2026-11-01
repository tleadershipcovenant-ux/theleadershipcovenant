"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MdCalendarToday, MdLocationOn, MdPeople, MdHistoryEdu, MdArrowForward } from "react-icons/md";

export default function SummitSection() {
  return (
    <section className="w-full py-16 sm:py-20 relative overflow-hidden" id="summit-featured">
      {/* Subtle top divider line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-[#D7F5EF]" />

      {/* Background ambient accents */}
      <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[#D7F5EF]/60 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-[#DDEFF7]/60 blur-3xl pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Centered Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-10 sm:mb-12"
        >
          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#FF7900] mb-2">
            Featured Event
          </p>
          <h2 className="font-serif font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#102E4D] tracking-tight">
            The School Impact Summit 2026
          </h2>
          <div className="w-20 h-1 bg-[#FFC400] mx-auto mt-3.5 rounded-full" />
          <p className="text-sm sm:text-base text-slate-600 mt-3.5 font-medium leading-relaxed">
            28 November 2026 • Islamabad. A one-day summit where school leaders and educators share strategies, stories and tools to amplify their school&apos;s impact on every student.
          </p>
        </motion.div>

        {/* Featured Summit Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl overflow-hidden shadow-xl border border-[#D7F5EF] bg-white grid grid-cols-1 lg:grid-cols-12"
        >
          {/* Banner Graphic Column */}
          <div className="lg:col-span-5 relative min-h-[280px] sm:min-h-[340px] lg:min-h-full bg-[#001B33] overflow-hidden">
            <img
              src="/images/summit-banner.png"
              alt="The School Impact Summit 2026 - Islamabad, 28th Nov 2026"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#001B33]/90 via-[#001B33]/30 to-transparent" />
            <div className="absolute bottom-4 left-5 right-5 text-white">
              <span className="px-2.5 py-1 rounded bg-[#FF7900] text-white font-extrabold text-[10px] uppercase tracking-wider shadow">
                28 November 2026 • Islamabad
              </span>
              <h3 className="font-serif font-bold text-lg sm:text-xl text-white mt-2 leading-tight">
                Discover • Voice • Impact
              </h3>
            </div>
          </div>

          {/* Details Column */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-[#EFFBF8] border border-[#D7F5EF]">
                  <MdCalendarToday className="text-lg text-[#FF7900] mx-auto mb-1" />
                  <div className="font-bold text-xs text-[#102E4D]">28 Nov 2026</div>
                  <div className="text-[10px] text-slate-500">Saturday</div>
                </div>
                <div className="p-3 rounded-xl bg-[#EFFBF8] border border-[#D7F5EF]">
                  <MdPeople className="text-lg text-[#FF7900] mx-auto mb-1" />
                  <div className="font-bold text-xs text-[#102E4D]">200+</div>
                  <div className="text-[10px] text-slate-500">Educators &amp; Leaders</div>
                </div>
                <div className="p-3 rounded-xl bg-[#EFFBF8] border border-[#D7F5EF]">
                  <MdHistoryEdu className="text-lg text-[#FF7900] mx-auto mb-1" />
                  <div className="font-bold text-xs text-[#102E4D]">40+</div>
                  <div className="text-[10px] text-slate-500">Schools Represented</div>
                </div>
                <div className="p-3 rounded-xl bg-[#EFFBF8] border border-[#D7F5EF]">
                  <MdLocationOn className="text-lg text-[#FF7900] mx-auto mb-1" />
                  <div className="font-bold text-xs text-[#102E4D]">Islamabad</div>
                  <div className="text-[10px] text-slate-500">One-Day Summit</div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="font-serif font-bold text-base sm:text-lg text-[#102E4D]">
                  Clarify your school&apos;s wildest goal
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Leave with one narrowly-defined, wildly important goal for the year and a scorecard to track it. Hear candid case stories from schools across Pakistan and explore how trust, language, and leadership roles turn staff and students into owners of the mission.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs font-semibold text-[#FF7900]">
                ● Open enrollment • Reserve your seat
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href="/summit"
                  className="px-5 py-2.5 rounded-lg bg-[#FF7900] hover:bg-[#E56D00] text-white font-bold text-xs sm:text-sm shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Event details &amp; Register</span>
                  <MdArrowForward className="text-[16px]" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

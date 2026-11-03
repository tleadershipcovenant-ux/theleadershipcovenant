"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MdAutoStories,
  MdMenuBook,
  MdMemory,
  MdVerifiedUser,
  MdArrowForward,
} from "react-icons/md";

export default function AboutSection() {
  return (
    <section className="w-full py-10 sm:py-12 lg:py-14 relative overflow-hidden" id="overview">
      {/* Subtle top divider line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-[#D7F5EF]" />

      {/* Background ambient accents */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#D7F5EF]/60 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#DDEFF7]/60 blur-3xl pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Centered Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-10"
        >
          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#FF7900] mb-2">
            Our Story
          </p>
          <h2 className="font-serif font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#102E4D] tracking-tight">
            Everyone has a leader within. We help them discover and develop it.
          </h2>
          <div className="w-20 h-1 bg-[#FFC400] mx-auto mt-3.5 rounded-full" />
          <p className="text-sm sm:text-base text-slate-600 mt-3.5 font-medium leading-relaxed">
            The Leadership Covenant exists to prepare individuals for life, organizations for meaningful contribution, and education for awareness and wisdom.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Image Frame */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            className="lg:col-span-6 relative w-full h-full"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-[#D7F5EF] bg-white aspect-[4/3] sm:aspect-[16/11] lg:h-[480px] w-full group">
              <img
                src="/images/hero-students.jpg"
                alt="Students in collaborative leadership session at The Leadership Covenant"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>
          </motion.div>

          {/* Right Column: Narrative & The Covenant Promises */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.32, delay: 0.05, ease: "easeOut" }}
            className="lg:col-span-6 flex flex-col items-start gap-4"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-[#FF7900]">
              Four promises. One covenant.
            </p>

            <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#102E4D] tracking-tight leading-snug">
              To be the most trusted catalyst for leadership.
            </h3>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
              Raising a generation that leads with character, contributes with purpose, and transforms the communities it belongs to. Sustainable transformation starts with people, not programs. Character shapes culture; culture shapes results.
            </p>

            {/* 4 Promises Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full pt-1">
              <div className="p-4 rounded-xl bg-white border border-[#D7F5EF] hover:border-[#FFC400] hover:bg-[#EFFBF8] transition-all flex items-start gap-3 shadow-xs">
                <MdAutoStories className="text-[#FF7900] text-xl shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-serif font-bold text-base sm:text-[17px] text-[#102E4D] tracking-tight leading-snug">Learn</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">We commit to lifelong learning as the foundation of leadership.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#D7F5EF] hover:border-[#FFC400] hover:bg-[#EFFBF8] transition-all flex items-start gap-3 shadow-xs">
                <MdMenuBook className="text-[#FF7900] text-xl shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-serif font-bold text-base sm:text-[17px] text-[#102E4D] tracking-tight leading-snug">Develop</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">We grow habits, character, and skill, patiently and deliberately.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#D7F5EF] hover:border-[#FFC400] hover:bg-[#EFFBF8] transition-all flex items-start gap-3 shadow-xs">
                <MdMemory className="text-[#FF7900] text-xl shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-serif font-bold text-base sm:text-[17px] text-[#102E4D] tracking-tight leading-snug">Lead</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">We lead ourselves first, then serve those around us.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#D7F5EF] hover:border-[#FFC400] hover:bg-[#EFFBF8] transition-all flex items-start gap-3 shadow-xs">
                <MdVerifiedUser className="text-[#FF7900] text-xl shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-serif font-bold text-base sm:text-[17px] text-[#102E4D] tracking-tight leading-snug">Transform</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">We build cultures where change is chosen, not feared.</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/services"
                className="px-5 py-2.5 rounded-lg bg-[#FF7900] hover:bg-[#E56D00] text-white font-bold text-xs sm:text-sm shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Explore Our Services</span>
                <MdArrowForward className="text-[16px]" />
              </Link>
              <Link
                href="/about"
                className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-[#102E4D] font-semibold text-xs sm:text-sm hover:border-[#102E4D] hover:bg-[#EFFBF8] transition-all inline-flex items-center gap-1.5"
              >
                <span>Read Our Full Story</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

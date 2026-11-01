"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MdCheckCircle, MdArrowForward } from "react-icons/md";
import ActivityCoverflowSlider from "./ActivitySlider";

export default function AcademicWingsSection() {
  return (
    <section className="w-full py-10 sm:py-12 lg:py-14 relative overflow-hidden" id="wings">
      <div id="services" className="absolute -top-24" />
      {/* Subtle top divider line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-[#D7F5EF]" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Centered Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-10"
        >
          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#FF7900] mb-2">
            Our Services
          </p>
          <h2 className="font-serif font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#102E4D] tracking-tight">
            Processes that transform schools &amp; lives.
          </h2>
          <div className="w-20 h-1 bg-[#FFC400] mx-auto mt-3.5 rounded-full" />
          <p className="text-sm sm:text-base text-slate-600 mt-3.5 font-medium leading-relaxed">
            Six ways we help you build a culture of leadership. Every program shares one belief: everyone has the potential to lead.
          </p>
        </motion.div>

        {/* 6 Professional Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 sm:gap-8">
          {/* Card 1: Leader in Me® */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="lg:col-span-2 bg-white rounded-2xl overflow-hidden border border-[#D7F5EF] shadow-md hover:shadow-xl hover:border-[#FFC400] hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between relative"
            id="leader-in-me"
          >
            <div className="h-1 w-full bg-gradient-to-r from-[#102E4D] via-[#FFC400] to-[#FF7900] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div>
              <div className="h-56 sm:h-60 w-full overflow-hidden relative bg-slate-100">
                <img
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  src="/images/leader-in-me.jpg"
                  alt="Leader in Me"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#102E4D]/40 via-transparent to-transparent opacity-60 pointer-events-none" />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-serif font-bold text-xl text-[#102E4D] group-hover:text-[#FF7900] transition-colors leading-snug">
                    Leader in Me
                  </h3>
                  <span className="text-[11px] font-bold text-[#102E4D] uppercase tracking-wider bg-[#EFFBF8] border border-[#D7F5EF] px-2.5 py-0.5 rounded shrink-0">
                    Flagship EY–12
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Our flagship EY–12 whole-school transformation process that develops student leaders and transforms school culture through The 7 Habits.
                </p>
                <ul className="pt-2 space-y-1.5 text-xs text-slate-700 font-medium">
                  <li className="flex items-center gap-2">
                    <MdCheckCircle className="text-[#FF7900] text-[18px] shrink-0" />
                    <span>Embeds leadership into everyday learning</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MdCheckCircle className="text-[#FF7900] text-[18px] shrink-0" />
                    <span>Builds high-trust school culture</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="p-6 pt-0">
              <div className="pt-3 border-t border-slate-100">
                <Link
                  className="text-xs font-bold text-[#102E4D] group-hover:text-[#FF7900] inline-flex items-center gap-1.5 transition-colors"
                  href="/services#leader-in-me"
                >
                  <span>Enquire about Leader in Me</span>
                  <MdArrowForward className="text-[16px] group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Card 2: LeaderU (Higher Education) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 bg-white rounded-2xl overflow-hidden border border-[#D7F5EF] shadow-md hover:shadow-xl hover:border-[#FFC400] hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between relative"
            id="leader-u"
          >
            <div className="h-1 w-full bg-gradient-to-r from-[#102E4D] via-[#FFC400] to-[#FF7900] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div>
              <div className="h-56 sm:h-60 w-full overflow-hidden relative bg-slate-100">
                <img
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  src="/images/leader-u.jpg"
                  alt="LeaderU"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#102E4D]/40 via-transparent to-transparent opacity-60 pointer-events-none" />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-serif font-bold text-xl text-[#102E4D] group-hover:text-[#FF7900] transition-colors leading-snug">
                    LeaderU
                  </h3>
                  <span className="text-[11px] font-bold text-[#102E4D] uppercase tracking-wider bg-[#EFFBF8] border border-[#D7F5EF] px-2.5 py-0.5 rounded shrink-0">
                    Higher Education
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Developing future-ready leaders for college, university, and beyond with Project-Based Learning and career readiness skills.
                </p>
                <ul className="pt-2 space-y-1.5 text-xs text-slate-700 font-medium">
                  <li className="flex items-center gap-2">
                    <MdCheckCircle className="text-[#FF7900] text-[18px] shrink-0" />
                    <span>Employability, trust &amp; collaboration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MdCheckCircle className="text-[#FF7900] text-[18px] shrink-0" />
                    <span>Project-based learning workshops</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="p-6 pt-0">
              <div className="pt-3 border-t border-slate-100">
                <Link
                  className="text-xs font-bold text-[#102E4D] group-hover:text-[#FF7900] inline-flex items-center gap-1.5 transition-colors"
                  href="/services#leader-u"
                >
                  <span>Enquire about LeaderU</span>
                  <MdArrowForward className="text-[16px] group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Professional Development for Educators */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="md:col-span-2 lg:col-span-2 bg-white rounded-2xl overflow-hidden border border-[#D7F5EF] shadow-md hover:shadow-xl hover:border-[#FFC400] hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between relative"
            id="professional-development"
          >
            <div className="h-1 w-full bg-gradient-to-r from-[#102E4D] via-[#FFC400] to-[#FF7900] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div>
              <div className="h-56 sm:h-60 w-full overflow-hidden relative bg-slate-100">
                <img
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  src="/images/pd-educators.jpg"
                  alt="Professional Development for Educators"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#102E4D]/40 via-transparent to-transparent opacity-60 pointer-events-none" />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-serif font-bold text-xl text-[#102E4D] group-hover:text-[#FF7900] transition-colors leading-snug">
                    Professional Development
                  </h3>
                  <span className="text-[11px] font-bold text-[#102E4D] uppercase tracking-wider bg-[#EFFBF8] border border-[#D7F5EF] px-2.5 py-0.5 rounded shrink-0">
                    Courses
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Internationally trusted courses that equip teachers and school leaders with the mindset, skillset and toolset to drive transformation.
                </p>
                <ul className="pt-2 space-y-1.5 text-xs text-slate-700 font-medium">
                  <li className="flex items-center gap-2">
                    <MdCheckCircle className="text-[#FF7900] text-[18px] shrink-0" />
                    <span>The 7 Habits &amp; 4 Disciplines (4DX®)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MdCheckCircle className="text-[#FF7900] text-[18px] shrink-0" />
                    <span>Teacher Believed in Me® Certification</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="p-6 pt-0">
              <div className="pt-3 border-t border-slate-100">
                <Link
                  className="text-xs font-bold text-[#102E4D] group-hover:text-[#FF7900] inline-flex items-center gap-1.5 transition-colors"
                  href="/services#professional-development"
                >
                  <span>Enquire about PD</span>
                  <MdArrowForward className="text-[16px] group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Card 4: Leadership Camps */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-2xl overflow-hidden border border-[#D7F5EF] shadow-md hover:shadow-xl hover:border-[#FFC400] hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between relative"
            id="leadership-camps"
          >
            <div className="h-1 w-full bg-gradient-to-r from-[#102E4D] via-[#FFC400] to-[#FF7900] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div>
              <div className="h-56 sm:h-60 w-full overflow-hidden relative bg-slate-100">
                <img
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  src="/images/leadership-camp.jpg"
                  alt="Leadership Camps"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#102E4D]/40 via-transparent to-transparent opacity-60 pointer-events-none" />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-serif font-bold text-xl text-[#102E4D] group-hover:text-[#FF7900] transition-colors leading-snug">
                    Leadership Camps
                  </h3>
                  <span className="text-[11px] font-bold text-[#102E4D] uppercase tracking-wider bg-[#EFFBF8] border border-[#D7F5EF] px-2.5 py-0.5 rounded shrink-0">
                    For Students
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Immersive residential and day camps where students build confidence, character and leadership through adventure and reflection.
                </p>
                <ul className="pt-2 space-y-1.5 text-xs text-slate-700 font-medium">
                  <li className="flex items-center gap-2">
                    <MdCheckCircle className="text-[#FF7900] text-[18px] shrink-0" />
                    <span>Real-world challenges &amp; mountain treks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MdCheckCircle className="text-[#FF7900] text-[18px] shrink-0" />
                    <span>Certificate of Leadership Participation</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="p-6 pt-0">
              <div className="pt-3 border-t border-slate-100">
                <Link
                  className="text-xs font-bold text-[#102E4D] group-hover:text-[#FF7900] inline-flex items-center gap-1.5 transition-colors"
                  href="/services#leadership-camps"
                >
                  <span>Enquire about Camps</span>
                  <MdArrowForward className="text-[16px] group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Card 5: Family Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="lg:col-span-2 bg-white rounded-2xl overflow-hidden border border-[#D7F5EF] shadow-md hover:shadow-xl hover:border-[#FFC400] hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between relative"
            id="family-sessions"
          >
            <div className="h-1 w-full bg-gradient-to-r from-[#102E4D] via-[#FFC400] to-[#FF7900] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div>
              <div className="h-56 sm:h-60 w-full overflow-hidden relative bg-slate-100">
                <img
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  src="/images/family-session.jpg"
                  alt="Family Sessions"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#102E4D]/40 via-transparent to-transparent opacity-60 pointer-events-none" />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-serif font-bold text-xl text-[#102E4D] group-hover:text-[#FF7900] transition-colors leading-snug">
                    Family Sessions
                  </h3>
                  <span className="text-[11px] font-bold text-[#102E4D] uppercase tracking-wider bg-[#EFFBF8] border border-[#D7F5EF] px-2.5 py-0.5 rounded shrink-0">
                    Parents
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Based on The 7 Habits of Highly Effective Families®, empowering parents to strengthen communication, build trust, and nurture positive habits.
                </p>
                <ul className="pt-2 space-y-1.5 text-xs text-slate-700 font-medium">
                  <li className="flex items-center gap-2">
                    <MdCheckCircle className="text-[#FF7900] text-[18px] shrink-0" />
                    <span>Shared family values and vision</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MdCheckCircle className="text-[#FF7900] text-[18px] shrink-0" />
                    <span>Healthy, resilient relationships</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="p-6 pt-0">
              <div className="pt-3 border-t border-slate-100">
                <Link
                  className="text-xs font-bold text-[#102E4D] group-hover:text-[#FF7900] inline-flex items-center gap-1.5 transition-colors"
                  href="/services#family-sessions"
                >
                  <span>Enquire about Family Sessions</span>
                  <MdArrowForward className="text-[16px] group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Card 6: Leadership Podcast */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="md:col-span-2 lg:col-span-2 bg-white rounded-2xl overflow-hidden border border-[#D7F5EF] shadow-md hover:shadow-xl hover:border-[#FFC400] hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between relative"
            id="podcast"
          >
            <div className="h-1 w-full bg-gradient-to-r from-[#102E4D] via-[#FFC400] to-[#FF7900] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div>
              <div className="h-56 sm:h-60 w-full overflow-hidden relative bg-slate-100">
                <img
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  src="/images/podcast.jpg"
                  alt="Leadership Podcast"
                />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-serif font-bold text-xl text-[#102E4D] group-hover:text-[#FF7900] transition-colors leading-snug">
                    Leadership Podcast
                  </h3>
                  <span className="text-[11px] font-bold text-[#102E4D] uppercase tracking-wider bg-[#EFFBF8] border border-[#D7F5EF] px-2.5 py-0.5 rounded shrink-0">
                    Podcast
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Conversations that inspire leaders. Bringing together respected voices from education, leadership, psychology, and personal effectiveness.
                </p>
                <ul className="pt-2 space-y-1.5 text-xs text-slate-700 font-medium">
                  <li className="flex items-center gap-2">
                    <MdCheckCircle className="text-[#FF7900] text-[18px] shrink-0" />
                    <span>Thought leadership &amp; practical strategies</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MdCheckCircle className="text-[#FF7900] text-[18px] shrink-0" />
                    <span>Grounded in timeless principles</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="p-6 pt-0">
              <div className="pt-3 border-t border-slate-100">
                <Link
                  className="text-xs font-bold text-[#102E4D] group-hover:text-[#FF7900] inline-flex items-center gap-1.5 transition-colors"
                  href="/services#podcast"
                >
                  <span>Enquire about Podcast</span>
                  <MdArrowForward className="text-[16px] group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ─── Activities Showcase (3D CoverFlow Slider) ─── */}
        <div className="mt-14 sm:mt-20 pt-10 sm:pt-14 border-t border-[#D7F5EF]" id="activities-showcase">
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
            <h3 className="font-serif font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#102E4D] tracking-tight">
              Transformational Experiences in Action
            </h3>
            <div className="w-16 h-1 bg-[#FFC400] mx-auto mt-2.5 rounded-full" />
            <p className="text-xs sm:text-sm text-slate-600 mt-2.5 font-medium leading-relaxed">
              Explore dynamic classroom leadership, educator masterclasses, youth expeditions, and national confluences across Pakistan.
            </p>
          </div>

          <ActivityCoverflowSlider />
        </div>
      </div>
    </section>
  );
}

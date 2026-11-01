"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MdSchool,
  MdRecordVoiceOver,
  MdVerifiedUser,
  MdExplore,
  MdFavorite,
  MdAutoAwesome,
  MdArrowForward,
} from "react-icons/md";

const facultyMembers = [
  {
    name: "Mr. Ubaid ur Rehman",
    role: "CEO, The Leadership Covenant",
    division: "Regional Manager, FranklinCovey Education North Region",
    experience: "Leadership Direction",
    image: "/images/ceo.jpg",
    credentials: "Guides the summit's working sessions, school partnerships, and commitments.",
    icon: MdSchool,
    href: "/about#ceo",
  },
  {
    name: "Mr. Fazal Niazi",
    role: "Practice Lead, FranklinCovey Education",
    division: "Pakistan, Türkiye and Azerbaijan",
    experience: "Executive Facilitation",
    image: "/images/pd-educators.jpg",
    credentials: "Leads school transformation on leadership cultures and the 4DX operating system.",
    icon: MdRecordVoiceOver,
    href: "/summit#speakers",
  },
  {
    name: "LiM Certified Coaching Faculty",
    role: "Whole-School Culture Coaches",
    division: "Leader in Me® Process",
    experience: "EY–12 Transformation",
    image: "/images/leader-in-me.jpg",
    credentials: "FranklinCovey Certified • Empowering students to build leadership and responsibility.",
    icon: MdVerifiedUser,
    href: "/services#leader-in-me",
  },
  {
    name: "Youth Wilderness Leadership Team",
    role: "Outdoor Experiential Guides",
    division: "Leadership Camps (Swat & North)",
    experience: "Student Adventure",
    image: "/images/leadership-camp.jpg",
    credentials: "Experiential activities, real-world challenges, teamwork, and character building.",
    icon: MdExplore,
    href: "/services#leadership-camps",
  },
  {
    name: "Family Dynamics Specialists",
    role: "Family Culture Facilitators",
    division: "7 Habits Family Sessions",
    experience: "Parents & Caregivers",
    image: "/images/family-session.jpg",
    credentials: "Timeless practices to strengthen communication, trust, and positive family habits.",
    icon: MdFavorite,
    href: "/services#family-sessions",
  },
  {
    name: "LeaderU Collegiate Mentors",
    role: "Higher Education Mentors",
    division: "LeaderU Process",
    experience: "Colleges & Universities",
    image: "/images/leader-u.jpg",
    credentials: "Equipping students with leadership, career readiness, and life skills for the workplace.",
    icon: MdAutoAwesome,
    href: "/services#leader-u",
  },
];

export default function FacultySection() {
  return (
    <section className="w-full py-16 sm:py-20 lg:py-24 relative overflow-hidden" id="faculty">
      {/* Subtle top divider line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-[#D7F5EF]" />

      {/* Background ambient blurs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#D7F5EF]/60 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#DDEFF7]/60 blur-3xl pointer-events-none" />

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
            Speakers &amp; Facilitators
          </p>
          <h2 className="font-serif font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#102E4D] tracking-tight">
            Who you&apos;ll learn from
          </h2>
          <div className="w-20 h-1 bg-[#FFC400] mx-auto mt-3.5 rounded-full" />
          <p className="text-sm sm:text-base text-slate-600 mt-3.5 font-medium leading-relaxed">
            Distinguished educational leaders, certified master facilitators, and institutional practitioners guiding lasting change from the inside out.
          </p>
        </motion.div>

        {/* 6 Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {facultyMembers.map((member, idx) => {
            const Icon = member.icon;
            return (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="bg-white rounded-2xl border border-[#D7F5EF] shadow-md hover:shadow-xl hover:border-[#FFC400] hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  <div className="h-52 w-full overflow-hidden relative bg-slate-900">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#001B33]/85 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-3 left-4 right-4 text-white flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#FFC400] uppercase tracking-wider bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs">
                        {member.experience}
                      </span>
                      <div className="w-7 h-7 rounded-full bg-[#FF7900] text-white flex items-center justify-center text-xs shadow-xs">
                        <Icon />
                      </div>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 space-y-2.5">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-[#102E4D] group-hover:text-[#FF7900] transition-colors leading-snug">
                        {member.name}
                      </h3>
                      <div className="text-xs font-semibold text-[#FF7900] mt-0.5">
                        {member.role}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {member.division}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-medium pt-1">
                      {member.credentials}
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-6 pt-0">
                  <div className="pt-3 border-t border-slate-100">
                    <Link
                      href={member.href}
                      className="text-xs font-bold text-[#102E4D] group-hover:text-[#FF7900] inline-flex items-center gap-1.5 transition-colors"
                    >
                      <span>Learn more</span>
                      <MdArrowForward className="text-[14px] group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

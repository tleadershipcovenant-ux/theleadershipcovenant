"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MdArrowForward } from "react-icons/md";
import { useHomePageContent } from "@/lib/cms-client";

export default function HomeWhatWeDoSection() {
  const { whatWeDo } = useHomePageContent();

  return (
    <section className="w-full py-16 sm:py-20 lg:py-24 relative overflow-hidden bg-slate-50/50" id="services">
      {/* Background ambient accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#D7F5EF]/60 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#DDEFF7]/60 blur-3xl pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 sm:mb-16"
        >
          <div>
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#FF7900] mb-2">
              {whatWeDo.eyebrow}
            </p>
            <h2 className="font-serif font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#102E4D] tracking-tight">
              {whatWeDo.heading}
            </h2>
            <div className="w-20 h-1 bg-[#FFC400] mt-3.5 rounded-full" />
          </div>

          <Link
            href={whatWeDo.viewAllLink.href}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#FF7900] hover:text-[#E56D00] transition-colors group self-start sm:self-end"
          >
            <span>{whatWeDo.viewAllLink.label}</span>
            <MdArrowForward className="text-base group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* 3 Featured Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {whatWeDo.items.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white rounded-2xl overflow-hidden border border-[#D7F5EF] shadow-md hover:shadow-xl hover:border-[#FFC400] hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="h-52 w-full overflow-hidden relative bg-slate-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#102E4D]/60 via-transparent to-transparent opacity-60 pointer-events-none" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[#102E4D] text-xs font-bold uppercase tracking-wider shadow-sm">
                      {item.badge}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <h3 className="font-serif font-bold text-xl text-[#102E4D] group-hover:text-[#FF7900] transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <div className="pt-4 border-t border-slate-100">
                  <Link
                    href={item.href}
                    className="text-xs font-bold text-[#FF7900] hover:text-[#E56D00] inline-flex items-center gap-1.5 transition-colors group-hover:translate-x-0.5"
                  >
                    <span>{item.ctaLabel}</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


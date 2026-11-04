"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaQuoteLeft } from "react-icons/fa";
import { HOME_PAGE } from "@/content/home";
import { useHomePageContent } from "@/lib/cms-client";

export default function HomeVoicesSection() {
  const { voices } = useHomePageContent();
  const { principle, testimonials } = voices;
  const isDefaultQuote =
    principle.quote.replace(/[“”"]/g, "").trim() ===
    HOME_PAGE.voices.principle.quote;
  const first =
    testimonials.items[0] || HOME_PAGE.voices.testimonials.items[0];
  const second =
    testimonials.items[1] || HOME_PAGE.voices.testimonials.items[1];

  return (
    <section className="w-full py-12 sm:py-16 lg:py-20 relative overflow-hidden" id="principle">
      {/* Subtle top divider line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-[#D7F5EF]" />

      {/* Background ambient accents */}
      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-[#D7F5EF]/60 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-[#DDEFF7]/60 blur-3xl pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: The Principle We Live By (Dr. Stephen R. Covey Quote) */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            className="lg:col-span-5 flex flex-col items-start"
          >
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D7F5EF] border border-[#C5EDE4] text-[#102E4D] font-bold text-[11px] sm:text-xs tracking-wider uppercase mb-5 sm:mb-6 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF7900]" />
              <span>{principle.eyebrow}</span>
            </div>

            {/* Display Headline with Signature Colored Accents */}
            {isDefaultQuote ? (
              <h2 className="font-serif font-extrabold text-3xl sm:text-4xl lg:text-[42px] leading-[1.2] text-[#102E4D] tracking-tight">
                &ldquo;The main thing is to keep{" "}
                <span className="text-[#C0392B]">the</span>{" "}
                <span className="text-[#D4A300]">main</span>{" "}
                <span className="text-[#102E4D]">thing</span>{" "}
                the main thing.&rdquo;
              </h2>
            ) : (
              <h2 className="font-serif font-extrabold text-3xl sm:text-4xl lg:text-[42px] leading-[1.2] text-[#102E4D] tracking-tight">
                &ldquo;{principle.quote}&rdquo;
              </h2>
            )}

            {/* Author Attribution with Institutional Crest Seal */}
            <div className="flex items-center gap-3.5 mt-5 sm:mt-6 pt-3 border-t border-[#D7F5EF] w-full">
              <div className="flex flex-col">
                <span className="font-serif font-bold text-sm sm:text-base text-[#102E4D] leading-tight">
                  {principle.author}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {principle.authorSubtitle ===
                  HOME_PAGE.voices.principle.authorSubtitle ? (
                    <>
                      Author, The <span className="font-num font-semibold">7</span>{" "}
                      Habits of Highly Effective People
                    </>
                  ) : (
                    principle.authorSubtitle
                  )}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Two Testimonial Cards (Clean, No Badges) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {/* Card 1: Elementary Principal (Red / Rust Accent) */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.3, delay: 0.04, ease: "easeOut" }}
              className="p-6 sm:p-7 rounded-2xl bg-white border border-[#D7F5EF] shadow-sm hover:shadow-md hover:-translate-y-1 transition-[transform,box-shadow] duration-200 flex flex-col justify-between relative overflow-hidden border-t-4 border-t-[#C0392B] group"
            >
              <div>
                <div className="mb-4">
                  <FaQuoteLeft className="text-[#C0392B] text-xl" />
                </div>
                <p className="text-sm sm:text-[15px] text-slate-700 leading-relaxed font-normal">
                  {first.quote}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100">
                <h3 className="font-serif font-bold text-sm sm:text-[15px] text-[#102E4D]">
                  {first.author}
                </h3>
              </div>
            </motion.div>

            {/* Card 2: District Superintendent (Royal Blue Accent) */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.3, delay: 0.08, ease: "easeOut" }}
              className="p-6 sm:p-7 rounded-2xl bg-white border border-[#D7F5EF] shadow-sm hover:shadow-md hover:-translate-y-1 transition-[transform,box-shadow] duration-200 flex flex-col justify-between relative overflow-hidden border-t-4 border-t-[#2563EB] group"
            >
              <div>
                <div className="mb-4">
                  <FaQuoteLeft className="text-[#2563EB] text-xl" />
                </div>
                <p className="font-num text-sm sm:text-[15px] text-slate-700 leading-relaxed font-normal">
                  {second.quote}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100">
                <h3 className="font-serif font-bold text-sm sm:text-[15px] text-[#102E4D]">
                  {second.author}
                </h3>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}

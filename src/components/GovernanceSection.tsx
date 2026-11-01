"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  MdMilitaryTech,
  MdRecordVoiceOver,
} from "react-icons/md";

export default function GovernanceSection() {
  return (
    <section className="w-full py-10 sm:py-12 lg:py-14 relative overflow-hidden" id="governance">
      {/* Anchor for CEO message links */}
      <span id="ceo" className="absolute -top-24 opacity-0 pointer-events-none" />
      {/* Subtle top divider line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D7F5EF] to-transparent" />
      
      {/* Ambient Glows */}
      <div className="absolute -top-32 right-1/4 w-96 h-96 bg-[#D7F5EF]/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-[#DDEFF7]/50 rounded-full blur-3xl pointer-events-none" />

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
            CEO Message &amp; Leadership
          </p>
          <h2 className="font-serif font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#102E4D] tracking-tight">
            Guidance &amp; Governance
          </h2>
          <div className="w-20 h-1 bg-[#FFC400] mx-auto mt-3.5 rounded-full" />
          <p className="text-sm sm:text-base text-slate-600 mt-3.5 font-medium leading-relaxed">
            Leading partners of FranklinCovey Education guiding schools toward enduring cultural transformation and holistic character.
          </p>
        </motion.div>

        {/* Alternating Leadership Cards Stack */}
        <div className="space-y-8 sm:space-y-10">
          {/* CARD 1: CEO'S MESSAGE */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            className="bg-white rounded-2xl border border-[#D7F5EF] shadow-md hover:shadow-xl hover:border-[#FFC400] transition-[box-shadow,border-color] duration-200 overflow-hidden group relative"
          >
            {/* Top Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#102E4D] via-[#FFC400] to-[#FF7900]" />

            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              {/* Left Column: Text Content */}
              <div className="lg:col-span-8 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#FF7900] mb-2">
                    Message from The Chief Executive
                  </p>

                  {/* Card Heading */}
                  <h3 className="font-serif font-extrabold text-xl sm:text-2xl text-[#102E4D] leading-snug tracking-tight border-l-4 border-[#FF7900] pl-4 py-0.5 mb-4">
                    &ldquo;The future will be shaped by those we lead today.&rdquo;
                  </h3>

                  {/* Narrative */}
                  <div className="space-y-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    <p>
                      When I look at the students walking into our partner schools each morning, I see the doctors, engineers, artists, activists, and parents this community will depend on tomorrow. Our responsibility is not simply to teach them what to think; it is to help them <em>lead</em> how they think, choose, and serve.
                    </p>
                    <p>
                      The Leadership Covenant stands for one idea: everyone has the potential to lead. We are privileged to partner with courageous principals, teachers, and families who refuse to settle for average, believing that every child deserves the language, habits, and confidence of a leader.
                    </p>
                    <p className="font-semibold text-[#102E4D]">
                      Together, we build leaders. Together, change starts here.
                    </p>
                  </div>
                </div>

                {/* Signature Block */}
                <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h4 className="font-serif font-extrabold text-base sm:text-lg text-[#102E4D] tracking-tight">
                      Ubaid ur Rehman
                    </h4>
                    <p className="text-xs sm:text-sm font-semibold text-[#FF7900] mt-0.5">
                      CEO, The Leadership Covenant
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#102E4D]">
                    <MdMilitaryTech className="text-[17px] text-[#FF7900]" />
                    <span>Regional Manager, FranklinCovey Education</span>
                  </div>
                </div>
              </div>

              {/* Right Column: CEO Image */}
              <div className="lg:col-span-4 relative min-h-[300px] sm:min-h-[340px] lg:min-h-full bg-slate-100 overflow-hidden">
                <img
                  src="/images/ceo.jpg"
                  alt="Portrait of Ubaid ur Rehman, CEO of The Leadership Covenant"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70 pointer-events-none" />
                <div className="absolute bottom-3.5 left-4 right-4 text-white drop-shadow">
                  <div className="font-serif font-bold text-sm sm:text-base">Ubaid ur Rehman</div>
                  <div className="text-[11px] text-[#FFC400] font-semibold">Chief Executive Officer</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CARD 2: STRATEGIC FACILITATOR */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.32, delay: 0.05, ease: "easeOut" }}
            className="bg-white rounded-2xl border border-[#D7F5EF] shadow-md hover:shadow-xl hover:border-[#FFC400] transition-[box-shadow,border-color] duration-200 overflow-hidden group relative"
          >
            {/* Top Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#102E4D] via-[#FFC400] to-[#FF7900]" />

            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              {/* Left Column: Image */}
              <div className="lg:col-span-4 relative min-h-[300px] sm:min-h-[340px] lg:min-h-full bg-slate-100 overflow-hidden order-2 lg:order-1">
                <img
                  src="/images/pd-educators.jpg"
                  alt="Mr. Fazal Niazi - Practice Lead"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70 pointer-events-none" />
                <div className="absolute bottom-3.5 left-4 right-4 text-white drop-shadow">
                  <div className="font-serif font-bold text-sm sm:text-base">Fazal Niazi</div>
                  <div className="text-[11px] text-[#FFC400] font-semibold">Practice Lead</div>
                </div>
              </div>

              {/* Right Column: Text Content */}
              <div className="lg:col-span-8 p-6 sm:p-8 lg:p-10 flex flex-col justify-between order-1 lg:order-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#FF7900] mb-2">
                    Speakers &amp; Facilitators
                  </p>

                  <h3 className="font-serif font-extrabold text-xl sm:text-2xl text-[#102E4D] leading-snug tracking-tight border-l-4 border-[#FF7900] pl-4 py-0.5 mb-4">
                    &ldquo;Partnering with schools on leadership cultures and the <span className="font-num">4DX</span> operating system.&rdquo;
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    Mr. Fazal Niazi leads the FranklinCovey Education practice across Pakistan, Türkiye and Azerbaijan, partnering with schools on leadership cultures and the <span className="font-num font-semibold">4DX</span> operating system. He equips teachers and school leaders with the mindset, skillset, and toolset to drive whole-school transformation.
                  </p>
                </div>

                <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h4 className="font-serif font-extrabold text-base sm:text-lg text-[#102E4D] tracking-tight">
                      Mr. Fazal Niazi
                    </h4>
                    <p className="text-xs sm:text-sm font-semibold text-[#FF7900] mt-0.5">
                      Practice Lead, FranklinCovey Education Pakistan, Türkiye and Azerbaijan
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#102E4D]">
                    <MdRecordVoiceOver className="text-[17px] text-[#FF7900]" />
                    <span>Lead Facilitator</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

import React from "react";
import ReactDOM from "react-dom";
import type { Metadata } from "next";
import Link from "next/link";
import SummitObjectivesAndAudience from "@/components/summit/SummitObjectivesAndAudience";
import SummitInteractiveSections from "@/components/summit/SummitInteractiveSections";
import { MdArrowForward, MdKeyboardArrowDown } from "react-icons/md";

export const metadata: Metadata = {
  title: "The School Impact Summit 2026 - The Leadership Covenant",
  description:
    "The School Impact Summit 2026: 28 November 2026, Islamabad. Objectives, who should attend, speakers, past highlights and testimonials. Register online in minutes.",
  alternates: {
    canonical: "/summit",
  },
  openGraph: {
    title: "The School Impact Summit 2026 - The Leadership Covenant",
    description:
      "The School Impact Summit 2026: 28 November 2026, Islamabad. Objectives, who should attend, speakers, past highlights and testimonials. Register online in minutes.",
    url: "https://theleadershipcovenant.com/summit",
    siteName: "The Leadership Covenant",
    images: [
      {
        url: "/OG_Image.png",
        width: 1672,
        height: 941,
        alt: "The School Impact Summit 2026 - The Leadership Covenant",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The School Impact Summit 2026 - The Leadership Covenant",
    description:
      "The School Impact Summit 2026: 28 November 2026, Islamabad. Objectives, who should attend, speakers, past highlights and testimonials. Register online in minutes.",
    images: ["/OG_Image.png"],
  },
};

export default function SummitPage() {
  ReactDOM.preload("/Submit/Hero.png", {
    as: "image",
    fetchPriority: "high",
  });
  ReactDOM.preload("/Submit/Mobile%20devices%20hero%20section.png", {
    as: "image",
  });
  ReactDOM.preload("/Submit/SP1.png", { as: "image" });

  return (
    <main className="w-full pt-[68px] md:pt-[112px]">
      {/* 1. Summit Hero Banner Section */}
      <section className="relative w-full overflow-hidden bg-[#001B33] border-b border-[#D7F5EF] flex items-center justify-center shadow-xs">
        {/* Top Signature Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#FFC400] z-20" />

        {/* Bottom Signature Accent Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#FFC400] z-20 shadow-xs" />

        <div className="w-full max-w-[1920px] mx-auto flex items-center justify-center relative">
          {/* Responsive Hero Picture: Mobile Devices (<640px) use mobile hero, Tablet/Desktop (>=640px) use wide hero */}
          <picture className="w-full flex items-center justify-center">
            <source
              media="(max-width: 639px)"
              srcSet="/Submit/Mobile%20devices%20hero%20section.png"
            />
            <source
              media="(min-width: 640px)"
              srcSet="/Submit/Hero.png"
            />
            <img
              src="/Submit/Hero.png"
              alt="The School Impact Summit 2026 - Educational Leadership Conference"
              className="w-full h-auto max-h-[85vh] object-contain sm:object-cover object-center select-none"
              loading="eager"
              fetchPriority="high"
            />
          </picture>

          {/* Minimal Elegant Scroll-Down Icon (Hidden on mobile, visible on tablet/desktop, without 'Explore' text) */}
          <a
            href="#objective"
            aria-label="Scroll to Objectives"
            className="hidden sm:flex absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex-col items-center gap-1 group text-white/90 hover:text-[#FFC400] transition-all p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FFC400]/50"
          >
            <div className="w-6 h-10 rounded-full border-2 border-white/60 group-hover:border-[#FFC400] flex items-start justify-center p-1.5 transition-colors shadow-md bg-black/20 backdrop-blur-xs">
              <span className="w-1.5 h-2.5 rounded-full bg-[#FFC400] animate-bounce" />
            </div>
            <MdKeyboardArrowDown className="text-white/80 group-hover:text-[#FFC400] text-sm -mt-0.5 transition-colors" />
          </a>

          {/* Register Now CTA Button (Right Bottom, Scaled Responsively for Mobile & Desktop) */}
          <div className="absolute bottom-3 right-3 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 z-30">
            <Link
              href="/apply?activity=school-impact-summit-2026#apply-form"
              className="px-3.5 py-2 sm:px-6 sm:py-3.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] hover:from-[#E56D00] hover:to-[#CC5F00] text-white font-extrabold text-[11px] sm:text-sm uppercase tracking-wider shadow-xl shadow-black/40 hover:shadow-2xl hover:-translate-y-0.5 active:scale-95 transition-all inline-flex items-center gap-1.5 sm:gap-2 group ring-1 sm:ring-2 ring-white/25"
            >
              <span>Register Now</span>
              <MdArrowForward className="text-sm sm:text-base group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2 & 3. Objectives & Target Audience Sections */}
      <SummitObjectivesAndAudience />

      {/* 5, 6, 7, 8, 9. Interactive Animated Sections (Speakers, Stats, Videos, Testimonials, CTA) */}
      <SummitInteractiveSections />
    </main>
  );
}

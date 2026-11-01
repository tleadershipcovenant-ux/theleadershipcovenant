"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MdArrowForward } from "react-icons/md";

const HERO_BACKGROUNDS = [
  {
    src: "/Hero%20Section/H1.png",
    alt: "A Covenant to Build Leaders - The Leadership Covenant",
  },
  {
    src: "/images/pd-educators.jpg",
    alt: "Professional development for educators",
  },
  {
    src: "/images/leadership-camp.jpg",
    alt: "Leadership camp experience",
  },
];

export default function HeroSlider() {
  const [activeBackground, setActiveBackground] = useState(0);

  useEffect(() => {
    const rotation = window.setInterval(() => {
      setActiveBackground((current) => (current + 1) % HERO_BACKGROUNDS.length);
    }, 4000);

    return () => window.clearInterval(rotation);
  }, []);

  return (
    <section
      className="relative w-full overflow-hidden bg-[#001B33]"
      style={{
        height: "calc(100vh - 112px)",
        minHeight: "560px",
        maxHeight: "860px",
      }}
    >
      {/* Top Signature Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#FFC400] z-30" />

      {/* Background Image & Executive Overlays */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {HERO_BACKGROUNDS.map((background, index) => (
          <img
            key={background.src}
            src={background.src}
            alt={background.alt}
            fetchPriority={index === 0 ? "high" : "auto"}
            decoding="async"
            className={`absolute inset-0 w-full h-full object-cover object-center scale-105 transition-opacity duration-1000 ${
              activeBackground === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#001B33]/90 via-black/30 to-[#001B33]/55" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,27,51,0.5)_0%,_transparent_75%)]" />
      </div>

      {/* Centered Hero Content (Slide 1) */}
      <div className="relative z-10 h-full max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-16 flex flex-col justify-center items-center text-center">
        <div className="flex flex-col max-w-3xl items-center text-center">
          {/* Headline */}
          <h1 className="font-serif font-extrabold text-white text-3xl sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight mb-5 sm:mb-6 drop-shadow-[0_2px_14px_rgba(0,0,0,0.8)]">
            A Covenant to{" "}
            <span className="text-[#FFC400]">Build Leaders</span>
          </h1>

          {/* Subtitle / Promise Statement */}
          <div className="text-white/95 text-sm sm:text-base lg:text-lg leading-relaxed mb-7 sm:mb-8 max-w-2xl drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)] space-y-1.5 sm:space-y-2">
            <p>
              The Leadership Covenant is our promise to every school, family and learner.
            </p>
            <p>
              Leadership is not reserved for a few; it is a potential within us all.
            </p>
            <p className="text-[#FFC400] font-semibold">
              We help you develop it, deliberately.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4">
            <Link
              href="/services"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-lg bg-[#FF7900] hover:bg-[#E56D00] text-white font-bold text-sm sm:text-base shadow-lg shadow-black/40 hover:shadow-xl transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 active:scale-95 group"
            >
              <span>Explore Our Services</span>
              <MdArrowForward className="text-[18px] group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            <Link
              href="/activities"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-black/45 hover:bg-black/65 text-white border border-white/35 backdrop-blur-md font-semibold text-sm sm:text-base transition-[border-color,background-color,transform] duration-200 hover:border-white/60 active:scale-95 shadow-md"
            >
              <span>Upcoming Activities</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

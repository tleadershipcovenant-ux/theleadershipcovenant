"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MdArrowForward } from "react-icons/md";
import { useHomePageContent } from "@/lib/cms-client";

// ═══════════════ THE 6 LEADERSHIP SERVICES (ENHANCED 3D COVERFLOW) ═══════════════
export const SERVICES_SLIDES = [
  {
    id: "leader-in-me",
    image: "/images/leader-in-me.jpg",
    title: "Leader in Me",
    category: "Whole-School Transformation",
    description:
      "EY–12 whole-school transformation process empowering students, educators, and families with The 7 Habits and leadership character for life.",
    href: "/services#leader-in-me",
  },
  {
    id: "leader-u",
    image: "/images/leader-u.jpg",
    title: "LeaderU",
    category: "Higher Education",
    description:
      "Developing future-ready leaders for college, university, and beyond with FranklinCovey's globally trusted frameworks, self-mastery, and career readiness.",
    href: "/services#leader-u",
  },
  {
    id: "professional-development",
    image: "/images/pd-educators.jpg",
    title: "Professional Development for Educators",
    category: "Faculty & Institutional Leadership",
    description:
      "Transformative professional learning in The 7 Habits®, 4 Disciplines of Execution®, and the principles of high-trust leadership, equipping educators to lead themselves, empower others, and create lasting school-wide impact.",
    href: "/services#professional-development",
  },
  {
    id: "leadership-camps",
    image: "/images/leadership-camp.jpg",
    title: "Leadership Camps",
    category: "Experiential Youth Expeditions",
    description:
      "Immersive residential and day camps empowering young minds through outdoor adventure, teamwork, resilience, and real-world leadership challenges.",
    href: "/services#leadership-camps",
  },
  {
    id: "family-sessions",
    image: "/images/family-session.jpg",
    title: "Family Sessions",
    category: "Parenting & Family Culture",
    description:
      "Strengthening family communication, trust, and shared values rooted in The 7 Habits of Highly Effective Families for a thriving home.",
    href: "/services#family-sessions",
  },
  {
    id: "podcast",
    image: "/images/podcast.jpg",
    title: "The Leadership Podcast",
    category: "National Thought Leadership",
    description:
      "In-depth conversations with visionary educationists, academics, and youth pioneers addressing future educational paradigms and character.",
    href: "/services#podcast",
  },
];

export default function HomeServicesSection() {
  const home = useHomePageContent();
  const slides =
    home.services.slides.length > 0 ? home.services.slides : SERVICES_SLIDES;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Wheel and gesture refs
  const wheelLockRef = useRef(false);
  const touchStartXRef = useRef(0);
  const dragStartXRef = useRef(0);
  const isMouseDownRef = useRef(false);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === 0 ? slides.length - 1 : prev - 1
    );
  }, [slides.length]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === slides.length - 1 ? 0 : prev + 1
    );
  }, [slides.length]);

  // Smooth auto-advancing timer (pauses seamlessly on hover or touch)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => clearInterval(timer);
  }, [nextSlide, isPaused]);

  // Deliberate horizontal trackpad swipe handler — never hijack vertical page scrolling
  const handleWheel = (e: React.WheelEvent) => {
    // Only capture deliberate horizontal swipes (deltaX > deltaY)
    // Never trap vertical scrolling so page scroll is 100% smooth without getting stuck
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) * 1.3 || Math.abs(e.deltaX) < 22) {
      return;
    }

    if (!wheelLockRef.current) {
      wheelLockRef.current = true;
      if (e.deltaX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      setTimeout(() => {
        wheelLockRef.current = false;
      }, 350);
    }
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (diff > 45) {
      nextSlide();
    } else if (diff < -45) {
      prevSlide();
    }
    setTimeout(() => setIsPaused(false), 2400);
  };

  // Desktop drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isMouseDownRef.current = true;
    dragStartXRef.current = e.clientX;
    setIsPaused(true);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current) return;
    isMouseDownRef.current = false;
    const diff = dragStartXRef.current - e.clientX;
    if (diff > 45) {
      nextSlide();
    } else if (diff < -45) {
      prevSlide();
    }
    setTimeout(() => setIsPaused(false), 1200);
  };

  // 3D Motion Variants for each relative slide position (GPU-hardware accelerated only)
  const getVariants = (index: number) => {
    const total = slides.length;
    const diff = (index - currentIndex + total) % total;

    if (diff === 0) {
      // Center active slide
      return {
        x: "0%",
        scale: 1,
        rotateY: 0,
        opacity: 1,
        zIndex: 25,
        visibility: "visible" as const,
        boxShadow:
          "0 20px 45px -12px rgba(0, 27, 51, 0.35), 0 8px 20px -6px rgba(0, 27, 51, 0.2)",
      };
    } else if (diff === 1 || diff === -total + 1) {
      // Right next slide
      return {
        x: "48%",
        scale: 0.85,
        rotateY: -9,
        opacity: 0.72,
        zIndex: 10,
        visibility: "visible" as const,
        boxShadow: "0 14px 30px -10px rgba(0, 27, 51, 0.22)",
      };
    } else if (diff === total - 1 || diff === -1) {
      // Left prev slide
      return {
        x: "-48%",
        scale: 0.85,
        rotateY: 9,
        opacity: 0.72,
        zIndex: 10,
        visibility: "visible" as const,
        boxShadow: "0 14px 30px -10px rgba(0, 27, 51, 0.22)",
      };
    } else {
      // Hidden behind - hide from GPU composition for max performance
      const isRight = diff <= total / 2;
      return {
        x: isRight ? "90%" : "-90%",
        scale: 0.65,
        rotateY: isRight ? -18 : 18,
        opacity: 0,
        zIndex: 0,
        visibility: "hidden" as const,
        boxShadow: "none",
      };
    }
  };

  return (
    <section
      className="w-full py-12 sm:py-16 lg:py-20 relative overflow-hidden"
      id="services"
    >
      {/* Anchor for backward compatibility */}
      <span id="activities-showcase" className="absolute -top-24 opacity-0 pointer-events-none" />

      {/* Subtle top divider line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D7F5EF] to-transparent" />

      {/* Ambient background accents */}
      <div className="absolute -top-36 right-1/4 w-96 h-96 bg-[#D7F5EF]/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-36 left-1/4 w-96 h-96 bg-[#DDEFF7]/50 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Centered Professional Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest text-[#FF7900] mb-2.5">
            <span className="w-6 h-[2px] bg-[#FF7900] inline-block" />
            <span>{home.services.eyebrow}</span>
            <span className="w-6 h-[2px] bg-[#FF7900] inline-block" />
          </div>
          <h2 className="font-serif font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#102E4D] tracking-tight">
            {home.services.heading}
          </h2>
          <div className="w-20 h-1 bg-[#FFC400] mx-auto mt-3.5 rounded-full" />
          <p className="text-sm sm:text-base text-slate-600 mt-3.5 font-medium leading-relaxed max-w-2xl mx-auto">
            {home.services.subtitle}
          </p>
        </motion.div>

        {/* 3D CoverFlow Interactive Slider Track */}
        <div
          className="relative w-full max-w-5xl lg:max-w-[1100px] mx-auto py-2 select-none"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => {
            setIsPaused(false);
            isMouseDownRef.current = false;
          }}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          {/* 3D Perspective Stage */}
          <div
            className="relative h-[410px] sm:h-[470px] md:h-[515px] flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
            style={{ perspective: 1200, transformStyle: "preserve-3d" }}
          >
            {slides.map((slide, index) => {
              const total = slides.length;
              const diff = (index - currentIndex + total) % total;
              const isCenter = diff === 0;
              const isPrev = diff === total - 1 || diff === -1;
              const isNext = diff === 1 || diff === -total + 1;

              return (
                <motion.div
                  key={slide.id ? `${slide.id}-${index}` : index}
                  animate={getVariants(index)}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 26,
                    mass: 0.9,
                  }}
                  className={`absolute w-[88%] sm:w-[74%] md:w-[68%] lg:w-[62%] max-w-[740px] h-[370px] sm:h-[430px] md:h-[470px] rounded-3xl overflow-hidden cursor-pointer border ${
                    isCenter
                      ? "border-[#FFC400]/90"
                      : "border-slate-200/80"
                  } bg-[#001B33] will-change-transform`}
                  onClick={() => {
                    if (isPrev) prevSlide();
                    else if (isNext) nextSlide();
                  }}
                >
                  {/* Top Signature Gold-Orange Accent Line */}
                  <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-gradient-to-r from-[#FF7900] via-[#FFC400] to-[#102E4D] z-20" />

                  {/* Card Background Image Frame */}
                  <div className="relative w-full h-full overflow-hidden group">
                    <picture className="w-full h-full">
                      <source
                        srcSet={slide.image.replace(/\.(jpg|png)$/i, ".webp")}
                        type="image/webp"
                      />
                      <img
                        src={slide.image}
                        alt={slide.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    </picture>

                    {/* Ambient Gradients Tailored for Text Visibility per Side */}
                    {isCenter && (
                      <>
                        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-[#001B33]/85 via-[#001B33]/30 to-transparent pointer-events-none" />
                        <div className="absolute bottom-0 inset-x-0 h-4/5 bg-gradient-to-t from-[#001B33] via-[#001B33]/92 via-55% to-transparent pointer-events-none" />
                      </>
                    )}
                    {isPrev && (
                      <div className="absolute inset-0 bg-gradient-to-r from-[#001B33]/95 via-[#001B33]/60 to-transparent pointer-events-none" />
                    )}
                    {isNext && (
                      <div className="absolute inset-0 bg-gradient-to-l from-[#001B33]/95 via-[#001B33]/60 to-transparent pointer-events-none" />
                    )}

                    {/* 1. PREVIOUS SLIDE (Exposed on Left Side: Left-Aligned Text) */}
                    {isPrev && (
                      <div className="absolute inset-0 z-10 p-5 sm:p-7 flex flex-col justify-between text-left pointer-events-none">
                        <div className="font-num text-xs font-bold text-white/70 tracking-widest">
                          0{index + 1} / {String(slides.length).padStart(2, "0")}
                        </div>
                        <div className="max-w-[46%] sm:max-w-[48%]">
                          <div className="text-[10.5px] sm:text-xs font-bold text-[#FFC400] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF7900]" />
                            <span className="truncate">{slide.category}</span>
                          </div>
                          <h4 className="font-serif font-bold text-base sm:text-lg md:text-xl text-white leading-snug tracking-tight drop-shadow-sm line-clamp-2">
                            {slide.title}
                          </h4>
                          <p className="font-sans text-[11px] sm:text-xs text-slate-200 mt-1 line-clamp-2 leading-relaxed hidden sm:block">
                            {slide.description}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* 2. NEXT SLIDE (Exposed on Right Side: Right-Aligned Text) */}
                    {isNext && (
                      <div className="absolute inset-0 z-10 p-5 sm:p-7 flex flex-col justify-between items-end text-right pointer-events-none">
                        <div className="font-num text-xs font-bold text-white/70 tracking-widest">
                          0{index + 1} / {String(slides.length).padStart(2, "0")}
                        </div>
                        <div className="max-w-[46%] sm:max-w-[48%] text-right ml-auto">
                          <div className="text-[10.5px] sm:text-xs font-bold text-[#FFC400] uppercase tracking-wider mb-1 flex items-center justify-end gap-1.5">
                            <span className="truncate">{slide.category}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF7900]" />
                          </div>
                          <h4 className="font-serif font-bold text-base sm:text-lg md:text-xl text-white leading-snug tracking-tight drop-shadow-sm line-clamp-2">
                            {slide.title}
                          </h4>
                          <p className="font-sans text-[11px] sm:text-xs text-slate-200 mt-1 line-clamp-2 leading-relaxed hidden sm:block">
                            {slide.description}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* 3. CENTER ACTIVE SLIDE (Full Prominence + Bottom Right CTA) */}
                    {isCenter && (
                      <div className="absolute inset-0 z-10 p-5 sm:p-7 md:p-8 flex flex-col justify-between">
                        <div className="flex items-center justify-end">
                          <span className="font-num text-xs sm:text-sm font-bold text-white/75 tracking-widest">
                            0{index + 1} / {String(slides.length).padStart(2, "0")}
                          </span>
                        </div>

                        <div className="text-white">
                          <div className="text-xs sm:text-[13px] font-bold text-[#FFC400] uppercase tracking-widest mb-1.5 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#FF7900]" />
                            <span>{slide.category}</span>
                          </div>

                          <h3 className="font-serif font-extrabold text-xl sm:text-2xl md:text-3xl leading-snug tracking-tight text-white drop-shadow-md">
                            {slide.title}
                          </h3>

                          <p className="font-sans text-xs sm:text-sm md:text-[14.5px] text-slate-100/90 mt-2 leading-relaxed line-clamp-2 sm:line-clamp-3 font-normal max-w-xl">
                            {slide.description}
                          </p>

                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="mt-3.5 pt-3 border-t border-white/20 flex items-center justify-end"
                          >
                            <Link
                              href={slide.href}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-2 px-4.5 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] hover:from-[#E56D00] hover:to-[#CC5F00] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all group/btn"
                            >
                              <span>{home.services.ctaLabel}</span>
                              <MdArrowForward className="text-sm sm:text-base group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                          </motion.div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Centered Enhanced Pagination Indicators */}
          <div className="flex items-center justify-center gap-2 mt-5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  i === currentIndex
                    ? "w-10 bg-gradient-to-r from-[#FF7900] to-[#FFC400] shadow-sm shadow-[#FF7900]/40"
                    : "w-2.5 bg-slate-300 hover:bg-[#FF7900]/50"
                }`}
                aria-label={`Go to service ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

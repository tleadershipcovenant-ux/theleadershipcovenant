"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdChevronLeft, MdChevronRight, MdClose } from "react-icons/md";

// ═══════════════ THE LEADERSHIP COVENANT ACTIVITIES COVERFLOW ═══════════════
export const activitySlides = [
  {
    id: 1,
    image: "/images/summit-banner.png",
    title: "The School Impact Summit 2026: Islamabad",
    category: "Educational Leadership",
    badge: "Summit 2026",
    description: "Annual confluence of 300+ visionary school heads, trustees, and keynote speakers shaping holistic education in Pakistan.",
  },
  {
    id: 2,
    image: "/images/leader-in-me.jpg",
    title: "Leader in Me® Whole-School Cultural Transformation",
    category: "School Culture & Character",
    badge: "FranklinCovey LiM",
    description: "Empowering students aged 4-18 with proactive habits, public victories, and whole-school leadership responsibility.",
  },
  {
    id: 3,
    image: "/images/pd-educators.jpg",
    title: "Executive Professional Development for Educators",
    category: "Faculty Masterclasses",
    badge: "Teacher Mentorship",
    description: "Certified deep-dive workshops for teachers in restorative classroom practices, 7 Habits pedagogy, and emotional intelligence.",
  },
  {
    id: 4,
    image: "/images/leadership-camp.jpg",
    title: "Youth Leadership Camp: Swat Valley Immersion",
    category: "Outdoor Experiential",
    badge: "Student Camps",
    description: "7-day experiential retreat in Swat Valley fostering resilience, self-reliance, team problem-solving, and servant leadership.",
  },
  {
    id: 5,
    image: "/images/family-session.jpg",
    title: "7 Habits for Successful Families & Parenting",
    category: "Family & Community",
    badge: "Parenting Forums",
    description: "Transformational weekend workshops aligning family values, constructive communication, and mutual empathy at home.",
  },
  {
    id: 6,
    image: "/images/podcast.jpg",
    title: "The Leadership Podcast: Thought Leadership",
    category: "Media & National Discourse",
    badge: "Podcast Series",
    description: "In-depth conversations with prominent educationists, academics, and youth pioneers addressing future educational paradigms.",
  },
  {
    id: 7,
    image: "/images/leader-u.jpg",
    title: "LeaderU: Collegiate & Higher Education Track",
    category: "Higher Education",
    badge: "LeaderU Campus",
    description: "Advanced leadership curriculum for university undergraduates bridging ethical decision-making, team execution, and career readiness.",
  },
];

export default function ActivityCoverflowSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSlide, setSelectedSlide] = useState<(typeof activitySlides)[0] | null>(null);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? activitySlides.length - 1 : prev - 1));
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === activitySlides.length - 1 ? 0 : prev + 1));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const getSlidePosition = (index: number) => {
    const diff = (index - currentIndex + activitySlides.length) % activitySlides.length;
    if (diff === 0) return "active";
    if (diff === 1 || diff === -activitySlides.length + 1) return "next";
    if (diff === activitySlides.length - 1 || diff === -1) return "prev";
    return "hidden";
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto py-4 select-none">
      {/* CoverFlow Track */}
      <div className="relative h-[340px] sm:h-[400px] md:h-[440px] flex items-center justify-center overflow-hidden">
        {activitySlides.map((slide, index) => {
          const position = getSlidePosition(index);
          const isCenter = position === "active";
          const isPrev = position === "prev";
          const isNext = position === "next";

          if (position === "hidden") return null;

          return (
            <div
              key={slide.id}
              className={`absolute w-[84%] sm:w-[68%] md:w-[60%] h-[320px] sm:h-[370px] md:h-[400px] rounded-2xl overflow-hidden cursor-pointer shadow-xl border transition-[transform,opacity,border-color,box-shadow] duration-400 ease-out bg-white will-change-transform ${
                isCenter
                  ? "z-20 translate-x-0 scale-100 opacity-100 border-[#FFC400] shadow-[0_20px_45px_-10px_rgba(0,27,51,0.3)]"
                  : isPrev
                  ? "z-10 -translate-x-[36%] sm:-translate-x-[40%] scale-[0.8] opacity-60 border-slate-200/90"
                  : "z-10 translate-x-[36%] sm:translate-x-[40%] scale-[0.8] opacity-60 border-slate-200/90"
              }`}
              onClick={() => {
                if (isCenter) setSelectedSlide(slide);
                else if (isPrev) prevSlide();
                else if (isNext) nextSlide();
              }}
            >
              {/* Image Frame */}
              <div className="relative w-full h-full overflow-hidden bg-slate-900 group">
                <img
                  src={slide.image}
                  alt={slide.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#001B33]/95 via-[#001B33]/45 to-transparent" />

                {/* Bottom Content (Clean Overline + Prominent Card Heading — No Badges) */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5 text-white">
                  <div className="text-[10.5px] sm:text-xs font-bold text-[#FFC400] uppercase tracking-widest mb-1">
                    {slide.category}
                  </div>
                  <h4 className="font-serif font-bold text-base sm:text-lg md:text-xl leading-snug tracking-tight line-clamp-2 drop-shadow-sm">
                    {slide.title}
                  </h4>
                  {isCenter && (
                    <p className="font-num text-[11px] sm:text-xs text-slate-200 mt-1.5 line-clamp-2 leading-relaxed">
                      {slide.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between mt-4 px-4 max-w-sm mx-auto">
        <button
          onClick={prevSlide}
          className="w-10 h-10 rounded-full bg-white border border-[#D7F5EF] text-[#102E4D] flex items-center justify-center hover:bg-[#FF7900] hover:text-white hover:border-[#FF7900] transition-colors shadow-sm cursor-pointer"
          aria-label="Previous Activity"
        >
          <MdChevronLeft className="text-2xl" />
        </button>

        {/* Indicators in Orange (#FF7900) */}
        <div className="flex items-center gap-1.5">
          {activitySlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                i === currentIndex
                  ? "w-7 bg-[#FF7900]"
                  : "w-2 bg-slate-300 hover:bg-slate-400"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          className="w-10 h-10 rounded-full bg-white border border-[#D7F5EF] text-[#102E4D] flex items-center justify-center hover:bg-[#FF7900] hover:text-white hover:border-[#FF7900] transition-colors shadow-sm cursor-pointer"
          aria-label="Next Activity"
        >
          <MdChevronRight className="text-2xl" />
        </button>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedSlide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200"
            >
              <div className="relative h-60 w-full bg-slate-900">
                <img
                  src={selectedSlide.image}
                  alt={selectedSlide.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedSlide(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
                  aria-label="Close"
                >
                  <MdClose className="text-xl" />
                </button>
              </div>
              <div className="p-6">
                <span className="text-xs font-bold text-[#FF7900] uppercase tracking-wider">
                  {selectedSlide.category}
                </span>
                <h3 className="font-serif font-bold text-xl text-[#102E4D] mt-1">
                  {selectedSlide.title}
                </h3>
                <p className="text-sm text-slate-600 mt-2.5 leading-relaxed">
                  {selectedSlide.description}
                </p>
                <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setSelectedSlide(null)}
                    className="px-4 py-2 rounded-lg bg-[#FF7900] text-white text-xs font-bold hover:bg-[#E56D00] transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

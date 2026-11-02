"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { MdChevronLeft, MdChevronRight, MdClose } from "react-icons/md";
import { FaPlay } from "react-icons/fa";

export interface SummitVideoItem {
  id: string;
  youtubeId: string;
  title: string;
  description: string;
  thumbnail: string;
}

export const SUMMIT_VIDEOS: SummitVideoItem[] = [
  {
    id: "v1",
    youtubeId: "e-zgk1VWN1s",
    title: "School Impact Summit — Event Highlights",
    description:
      "A look inside the room: keynote addresses, coaching corners, and leadership teams formulating 90-day whole-school action plans.",
    thumbnail: "https://img.youtube.com/vi/e-zgk1VWN1s/maxresdefault.jpg",
  },
  {
    id: "v2",
    youtubeId: "omlFZklTLV8",
    title: "Leader Voices & Classroom Transformation",
    description:
      "School heads and educators share firsthand how FranklinCovey Education leadership principles transformed student agency and staff culture.",
    thumbnail: "https://img.youtube.com/vi/omlFZklTLV8/maxresdefault.jpg",
  },
  {
    id: "v3",
    youtubeId: "e-zgk1VWN1s",
    title: "Empowering Educators & Strategic Culture",
    description:
      "Collaborative roundtables where educational leaders formulate measurable 90-day action targets for their school communities.",
    thumbnail: "https://img.youtube.com/vi/e-zgk1VWN1s/hqdefault.jpg",
  },
];

export default function SummitVideoSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const total = SUMMIT_VIDEOS.length;

  const handlePrev = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  }, [total]);

  const handleNext = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  }, [total]);

  const handleCardClick = (index: number) => {
    if (index === currentIndex) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      setCurrentIndex(index);
    }
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape" && isPlaying) setIsPlaying(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrev, handleNext, isPlaying]);

  const getSlideRole = (index: number) => {
    const diff = (index - currentIndex + total) % total;
    if (diff === 0) return "active";
    if (diff === 1 || diff === -total + 1) return "next";
    if (diff === total - 1 || diff === -1) return "prev";
    return "hidden";
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto pt-2 pb-2 sm:pt-3 sm:pb-4 select-none">
      {/* ────────────────────────────────────────────────────────── */}
      {/* 3D Coverflow Slider Presentation Track                      */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="relative w-full h-[240px] sm:h-[360px] md:h-[440px] lg:h-[480px] flex items-center justify-center overflow-hidden">
        {/* Navigation Arrow — Left */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous Video"
          className="absolute left-2 sm:left-4 md:left-6 lg:left-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow-xl border border-slate-200/80 flex items-center justify-center text-slate-700 hover:text-[#102E4D] hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-[#FFC400]"
        >
          <MdChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>

        {/* Navigation Arrow — Right */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next Video"
          className="absolute right-2 sm:right-4 md:right-6 lg:right-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow-xl border border-slate-200/80 flex items-center justify-center text-slate-700 hover:text-[#102E4D] hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-[#FFC400]"
        >
          <MdChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>

        {/* Slide Cards */}
        {SUMMIT_VIDEOS.map((video, idx) => {
          const role = getSlideRole(idx);
          const isActive = role === "active";
          const isPrev = role === "prev";
          const isNext = role === "next";

          if (role === "hidden") return null;

          return (
            <div
              key={video.id}
              onClick={() => handleCardClick(idx)}
              className={`absolute top-1/2 left-1/2 aspect-video w-[78%] sm:w-[68%] md:w-[62%] lg:w-[58%] max-w-[780px] rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer transition-[transform,opacity,box-shadow,filter] duration-500 ease-out will-change-transform ${
                isActive
                  ? "-translate-x-1/2 -translate-y-1/2 scale-100 opacity-100 z-20 shadow-[0_24px_60px_-15px_rgba(0,27,51,0.35)] border-2 border-white ring-1 ring-slate-200"
                  : isPrev
                  ? "-translate-x-[110%] sm:-translate-x-[102%] -translate-y-1/2 scale-[0.82] opacity-50 hover:opacity-75 z-10 shadow-lg border border-slate-200/60"
                  : "translate-x-[10%] sm:translate-x-[2%] -translate-y-1/2 scale-[0.82] opacity-50 hover:opacity-75 z-10 shadow-lg border border-slate-200/60"
              }`}
            >
              {/* If Active & Playing: Show embedded YouTube iframe */}
              {isActive && isPlaying ? (
                <div className="relative w-full h-full bg-black">
                  <iframe
                    className="w-full h-full border-0"
                    src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                  {/* Close / Return to thumbnail button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPlaying(false);
                    }}
                    aria-label="Close video player"
                    className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors shadow-md"
                  >
                    <MdClose className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                /* Thumbnail with Centered Play Button (Matching Reference) */
                <div className="relative w-full h-full group bg-slate-900 overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />

                  {/* Soft Gradient Overlay for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

                  {/* Centered Circular Play Button (only on active or hover) */}
                  {isActive ? (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-white text-[#102E4D] shadow-[0_10px_35px_rgba(0,0,0,0.35)] flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-all duration-300 ring-4 ring-white/50">
                        <FaPlay className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-slate-900 translate-x-0.5" />
                      </div>
                    </div>
                  ) : (
                    /* Subtle play indicator for side cards */
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/80 text-slate-800 flex items-center justify-center shadow-md">
                        <FaPlay className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-900 translate-x-0.5" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* Pagination Dots Indicator                                  */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-2 mt-5 sm:mt-6">
          {SUMMIT_VIDEOS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setCurrentIndex(i);
              }}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? "w-7 bg-[#FF7900]"
                  : "w-2 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
    </div>
  );
}

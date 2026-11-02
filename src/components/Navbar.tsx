"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBars, FaTimes } from "react-icons/fa";
import {
  MdPhone,
  MdMail,
  MdLocationOn,
  MdArrowForward,
} from "react-icons/md";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY;
          setIsScrolled((prev) => {
            // Hysteresis buffer zone:
            // Scroll down past 32px -> smoothly collapse upper info top bar
            // Scroll up below 14px -> smoothly restore upper info top bar
            if (!prev && y > 32) return true;
            if (prev && y < 14) return false;
            return prev;
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Our Story", href: "/about" },
    { label: "Activities", href: "/activities" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    // Fixed, locked navbar permanently anchored to the top of the viewport across all pages
    <header className="fixed top-0 left-0 right-0 z-[100] w-full">
      {/* 1. Professional Upper Top Bar — Midnight Navy (#001B33) */}
      <div
        className={`w-full bg-[#001B33] text-white/90 border-b overflow-hidden transition-[height,opacity] duration-300 ease-in-out hidden md:block ${
          isScrolled
            ? "h-0 opacity-0 pointer-events-none border-transparent"
            : "h-9 opacity-100 border-white/10"
        }`}
      >
        <div className="max-w-[1280px] h-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs font-medium">
          {/* Left: Phone & Email */}
          <div className="flex items-center gap-4 lg:gap-6 shrink-0 text-slate-300">
            <a
              href="tel:+923192091249"
              className="inline-flex items-center gap-1.5 hover:text-[#FFC400] transition-colors"
            >
              <MdPhone className="text-[13px] text-[#FFC400]" />
              <span className="font-num font-semibold text-white/90">+92 319 2091249</span>
            </a>
            <span className="text-white/20">|</span>
            <a
              href="mailto:theleadershipcovenant@gmail.com"
              className="inline-flex items-center gap-1.5 hover:text-[#FFC400] transition-colors"
            >
              <MdMail className="text-[13px] text-[#FFC400]" />
              <span className="hidden sm:inline">theleadershipcovenant@gmail.com</span>
            </a>
          </div>

          {/* Right: Islamabad Office Address */}
          <div className="hidden md:flex items-center shrink-0 text-xs text-slate-300">
            <span className="inline-flex items-center gap-1.5">
              <MdLocationOn className="text-[13px] text-[#FFC400]" />
              <span className="font-num">F-10/3, Islamabad</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar — Locked & Visible when scrolling with all pages */}
      <div
        className={`w-full bg-white border-b border-slate-200/90 transition-[height,box-shadow] duration-300 ease-in-out ${
          isScrolled
            ? "h-[60px] md:h-[68px] shadow-md"
            : "h-[68px] md:h-[76px] shadow-xs"
        }`}
      >
        <div className="max-w-[1280px] h-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-3 sm:gap-3.5 group min-w-0">
            <div
              className={`relative shrink-0 flex items-center justify-center transition-transform duration-300 ease-out w-11 h-11 sm:w-12 sm:h-12 md:w-13 md:h-13 lg:w-14 lg:h-14 ${
                isScrolled ? "scale-95" : "scale-100"
              }`}
            >
              <img
                src="/Logo_For_Navbar_Fotter.png"
                alt="The Leadership Covenant"
                className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex flex-col justify-center text-left min-w-0">
              <span className="font-serif font-extrabold text-[#102E4D] tracking-tight leading-tight whitespace-nowrap truncate text-base sm:text-lg lg:text-[21px]">
                The Leadership Covenant
              </span>
              <span className="text-[9.5px] sm:text-[10.5px] text-[#FF7900] font-bold tracking-wider truncate mt-0.5 uppercase">
                Learn • Develop • Lead • Transform
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links + Apply Now CTA */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-lg text-sm font-bold transition-all relative ${
                    isActive
                      ? "text-[#FF7900] bg-[#EFFBF8]"
                      : "text-[#102E4D] hover:text-[#FF7900] hover:bg-[#EFFBF8]/70"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-1 left-3.5 right-3.5 h-[2px] bg-[#FF7900] rounded-full" />
                  )}
                </Link>
              );
            })}

            {/* Apply Now Primary CTA */}
            <div className="ml-3 pl-3 border-l border-slate-200">
              <Link
                href="/apply"
                className="h-9 px-5 inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#FF7900] to-[#E56D00] hover:from-[#E56D00] hover:to-[#CC5F00] text-white font-bold text-xs uppercase tracking-wider shadow-sm hover:shadow-md active:scale-98 transition-all shrink-0 cursor-pointer"
              >
                <span>Apply Now</span>
                <MdArrowForward className="text-[15px]" />
              </Link>
            </div>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-[#102E4D] hover:bg-[#EFFBF8] focus:outline-none flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#D7F5EF] px-5 py-4 space-y-3 shadow-2xl">
          <nav className="flex flex-col space-y-1 text-sm font-semibold text-[#102E4D]">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3.5 py-2.5 rounded-lg transition-colors ${
                  pathname === link.href
                    ? "bg-[#EFFBF8] text-[#FF7900] font-bold"
                    : "hover:bg-[#EFFBF8] text-[#102E4D]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            <Link
              href="/apply"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-xl bg-[#FF7900] hover:bg-[#E56D00] text-white font-bold text-sm shadow-md"
            >
              Apply Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { SITE, MAIN_NAV, HEADER_CTA, ANNOUNCEMENTS } from "@/config/site";
import logoMark from "@/assets/images/logo-mark.png";
import { Menu, X, ArrowRight, Sparkles } from "lucide-react";

export function SiteHeader() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [announcementIndex, setAnnouncementIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cycle announcements periodically if multiple
  useEffect(() => {
    if (ANNOUNCEMENTS.length <= 1) return;
    const interval = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const currentAnnouncement = ANNOUNCEMENTS[announcementIndex] || ANNOUNCEMENTS[0];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        {/* Top Announcement Bar */}
        <div className="bg-navy-950 text-white border-b border-white/10 text-xs py-2 px-4 transition-all">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-hidden mx-auto md:mx-0">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gold/20 text-gold-400 font-bold uppercase tracking-wider text-[10px] shrink-0">
                <Sparkles className="w-3 h-3 text-gold-400 animate-spin-slow" />
                <span>Announcement</span>
              </span>
              {currentAnnouncement.href ? (
                <Link
                  href={currentAnnouncement.href}
                  className="truncate hover:text-gold-400 transition-colors flex items-center gap-1 group font-medium"
                >
                  <span className="truncate">{currentAnnouncement.text}</span>
                  <ArrowRight className="w-3 h-3 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ) : (
                <span className="truncate text-white/90 font-medium">{currentAnnouncement.text}</span>
              )}
            </div>

            {/* Quick contact on desktop right */}
            <div className="hidden lg:flex items-center gap-4 text-white/75 shrink-0 text-[11px]">
              <a
                href={SITE.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                WhatsApp: <span className="text-white font-semibold">{SITE.whatsappDisplay}</span>
              </a>
              <span className="text-white/20">|</span>
              <a href={`mailto:${SITE.email}`} className="hover:text-white transition-colors">
                {SITE.email}
              </a>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div
          className={`w-full transition-all duration-300 ${
            isScrolled
              ? "bg-white/95 backdrop-blur-md shadow-md py-2.5 border-b border-line"
              : "bg-white/90 backdrop-blur-sm py-3.5 border-b border-line/60"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            {/* Brand Logo & Wordmark */}
            <Link
              href="/"
              className="flex items-center gap-3 sm:gap-3.5 group shrink-0 focus-visible:outline-none"
              aria-label="The Leadership Covenant Home"
            >
              <div className="relative w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-xl overflow-hidden flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform duration-300">
                <Image
                  src={logoMark}
                  alt="The Leadership Covenant Emblem"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-navy-900 text-lg sm:text-xl lg:text-[22px] leading-tight tracking-tight group-hover:text-teal-800 transition-colors">
                  {SITE.name}
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-muted uppercase">
                  {SITE.tagline}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {MAIN_NAV.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-3.5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "text-navy-900 bg-mint-100/80 shadow-xs"
                        : "text-ink/80 hover:text-navy-900 hover:bg-black/5"
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-teal" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Side CTA Button */}
            <div className="hidden sm:flex items-center gap-3 shrink-0">
              <Link href={HEADER_CTA.href} className="btn btn-gold text-xs sm:text-sm font-bold shadow-md">
                <span>{HEADER_CTA.label}</span>
                <ArrowRight className="w-4 h-4 icon-shift" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2.5 rounded-xl text-navy-900 hover:bg-black/5 focus:outline-none transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-b border-line px-5 py-5 space-y-4 shadow-xl animate-fade-up">
            <nav className="flex flex-col space-y-1.5">
              {MAIN_NAV.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 py-3 rounded-xl text-base font-bold transition-colors flex items-center justify-between ${
                      isActive ? "bg-navy-900 text-white" : "text-ink hover:bg-mint-50"
                    }`}
                  >
                    <span>{item.label}</span>
                    <ArrowRight className={`w-4 h-4 ${isActive ? "text-gold" : "text-muted"}`} />
                  </Link>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-line flex flex-col gap-3">
              <Link
                href={HEADER_CTA.href}
                onClick={() => setMobileOpen(false)}
                className="btn btn-gold w-full text-center justify-center font-bold"
              >
                <span>{HEADER_CTA.label}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="text-xs text-muted text-center pt-1 space-y-1">
                <p>
                  Call / WhatsApp:{" "}
                  <a href={SITE.whatsappUrl} className="font-semibold text-navy-900 underline">
                    {SITE.whatsappDisplay}
                  </a>
                </p>
                <p className="text-[11px]">{SITE.address.full}</p>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Spacer so page content starts below the fixed header */}
      <div className="h-24 sm:h-26" aria-hidden="true" />
    </>
  );
}

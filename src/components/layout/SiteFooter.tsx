import React from "react";
import Link from "next/link";
import Image from "next/image";
import { SITE, MAIN_NAV } from "@/config/site";
import logoWhite from "@/assets/images/logo-white.png";
import {
  IconLinkedIn,
  IconFacebook,
  IconInstagram,
  IconWhatsApp,
} from "@/components/icons/BrandIcons";
import { Mail, Phone, MapPin, ArrowUpRight, Heart } from "lucide-react";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-950 text-white relative overflow-hidden border-t border-white/10">
      {/* Decorative Rainbow Brand Stripe */}
      <div className="h-1.5 w-full brand-bar" aria-hidden="true" />

      {/* Background glow effects */}
      <div
        className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-teal/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-10 w-96 h-96 rounded-full bg-brand-crimson/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-14 border-b border-white/10">
          {/* Column 1: Brand & Socials (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <Link href="/" className="inline-flex items-center gap-3.5 group">
              <div className="relative w-12 h-14 shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Image
                  src={logoWhite}
                  alt="The Leadership Covenant Logo"
                  width={48}
                  height={56}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-xl sm:text-2xl text-white tracking-tight">
                  {SITE.name}
                </span>
                <span className="text-[11px] font-semibold tracking-wider text-seafoam uppercase">
                  {SITE.tagline}
                </span>
              </div>
            </Link>

            <p className="text-sm text-white/75 leading-relaxed max-w-md">
              {SITE.footerBlurb}
            </p>

            <div className="pt-2">
              <span className="text-xs font-semibold text-white/60 uppercase tracking-widest block mb-3">
                Connect With Us
              </span>
              <div className="flex items-center gap-3">
                <a
                  href={SITE.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white hover:text-navy-950 flex items-center justify-center transition-all duration-200"
                  aria-label="The Leadership Covenant on LinkedIn"
                >
                  <IconLinkedIn className="w-4 h-4" />
                </a>
                <a
                  href={SITE.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white hover:text-navy-950 flex items-center justify-center transition-all duration-200"
                  aria-label="The Leadership Covenant on Facebook"
                >
                  <IconFacebook className="w-4 h-4" />
                </a>
                <a
                  href={SITE.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white hover:text-navy-950 flex items-center justify-center transition-all duration-200"
                  aria-label="The Leadership Covenant on Instagram"
                >
                  <IconInstagram className="w-4 h-4" />
                </a>
                <a
                  href={SITE.social.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all duration-200"
                  aria-label="The Leadership Covenant on WhatsApp"
                >
                  <IconWhatsApp className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Explore Navigation (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="font-display font-semibold text-base text-white tracking-wide">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm text-white/75">
              {MAIN_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-gold-400 hover:translate-x-1 inline-flex items-center gap-1 transition-all"
                  >
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/summit"
                  className="hover:text-gold-400 hover:translate-x-1 inline-flex items-center gap-1.5 transition-all text-gold-400 font-semibold"
                >
                  <span>School Impact Summit 2026</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-white hover:translate-x-1 inline-flex items-center gap-1 transition-all text-xs text-white/50 pt-2"
                >
                  <span>Privacy Policy</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Address (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="font-display font-semibold text-base text-white tracking-wide">
              Contact
            </h3>
            <ul className="space-y-3.5 text-sm text-white/80">
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="inline-flex items-start gap-3 hover:text-gold-400 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-gold/20 group-hover:text-gold transition-colors mt-0.5">
                    <Mail className="w-4 h-4 text-seafoam" />
                  </div>
                  <div>
                    <span className="block text-xs text-white/50">Email</span>
                    <span className="font-medium break-all">{SITE.email}</span>
                  </div>
                </a>
              </li>

              <li>
                <a
                  href={SITE.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-start gap-3 hover:text-gold-400 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors mt-0.5">
                    <Phone className="w-4 h-4 text-seafoam" />
                  </div>
                  <div>
                    <span className="block text-xs text-white/50">WhatsApp / Call</span>
                    <span className="font-medium">{SITE.whatsappDisplay}</span>
                  </div>
                </a>
              </li>

              <li>
                <a
                  href={SITE.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-start gap-3 hover:text-gold-400 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-brand-crimson/20 group-hover:text-brand-crimson transition-colors mt-0.5">
                    <MapPin className="w-4 h-4 text-seafoam" />
                  </div>
                  <div>
                    <span className="block text-xs text-white/50">Address</span>
                    <span className="font-medium leading-relaxed">{SITE.address.full}</span>
                  </div>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <p>© {currentYear} {SITE.name}. All rights reserved.</p>
          <div className="flex items-center gap-2 text-seafoam font-display italic text-sm">
            <span>“{SITE.signoff}”</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

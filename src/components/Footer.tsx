import React from "react";
import Link from "next/link";
import {
  FaFacebook,
  FaLinkedin,
  FaInstagram,
  FaWhatsapp,
} from "react-icons/fa";
import {
  MdChevronRight,
  MdLocationOn,
  MdPhone,
  MdMail,
} from "react-icons/md";

const exploreLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Our Story", href: "/about" },
  { label: "Activities", href: "/activities" },
  { label: "Contact", href: "/contact" },
];

const serviceLinks = [
  { label: "Leader in Me", href: "/services#leader-in-me" },
  { label: "LeaderU", href: "/services#leader-u" },
  {
    label: "Professional Development",
    href: "/services#professional-development",
  },
  { label: "Leadership Camps", href: "/services#leadership-camps" },
  { label: "Family Sessions", href: "/services#family-sessions" },
  { label: "Leadership Podcast", href: "/services#podcast" },
];

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-b from-[#001B33] via-[#061F38] to-[#001224] text-white relative overflow-hidden border-t border-white/10">
      {/* Top Signature Gold -> Orange Accent Strip */}
      <div className="h-[3px] w-full bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#FFC400]" />

      {/* Subtle Ambient Glows */}
      <div className="absolute -top-32 left-1/4 w-96 h-48 rounded-full bg-[#FFC400]/[0.06] blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 right-1/4 w-96 h-48 rounded-full bg-[#FF7900]/[0.06] blur-3xl pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-7 relative z-10">
        {/* Main Grid: Compact 2-Column on Mobile, 12-Column on Desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-x-6 sm:gap-x-8 gap-y-7 sm:gap-y-8 pb-9 sm:pb-11 border-b border-white/10 items-start">
          {/* Col 1: Compact Brand Lockup, Mission & Socials (Full width on mobile/tablet, 4 cols on desktop) */}
          <div className="col-span-2 lg:col-span-4 space-y-3.5 sm:space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-3 sm:gap-3.5 group max-w-full"
            >
              <div className="w-11 h-11 sm:w-[52px] sm:h-[52px] flex items-center justify-center shrink-0">
                <img
                  alt="The Leadership Covenant"
                  className="w-full h-full object-contain"
                  src="/images/footerlogo-transparent.png"
                />
              </div>

              <div className="min-w-0">
                <span className="font-serif font-extrabold text-base sm:text-lg lg:text-[21px] text-white leading-tight tracking-tight block group-hover:text-[#FFC400] transition-colors">
                  The Leadership Covenant
                </span>
                <span className="text-[9.5px] sm:text-[10px] lg:text-[10.5px] font-bold uppercase tracking-widest text-[#FFC400] block mt-0.5">
                  Learn • Develop • Lead • Transform
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-[13px] text-slate-300/90 leading-relaxed max-w-sm">
              The Leadership Covenant exists to prepare individuals for life, organizations for meaningful contribution, and education for awareness and wisdom.
            </p>

            {/* Social Channels */}
            <div className="pt-1 flex items-center gap-2 sm:gap-2.5">
              <a
                aria-label="LinkedIn"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/[0.06] border border-white/12 text-slate-300 flex items-center justify-center hover:bg-[#FF7900] hover:text-white hover:border-[#FF7900] hover:-translate-y-0.5 transition-all duration-200"
                href="https://www.linkedin.com/company/franklincovey-education-north-region/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaLinkedin size={14} />
              </a>
              <a
                aria-label="Facebook"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/[0.06] border border-white/12 text-slate-300 flex items-center justify-center hover:bg-[#FF7900] hover:text-white hover:border-[#FF7900] hover:-translate-y-0.5 transition-all duration-200"
                href="https://web.facebook.com/profile.php?id=61592161942804"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaFacebook size={14} />
              </a>
              <a
                aria-label="Instagram"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/[0.06] border border-white/12 text-slate-300 flex items-center justify-center hover:bg-[#FF7900] hover:text-white hover:border-[#FF7900] hover:-translate-y-0.5 transition-all duration-200"
                href="https://www.instagram.com/franklincoveyeducation_north/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram size={14} />
              </a>
              <a
                aria-label="WhatsApp"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/[0.06] border border-white/12 text-slate-300 flex items-center justify-center hover:bg-[#25D366] hover:text-white hover:border-[#25D366] hover:-translate-y-0.5 transition-all duration-200"
                href="https://wa.me/923192091249"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaWhatsapp size={14} />
              </a>
            </div>
          </div>

          {/* Col 2: Explore (1 column on mobile side-by-side with Services, 2 cols on desktop) */}
          <div className="col-span-1 lg:col-span-2 space-y-3 sm:space-y-3.5">
            <h4 className="text-[11.5px] sm:text-xs font-extrabold uppercase tracking-widest text-[#FFC400] pb-2 border-b border-white/10 flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-[#FF7900] rounded-xs" />
              <span>Explore</span>
            </h4>
            <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-[13px] text-slate-300">
              {exploreLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    className="hover:text-[#FFC400] transition-colors inline-flex items-center gap-1 sm:gap-1.5 group"
                    href={item.href}
                  >
                    <MdChevronRight className="text-xs sm:text-sm text-[#FF7900] group-hover:translate-x-0.5 transition-transform shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Services (1 column on mobile side-by-side with Explore, 3 cols on desktop) */}
          <div className="col-span-1 lg:col-span-3 space-y-3 sm:space-y-3.5">
            <h4 className="text-[11.5px] sm:text-xs font-extrabold uppercase tracking-widest text-[#FFC400] pb-2 border-b border-white/10 flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-[#FF7900] rounded-xs" />
              <span>Services</span>
            </h4>
            <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-[13px] text-slate-300">
              {serviceLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    className="hover:text-[#FFC400] transition-colors inline-flex items-center gap-1 sm:gap-1.5 group"
                    href={item.href}
                  >
                    <MdChevronRight className="text-xs sm:text-sm text-[#FF7900] group-hover:translate-x-0.5 transition-transform shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact & Details (Full width on mobile/tablet, 3 cols on desktop) */}
          <div className="col-span-2 lg:col-span-3 space-y-3 sm:space-y-3.5 pt-3 sm:pt-0 border-t border-white/10 lg:border-t-0">
            <h4 className="text-[11.5px] sm:text-xs font-extrabold uppercase tracking-widest text-[#FFC400] pb-2 border-b border-white/10 flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-[#FF7900] rounded-xs" />
              <span>Contact</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 sm:gap-3 text-xs sm:text-[13px] text-slate-300">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0">
                  <MdLocationOn className="text-sm text-[#FFC400]" />
                </span>
                <span className="font-num leading-snug">
                  F-10/3, Islamabad
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0">
                  <MdPhone className="text-sm text-[#FFC400]" />
                </span>
                <a
                  href="https://wa.me/923192091249"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-num font-semibold text-white/95 hover:text-[#FFC400] transition-colors"
                >
                  +92 319 2091249 (WhatsApp)
                </a>
              </div>

              <div className="flex items-center gap-2.5 sm:col-span-2 lg:col-span-1">
                <span className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0">
                  <MdMail className="text-sm text-[#FFC400]" />
                </span>
                <a
                  href="mailto:theleadershipcovenant@gmail.com"
                  className="hover:text-[#FFC400] transition-colors break-all"
                >
                  theleadershipcovenant@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal Links */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="text-center sm:text-left">
            <span>
              &copy;{" "}
              <span className="font-num font-semibold text-slate-300">
                2026
              </span>{" "}
              The Leadership Covenant. All rights reserved.
            </span>
            <span className="hidden sm:inline mx-2 text-white/20">|</span>
            <span className="block sm:inline text-[#FFC400]/90 font-semibold">
              Change starts here.
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <Link
              href="/activities"
              className="hover:text-[#FFC400] transition-colors"
            >
              Upcoming Activities
            </Link>
            <span className="text-white/20">•</span>
            <Link
              href="/privacy"
              className="hover:text-[#FFC400] transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-white/20">•</span>
            <Link
              href="/contact"
              className="hover:text-[#FFC400] transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

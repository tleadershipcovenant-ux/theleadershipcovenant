import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import { SITE } from "@/config/site";

export default function FloatingWhatsApp() {
  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[90] print:hidden">
      <a
        href={SITE.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Chat with The Leadership Covenant on WhatsApp (${SITE.whatsappDisplay})`}
        className="group relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white shadow-[0_10px_28px_-4px_rgba(37,211,102,0.55)] hover:shadow-[0_14px_34px_-4px_rgba(37,211,102,0.7)] hover:-translate-y-1 active:scale-95 transition-[transform,box-shadow] duration-200 ease-out"
      >
        {/* Subtle ambient pulse halo */}
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-[#25D366]/35 animate-ping [animation-duration:2.8s] pointer-events-none"
        />

        {/* Crisp inner ring */}
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full ring-2 ring-white/25 pointer-events-none"
        />

        {/* WhatsApp Icon */}
        <FaWhatsapp className="relative z-10 text-[27px] sm:text-[30px] drop-shadow-xs" />

        {/* Desktop Hover Label Pill */}
        <span className="pointer-events-none hidden sm:inline-flex items-center gap-2 whitespace-nowrap absolute right-full mr-3 px-3.5 py-2 rounded-xl bg-[#001B33] text-white text-xs font-bold tracking-wide shadow-lg border border-white/15 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-[opacity,transform] duration-200 ease-out">
          <span className="w-2 h-2 rounded-full bg-[#25D366]" />
          <span>WhatsApp Us</span>
        </span>
      </a>
    </div>
  );
}


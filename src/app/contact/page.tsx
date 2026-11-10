import React from "react";
import ReactDOM from "react-dom";
import type { Metadata } from "next";
import ContactHero from "@/components/contact/ContactHero";
import ContactSection from "@/components/ContactSection";
import ContactMapSection from "@/components/contact/ContactMapSection";
import { SITE_URL } from "@/config/site";
import { ContactStructuredData } from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: "Contact Us - The Leadership Covenant",
  description:
    "Get in touch with The Leadership Covenant in F-10/3, Islamabad. Address, phone, WhatsApp, email and online enquiry form for schools, educators, and families.",
  keywords: [
    "Contact The Leadership Covenant",
    "FranklinCovey Education Islamabad Office",
    "Leadership Training Enquiry Pakistan",
    "The Leadership Covenant F-10 Islamabad",
  ],
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Us - The Leadership Covenant Islamabad",
    description:
      "Get in touch with The Leadership Covenant in F-10/3, Islamabad. Address, phone, WhatsApp, email and online enquiry form.",
    url: `${SITE_URL}/contact`,
    siteName: "The Leadership Covenant",
    images: [
      {
        url: "/OG_Image.png",
        width: 1672,
        height: 941,
        alt: "Contact The Leadership Covenant in Islamabad",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us - The Leadership Covenant Islamabad",
    description:
      "Get in touch with The Leadership Covenant in F-10/3, Islamabad. Address, phone, WhatsApp, email and online enquiry form.",
    images: ["/OG_Image.png"],
  },
};

export default function ContactPage() {
  ReactDOM.preload("/Contact/C1.png", {
    as: "image",
    fetchPriority: "high",
  });

  return (
    <main className="w-full pt-[68px] md:pt-[112px]">
      <ContactStructuredData />
      {/* 1. Executive Hero Section — Photographic Backdrop + Midnight Navy Overlay */}
      <section className="relative w-full overflow-hidden bg-[#001B33] text-white py-14 sm:py-18 lg:py-22 min-h-[360px] sm:min-h-[400px] flex items-center justify-center border-b border-white/10">
        {/* Top Signature Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#FFC400] z-20" />

        {/* Atmospheric Background Image */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src="/Contact/C1.png"
            alt="Connect with The Leadership Covenant team in Islamabad"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover object-center opacity-40 transform-gpu"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#001B33]/80 via-[#001B33]/75 to-[#001B33]/90" />
          <div className="absolute -top-24 left-1/4 w-96 h-48 bg-[#FFC400]/12 rounded-full blur-3xl transform-gpu" />
          <div className="absolute -bottom-24 right-1/4 w-96 h-48 bg-[#FF7900]/12 rounded-full blur-3xl transform-gpu" />
        </div>

        <ContactHero />
      </section>

      {/* 2. Main Contact Component (Details & Enquiry Form) */}
      <ContactSection />

      {/* 3. Find Us in Islamabad Map Section */}
      <ContactMapSection />
    </main>
  );
}

import React from "react";
import ReactDOM from "react-dom";
import type { Metadata } from "next";
import PrivacyContent from "@/components/privacy/PrivacyContent";
import { SITE_URL } from "@/config/site";
import { PrivacyStructuredData } from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: "Privacy Policy & Data Governance - The Leadership Covenant",
  description:
    "Institutional privacy policy, student data safeguards, and data governance at The Leadership Covenant Pakistan. Authorized FranklinCovey Education Partner.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy & Data Governance - The Leadership Covenant",
    description:
      "Institutional privacy policy, student data safeguards, and data governance at The Leadership Covenant Pakistan. Authorized FranklinCovey Education Partner.",
    url: `${SITE_URL}/privacy`,
    siteName: "The Leadership Covenant",
    images: [
      {
        url: "/OG_Image.png",
        width: 1672,
        height: 941,
        alt: "The Leadership Covenant Privacy Policy & Data Governance",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy & Data Governance - The Leadership Covenant",
    description:
      "Institutional privacy policy, student data safeguards, and data governance at The Leadership Covenant Pakistan.",
    images: ["/OG_Image.png"],
  },
};

export default function PrivacyPage() {
  ReactDOM.preload("/Privicy%20Policy/privacy-policy.webp", {
    as: "image",
    fetchPriority: "high",
  });

  return (
    <main className="w-full pt-[68px] md:pt-[112px]">
      <PrivacyStructuredData />
      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. EXECUTIVE HERO SECTION WITH USER-REQUESTED IMAGE        */}
      {/* ────────────────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden bg-[#001B33] text-white py-14 sm:py-20 lg:py-24 min-h-[340px] sm:min-h-[400px] flex items-center justify-center border-b border-white/10">
        {/* Top Signature Gold/Orange Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#FFC400] z-20" />

        {/* Bottom Signature Accent Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#FFC400] z-20 shadow-xs" />

        {/* Atmospheric Background Image Layer with User-Provided Image */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src="/Privicy%20Policy/privacy-policy.webp"
            alt="The Leadership Covenant Privacy Policy and Data Governance"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover object-center opacity-30 transform-gpu scale-105"
          />
          {/* Executive Midnight Navy Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#001B33]/85 via-[#001B33]/80 to-[#001B33]/95" />
          <div className="absolute -top-24 left-1/4 w-96 h-48 bg-[#FFC400]/12 rounded-full blur-3xl transform-gpu" />
          <div className="absolute -bottom-24 right-1/4 w-96 h-48 bg-[#FF7900]/12 rounded-full blur-3xl transform-gpu" />
        </div>

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center w-full">
          {/* Main Headline */}
          <h1 className="font-serif font-extrabold text-3xl sm:text-5xl lg:text-[54px] text-white leading-[1.12] tracking-tight max-w-4xl mx-auto drop-shadow-[0_2px_14px_rgba(0,0,0,0.8)]">
            Privacy Policy &amp;{" "}
            <span className="text-[#FFC400]">Data Protection</span>
          </h1>

          <div className="w-20 h-1 bg-[#FFC400] mx-auto mt-4 rounded-full" />

          {/* Subtitle Statement */}
          <p className="text-sm sm:text-base lg:text-lg text-white/95 mt-5 max-w-2xl mx-auto leading-relaxed font-normal drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)]">
            How The Leadership Covenant safeguards the personal information, school records, student privacy, and digital interactions of educators, parents, and youth across our programs.
          </p>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. ARTICULATED POLICY SECTIONS + ANIMATIONS                */}
      {/* ────────────────────────────────────────────────────────── */}
      <PrivacyContent />
    </main>
  );
}

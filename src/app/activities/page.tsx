import React from "react";
import ReactDOM from "react-dom";
import type { Metadata } from "next";
import ActivitiesExplorer from "@/components/activities/ActivitiesExplorer";
import ActivitiesHero from "@/components/activities/ActivitiesHero";
import { getCmsPage } from "@/lib/firebase-cms";
import { EVENTS, type LeadershipEvent } from "@/content/events";

export const metadata: Metadata = {
  title: "Upcoming Activities - The Leadership Covenant",
  description:
    "Explore 2026 leadership camps, cohorts, summits, family sessions and educator workshops across Islamabad, Peshawar and Swat, and apply online in minutes.",
  alternates: {
    canonical: "/activities",
  },
};

export default async function ActivitiesPage() {
  let initialEvents: LeadershipEvent[] = EVENTS;
  let pageVisible = true;
  try {
    const page = await getCmsPage("events");
    if (
      page?.content?.events &&
      Array.isArray(page.content.events) &&
      page.content.events.length > 0
    ) {
      initialEvents = page.content.events as LeadershipEvent[];
    }
    if (page?.content?._visible === false) {
      pageVisible = false;
    }
  } catch {
    // Graceful fallback to static EVENTS
  }

  ReactDOM.preload("/Activities/A1.png", {
    as: "image",
    fetchPriority: "high",
  });

  return (
    <main className="w-full pt-[68px] md:pt-[112px]">
      {/* 1. Executive Hero Section — Server-Rendered Photographic Backdrop + Midnight Navy Overlay */}
      <section className="relative w-full overflow-hidden bg-[#001B33] text-white py-14 sm:py-18 lg:py-22 min-h-[360px] sm:min-h-[400px] flex items-center justify-center border-b border-white/10">
        {/* Top Signature Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#FFC400] z-20" />

        {/* Atmospheric Background Image */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src="/Activities/A1.png"
            alt="Upcoming leadership camps, summits and cohorts at The Leadership Covenant"
            fetchPriority="high"
            decoding="async"
            className="w-full h-[106%] -top-[3%] object-cover object-[center_42%] opacity-40 transform-gpu translate-y-0"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#001B33]/80 via-[#001B33]/75 to-[#001B33]/90" />
          <div className="absolute -top-24 left-1/4 w-96 h-48 bg-[#FFC400]/12 rounded-full blur-3xl transform-gpu" />
          <div className="absolute -bottom-24 right-1/4 w-96 h-48 bg-[#FF7900]/12 rounded-full blur-3xl transform-gpu" />
        </div>

        <ActivitiesHero />
      </section>

      {/* 2 & 3. Fast Interactive Activity Explorer + Calendar Grid + Apply Form */}
      <ActivitiesExplorer initialEvents={initialEvents} pageVisible={pageVisible} />
    </main>
  );
}

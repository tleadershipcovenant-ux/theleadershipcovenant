"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { EVENTS, EventCategory, CATEGORY_LABELS } from "@/content/events";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { EventCard } from "@/components/activities/EventCard";
import { ApplyForm } from "@/components/forms/ApplyForm";
import { CheckCircle2, Filter } from "lucide-react";

export function ActivitiesClientView() {
  const searchParams = useSearchParams();
  const queryActivity = searchParams?.get("activity") || "";

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedActivity, setSelectedActivity] = useState<string>(queryActivity);
  const applySectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (queryActivity) {
      setSelectedActivity(queryActivity);
    }
  }, [queryActivity]);

  const handleSelectActivity = (slug: string) => {
    setSelectedActivity(slug);
    // Smooth scroll to apply form
    const el = document.getElementById("apply");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const filteredEvents =
    selectedCategory === "all"
      ? EVENTS
      : EVENTS.filter((e) => e.category === selectedCategory);

  const categories = [
    { key: "all", label: "All Activities" },
    { key: "professional_development", label: "Professional Development" },
    { key: "lim_community", label: "Community Events" },
    { key: "wellness", label: "Wellness" },
    { key: "leaderu", label: "LeaderU" },
    { key: "family_session", label: "Family Sessions" },
    { key: "student_camp", label: "Student Camps" },
    { key: "summit", label: "Summit" },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* 1. HERO SECTION */}
      <section className="pt-12 pb-14 md:pt-16 md:pb-20 bg-gradient-to-b from-canvas via-mint-50/60 to-canvas border-b border-line">
        <div className="container-x text-center max-w-4xl mx-auto space-y-5" data-reveal>
          <Eyebrow tone="teal">Upcoming Activities</Eyebrow>

          <h1 className="display-1 text-navy-900 font-semibold">
            Find your next leadership moment.
          </h1>

          <p className="lead text-ink/80 max-w-2xl mx-auto">
            Camps, cohorts, summits, family evenings, and open workshops. Pick what fits and apply in minutes.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {categories.map((c) => {
              const isActive = selectedCategory === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setSelectedCategory(c.key)}
                  className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-navy-900 text-white shadow-xs"
                      : "bg-white text-ink/80 border border-line hover:border-teal hover:bg-mint-50"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. ACTIVITIES GRID (9 cards) */}
      <section className="py-16 md:py-24 bg-white border-b border-line">
        <div className="container-x">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredEvents.map((event, idx) => (
              <div
                key={event.slug}
                data-reveal
                style={{ ["--reveal-delay" as string]: `${idx * 80}ms` }}
              >
                <EventCard
                  event={event}
                  onSelect={handleSelectActivity}
                />
              </div>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12 text-muted">
              <p>No activities currently listed in this category.</p>
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className="mt-3 text-sm font-bold text-navy-900 underline"
              >
                Show all activities
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 3. APPLY ONLINE SECTION */}
      <section id="apply" ref={applySectionRef} className="py-20 md:py-28 bg-canvas">
        <div className="container-x">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Left Info Column (5 cols) */}
            <div className="lg:col-span-5 space-y-6" data-reveal>
              <Eyebrow tone="gold">Apply Online</Eyebrow>

              <h2 className="display-2 text-navy-900">
                Reserve your seat in a few clicks.
              </h2>

              <p className="lead text-ink/80">
                Complete the form and our activities team will confirm availability, share the joining
                details and answer any questions within one working day.
              </p>

              {/* Assurance Bullets */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm font-semibold text-navy-900 bg-white p-3.5 rounded-xl border border-line shadow-xs">
                  <CheckCircle2 className="w-5 h-5 text-teal shrink-0" />
                  <span>Applications reviewed within 24 hours</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-semibold text-navy-900 bg-white p-3.5 rounded-xl border border-line shadow-xs">
                  <CheckCircle2 className="w-5 h-5 text-teal shrink-0" />
                  <span>Group and school bookings are welcomed</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-semibold text-navy-900 bg-white p-3.5 rounded-xl border border-line shadow-xs">
                  <CheckCircle2 className="w-5 h-5 text-teal shrink-0" />
                  <span>Early Bird and group discounts available</span>
                </div>
              </div>
            </div>

            {/* Right Form Column (7 cols) */}
            <div className="lg:col-span-7" data-reveal="zoom">
              <ApplyForm initialActivity={selectedActivity} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

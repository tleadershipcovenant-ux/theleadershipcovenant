"use client";

import React from "react";
import { LeadershipEvent } from "@/content/events";
import { EventCard } from "./EventCard";

interface EventsMarqueeProps {
  events: LeadershipEvent[];
}

export function EventsMarquee({ events }: EventsMarqueeProps) {
  // Duplicate array once for seamless infinite loop
  const loopEvents = [...events, ...events];

  return (
    <div className="relative w-full overflow-hidden py-4 mask-fade-x">
      <div
        className="marquee-track flex gap-6 w-max animate-marquee"
        style={{ "--marquee-duration": `${events.length * 7}s` } as React.CSSProperties}
      >
        {loopEvents.map((event, idx) => (
          <div
            key={`${event.slug}-${idx}`}
            className="w-[320px] sm:w-[360px] shrink-0"
          >
            <EventCard event={event} />
          </div>
        ))}
      </div>
    </div>
  );
}

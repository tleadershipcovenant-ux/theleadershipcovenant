"use client";

import React, { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ApplyForm } from "@/components/forms/ApplyForm";
import type { LeadershipEvent } from "@/content/events";

interface ApplyBookingViewProps {
  initialEvents?: LeadershipEvent[];
}

function ApplyBookingContent({ initialEvents }: ApplyBookingViewProps) {
  const searchParams = useSearchParams();
  const rawActivity = searchParams?.get("activity") || "";
  const initialActivity = rawActivity ? decodeURIComponent(rawActivity).trim() : undefined;

  useEffect(() => {
    // If arriving with hash or a selected activity, auto-scroll directly to the Seat Booking & Registration Form
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      const shouldScroll =
        hash === "#apply-form" ||
        hash === "#booking-form" ||
        hash === "#seat-booking-form" ||
        hash === "#apply" ||
        Boolean(initialActivity);

      if (shouldScroll) {
        const timer = window.setTimeout(() => {
          const formEl =
            document.getElementById("apply-form") ||
            document.getElementById("booking-form");
          if (formEl) {
            formEl.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 120);
        return () => window.clearTimeout(timer);
      }
    }
  }, [initialActivity]);

  return (
    <div className="w-full">
      <ApplyForm
        initialActivity={initialActivity}
        initialEvents={initialEvents}
      />
    </div>
  );
}

export default function ApplyBookingView({ initialEvents }: ApplyBookingViewProps) {
  return (
    <Suspense
      fallback={
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-[#102E4D]/20 border-t-[#FF7900] rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Loading online booking system...
          </p>
        </div>
      }
    >
      <ApplyBookingContent initialEvents={initialEvents} />
    </Suspense>
  );
}


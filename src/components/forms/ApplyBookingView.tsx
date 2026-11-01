"use client";

import React, { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ApplyForm } from "@/components/forms/ApplyForm";

function ApplyBookingContent() {
  const searchParams = useSearchParams();
  const initialActivity = searchParams?.get("activity") || undefined;

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
      <ApplyForm initialActivity={initialActivity} />
    </div>
  );
}

export default function ApplyBookingView() {
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
      <ApplyBookingContent />
    </Suspense>
  );
}


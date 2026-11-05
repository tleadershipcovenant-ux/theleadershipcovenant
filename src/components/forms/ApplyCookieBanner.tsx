"use client";

import React, { useState, useEffect } from "react";
import { Cookie, Check, ShieldCheck } from "lucide-react";
import {
  getCookieConsent,
  setCookieConsent,
  type CookieConsentStatus,
} from "@/lib/apply-cookies";

interface ApplyCookieBannerProps {
  onConsentChange?: (status: "accepted" | "rejected") => void;
}

export default function ApplyCookieBanner({
  onConsentChange,
}: ApplyCookieBannerProps) {
  const [consentStatus, setConsentStatus] = useState<CookieConsentStatus>("undecided");
  const [mounted, setMounted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const initial = getCookieConsent();
    setConsentStatus(initial);
  }, []);

  const handleAccept = () => {
    setCookieConsent("accepted");
    setConsentStatus("accepted");
    onConsentChange?.("accepted");
    showToast("Cookies accepted · Form draft will be saved.");
  };

  const handleReject = () => {
    setCookieConsent("rejected");
    setConsentStatus("rejected");
    onConsentChange?.("rejected");
    showToast("Cookies declined · Form draft saving disabled.");
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  if (!mounted) return null;

  // Only render when the user has not yet decided
  if (consentStatus !== "undecided") {
    // If a temporary confirmation toast is active, show only the toast
    if (toastMessage) {
      return (
        <div className="fixed top-20 right-4 z-50 bg-[#001B33] text-white border border-[#FFC400]/40 shadow-2xl px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
          <span>{toastMessage}</span>
        </div>
      );
    }
    return null;
  }

  return (
    <>
      {/* ─── COMPACT LANDSCAPE BOTTOM COOKIE BANNER ─── */}
      <aside
        role="region"
        aria-label="Cookie preferences"
        className="fixed bottom-0 inset-x-0 z-50 p-2 sm:p-3 pointer-events-none pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] sm:pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]"
      >
        <div className="pointer-events-auto max-w-5xl mx-auto w-full relative overflow-hidden rounded-xl sm:rounded-2xl bg-[#001B33]/95 backdrop-blur-xl text-white border border-white/15 shadow-[0_14px_40px_rgba(0,15,30,0.6)] px-3.5 py-2.5 sm:px-4 sm:py-3 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 transform-gpu">
          {/* Top signature gradient accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#10B981]" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3.5">
            {/* Left / Info Section */}
            <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#FF7900]/20 text-[#FFC400] border border-[#FFC400]/30 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                <Cookie className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                  <span className="font-semibold text-xs sm:text-[13px] text-white">
                    Cookie Notice
                  </span>
                  <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#FFC400] bg-[#FFC400]/15 border border-[#FFC400]/25 px-1.5 py-0.2 rounded">
                    Draft Saving
                  </span>
                </div>

                <p className="text-[11.5px] sm:text-xs text-slate-300 leading-snug">
                  We use cookies to save your application draft (contact info &amp; selected cohort) so your progress is preserved if you refresh.
                </p>
              </div>
            </div>

            {/* Right / Actions Section */}
            <div className="flex items-center gap-2 shrink-0 pt-1.5 md:pt-0 border-t border-white/10 md:border-t-0">
              <button
                type="button"
                onClick={handleReject}
                className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg bg-white/8 hover:bg-white/15 text-slate-200 hover:text-white text-xs font-semibold border border-white/15 transition-all cursor-pointer active:scale-95 text-center min-w-[78px] sm:min-w-[85px]"
              >
                Reject
              </button>

              <button
                type="button"
                onClick={handleAccept}
                className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#FF7900] to-[#E56D00] hover:from-[#E56D00] hover:to-[#CC5F00] text-white text-xs font-bold tracking-wide border border-[#FFC400]/40 shadow-md shadow-[#FF7900]/20 transition-all cursor-pointer active:scale-95 inline-flex items-center justify-center gap-1.5 min-w-[125px] sm:min-w-[135px]"
              >
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Accept Cookies</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── TEMPORARY CONFIRMATION TOAST ─── */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#001B33] text-white border border-[#FFC400]/40 shadow-2xl px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}

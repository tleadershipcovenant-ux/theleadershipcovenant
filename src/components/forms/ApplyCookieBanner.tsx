"use client";

import React, { useState, useEffect } from "react";
import { Cookie, Check, X, ShieldCheck } from "lucide-react";
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
  const [manuallyOpened, setManuallyOpened] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const initial = getCookieConsent();
    setConsentStatus(initial);
  }, []);

  const handleAccept = () => {
    setCookieConsent("accepted");
    setConsentStatus("accepted");
    setManuallyOpened(false);
    onConsentChange?.("accepted");
    showToast("Cookies accepted · Your application draft will be preserved.");
  };

  const handleReject = () => {
    setCookieConsent("rejected");
    setConsentStatus("rejected");
    setManuallyOpened(false);
    onConsentChange?.("rejected");
    showToast("Cookies declined · Form draft saving disabled.");
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  if (!mounted) return null;

  const showBanner = consentStatus === "undecided" || manuallyOpened;

  return (
    <>
      {/* ─── LANDSCAPE BOTTOM COOKIE BANNER (RESPONSIVE) ─── */}
      {showBanner && (
        <aside
          role="region"
          aria-label="Cookie preferences"
          className="fixed bottom-0 inset-x-0 z-50 p-2.5 sm:p-4 md:p-5 pointer-events-none pb-[calc(0.625rem+env(safe-area-inset-bottom,0px))] sm:pb-[calc(1rem+env(safe-area-inset-bottom,0px))]"
        >
          <div className="pointer-events-auto max-w-6xl mx-auto w-full relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#001B33]/95 backdrop-blur-xl text-white border border-white/15 shadow-[0_20px_60px_rgba(0,15,30,0.65)] p-3.5 sm:p-5 md:py-4 md:px-6 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
            {/* Top signature gradient accent line */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#10B981]" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 lg:gap-8">
              {/* Left / Info Section */}
              <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#FF7900]/20 text-[#FFC400] border border-[#FFC400]/30 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 shadow-inner">
                  <Cookie className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-serif font-extrabold text-sm sm:text-base text-white tracking-tight leading-snug">
                      Cookie &amp; Draft Preferences
                    </h4>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FFC400] bg-[#FFC400]/15 border border-[#FFC400]/30 px-2 py-0.5 rounded-full">
                      Form Auto-Save
                    </span>
                  </div>

                  <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed max-w-3xl">
                    We use cookies to safely store your application progress (name, contact info, selected cohort) so you don&apos;t lose data if you reload or return later. Choose whether to accept or reject draft cookies.
                  </p>
                </div>

                {manuallyOpened && (
                  <button
                    type="button"
                    onClick={() => setManuallyOpened(false)}
                    className="p-1.5 -mr-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer shrink-0 md:hidden"
                    title="Close cookie preferences"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Right / Actions Section (Responsive Buttons) */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0 pt-1 md:pt-0 border-t border-white/10 md:border-t-0">
                <button
                  type="button"
                  onClick={handleReject}
                  className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-xl bg-white/8 hover:bg-white/15 text-slate-200 hover:text-white text-xs sm:text-sm font-bold border border-white/15 transition-all cursor-pointer active:scale-95 text-center min-w-[100px] sm:min-w-[110px]"
                >
                  Reject
                </button>

                <button
                  type="button"
                  onClick={handleAccept}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] hover:from-[#E56D00] hover:to-[#CC5F00] text-white text-xs sm:text-sm font-extrabold tracking-wide border border-[#FFC400]/40 shadow-lg shadow-[#FF7900]/25 transition-all cursor-pointer active:scale-95 inline-flex items-center justify-center gap-1.5 sm:gap-2 min-w-[140px] sm:min-w-[160px]"
                >
                  <Check className="w-4 h-4 text-white" />
                  <span>Accept Cookies</span>
                </button>

                {manuallyOpened && (
                  <button
                    type="button"
                    onClick={() => setManuallyOpened(false)}
                    className="hidden md:inline-flex p-2 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer shrink-0 ml-1"
                    title="Close cookie preferences"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* ─── COMPACT RE-OPEN BADGE / STATUS TRIGGER (WHEN BANNER IS CLOSED) ─── */}
      {!showBanner && (
        <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-40 animate-in fade-in duration-200 pb-[env(safe-area-inset-bottom,0px)]">
          <button
            type="button"
            onClick={() => setManuallyOpened(true)}
            className="px-3.5 py-1.5 rounded-full bg-[#001B33]/90 hover:bg-[#001B33] text-white backdrop-blur-md border border-white/20 shadow-xl text-[11px] font-bold inline-flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
            title="Click to view or change cookie preferences"
          >
            <Cookie className="w-3.5 h-3.5 text-[#FFC400] group-hover:rotate-12 transition-transform" />
            <span className="text-slate-300">Cookies:</span>
            <span
              className={`font-extrabold uppercase ${
                consentStatus === "accepted" ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {consentStatus === "accepted" ? "Accepted" : "Rejected"}
            </span>
            <span className="text-white/40 font-normal">· Change</span>
          </button>
        </div>
      )}

      {/* ─── TEMPORARY CONFIRMATION TOAST ─── */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#001B33] text-white border border-[#FFC400]/40 shadow-2xl px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <ShieldCheck className="w-4 h-4 text-[#10B981]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}

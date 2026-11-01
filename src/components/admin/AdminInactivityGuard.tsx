"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ShieldAlert, RefreshCw, LogOut } from "lucide-react";

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const WARNING_THRESHOLD_MS = 60 * 1000; // Show warning in last 60 seconds

export default function AdminInactivityGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/AD_Admin/login";

  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const lastActivityRef = useRef<number>(Date.now());
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch {
      // Ignored
    }
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("tlc_admin_jwt_preview");
    }
    router.replace("/AD_Admin/login?reason=inactivity");
    router.refresh();
  }, [router]);

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
      setSecondsRemaining(60);
    }
  }, [showWarning]);

  useEffect(() => {
    if (isLoginPage) return;

    const activityEvents = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    // Throttled event listener to minimize overhead
    let throttleTimeout: NodeJS.Timeout | null = null;
    const onUserAction = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          throttleTimeout = null;
          resetActivity();
        }, 1000);
      }
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, onUserAction, { passive: true });
    });

    const checkInterval = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      const remainingMs = INACTIVITY_TIMEOUT_MS - elapsed;

      if (remainingMs <= 0) {
        clearInterval(checkInterval);
        handleLogout();
      } else if (remainingMs <= WARNING_THRESHOLD_MS) {
        setShowWarning(true);
        setSecondsRemaining(Math.max(1, Math.ceil(remainingMs / 1000)));
      } else {
        setShowWarning(false);
      }
    }, 1000);

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, onUserAction);
      });
      clearInterval(checkInterval);
      if (throttleTimeout) clearTimeout(throttleTimeout);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    };
  }, [isLoginPage, resetActivity, handleLogout]);

  if (!showWarning || isLoginPage) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border-2 border-[#FF7900] text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-[#FF7900] flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <h3 className="font-serif font-extrabold text-xl text-[#102E4D]">
          Session Inactivity Warning
        </h3>
        <p className="text-sm text-slate-600 mt-2">
          You have been inactive for nearly 15 minutes. For security, your admin
          session will automatically lock in:
        </p>

        <div className="my-5 inline-block px-5 py-2 rounded-2xl bg-amber-100 text-[#FF7900] font-num font-extrabold text-2xl tracking-wider">
          {secondsRemaining}s
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <button
            type="button"
            onClick={resetActivity}
            className="flex-1 py-3 px-4 rounded-xl bg-[#102E4D] hover:bg-[#001B33] text-white text-xs font-bold transition-colors inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-4 h-4 text-[#FFC400]" />
            <span>Stay Signed In</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Lock Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}


"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ShieldAlert, RefreshCw, LogOut } from "lucide-react";

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // Strict 30-minute inactivity timeout
const WARNING_THRESHOLD_MS = 60 * 1000; // Show warning in last 60 seconds
const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // Refresh JWT every 10 min during active usage

export default function AdminInactivityGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const isCleanUrl = !pathname.startsWith("/AD_Admin");
  const isLoginPage = pathname === "/AD_Admin/login" || pathname === "/login";

  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastActivityRef = useRef<number>(Date.now());
  const lastRefreshRef = useRef<number>(Date.now());
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch {
      // Ignored
    }

    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem("tlc_admin_jwt_preview");
        sessionStorage.removeItem("tlc_admin_dashboard_cache");
        localStorage.removeItem("tlc_admin_dashboard_cache");
      } catch {
        // Ignored
      }
    }

    const targetUrl = isCleanUrl
      ? "/login?reason=inactivity"
      : "/AD_Admin/login?reason=inactivity";

    if (typeof window !== "undefined") {
      window.location.replace(targetUrl);
    } else {
      router.replace(targetUrl);
      router.refresh();
    }
  }, [isCleanUrl, router]);

  const pingRefreshSession = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await fetch("/api/admin/auth/refresh", { method: "POST" });
      lastRefreshRef.current = Date.now();
    } catch {
      // Ignored
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const resetActivity = useCallback((pingServer = false) => {
    lastActivityRef.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
      setSecondsRemaining(60);
    }
    if (pingServer) {
      pingRefreshSession();
    }
  }, [showWarning, pingRefreshSession]);

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
          resetActivity(false);

          // Periodically slide JWT forward on active use
          const now = Date.now();
          if (now - lastRefreshRef.current >= REFRESH_INTERVAL_MS) {
            pingRefreshSession();
          }
        }, 1000);
      }
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, onUserAction, { passive: true });
    });

    // Check inactivity every 1s
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

    // Immediate check on tab focus / wake from sleep
    const onVisibilityOrFocusChange = () => {
      if (document.visibilityState === "visible") {
        const elapsed = Date.now() - lastActivityRef.current;
        if (elapsed >= INACTIVITY_TIMEOUT_MS) {
          handleLogout();
        }
      }
    };

    document.addEventListener("visibilitychange", onVisibilityOrFocusChange);
    window.addEventListener("focus", onVisibilityOrFocusChange);

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, onUserAction);
      });
      clearInterval(checkInterval);
      document.removeEventListener("visibilitychange", onVisibilityOrFocusChange);
      window.removeEventListener("focus", onVisibilityOrFocusChange);
      if (throttleTimeout) clearTimeout(throttleTimeout);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    };
  }, [isLoginPage, resetActivity, handleLogout, pingRefreshSession]);

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
          You have been inactive for nearly 30 minutes. For security, your admin
          session will automatically lock in:
        </p>

        <div className="my-5 inline-block px-5 py-2 rounded-2xl bg-amber-100 text-[#FF7900] font-num font-extrabold text-2xl tracking-wider">
          {secondsRemaining}s
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <button
            type="button"
            disabled={isRefreshing}
            onClick={() => resetActivity(true)}
            className="flex-1 py-3 px-4 rounded-xl bg-[#102E4D] hover:bg-[#001B33] text-white text-xs font-bold transition-colors inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 text-[#FFC400] ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Renewing…" : "Stay Signed In"}</span>
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


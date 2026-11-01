"use client";

import { useState, useEffect } from "react";
import type { CmsPageKey } from "@/lib/supabase-store";

/**
 * React hook for consuming CMS page content on client components.
 * 
 * - Guaranteed Zero Downtime: Always initialises immediately with defaultContent,
 *   so there is never a blank screen, spinner delay, or layout shift.
 * - Resilient Background Hydration: Asynchronously fetches live CMS edits from /api/cms.
 *   If Supabase is stopped, paused, or unreachable, it silently catches the failure
 *   and retains the trusted defaultContent.
 */
export function useCmsContent<T extends Record<string, unknown>>(
  pageKey: CmsPageKey,
  defaultContent: T
): { content: T; isLive: boolean } {
  const [content, setContent] = useState<T>(defaultContent);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let active = true;

    async function fetchLiveCms() {
      try {
        const res = await fetch(`/api/cms?key=${encodeURIComponent(pageKey)}`, {
          cache: "default",
        });
        if (!res.ok) return;

        const data = await res.json();
        if (active && data?.ok && data?.page?.content) {
          setContent(data.page.content as T);
          setIsLive(!data.fallback);
        }
      } catch {
        // Supabase or network unavailable; keep trusted default content safely
      }
    }

    fetchLiveCms();

    return () => {
      active = false;
    };
  }, [pageKey]);

  return { content, isLive };
}


"use client";

import { useState, useEffect, useMemo } from "react";
import type { CmsPageKey } from "@/lib/firebase-cms";
import { HOME_PAGE, normalizeHomeCms, type HomePageContent } from "@/content/home";
import {
  SERVICES_PAGE,
  normalizeServicesCms,
  type ServicesPageContent,
} from "@/content/services";
import {
  APPLY_PAGE,
  normalizeApplyCms,
  type ApplyPageContent,
} from "@/content/forms";
import {
  SUMMIT_CONTENT,
  normalizeSummitCms,
  type SummitPageContent,
} from "@/content/summit";

/**
 * React hook for consuming CMS page content on client components.
 * 
 * - Guaranteed Zero Downtime: Always initialises immediately with defaultContent,
 *   so there is never a blank screen, spinner delay, or layout shift.
 * - Resilient Background Hydration: Asynchronously fetches live CMS edits from /api/cms.
 *   If Firebase Firestore or network is temporarily unreachable, it catches the failure
 *   and smoothly retains the trusted defaultContent.
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
        const res = await fetch(
          `/api/cms?key=${encodeURIComponent(pageKey)}&_t=${Date.now()}`,
          {
            cache: "no-store",
          }
        );
        if (!res.ok) return;

        const data = await res.json();
        if (active && data?.ok && data?.page?.content) {
          setContent(data.page.content as T);
          setIsLive(!data.fallback);
        }
      } catch {
        // Firebase or network unavailable; keep trusted default content safely
      }
    }

    fetchLiveCms();

    return () => {
      active = false;
    };
  }, [pageKey]);

  return { content, isLive };
}

export function useHomePageContent(): HomePageContent {
  const { content } = useCmsContent(
    "home",
    HOME_PAGE as unknown as Record<string, unknown>
  );
  return useMemo(() => normalizeHomeCms(content), [content]);
}

export function useServicesPageContent(): ServicesPageContent {
  const { content } = useCmsContent(
    "services",
    SERVICES_PAGE as unknown as Record<string, unknown>
  );
  return useMemo(() => normalizeServicesCms(content), [content]);
}

export function useApplyPageContent(): ApplyPageContent {
  const { content } = useCmsContent(
    "forms",
    APPLY_PAGE as unknown as Record<string, unknown>
  );
  return useMemo(() => normalizeApplyCms(content), [content]);
}

export function useSummitPageContent(): SummitPageContent {
  const { content } = useCmsContent(
    "summit",
    SUMMIT_CONTENT as unknown as Record<string, unknown>
  );
  return useMemo(() => normalizeSummitCms(content), [content]);
}


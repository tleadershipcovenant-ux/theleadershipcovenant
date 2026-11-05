"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
import {
  ABOUT_CONTENT,
  normalizeAboutCms,
  type AboutPageContent,
} from "@/content/about";

/**
 * High-performance shared in-memory client cache and promise deduplicator.
 * Ensures:
 * 1. Multiple components on the same page (e.g. 7 home page sections) make only 1 single network request.
 * 2. Navigation between pages is instant (0ms delay) because cached data renders immediately.
 * 3. Freshness window (30s) prevents network spam while keeping CMS live updates seamlessly synchronized.
 */
interface CacheEntry<T> {
  content: T;
  isLive: boolean;
  timestamp: number;
}

const clientCmsCache = new Map<string, CacheEntry<unknown>>();
const inFlightRequests = new Map<
  string,
  Promise<{ content: unknown; isLive: boolean } | null>
>();
const subscribers = new Map<string, Set<(data: { content: unknown; isLive: boolean }) => void>>();

const CACHE_FRESHNESS_MS = 30_000; // 30 seconds fresh

function subscribeToKey(
  key: string,
  callback: (data: { content: unknown; isLive: boolean }) => void
): () => void {
  let subs = subscribers.get(key);
  if (!subs) {
    subs = new Set();
    subscribers.set(key, subs);
  }
  subs.add(callback);
  return () => {
    subs?.delete(callback);
    if (subs && subs.size === 0) {
      subscribers.delete(key);
    }
  };
}

function notifySubscribers(
  key: string,
  data: { content: unknown; isLive: boolean }
) {
  const subs = subscribers.get(key);
  if (subs) {
    subs.forEach((cb) => {
      try {
        cb(data);
      } catch {
        // Safe swallow
      }
    });
  }
}

async function fetchCmsShared<T>(
  pageKey: CmsPageKey
): Promise<{ content: T; isLive: boolean } | null> {
  // If request is already in flight, reuse it
  const existing = inFlightRequests.get(pageKey);
  if (existing) {
    return existing as Promise<{ content: T; isLive: boolean } | null>;
  }

  const promise = (async () => {
    try {
      const res = await fetch(
        `/api/cms?key=${encodeURIComponent(pageKey)}&_t=${Date.now()}`,
        { cache: "no-store" }
      );
      if (!res.ok) return null;

      const data = await res.json();
      if (data?.ok && data?.page?.content) {
        const result = {
          content: data.page.content as T,
          isLive: !data.fallback,
        };
        clientCmsCache.set(pageKey, {
          content: result.content,
          isLive: result.isLive,
          timestamp: Date.now(),
        });
        notifySubscribers(pageKey, result as { content: unknown; isLive: boolean });
        return result;
      }
      return null;
    } catch {
      return null;
    } finally {
      inFlightRequests.delete(pageKey);
    }
  })();

  inFlightRequests.set(pageKey, promise);
  return promise as Promise<{ content: T; isLive: boolean } | null>;
}

/**
 * Public helper to invalidate cache when admin makes edits in CMS portal
 */
export function invalidateCmsClientCache(pageKey?: CmsPageKey): void {
  if (pageKey) {
    clientCmsCache.delete(pageKey);
    inFlightRequests.delete(pageKey);
  } else {
    clientCmsCache.clear();
    inFlightRequests.clear();
  }
}

/**
 * React hook for consuming CMS page content on client components.
 * 
 * - Guaranteed Zero Downtime: Always initialises immediately with cached or defaultContent,
 *   so there is never a blank screen, spinner delay, or layout shift.
 * - Resilient Background Hydration: Asynchronously fetches live CMS edits from /api/cms with
 *   request deduplication and stale-while-revalidate caching.
 */
export function useCmsContent<T extends Record<string, unknown>>(
  pageKey: CmsPageKey,
  defaultContent: T
): { content: T; isLive: boolean } {
  // Initialize from client memory cache if available, otherwise defaultContent
  const cached = clientCmsCache.get(pageKey) as CacheEntry<T> | undefined;

  const [state, setState] = useState<{ content: T; isLive: boolean }>(() => ({
    content: cached ? cached.content : defaultContent,
    isLive: cached ? cached.isLive : false,
  }));

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    // Listen to updates from other components or background refetches
    const unsubscribe = subscribeToKey(pageKey, (data) => {
      if (isMountedRef.current) {
        setState({
          content: data.content as T,
          isLive: data.isLive,
        });
      }
    });

    // Check if cached entry is fresh
    const currentCached = clientCmsCache.get(pageKey) as CacheEntry<T> | undefined;
    const isFresh =
      currentCached && Date.now() - currentCached.timestamp < CACHE_FRESHNESS_MS;

    if (!isFresh) {
      fetchCmsShared<T>(pageKey).then((result) => {
        if (result && isMountedRef.current) {
          setState(result);
        }
      });
    }

    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, [pageKey]);

  return state;
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

export function useAboutPageContent(): AboutPageContent {
  const { content } = useCmsContent(
    "about",
    ABOUT_CONTENT as unknown as Record<string, unknown>
  );
  return useMemo(() => normalizeAboutCms(content), [content]);
}

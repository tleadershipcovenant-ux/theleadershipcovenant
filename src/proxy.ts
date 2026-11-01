import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  authenticateAdminRequest,
  verifyAdminJwt,
} from "@/lib/admin-auth";
import { updateSession } from "./utils/supabase/middleware";

const ADMIN_HOSTNAME = "admin.leadershipcovenant.com.pk";
const MAIN_HOSTNAMES = new Set([
  "leadershipcovenant.com.pk",
  "www.leadershipcovenant.com.pk",
]);

/**
 * Extracts and normalizes the request hostname from Cloudflare/reverse-proxy headers.
 */
function getNormalizedHost(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-host");
  if (forwarded) {
    return forwarded.split(":")[0].toLowerCase().trim();
  }
  const host = request.headers.get("host");
  if (host) {
    return host.split(":")[0].toLowerCase().trim();
  }
  return request.nextUrl.hostname.toLowerCase().trim();
}

/**
 * Checks whether the incoming request is directed at the admin subdomain.
 * Matches `admin.leadershipcovenant.com.pk` or any `admin.*` host (e.g. admin.localhost).
 */
function isAdminSubdomain(hostname: string): boolean {
  return (
    hostname === ADMIN_HOSTNAME ||
    hostname.startsWith("admin.")
  );
}

/**
 * Clones cookies & security headers from the base Supabase response to a rewrite response.
 * CRITICAL: Excludes internal Next.js `x-middleware-*` control headers (e.g. x-middleware-next),
 * which would cancel the rewrite and cause Next.js to fall back to the unrewritten route.
 */
function createRewriteResponse(
  targetUrl: URL,
  baseResponse: NextResponse
): NextResponse {
  const rewriteRes = NextResponse.rewrite(targetUrl);
  baseResponse.headers.forEach((val, key) => {
    const lowerKey = key.toLowerCase();
    if (!lowerKey.startsWith("x-middleware-")) {
      rewriteRes.headers.set(key, val);
    }
  });
  baseResponse.cookies.getAll().forEach((c) => {
    rewriteRes.cookies.set(c);
  });
  rewriteRes.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return rewriteRes;
}

/**
 * Clones cookies & security headers from the base Supabase response to a redirect response.
 * CRITICAL: Excludes internal Next.js `x-middleware-*` control headers.
 */
function createRedirectResponse(
  targetUrl: URL,
  baseResponse: NextResponse,
  status: number = 307
): NextResponse {
  const redirectRes = NextResponse.redirect(targetUrl, status);
  baseResponse.headers.forEach((val, key) => {
    const lowerKey = key.toLowerCase();
    if (!lowerKey.startsWith("x-middleware-")) {
      redirectRes.headers.set(key, val);
    }
  });
  baseResponse.cookies.getAll().forEach((c) => {
    redirectRes.cookies.set(c);
  });
  redirectRes.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return redirectRes;
}

/**
 * Next.js 16 Proxy:
 * 1. Manages multi-host routing for `admin.leadershipcovenant.com.pk` (clean URLs).
 * 2. Maps admin subdomain root `/` to `/AD_Admin`.
 * 3. Maps clean admin pages: `/login`, `/registrations`, `/contacts`, `/cms`.
 * 4. Guards `/api/admin/*` endpoints and verifies 15-minute inactivity session expiration.
 * 5. Refreshes Supabase SSR sessions.
 * 6. Keeps the main website running seamlessly at `leadershipcovenant.com.pk` and `www.leadershipcovenant.com.pk`.
 */
export async function proxy(request: NextRequest) {
  const hostname = getNormalizedHost(request);
  const onAdminDomain = isAdminSubdomain(hostname);
  const { pathname, search } = request.nextUrl;

  // Check if Supabase session refresh is actually required.
  // CRITICAL PERFORMANCE FIX: Skip external Supabase network calls for anonymous public page visits
  // to prevent Cloudflare Worker subrequest timeouts and keep client-side navigation instantaneous.
  const hasSupabaseCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.includes("auth-token"));

  const needsSessionRefresh =
    onAdminDomain ||
    pathname.startsWith("/AD_Admin") ||
    pathname.startsWith("/api/admin") ||
    hasSupabaseCookie;

  // 1. Refresh Supabase session cookies only when relevant
  const response = needsSessionRefresh
    ? await updateSession(request)
    : NextResponse.next();

  // Enterprise baseline security headers across all requests
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // 2. Protect /api/admin/* endpoints (both domains)
  if (pathname.startsWith("/api/admin")) {
    if (
      pathname === "/api/admin/auth/login" ||
      pathname === "/api/admin/auth/logout"
    ) {
      response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
      return response;
    }

    const session = await authenticateAdminRequest(request);
    if (!session) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Unauthorized — session expired due to 15 minutes of inactivity or missing token.",
        },
        {
          status: 401,
          headers: {
            "X-Robots-Tag": "noindex, nofollow, noarchive",
            "X-Content-Type-Options": "nosniff",
          },
        }
      );
    }

    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return response;
  }

  // 3. Allow other API routes, next assets, and statics to proceed untouched
  if (pathname.startsWith("/api/")) {
    return response;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HOST ROUTING: A. DEDICATED ADMIN SUBDOMAIN (admin.leadershipcovenant.com.pk)
  // ─────────────────────────────────────────────────────────────────────────
  if (onAdminDomain) {
    // 3a. If user enters with legacy /AD_Admin prefix on the admin subdomain,
    // redirect them to the clean URL immediately (e.g. /AD_Admin/cms -> /cms)
    if (pathname === "/AD_Admin" || pathname.startsWith("/AD_Admin/")) {
      const cleanPath = pathname === "/AD_Admin" ? "/" : pathname.replace("/AD_Admin", "");
      const cleanUrl = new URL(`${cleanPath}${search}`, request.url);
      return createRedirectResponse(cleanUrl, response, 301);
    }

    const rawToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const session = await verifyAdminJwt(rawToken);

    // 3b. Clean Login Route (/login)
    if (pathname === "/login") {
      // If already logged in with a valid session, redirect to clean Dashboard root (/)
      if (session) {
        const dashUrl = new URL(`/${search}`, request.url);
        return createRedirectResponse(dashUrl, response, 307);
      }
      // Unauthenticated -> rewrite clean /login to internal /AD_Admin/login
      const internalLoginUrl = new URL(`/AD_Admin/login${search}`, request.url);
      return createRewriteResponse(internalLoginUrl, response);
    }

    // 3c. Protected Admin Pages: Root (/), /registrations, /contacts, /cms
    const isAdminRoute =
      pathname === "/" ||
      pathname === "/registrations" ||
      pathname.startsWith("/registrations/") ||
      pathname === "/contacts" ||
      pathname.startsWith("/contacts/") ||
      pathname === "/cms" ||
      pathname.startsWith("/cms/");

    if (!session) {
      // Session missing or expired after 15 min inactivity -> redirect to /login
      const loginUrl = new URL("/login", request.url);
      if (rawToken) {
        loginUrl.searchParams.set("reason", "inactivity");
      }
      if (pathname !== "/") {
        loginUrl.searchParams.set("next", `${pathname}${search}`);
      }
      return createRedirectResponse(loginUrl, response, 307);
    }

    // 3d. User IS authenticated -> rewrite clean URLs to internal /AD_Admin pages
    if (isAdminRoute) {
      const internalPath = pathname === "/" ? "/AD_Admin" : `/AD_Admin${pathname}`;
      const internalUrl = new URL(`${internalPath}${search}`, request.url);
      return createRewriteResponse(internalUrl, response);
    }

    // Fallback on admin subdomain: Unknown path -> redirect to clean dashboard root
    const fallbackUrl = new URL("/", request.url);
    return createRedirectResponse(fallbackUrl, response, 307);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HOST ROUTING: B. MAIN WEBSITE (leadershipcovenant.com.pk / www / localhost)
  // ─────────────────────────────────────────────────────────────────────────

  // If someone attempts to access /AD_Admin on the production main domain,
  // redirect them to the dedicated admin subdomain
  if (MAIN_HOSTNAMES.has(hostname) && (pathname === "/AD_Admin" || pathname.startsWith("/AD_Admin/"))) {
    const cleanSubPath = pathname === "/AD_Admin" ? "" : pathname.replace("/AD_Admin", "");
    const targetUrl = `https://${ADMIN_HOSTNAME}${cleanSubPath}${search}`;
    return createRedirectResponse(new URL(targetUrl), response, 301);
  }

  // Local development fallback for /AD_Admin (e.g. running on localhost:3000)
  if (pathname.startsWith("/AD_Admin")) {
    const rawToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const session = await verifyAdminJwt(rawToken);
    const isLoginPage = pathname === "/AD_Admin/login";

    if (isLoginPage && session) {
      const dashUrl = new URL(`/AD_Admin${search}`, request.url);
      return createRedirectResponse(dashUrl, response);
    }

    if (!isLoginPage && !session) {
      const loginUrl = new URL("/AD_Admin/login", request.url);
      if (rawToken) {
        loginUrl.searchParams.set("reason", "inactivity");
      }
      if (pathname !== "/AD_Admin") {
        loginUrl.searchParams.set("next", `${pathname}${search}`);
      }
      return createRedirectResponse(loginUrl, response);
    }

    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return response;
  }

  // Regular public website routes (/, /about, /services, /contact, /apply, /summit, etc.)
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

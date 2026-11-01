import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, authenticateAdminRequest, verifyAdminJwt } from "@/lib/admin-auth";
import { updateSession } from "./utils/supabase/middleware";

/**
 * Next.js 16 Proxy guarding the hidden `/AD_Admin` portal and `/api/admin/*` endpoints,
 * enforcing 15-minute inactivity session expiration, keeping Supabase sessions refreshed,
 * and applying enterprise HTTP security headers.
 */
export async function proxy(request: NextRequest) {
  // 1. Refresh Supabase session cookies
  const response = await updateSession(request);

  // Apply baseline security headers across all routes
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  const { pathname } = request.nextUrl;

  // 2. Protect /api/admin/* endpoints (except public auth endpoints)
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
          error: "Unauthorized — session expired due to 15 minutes of inactivity or missing token.",
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

  // 3. Protect /AD_Admin pages
  if (pathname.startsWith("/AD_Admin")) {
    const rawToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const session = await verifyAdminJwt(rawToken);
    const isLoginPage = pathname === "/AD_Admin/login";

    // If logged in and browsing to /login, redirect to /AD_Admin dashboard
    if (isLoginPage && session) {
      const dashUrl = new URL("/AD_Admin", request.url);
      const res = NextResponse.redirect(dashUrl);
      res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
      return res;
    }

    // If not logged in or session timed out after 15 min inactivity
    if (!isLoginPage && !session) {
      const loginUrl = new URL("/AD_Admin/login", request.url);
      if (rawToken) {
        // Token was present but expired -> notify user of 15 min inactivity timeout
        loginUrl.searchParams.set("reason", "inactivity");
      }
      if (pathname !== "/AD_Admin") {
        loginUrl.searchParams.set("next", pathname);
      }
      const res = NextResponse.redirect(loginUrl);
      res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
      return res;
    }

    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, authenticateAdminRequest, verifyAdminJwt } from "@/lib/admin-auth";
import { updateSession } from "./utils/supabase/middleware";

/**
 * Next.js 16 Proxy guarding the hidden `/AD_Admin` portal and `/api/admin/*` endpoints,
 * keeping Supabase user sessions refreshed, and enforcing `noindex, nofollow` headers.
 */
export async function proxy(request: NextRequest) {
  // 1. Refresh Supabase session cookies
  const supabaseResponse = await updateSession(request);

  const { pathname } = request.nextUrl;

  // 2. Protect /api/admin/* endpoints (except public auth endpoints)
  if (pathname.startsWith("/api/admin")) {
    if (
      pathname === "/api/admin/auth/login" ||
      pathname === "/api/admin/auth/logout"
    ) {
      supabaseResponse.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
      return supabaseResponse;
    }

    const session = await authenticateAdminRequest(request);
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized — valid Admin JWT session required." },
        {
          status: 401,
          headers: { "X-Robots-Tag": "noindex, nofollow, noarchive" },
        }
      );
    }

    supabaseResponse.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return supabaseResponse;
  }

  // 3. Protect /AD_Admin pages
  if (pathname.startsWith("/AD_Admin")) {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const session = await verifyAdminJwt(token);
    const isLoginPage = pathname === "/AD_Admin/login";

    if (isLoginPage && session) {
      const dashUrl = new URL("/AD_Admin", request.url);
      const res = NextResponse.redirect(dashUrl);
      res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
      return res;
    }

    if (!isLoginPage && !session) {
      const loginUrl = new URL("/AD_Admin/login", request.url);
      if (pathname !== "/AD_Admin") {
        loginUrl.searchParams.set("next", pathname);
      }
      const res = NextResponse.redirect(loginUrl);
      res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
      return res;
    }

    supabaseResponse.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return supabaseResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

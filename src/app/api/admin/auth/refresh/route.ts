import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  SESSION_INACTIVITY_SECONDS,
  authenticateAdminRequest,
  signAdminJwt,
} from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  try {
    const session = await authenticateAdminRequest(req);
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Session expired or invalid" },
        { status: 401 }
      );
    }

    const { token, payload } = await signAdminJwt(session.email);

    const res = NextResponse.json({
      ok: true,
      issuedAt: new Date(payload.iat * 1000).toISOString(),
      expiresAt: new Date(payload.exp * 1000).toISOString(),
      inactivityTimeoutMinutes: 30,
    });

    const host =
      req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
    const isLeadershipDomain = host.includes("leadershipcovenant.com.pk");

    res.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      domain: isLeadershipDomain ? ".leadershipcovenant.com.pk" : undefined,
      maxAge: SESSION_INACTIVITY_SECONDS,
    });

    return res;
  } catch (err: unknown) {
    console.error("[TLC ADMIN REFRESH ERROR]", err);
    return NextResponse.json(
      { ok: false, error: "Failed to refresh session" },
      { status: 500 }
    );
  }
}


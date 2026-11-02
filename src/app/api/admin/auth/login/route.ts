import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  SESSION_INACTIVITY_SECONDS,
  signAdminJwt,
  verifyAdminWithSupabase,
} from "@/lib/admin-auth";
import {
  checkRateLimit,
  recordFailedAttempt,
  clearRateLimit,
} from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Check: Max 5 failed attempts in 15 minutes
    const limitCheck = checkRateLimit(req, {
      prefix: "admin_login",
      maxAttempts: 5,
      windowSeconds: 15 * 60,
    });

    if (!limitCheck.allowed) {
      const minutesRemaining = Math.ceil(limitCheck.resetInSeconds / 60);
      return NextResponse.json(
        {
          ok: false,
          error: `Too many failed login attempts. For security, access is temporarily locked. Please try again in ${minutesRemaining} minute${minutesRemaining > 1 ? "s" : ""}.`,
          retryAfterSeconds: limitCheck.resetInSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(limitCheck.resetInSeconds),
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const body = await req.json();
    const email = String(body?.email || "").trim();
    const password = String(body?.password || "");

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Please enter both email address and password." },
        { status: 400 }
      );
    }

    // 2. Authenticate user directly against Supabase Auth (Single fast round-trip)
    const authResult = await verifyAdminWithSupabase(email, password);
    if (!authResult.ok) {
      const failInfo = recordFailedAttempt(req, {
        prefix: "admin_login",
        windowSeconds: 15 * 60,
      });

      const attemptsMsg =
        failInfo.remaining > 0
          ? ` (${failInfo.remaining} attempt${failInfo.remaining > 1 ? "s" : ""} remaining before temporary 15-min lockout)`
          : " (Account locked for 15 minutes due to multiple failed attempts)";

      return NextResponse.json(
        {
          ok: false,
          error: `${authResult.error || "Invalid admin email or password."}${attemptsMsg}`,
        },
        { status: 401 }
      );
    }

    // 3. Clear rate limit on successful authentication
    clearRateLimit(req, "admin_login");

    // 4. Issue cryptographically signed Admin JWT with 30-minute inactivity session
    const verifiedEmail = authResult.email || email;
    const { token, payload } = await signAdminJwt(verifiedEmail);

    const res = NextResponse.json({
      ok: true,
      token,
      user: {
        email: payload.email,
        role: payload.role,
      },
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
      maxAge: SESSION_INACTIVITY_SECONDS, // Strict 30-minute inactivity session
    });

    return res;
  } catch (err: unknown) {
    console.error("[TLC ADMIN LOGIN ERROR]", err);
    return NextResponse.json(
      { ok: false, error: "Authentication service error. Please try again." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  SESSION_INACTIVITY_SECONDS,
  authenticateAdminRequest,
  changeAdminPasswordWithSupabase,
  signAdminJwt,
} from "@/lib/admin-auth";
import {
  checkRateLimit,
  recordFailedAttempt,
  clearRateLimit,
} from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // 1. Require active authenticated Admin JWT session
    const session = await authenticateAdminRequest(req);
    if (!session) {
      return NextResponse.json(
        {
          ok: false,
          field: "general",
          error: "Your admin session has expired. Please sign in again.",
        },
        { status: 401 }
      );
    }

    // 2. Rate limiting check: Max 8 failed password verification attempts in 15 minutes
    const limitCheck = checkRateLimit(req, {
      prefix: "admin_change_password",
      maxAttempts: 8,
      windowSeconds: 15 * 60,
    });

    if (!limitCheck.allowed) {
      const minutesRemaining = Math.ceil(limitCheck.resetInSeconds / 60);
      return NextResponse.json(
        {
          ok: false,
          field: "general",
          error: `Too many failed password change attempts. Please wait ${minutesRemaining} minute${minutesRemaining > 1 ? "s" : ""} before trying again.`,
          retryAfterSeconds: limitCheck.resetInSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(limitCheck.resetInSeconds),
          },
        }
      );
    }

    const body = await req.json().catch(() => null);
    const currentPassword = String(body?.currentPassword || "");
    const newPassword = String(body?.newPassword || "");
    const confirmPassword =
      body?.confirmPassword !== undefined
        ? String(body?.confirmPassword || "")
        : undefined;

    // 3. Comprehensive server-side input validation
    if (!currentPassword) {
      return NextResponse.json(
        {
          ok: false,
          field: "currentPassword",
          error: "Current password is required.",
        },
        { status: 400 }
      );
    }

    if (currentPassword.length < 6) {
      return NextResponse.json(
        {
          ok: false,
          field: "currentPassword",
          error: "Current password must be at least 6 characters long.",
        },
        { status: 400 }
      );
    }

    if (!newPassword) {
      return NextResponse.json(
        {
          ok: false,
          field: "newPassword",
          error: "New password is required.",
        },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          ok: false,
          field: "newPassword",
          error: "New password must be at least 6 characters long.",
        },
        { status: 400 }
      );
    }

    if (newPassword.length > 72) {
      return NextResponse.json(
        {
          ok: false,
          field: "newPassword",
          error: "New password cannot exceed 72 characters.",
        },
        { status: 400 }
      );
    }

    if (newPassword === currentPassword) {
      return NextResponse.json(
        {
          ok: false,
          field: "newPassword",
          error: "New password must be different from your current password.",
        },
        { status: 400 }
      );
    }

    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      return NextResponse.json(
        {
          ok: false,
          field: "confirmPassword",
          error: "Confirm password does not match your new password.",
        },
        { status: 400 }
      );
    }

    // 4. Verify current password & update password in Supabase Auth database
    const result = await changeAdminPasswordWithSupabase(
      session.email,
      currentPassword,
      newPassword
    );

    if (!result.ok) {
      if (result.field === "currentPassword") {
        const failInfo = recordFailedAttempt(req, {
          prefix: "admin_change_password",
          windowSeconds: 15 * 60,
        });
        const remainingNote =
          failInfo.remaining > 0 && failInfo.remaining <= 3
            ? ` (${failInfo.remaining} attempt${failInfo.remaining > 1 ? "s" : ""} remaining)`
            : "";

        return NextResponse.json(
          {
            ok: false,
            field: "currentPassword",
            error: `${result.error || "Current password is incorrect."}${remainingNote}`,
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          ok: false,
          field: result.field || "general",
          error: result.error || "Failed to update password.",
        },
        { status: 400 }
      );
    }

    // 5. Clear rate limit on successful update
    clearRateLimit(req, "admin_change_password");

    // 6. Re-issue fresh Admin JWT session cookie so user stays seamlessly signed in
    const verifiedEmail = result.email || session.email;
    const { token, payload } = await signAdminJwt(verifiedEmail);

    const res = NextResponse.json({
      ok: true,
      message: "Password updated successfully in the database.",
      email: payload.email,
      updatedAt: new Date().toISOString(),
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
    console.error("[TLC ADMIN CHANGE PASSWORD ERROR]", err);
    return NextResponse.json(
      {
        ok: false,
        field: "general",
        error: "An unexpected server error occurred while updating password.",
      },
      { status: 500 }
    );
  }
}


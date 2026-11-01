import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  JWT_EXPIRY_SECONDS,
  signAdminJwt,
  verifyAdminWithSupabase,
} from "@/lib/admin-auth";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body?.email || "").trim();
    const password = String(body?.password || "");

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Please enter both email address and password." },
        { status: 400 }
      );
    }

    // 1. Authenticate user directly against Supabase Auth
    const authResult = await verifyAdminWithSupabase(email, password);
    if (!authResult.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: authResult.error || "Invalid admin email or password.",
        },
        { status: 401 }
      );
    }

    // 2. Also refresh/set SSR Supabase session cookies
    try {
      const supabase = await createClient();
      await supabase.auth.signInWithPassword({
        email,
        password,
      });
    } catch {
      // Non-critical if SSR cookies are bypassed
    }

    // 3. Issue cryptographically signed Admin JWT session token
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
    });

    res.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: JWT_EXPIRY_SECONDS,
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

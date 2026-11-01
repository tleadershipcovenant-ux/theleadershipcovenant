import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  JWT_EXPIRY_SECONDS,
  signAdminJwt,
  verifyAdminCredentials,
} from "@/lib/admin-auth";

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

    const isValid = verifyAdminCredentials(email, password);
    if (!isValid) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid admin email or password. Please check your credentials.",
        },
        { status: 401 }
      );
    }

    const { token, payload } = await signAdminJwt(email);

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


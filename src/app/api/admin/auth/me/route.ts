import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, authenticateAdminRequest } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const session = await authenticateAdminRequest(req);
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  const rawCookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value || "";
  const tokenPreview = rawCookie
    ? `${rawCookie.slice(0, 14)}…${rawCookie.slice(-10)}`
    : "Bearer JWT";

  return NextResponse.json({
    ok: true,
    session: {
      email: session.email,
      role: session.role,
      jti: session.jti,
      issuedAt: new Date(session.iat * 1000).toISOString(),
      expiresAt: new Date(session.exp * 1000).toISOString(),
      tokenPreview,
    },
  });
}


import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  const host =
    req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const isLeadershipDomain = host.includes("leadershipcovenant.com.pk");

  res.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    domain: isLeadershipDomain ? ".leadershipcovenant.com.pk" : undefined,
    maxAge: 0,
  });
  return res;
}


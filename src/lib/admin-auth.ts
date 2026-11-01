import type { NextRequest } from "next/server";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";

export const ADMIN_COOKIE_NAME = "tlc_admin_jwt";
// Strict 15-minute inactivity session timeout as requested
export const SESSION_INACTIVITY_SECONDS = 15 * 60; // 15 minutes (900 seconds)

export interface AdminJwtPayload {
  sub: string;
  email: string;
  role: "super_admin";
  iat: number;
  exp: number;
  lastActive: number;
  jti: string;
}

function getJwtSecret(): string {
  return (
    process.env.ADMIN_JWT_SECRET ||
    "tlc_jwt_hs256_secret_2026_leadership_covenant_8492017465a9c3e1"
  );
}

function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlEncodeString(str: string): string {
  return base64UrlEncodeBytes(new TextEncoder().encode(str));
}

function base64UrlDecodeToBytes(b64url: string): Uint8Array {
  const padded = b64url
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(b64url.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Verifies admin credentials directly against Supabase Auth (auth.users).
 * No admin credentials are stored in environment files.
 */
export async function verifyAdminWithSupabase(
  inputEmail: string,
  inputPassword: string
): Promise<{ ok: boolean; email?: string; error?: string }> {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const key = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""
  ).trim();

  if (!url || !key) {
    return { ok: false, error: "Supabase service is not configured." };
  }

  const supabase = createSupabaseJsClient(url, key, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email: inputEmail.trim().toLowerCase(),
    password: inputPassword,
  });

  if (error || !data?.user) {
    return {
      ok: false,
      error: error?.message || "Invalid admin email or password.",
    };
  }

  const user = data.user;
  const isSuperAdmin =
    user.app_metadata?.role === "admin" ||
    user.user_metadata?.role === "admin" ||
    user.email === "tleadershipcovenant@gmail.com";

  if (!isSuperAdmin) {
    return {
      ok: false,
      error: "Access denied. This user does not have administrator privileges.",
    };
  }

  return { ok: true, email: user.email || inputEmail };
}

/**
 * Signs an HS256 JWT token with strict 15-minute inactivity tracking.
 */
export async function signAdminJwt(email: string): Promise<{
  token: string;
  payload: AdminJwtPayload;
}> {
  const now = Math.floor(Date.now() / 1000);
  const payload: AdminJwtPayload = {
    sub: "tlc_super_admin",
    email: email.trim().toLowerCase(),
    role: "super_admin",
    iat: now,
    exp: now + SESSION_INACTIVITY_SECONDS,
    lastActive: now,
    jti: crypto.randomUUID(),
  };

  const headerSegment = base64UrlEncodeString(
    JSON.stringify({ alg: "HS256", typ: "JWT" })
  );
  const payloadSegment = base64UrlEncodeString(JSON.stringify(payload));
  const signingInput = `${headerSegment}.${payloadSegment}`;

  const key = await importHmacKey(getJwtSecret());
  const sigBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signingInput)
  );
  const sigSegment = base64UrlEncodeBytes(new Uint8Array(sigBuffer));

  return {
    token: `${signingInput}.${sigSegment}`,
    payload,
  };
}

/**
 * Verifies an HS256 JWT token signature and checks for 15-minute inactivity.
 */
export async function verifyAdminJwt(
  token?: string | null
): Promise<AdminJwtPayload | null> {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerSeg, payloadSeg, sigSeg] = parts;
  try {
    const key = await importHmacKey(getJwtSecret());
    const sigBytes = base64UrlDecodeToBytes(sigSeg);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes.buffer as ArrayBuffer,
      new TextEncoder().encode(`${headerSeg}.${payloadSeg}`)
    );
    if (!valid) return null;

    const payloadJson = new TextDecoder().decode(
      base64UrlDecodeToBytes(payloadSeg)
    );
    const payload = JSON.parse(payloadJson) as AdminJwtPayload;
    const now = Math.floor(Date.now() / 1000);

    // Strict 15-minute check: either expired by exp OR by lastActive
    if (!payload.exp || payload.exp <= now) {
      return null;
    }
    if (payload.lastActive && now - payload.lastActive > SESSION_INACTIVITY_SECONDS) {
      return null; // Session expired due to 15 min inactivity
    }
    if (payload.role !== "super_admin") {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Extracts and verifies the admin JWT from either the HttpOnly session cookie
 * or an `Authorization: Bearer <token>` header.
 */
export async function authenticateAdminRequest(
  req: NextRequest
): Promise<AdminJwtPayload | null> {
  const cookieToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (cookieToken) {
    const verified = await verifyAdminJwt(cookieToken);
    if (verified) return verified;
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    const bearerToken = authHeader.slice(7).trim();
    return verifyAdminJwt(bearerToken);
  }

  return null;
}

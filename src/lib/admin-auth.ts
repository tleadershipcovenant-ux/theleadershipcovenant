import type { NextRequest } from "next/server";

export const ADMIN_COOKIE_NAME = "tlc_admin_jwt";
export const JWT_EXPIRY_SECONDS = 60 * 60 * 24; // 24 hours

export interface AdminJwtPayload {
  sub: string;
  email: string;
  role: "super_admin";
  iat: number;
  exp: number;
  jti: string;
}

function getJwtSecret(): string {
  return (
    process.env.ADMIN_JWT_SECRET ||
    "tlc_jwt_hs256_secret_2026_leadership_covenant_8492017465a9c3e1"
  );
}

export function getExpectedAdminCredentials(): {
  email: string;
  password: string;
} {
  return {
    email: (process.env.ADMIN_EMAIL || "admin@gamail.com").trim().toLowerCase(),
    password: process.env.ADMIN_PASSWORD || "001001",
  };
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

function timingSafeEqualString(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const aBytes = enc.encode(a);
  const bBytes = enc.encode(b);
  const len = Math.max(aBytes.length, bBytes.length);
  let diff = aBytes.length ^ bBytes.length;
  for (let i = 0; i < len; i++) {
    diff |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
  }
  return diff === 0;
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
 * Verifies admin login credentials using timing-safe comparison.
 */
export function verifyAdminCredentials(
  inputEmail: string,
  inputPassword: string
): boolean {
  const expected = getExpectedAdminCredentials();
  const normalizedEmail = (inputEmail || "").trim().toLowerCase();
  const emailOk = timingSafeEqualString(normalizedEmail, expected.email);
  const passwordOk = timingSafeEqualString(inputPassword || "", expected.password);
  return emailOk && passwordOk;
}

/**
 * Signs an HS256 JWT token using Web Crypto API (Edge & Node compatible).
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
    exp: now + JWT_EXPIRY_SECONDS,
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
 * Verifies an HS256 JWT token signature and expiration.
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
    if (!payload.exp || payload.exp <= now) {
      return null;
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


import type { NextRequest } from "next/server";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory sliding store for edge / server instances
const loginAttempts = new Map<string, RateLimitRecord>();

// Clean up stale entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of loginAttempts.entries()) {
      if (record.resetAt <= now) {
        loginAttempts.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export function getClientIp(req: NextRequest): string {
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  const xRealIp = req.headers.get("x-real-ip");
  if (xRealIp) return xRealIp.trim();

  const xForwarded = req.headers.get("x-forwarded-for");
  if (xForwarded) {
    const first = xForwarded.split(",")[0];
    if (first) return first.trim();
  }

  return "127.0.0.1";
}

/**
 * Enforces rate limiting on sensitive endpoints (e.g. Admin Login).
 * Default: Max 5 attempts per 15-minute (900s) window.
 */
export function checkRateLimit(
  req: NextRequest,
  options: {
    prefix?: string;
    maxAttempts?: number;
    windowSeconds?: number;
  } = {}
): {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
} {
  const prefix = options.prefix || "admin_login";
  const maxAttempts = options.maxAttempts ?? 5;
  const windowSeconds = options.windowSeconds ?? 15 * 60; // 15 minutes default
  const windowMs = windowSeconds * 1000;

  const ip = getClientIp(req);
  const key = `${prefix}:${ip}`;
  const now = Date.now();

  const record = loginAttempts.get(key);

  if (!record || record.resetAt <= now) {
    return {
      allowed: true,
      remaining: maxAttempts,
      resetInSeconds: windowSeconds,
    };
  }

  if (record.count >= maxAttempts) {
    const resetInSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds,
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, maxAttempts - record.count),
    resetInSeconds: Math.max(1, Math.ceil((record.resetAt - now) / 1000)),
  };
}

/**
 * Records a failed attempt for an IP.
 */
export function recordFailedAttempt(
  req: NextRequest,
  options: {
    prefix?: string;
    windowSeconds?: number;
  } = {}
): { remaining: number; resetInSeconds: number } {
  const prefix = options.prefix || "admin_login";
  const maxAttempts = 5;
  const windowSeconds = options.windowSeconds ?? 15 * 60;
  const windowMs = windowSeconds * 1000;

  const ip = getClientIp(req);
  const key = `${prefix}:${ip}`;
  const now = Date.now();

  const record = loginAttempts.get(key);

  if (!record || record.resetAt <= now) {
    loginAttempts.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { remaining: maxAttempts - 1, resetInSeconds: windowSeconds };
  }

  record.count += 1;
  const resetInSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
  return {
    remaining: Math.max(0, maxAttempts - record.count),
    resetInSeconds,
  };
}

/**
 * Clears failed attempts when credentials are valid.
 */
export function clearRateLimit(req: NextRequest, prefix = "admin_login"): void {
  const ip = getClientIp(req);
  loginAttempts.delete(`${prefix}:${ip}`);
}


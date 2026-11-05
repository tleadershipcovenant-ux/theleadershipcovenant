/**
 * Cookie and draft management utilities for the TLC Apply Now page (/apply).
 * Respects user consent: only stores form draft cookies when user explicitly accepts.
 */

export type CookieConsentStatus = "accepted" | "rejected" | "undecided";

export interface ApplyDraftData {
  full_name: string;
  email: string;
  phone: string;
  role: string;
  school_name?: string;
  address_with_city?: string;
  activity_slug: string;
  bookingMode: "reservation" | "secure_seat" | null;
  message?: string;
}

const CONSENT_COOKIE_KEY = "tlc_cookie_consent";
const DRAFT_COOKIE_KEY = "tlc_apply_draft";
const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;
const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60;

/**
 * Reads a cookie value by name from document.cookie
 */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
  return match ? decodeURIComponent(match[3]) : null;
}

/**
 * Writes a cookie to document.cookie
 */
function setCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

/**
 * Removes a cookie from document.cookie
 */
function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

/**
 * Retrieves the user's cookie consent status.
 */
export function getCookieConsent(): CookieConsentStatus {
  if (typeof window === "undefined") return "undecided";

  // Check cookie first
  const cookieVal = getCookie(CONSENT_COOKIE_KEY);
  if (cookieVal === "accepted" || cookieVal === "rejected") {
    return cookieVal;
  }

  // Check localStorage backup
  try {
    const localVal = localStorage.getItem(CONSENT_COOKIE_KEY);
    if (localVal === "accepted" || localVal === "rejected") {
      return localVal;
    }
  } catch {
    // Ignore storage restrictions
  }

  return "undecided";
}

/**
 * Sets the user's cookie consent status and cleans up drafts if rejected.
 */
export function setCookieConsent(status: "accepted" | "rejected"): void {
  if (typeof window === "undefined") return;

  setCookie(CONSENT_COOKIE_KEY, status, ONE_YEAR_SECONDS);
  try {
    localStorage.setItem(CONSENT_COOKIE_KEY, status);
  } catch {
    // Ignore
  }

  if (status === "rejected") {
    clearApplyFormDraft();
  }

  try {
    window.dispatchEvent(
      new CustomEvent("tlc_cookie_consent_changed", { detail: status })
    );
  } catch {
    // Non-fatal
  }
}

/**
 * Saves application form draft if and only if cookies have been accepted.
 */
export function saveApplyFormDraft(data: ApplyDraftData): void {
  if (typeof window === "undefined") return;
  if (getCookieConsent() !== "accepted") return;

  try {
    const payload = JSON.stringify({
      full_name: data.full_name || "",
      email: data.email || "",
      phone: data.phone || "",
      role: data.role || "",
      activity_slug: data.activity_slug || "",
      bookingMode: data.bookingMode || null,
      message: data.message || "",
      savedAt: Date.now(),
    });

    setCookie(DRAFT_COOKIE_KEY, payload, SEVEN_DAYS_SECONDS);
    try {
      localStorage.setItem(DRAFT_COOKIE_KEY, payload);
    } catch {
      // Ignore
    }
  } catch {
    // Non-fatal
  }
}

/**
 * Loads previously saved application form draft if cookies are accepted.
 */
export function loadApplyFormDraft(): ApplyDraftData | null {
  if (typeof window === "undefined") return null;
  if (getCookieConsent() !== "accepted") return null;

  try {
    const raw = getCookie(DRAFT_COOKIE_KEY) || localStorage.getItem(DRAFT_COOKIE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;

    return {
      full_name: String(parsed.full_name || ""),
      email: String(parsed.email || ""),
      phone: String(parsed.phone || ""),
      role: String(parsed.role || ""),
      activity_slug: String(parsed.activity_slug || ""),
      bookingMode: parsed.bookingMode === "reservation" || parsed.bookingMode === "secure_seat" ? parsed.bookingMode : null,
      message: String(parsed.message || ""),
    };
  } catch {
    return null;
  }
}

/**
 * Clears any saved draft cookies and local storage tokens.
 */
export function clearApplyFormDraft(): void {
  if (typeof window === "undefined") return;
  deleteCookie(DRAFT_COOKIE_KEY);
  try {
    localStorage.removeItem(DRAFT_COOKIE_KEY);
  } catch {
    // Ignore
  }
}

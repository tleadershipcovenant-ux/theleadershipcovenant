import path from "path";
import { promises as fs } from "fs";
import { SITE, ANNOUNCEMENTS, MAIN_NAV, HEADER_CTA } from "@/config/site";
import { HOME_CONTENT } from "@/content/home";
import { EVENTS, CATEGORY_LABELS, type LeadershipEvent } from "@/content/events";
import { SUMMIT_CONTENT } from "@/content/summit";
import { SERVICES } from "@/content/services";
import { ABOUT_CONTENT } from "@/content/about";
import { PAYMENT_METHODS } from "@/content/payment";
import { FORM_COPY } from "@/content/forms";

export type ContactCrmStatus = "new" | "in_progress" | "responded" | "archived";
export type ContactPriority = "low" | "normal" | "high" | "urgent";

export interface ContactSubmissionRecord {
  id: string;
  reference_code: string;
  full_name: string;
  email: string;
  phone: string;
  organization: string;
  interest: string;
  message: string;
  crm_status: ContactCrmStatus;
  priority: ContactPriority;
  admin_notes: string;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
}

export type BookingModeType = "reserve_later" | "secure_seat";
export type VerificationStatus =
  | "pending_callback"
  | "awaiting_verification"
  | "verified_confirmed"
  | "waitlisted"
  | "cancelled";

export interface ActivityRegistrationRecord {
  id: string;
  reference_code: string;
  submission_type: "application" | "summit";
  full_name: string;
  email: string;
  phone: string;
  role: string;
  organization: string;
  activity_slug: string;
  activity_title: string;
  activity_category: string;
  activity_date: string;
  activity_city: string;
  booking_mode: BookingModeType;
  payment_method: string;
  fee_label: string;
  transaction_ref: string;
  screenshot_url: string;
  screenshot_public_id: string;
  screenshot_name: string;
  verification_status: VerificationStatus;
  admin_notes: string;
  message: string;
  created_at: string;
  updated_at: string;
}

export type CmsPageKey =
  | "site"
  | "home"
  | "events"
  | "pricing"
  | "summit"
  | "services"
  | "about"
  | "payment"
  | "forms";

export interface CmsPageRecord {
  page_key: CmsPageKey;
  title: string;
  content: Record<string, unknown>;
  updated_by: string;
  updated_at: string;
}

interface LocalDbSchema {
  contacts: ContactSubmissionRecord[];
  registrations: ActivityRegistrationRecord[];
  cms: Record<string, CmsPageRecord>;
}

const CMS_PAGE_TITLES: Record<CmsPageKey, string> = {
  site: "Global Site Settings & Ticker Announcements",
  home: "Home Page Content & Impact Metrics",
  events: "Activities, Workshops & Cohorts Catalog",
  pricing: "Activity Pricing & Early Bird Discount Rules",
  summit: "The School Impact Summit 2026 Page",
  services: "Services & Flagship Programs Page",
  about: "Our Story, Covenant & CEO Message Page",
  payment: "Official Bank & QR Payment Settings",
  forms: "Application & Contact Forms Copy",
};

export function getDefaultCmsContent(
  key: CmsPageKey
): Record<string, unknown> {
  switch (key) {
    case "site":
      return {
        site: JSON.parse(JSON.stringify(SITE)),
        announcements: JSON.parse(JSON.stringify(ANNOUNCEMENTS)),
        mainNav: JSON.parse(JSON.stringify(MAIN_NAV)),
        headerCta: JSON.parse(JSON.stringify(HEADER_CTA)),
      };
    case "home":
      return JSON.parse(JSON.stringify(HOME_CONTENT));
    case "events":
      return {
        events: JSON.parse(JSON.stringify(EVENTS)),
      };
    case "pricing":
      return {
        summitSlug: "school-impact-summit-2026",
        regularPrice: 5000,
        discountPercent: 20,
        earlyBirdDeadline: "2026-11-07T23:59:59+05:00",
        currency: "PKR",
      };
    case "summit":
      return JSON.parse(JSON.stringify(SUMMIT_CONTENT));
    case "services":
      return {
        services: JSON.parse(JSON.stringify(SERVICES)),
      };
    case "about":
      return JSON.parse(JSON.stringify(ABOUT_CONTENT));
    case "payment":
      return {
        methods: JSON.parse(JSON.stringify(PAYMENT_METHODS)),
      };
    case "forms":
      return JSON.parse(JSON.stringify(FORM_COPY));
  }
}

export const ALL_CMS_KEYS: CmsPageKey[] = [
  "site",
  "home",
  "events",
  "pricing",
  "summit",
  "services",
  "about",
  "payment",
  "forms",
];

export function getSupabaseConfig() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "")
    .trim()
    .replace(/\/$/, "");
  const anonKey = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""
  ).trim();
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  const activeKey = serviceRoleKey || anonKey;

  const isConfigured = Boolean(
    url &&
      activeKey &&
      url.startsWith("https://") &&
      !url.includes("your-project-id") &&
      !activeKey.includes("your-supabase")
  );

  return {
    url,
    anonKey,
    serviceRoleKey,
    activeKey,
    isConfigured,
  };
}

// In-memory cache fallback if filesystem is read-only (e.g. serverless edge)
let memoryDb: LocalDbSchema | null = null;

function getLocalDbPath(): string {
  return path.join(process.cwd(), ".data", "tlc-admin-db.json");
}

function buildSeedDb(): LocalDbSchema {
  const now = new Date().toISOString();
  const cms: Record<string, CmsPageRecord> = {};
  for (const key of ALL_CMS_KEYS) {
    cms[key] = {
      page_key: key,
      title: CMS_PAGE_TITLES[key],
      content: getDefaultCmsContent(key),
      updated_by: "system-seed",
      updated_at: now,
    };
  }
  return {
    contacts: [],
    registrations: [],
    cms,
  };
}

async function readLocalDb(): Promise<LocalDbSchema> {
  try {
    const filePath = getLocalDbPath();
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<LocalDbSchema>;
    const seed = buildSeedDb();
    return {
      contacts: Array.isArray(parsed.contacts) ? parsed.contacts : [],
      registrations: Array.isArray(parsed.registrations)
        ? parsed.registrations
        : [],
      cms: { ...seed.cms, ...(parsed.cms || {}) },
    };
  } catch {
    if (!memoryDb) {
      memoryDb = buildSeedDb();
    }
    return memoryDb;
  }
}

async function writeLocalDb(db: LocalDbSchema): Promise<void> {
  memoryDb = db;
  try {
    const filePath = getLocalDbPath();
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(db, null, 2), "utf8");
  } catch {
    // Read-only runtime keeps memoryDb updated safely
  }
}

async function supabaseFetch<T>(
  restPath: string,
  init: RequestInit = {}
): Promise<T> {
  const cfg = getSupabaseConfig();
  if (!cfg.isConfigured) {
    throw new Error("Supabase not configured");
  }

  const headers = new Headers(init.headers);
  headers.set("apikey", cfg.activeKey);
  headers.set("Authorization", `Bearer ${cfg.activeKey}`);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${cfg.url}/rest/v1/${restPath}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Supabase error (${res.status}): ${errText}`);
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

export async function testSupabaseConnection(): Promise<{
  configured: boolean;
  connected: boolean;
  provider: "supabase" | "local_json";
  message: string;
}> {
  const cfg = getSupabaseConfig();
  if (!cfg.isConfigured) {
    return {
      configured: false,
      connected: true,
      provider: "local_json",
      message:
        "Running on built-in local JSON store (.data/tlc-admin-db.json). Add NEXT_PUBLIC_SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY in .env.local and run supabase/schema.sql to activate cloud PostgreSQL.",
    };
  }

  try {
    await supabaseFetch<unknown[]>("cms_pages?select=page_key&limit=1");
    return {
      configured: true,
      connected: true,
      provider: "supabase",
      message: "Connected to Supabase PostgreSQL (tables verified & active).",
    };
  } catch (err: unknown) {
    return {
      configured: true,
      connected: false,
      provider: "local_json",
      message:
        err instanceof Error
          ? `Supabase keys detected, but query failed (${err.message}). Make sure you ran supabase/schema.sql in Supabase SQL Editor. Falling back to local store meanwhile.`
          : "Supabase connection test failed.",
    };
  }
}

// =============================================================================
// CONTACT US SUBMISSIONS CRM OPERATIONS
// =============================================================================

export async function listContactSubmissions(): Promise<
  ContactSubmissionRecord[]
> {
  const cfg = getSupabaseConfig();
  if (cfg.isConfigured) {
    try {
      const rows = await supabaseFetch<ContactSubmissionRecord[]>(
        "contact_submissions?select=*&order=created_at.desc"
      );
      return rows;
    } catch {
      // Fallback to local DB if table not yet migrated
    }
  }
  const db = await readLocalDb();
  return [...db.contacts].sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  );
}

export async function createContactSubmission(input: {
  reference_code: string;
  full_name: string;
  email: string;
  phone?: string;
  organization: string;
  interest?: string;
  message: string;
}): Promise<ContactSubmissionRecord> {
  const now = new Date().toISOString();
  const record: ContactSubmissionRecord = {
    id: crypto.randomUUID(),
    reference_code: input.reference_code,
    full_name: input.full_name.trim(),
    email: input.email.trim(),
    phone: (input.phone || "").trim(),
    organization: input.organization.trim(),
    interest: (input.interest || "general").trim(),
    message: input.message.trim(),
    crm_status: "new",
    priority: "normal",
    admin_notes: "",
    responded_at: null,
    created_at: now,
    updated_at: now,
  };

  const cfg = getSupabaseConfig();
  if (cfg.isConfigured) {
    try {
      const inserted = await supabaseFetch<ContactSubmissionRecord[]>(
        "contact_submissions",
        {
          method: "POST",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify(record),
        }
      );
      if (inserted?.[0]) return inserted[0];
    } catch {
      // Fallback safely to local DB
    }
  }

  const db = await readLocalDb();
  db.contacts.unshift(record);
  await writeLocalDb(db);
  return record;
}

export async function updateContactSubmission(
  id: string,
  patch: Partial<
    Pick<
      ContactSubmissionRecord,
      "crm_status" | "priority" | "admin_notes" | "responded_at"
    >
  >
): Promise<ContactSubmissionRecord | null> {
  const now = new Date().toISOString();
  const payload: Record<string, unknown> = {
    ...patch,
    updated_at: now,
  };
  if (patch.crm_status === "responded" && !patch.responded_at) {
    payload.responded_at = now;
  }

  const cfg = getSupabaseConfig();
  if (cfg.isConfigured) {
    try {
      const updated = await supabaseFetch<ContactSubmissionRecord[]>(
        `contact_submissions?id=eq.${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify(payload),
        }
      );
      if (updated?.[0]) return updated[0];
    } catch {
      // Fallback to local DB
    }
  }

  const db = await readLocalDb();
  const idx = db.contacts.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  db.contacts[idx] = {
    ...db.contacts[idx],
    ...(payload as Partial<ContactSubmissionRecord>),
  };
  await writeLocalDb(db);
  return db.contacts[idx];
}

export async function deleteContactSubmission(id: string): Promise<boolean> {
  const cfg = getSupabaseConfig();
  if (cfg.isConfigured) {
    try {
      await supabaseFetch<unknown>(
        `contact_submissions?id=eq.${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      return true;
    } catch {
      // Fallback to local DB
    }
  }

  const db = await readLocalDb();
  const before = db.contacts.length;
  db.contacts = db.contacts.filter((c) => c.id !== id);
  await writeLocalDb(db);
  return db.contacts.length < before;
}

// =============================================================================
// ACTIVITY & SUMMIT REGISTRATIONS CRM OPERATIONS
// =============================================================================

export async function resolveActivityMetadata(slug: string): Promise<{
  title: string;
  category: string;
  date: string;
  city: string;
  schedule: string;
}> {
  const eventsPage = await getCmsPage("events");
  const cmsEvents = Array.isArray(eventsPage?.content?.events)
    ? (eventsPage.content.events as LeadershipEvent[])
    : EVENTS;

  const found =
    cmsEvents.find((ev) => ev.slug === slug) ||
    EVENTS.find((ev) => ev.slug === slug);

  if (found) {
    const formattedDate = found.startDate
      ? new Date(found.startDate + "T00:00:00").toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "2026 Schedule";
    return {
      title: found.title,
      category: CATEGORY_LABELS[found.category] || found.category,
      date: formattedDate,
      city: found.city || "Islamabad",
      schedule: found.schedule || "Full Day PKT",
    };
  }

  return {
    title: slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (m) => m.toUpperCase()),
    category: "Leadership Activity",
    date: "2026 Schedule",
    city: "Islamabad",
    schedule: "Full Day PKT",
  };
}

export async function listActivityRegistrations(): Promise<
  ActivityRegistrationRecord[]
> {
  const cfg = getSupabaseConfig();
  if (cfg.isConfigured) {
    try {
      const rows = await supabaseFetch<ActivityRegistrationRecord[]>(
        "activity_registrations?select=*&order=created_at.desc"
      );
      return rows;
    } catch {
      // Fallback to local DB
    }
  }

  const db = await readLocalDb();
  return [...db.registrations].sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  );
}

export async function createActivityRegistration(input: {
  reference_code: string;
  submission_type: "application" | "summit";
  full_name: string;
  email: string;
  phone: string;
  role: string;
  organization?: string;
  activity_slug: string;
  booking_mode?: BookingModeType;
  payment_method?: string;
  fee_label?: string;
  transaction_ref?: string;
  screenshot_url?: string;
  screenshot_public_id?: string;
  screenshot_name?: string;
  message?: string;
  verification_status?: VerificationStatus;
}): Promise<ActivityRegistrationRecord> {
  const now = new Date().toISOString();
  const meta = await resolveActivityMetadata(input.activity_slug);
  const mode: BookingModeType =
    input.booking_mode === "secure_seat" ? "secure_seat" : "reserve_later";
  const defaultVerification: VerificationStatus =
    input.verification_status ||
    (mode === "secure_seat" ? "awaiting_verification" : "pending_callback");

  const record: ActivityRegistrationRecord = {
    id: crypto.randomUUID(),
    reference_code: input.reference_code,
    submission_type: input.submission_type,
    full_name: input.full_name.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    role: input.role.trim(),
    organization: (input.organization || "").trim(),
    activity_slug: input.activity_slug.trim(),
    activity_title: meta.title,
    activity_category: meta.category,
    activity_date: meta.date,
    activity_city: meta.city,
    booking_mode: mode,
    payment_method: (input.payment_method || "ubl").trim(),
    fee_label: (input.fee_label || "").trim(),
    transaction_ref: (input.transaction_ref || "").trim(),
    screenshot_url: (input.screenshot_url || "").trim(),
    screenshot_public_id: (input.screenshot_public_id || "").trim(),
    screenshot_name: (input.screenshot_name || "").trim(),
    verification_status: defaultVerification,
    admin_notes: "",
    message: (input.message || "").trim(),
    created_at: now,
    updated_at: now,
  };

  const cfg = getSupabaseConfig();
  if (cfg.isConfigured) {
    try {
      const inserted = await supabaseFetch<ActivityRegistrationRecord[]>(
        "activity_registrations",
        {
          method: "POST",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify(record),
        }
      );
      if (inserted?.[0]) return inserted[0];
    } catch {
      // Fallback safely to local DB
    }
  }

  const db = await readLocalDb();
  db.registrations.unshift(record);
  await writeLocalDb(db);
  return record;
}

export async function updateActivityRegistration(
  id: string,
  patch: Partial<
    Pick<
      ActivityRegistrationRecord,
      | "verification_status"
      | "booking_mode"
      | "transaction_ref"
      | "fee_label"
      | "admin_notes"
      | "screenshot_url"
      | "screenshot_public_id"
      | "screenshot_name"
    >
  >
): Promise<ActivityRegistrationRecord | null> {
  const now = new Date().toISOString();
  const payload = {
    ...patch,
    updated_at: now,
  };

  const cfg = getSupabaseConfig();
  if (cfg.isConfigured) {
    try {
      const updated = await supabaseFetch<ActivityRegistrationRecord[]>(
        `activity_registrations?id=eq.${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify(payload),
        }
      );
      if (updated?.[0]) return updated[0];
    } catch {
      // Fallback to local DB
    }
  }

  const db = await readLocalDb();
  const idx = db.registrations.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  db.registrations[idx] = {
    ...db.registrations[idx],
    ...payload,
  };
  await writeLocalDb(db);
  return db.registrations[idx];
}

export async function deleteActivityRegistration(
  id: string
): Promise<ActivityRegistrationRecord | null> {
  const cfg = getSupabaseConfig();
  if (cfg.isConfigured) {
    try {
      const deleted = await supabaseFetch<ActivityRegistrationRecord[]>(
        `activity_registrations?id=eq.${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers: { Prefer: "return=representation" },
        }
      );
      if (deleted?.[0]) return deleted[0];
    } catch {
      // Fallback to local DB
    }
  }

  const db = await readLocalDb();
  const found = db.registrations.find((r) => r.id === id) || null;
  db.registrations = db.registrations.filter((r) => r.id !== id);
  await writeLocalDb(db);
  return found;
}

// =============================================================================
// WEBSITE CMS PORTAL OPERATIONS (ALL PAGES)
// =============================================================================

export async function getCmsPage(key: CmsPageKey): Promise<CmsPageRecord> {
  const cfg = getSupabaseConfig();
  if (cfg.isConfigured) {
    try {
      const rows = await supabaseFetch<CmsPageRecord[]>(
        `cms_pages?page_key=eq.${encodeURIComponent(key)}&select=*&limit=1`
      );
      if (rows?.[0]) return rows[0];
    } catch {
      // Fallback to local DB
    }
  }

  const db = await readLocalDb();
  if (db.cms[key]) return db.cms[key];

  return {
    page_key: key,
    title: CMS_PAGE_TITLES[key],
    content: getDefaultCmsContent(key),
    updated_by: "system-seed",
    updated_at: new Date().toISOString(),
  };
}

export async function getAllCmsPages(): Promise<Record<CmsPageKey, CmsPageRecord>> {
  const result = {} as Record<CmsPageKey, CmsPageRecord>;
  for (const key of ALL_CMS_KEYS) {
    result[key] = {
      page_key: key,
      title: CMS_PAGE_TITLES[key],
      content: getDefaultCmsContent(key),
      updated_by: "system-seed",
      updated_at: new Date().toISOString(),
    };
  }

  const cfg = getSupabaseConfig();
  if (cfg.isConfigured) {
    try {
      const rows = await supabaseFetch<CmsPageRecord[]>(
        "cms_pages?select=*"
      );
      for (const row of rows || []) {
        if (ALL_CMS_KEYS.includes(row.page_key as CmsPageKey)) {
          result[row.page_key as CmsPageKey] = row;
        }
      }
      return result;
    } catch {
      // Fallback to local DB
    }
  }

  const db = await readLocalDb();
  for (const key of ALL_CMS_KEYS) {
    if (db.cms[key]) {
      result[key] = db.cms[key];
    }
  }
  return result;
}

export async function upsertCmsPage(
  key: CmsPageKey,
  content: Record<string, unknown>,
  actorEmail: string
): Promise<CmsPageRecord> {
  const now = new Date().toISOString();
  const record: CmsPageRecord = {
    page_key: key,
    title: CMS_PAGE_TITLES[key],
    content,
    updated_by: actorEmail,
    updated_at: now,
  };

  const cfg = getSupabaseConfig();
  if (cfg.isConfigured) {
    try {
      const saved = await supabaseFetch<CmsPageRecord[]>(
        "cms_pages?on_conflict=page_key",
        {
          method: "POST",
          headers: {
            Prefer: "resolution=merge-duplicates,return=representation",
          },
          body: JSON.stringify(record),
        }
      );
      if (saved?.[0]) return saved[0];
    } catch {
      // Fallback to local DB
    }
  }

  const db = await readLocalDb();
  db.cms[key] = record;
  await writeLocalDb(db);
  return record;
}

export async function resetCmsPageToDefault(
  key: CmsPageKey,
  actorEmail: string
): Promise<CmsPageRecord> {
  return upsertCmsPage(key, getDefaultCmsContent(key), actorEmail);
}


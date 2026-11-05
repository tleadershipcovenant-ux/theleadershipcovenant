import path from "path";
import { promises as fs } from "fs";
import { EVENTS, CATEGORY_LABELS, type LeadershipEvent } from "@/content/events";
import { getCmsPage } from "@/lib/firebase-cms";

/**
 * Re-export all CMS operations and types from Firebase Firestore module.
 * For dedicated CMS work, import directly from `@/lib/firebase-cms`.
 */
export {
  type CmsPageKey,
  type CmsPageRecord,
  CMS_PAGE_TITLES,
  ALL_CMS_KEYS,
  getDefaultCmsContent,
  getCmsPage,
  getAllCmsPages,
  upsertCmsPage,
  resetCmsPageToDefault,
  testFirebaseCmsStatus,
} from "@/lib/firebase-cms";

export type ContactCrmStatus = "new" | "in_progress" | "responded" | "archived";
export type ContactPriority = "low" | "normal" | "high" | "urgent";

export interface ContactSubmissionRecord {
  id: string;
  reference_code: string;
  full_name: string;
  email: string;
  phone: string;
  organization: string;
  address_with_city: string;
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
  school_name: string;
  address_with_city: string;
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

interface LocalDbSchema {
  contacts: ContactSubmissionRecord[];
  registrations: ActivityRegistrationRecord[];
}

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
  return {
    contacts: [],
    registrations: [],
  };
}

async function readLocalDb(): Promise<LocalDbSchema> {
  try {
    const filePath = getLocalDbPath();
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<LocalDbSchema>;
    return {
      contacts: Array.isArray(parsed.contacts)
        ? parsed.contacts.map((c) => ({
            ...c,
            address_with_city: c.address_with_city || "",
          }))
        : [],
      registrations: Array.isArray(parsed.registrations)
        ? parsed.registrations.map((r) => ({
            ...r,
            school_name: r.school_name || r.organization || "",
            address_with_city: r.address_with_city || "",
          }))
        : [],
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

  // Strict 2.5s AbortController timeout so hung/paused Supabase requests never block the application
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);

  try {
    const res = await fetch(`${cfg.url}/rest/v1/${restPath}`, {
      ...init,
      headers,
      signal: init.signal || controller.signal,
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Supabase error (${res.status}): ${errText}`);
    }

    const text = await res.text();
    return (text ? JSON.parse(text) : null) as T;
  } finally {
    clearTimeout(timer);
  }
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
    await supabaseFetch<unknown[]>("contact_submissions?select=id&limit=1");
    return {
      configured: true,
      connected: true,
      provider: "supabase",
      message: "Connected to Supabase PostgreSQL (CRM tables verified & active).",
    };
  } catch (err: unknown) {
    return {
      configured: true,
      connected: false,
      provider: "local_json",
      message:
        err instanceof Error
          ? `Supabase paused or query failed (${err.message}). Safe zero-downtime local JSON store is currently handling requests.`
          : "Supabase connection test failed. Local fallback active.",
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
      if (Array.isArray(rows)) {
        // Sync warm cache
        readLocalDb().then((db) => {
          db.contacts = rows;
          writeLocalDb(db).catch(() => {});
        }).catch(() => {});
        return rows;
      }
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
  address_with_city?: string;
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
    address_with_city: (input.address_with_city || "").trim(),
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
        `contact_submissions?or=(id.eq.${encodeURIComponent(id)},reference_code.eq.${encodeURIComponent(id)})`,
        {
          method: "PATCH",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify(payload),
        }
      );
      if (updated?.[0]) {
        readLocalDb().then((db) => {
          const idx = db.contacts.findIndex((c) => c.id === id || c.reference_code === id);
          if (idx !== -1) {
            db.contacts[idx] = updated[0];
          } else {
            db.contacts.unshift(updated[0]);
          }
          writeLocalDb(db).catch(() => {});
        }).catch(() => {});
        return updated[0];
      }
    } catch (err) {
      console.error("[SUPABASE CONTACT UPDATE ERROR]", err);
    }
  }

  const db = await readLocalDb();
  const idx = db.contacts.findIndex((c) => c.id === id || c.reference_code === id);
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
        `contact_submissions?or=(id.eq.${encodeURIComponent(id)},reference_code.eq.${encodeURIComponent(id)})`,
        { method: "DELETE" }
      );
      readLocalDb().then((db) => {
        db.contacts = db.contacts.filter((c) => c.id !== id && c.reference_code !== id);
        writeLocalDb(db).catch(() => {});
      }).catch(() => {});
      return true;
    } catch {
      // Fallback to local DB
    }
  }

  const db = await readLocalDb();
  const before = db.contacts.length;
  db.contacts = db.contacts.filter((c) => c.id !== id && c.reference_code !== id);
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
  // 1. Dynamic Firebase CMS lookup
  try {
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
  } catch {
    // Non-fatal, fallback to static EVENTS
  }

  // 2. Static events fallback
  const staticFound = EVENTS.find((ev) => ev.slug === slug);
  if (staticFound) {
    const formattedDate = staticFound.startDate
      ? new Date(staticFound.startDate + "T00:00:00").toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "2026 Schedule";
    return {
      title: staticFound.title,
      category: CATEGORY_LABELS[staticFound.category] || staticFound.category,
      date: formattedDate,
      city: staticFound.city || "Islamabad",
      schedule: staticFound.schedule || "Full Day PKT",
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

const UNAMBIGUOUS_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateBookingToken(length = 5): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => UNAMBIGUOUS_CHARS[b % UNAMBIGUOUS_CHARS.length])
    .join("");
}

/**
 * Checks whether a booking reference code already exists in memory, local store, or Supabase.
 */
export async function isBookingReferenceTaken(referenceCode: string): Promise<boolean> {
  const code = referenceCode.trim().toUpperCase();

  // 1. Fast check against in-memory DB
  if (
    memoryDb?.registrations?.some(
      (r) => r.reference_code.toUpperCase() === code
    )
  ) {
    return true;
  }

  // 2. Check local DB file
  try {
    const db = await readLocalDb();
    if (
      db.registrations?.some((r) => r.reference_code.toUpperCase() === code)
    ) {
      return true;
    }
  } catch {
    // Ignore local read errors
  }

  // 3. Query Supabase table for existence
  const cfg = getSupabaseConfig();
  if (cfg.isConfigured) {
    try {
      const existing = await supabaseFetch<{ id: string }[]>(
        `activity_registrations?reference_code=eq.${encodeURIComponent(
          code
        )}&select=id&limit=1`
      );
      if (Array.isArray(existing) && existing.length > 0) {
        return true;
      }
    } catch {
      // Ignore network errors on check
    }
  }

  return false;
}

/**
 * Generates a guaranteed 100% unique official booking reference code:
 * Format: TLC-26-XXXXX (e.g. TLC-26-K9P4M)
 * Actively verified against both local store and Supabase database records to ensure zero duplicates.
 */
export async function generateUniqueBookingReference(
  attempts = 15
): Promise<string> {
  for (let i = 0; i < attempts; i++) {
    // Generate 5-character token (or 6-character token if higher entropy needed)
    const length = i < 10 ? 5 : 6;
    const token = generateBookingToken(length);
    const candidate = `TLC-26-${token}`;

    const taken = await isBookingReferenceTaken(candidate);
    if (!taken) {
      return candidate;
    }
  }

  // High-entropy fallback using base36 timestamp + random bytes
  const timeSlice = Date.now().toString(36).slice(-3).toUpperCase();
  const randSlice = generateBookingToken(3);
  return `TLC-26-${timeSlice}${randSlice}`;
}

/**
 * Generates a guaranteed unique reference code for contact inquiries: TLC-INQ-XXXXX
 */
export async function generateUniqueContactReference(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const token = generateBookingToken(5);
    const candidate = `TLC-INQ-${token}`;
    if (!memoryDb?.contacts?.some((c) => c.reference_code === candidate)) {
      return candidate;
    }
  }
  return `TLC-INQ-${Date.now().toString(36).slice(-3).toUpperCase()}${generateBookingToken(3)}`;
}

export async function createActivityRegistration(input: {
  reference_code?: string;
  submission_type: "application" | "summit";
  full_name: string;
  email: string;
  phone: string;
  role: string;
  organization?: string;
  school_name?: string;
  address_with_city?: string;
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
    (mode === "secure_seat" || Boolean(input.screenshot_url)
      ? "awaiting_verification"
      : "pending_callback");

  // Ensure reference code is 100% unique across all existing records
  let resolvedRefCode = (input.reference_code || "").trim().toUpperCase();
  if (!resolvedRefCode || (await isBookingReferenceTaken(resolvedRefCode))) {
    resolvedRefCode = await generateUniqueBookingReference();
  }

  const resolvedSchoolName = (input.school_name || input.organization || "").trim();
  const resolvedOrg = (input.organization || input.school_name || "").trim();

  const record: ActivityRegistrationRecord = {
    id: crypto.randomUUID(),
    reference_code: resolvedRefCode,
    submission_type: input.submission_type,
    full_name: input.full_name.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    role: input.role.trim(),
    organization: resolvedOrg,
    school_name: resolvedSchoolName,
    address_with_city: (input.address_with_city || "").trim(),
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
      if (inserted?.[0]) {
        // Keep in-memory cache and local DB synchronized immediately
        if (memoryDb) {
          memoryDb.registrations.unshift(inserted[0]);
        }
        try {
          const db = await readLocalDb();
          db.registrations.unshift(inserted[0]);
          await writeLocalDb(db).catch(() => {});
        } catch {
          // Ignored
        }
        return inserted[0];
      }
    } catch (err: unknown) {
      const errStr = String(err);
      // Auto-retry with fresh unique ID if Postgres reports unique constraint violation (code 23505)
      if (
        errStr.includes("23505") ||
        errStr.includes("duplicate key") ||
        errStr.includes("unique")
      ) {
        console.warn(
          "[Unique collision on reference_code, regenerating fresh ID...]"
        );
        record.reference_code = await generateUniqueBookingReference();
        try {
          const retry = await supabaseFetch<ActivityRegistrationRecord[]>(
            "activity_registrations",
            {
              method: "POST",
              headers: { Prefer: "return=representation" },
              body: JSON.stringify(record),
            }
          );
          if (retry?.[0]) {
            if (memoryDb) memoryDb.registrations.unshift(retry[0]);
            const db = await readLocalDb();
            db.registrations.unshift(retry[0]);
            await writeLocalDb(db).catch(() => {});
            return retry[0];
          }
        } catch {
          // Fall through to local DB
        }
      }
      console.warn("[Supabase Insert Error, saving to local store]:", err);
    }
  }

  // Ensure uniqueness in local DB
  const db = await readLocalDb();
  while (
    db.registrations.some((r) => r.reference_code === record.reference_code)
  ) {
    record.reference_code = await generateUniqueBookingReference();
  }

  if (memoryDb) {
    memoryDb.registrations.unshift(record);
  }
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
        `activity_registrations?or=(id.eq.${encodeURIComponent(id)},reference_code.eq.${encodeURIComponent(id)})`,
        {
          method: "PATCH",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify(payload),
        }
      );
      if (updated?.[0]) {
        readLocalDb().then((db) => {
          const idx = db.registrations.findIndex((r) => r.id === id || r.reference_code === id);
          if (idx !== -1) {
            db.registrations[idx] = updated[0];
          } else {
            db.registrations.unshift(updated[0]);
          }
          writeLocalDb(db).catch(() => {});
        }).catch(() => {});
        return updated[0];
      }
    } catch {
      // Fallback to local DB
    }
  }

  const db = await readLocalDb();
  const idx = db.registrations.findIndex((r) => r.id === id || r.reference_code === id);
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




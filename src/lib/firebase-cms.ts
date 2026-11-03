import path from "path";
import { promises as fs } from "fs";
import { SITE, ANNOUNCEMENTS, MAIN_NAV, HEADER_CTA } from "@/config/site";
import { HOME_CONTENT } from "@/content/home";
import { EVENTS } from "@/content/events";
import { SUMMIT_CONTENT } from "@/content/summit";
import { SERVICES } from "@/content/services";
import { ABOUT_CONTENT } from "@/content/about";
import { PAYMENT_METHODS } from "@/content/payment";
import { FORM_COPY } from "@/content/forms";
import {
  getFirestoreDocument,
  setFirestoreDocument,
  listFirestoreDocuments,
  testFirebaseConnection,
} from "@/lib/firebase-admin";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * FIREBASE CLOUD FIRESTORE CMS ENGINE
 * ─────────────────────────────────────────────────────────────────────────────
 * All public website content and admin CMS edits are stored and synced via
 * Google Cloud Firestore collection: `cms_pages`.
 * 
 * Features:
 * - Direct Firestore persistence with document-level granularity
 * - Multi-tiered fallback (Firestore -> In-Memory Cache -> Local JSON Cache -> Code Defaults)
 * - Zero Downtime guarantee: Never serves an empty or broken page
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type CmsPageKey =
  | "site"
  | "home"
  | "events"
  | "pricing"
  | "summit"
  | "services"
  | "about"
  | "payment"
  | "forms"
  | "contact";

export interface CmsPageRecord {
  page_key: CmsPageKey;
  title: string;
  content: Record<string, unknown>;
  updated_by: string;
  updated_at: string;
}

export const CMS_PAGE_TITLES: Record<CmsPageKey, string> = {
  site: "Global Site Settings & Ticker Announcements",
  home: "Home Page Content & Impact Metrics",
  events: "Activities, Workshops & Cohorts Catalog",
  pricing: "Activity Pricing & Early Bird Discount Rules",
  summit: "The School Impact Summit 2026 Page",
  services: "Services & Flagship Programs Page",
  about: "Our Story, Covenant & CEO Message Page",
  payment: "Official Bank & QR Payment Settings",
  forms: "Application & Contact Forms Copy",
  contact: "Contact Us & Regional Headquarters Page",
};

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
  "contact",
];

export function getDefaultCmsContent(key: CmsPageKey): Record<string, unknown> {
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
    case "contact":
      return {
        hero: {
          eyebrow: "Contact Us",
          heading: "Let's start a conversation.",
          subheading:
            "Whether you are exploring a program for your school, joining a camp, or just curious, we would love to hear from you.",
        },
        contactInfo: {
          email: "theleadershipcovenant@gmail.com",
          phone: "+92 319 2091249",
          whatsapp: "+92 319 2091249",
          whatsappLink: "https://wa.me/923192091249",
          address: "F-10/3, Islamabad, Pakistan",
          officeHours: "Monday - Saturday, 9:00 AM - 6:00 PM PKT",
          consultationNote:
            "Connect with our Islamabad office via WhatsApp, email, or in person for school partnerships, workshops, and camp enquiries.",
        },
        social: {
          linkedin:
            "https://www.linkedin.com/company/franklincovey-education-north-region/",
          facebook: "https://web.facebook.com/profile.php?id=61592161942804",
          instagram: "https://www.instagram.com/franklincoveyeducation_north/",
        },
      };
  }
}

// In-memory cache for ultra-fast serverless hits
let memoryCmsCache: Record<string, CmsPageRecord> | null = null;

function buildSeedCmsMap(): Record<string, CmsPageRecord> {
  const now = new Date().toISOString();
  const map: Record<string, CmsPageRecord> = {};
  for (const key of ALL_CMS_KEYS) {
    map[key] = {
      page_key: key,
      title: CMS_PAGE_TITLES[key],
      content: getDefaultCmsContent(key),
      updated_by: "system-seed",
      updated_at: now,
    };
  }
  return map;
}

function getLocalCmsCachePath(): string {
  return path.join(process.cwd(), ".data", "tlc-cms-cache.json");
}

async function readLocalCmsCache(): Promise<Record<string, CmsPageRecord> | null> {
  try {
    const raw = await fs.readFile(getLocalCmsCachePath(), "utf8");
    return JSON.parse(raw);
  } catch {
    // If not found, also check legacy admin db fallback file
    try {
      const legacyPath = path.join(process.cwd(), ".data", "tlc-admin-db.json");
      const legacyRaw = await fs.readFile(legacyPath, "utf8");
      const parsed = JSON.parse(legacyRaw);
      if (parsed?.cms && typeof parsed.cms === "object") {
        return parsed.cms;
      }
    } catch {
      // Ignore
    }
    return null;
  }
}

async function writeLocalCmsCache(data: Record<string, CmsPageRecord>): Promise<void> {
  try {
    const dir = path.join(process.cwd(), ".data");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(getLocalCmsCachePath(), JSON.stringify(data, null, 2), "utf8");
  } catch {
    // Read-only filesystem, memory cache handles it
  }
}

/**
 * Fetch a single CMS page by key.
 * Tier 1: Firebase Cloud Firestore
 * Tier 2: In-Memory Cache
 * Tier 3: Local JSON disk cache
 * Tier 4: Built-in code defaults
 */
export async function getCmsPage(key: CmsPageKey): Promise<CmsPageRecord> {
  // 1. Primary: Google Cloud Firestore Edge REST
  try {
    const doc = await getFirestoreDocument<CmsPageRecord>("cms_pages", key);
    if (doc?.content) {
      if (!memoryCmsCache) memoryCmsCache = buildSeedCmsMap();
      memoryCmsCache[key] = doc;
      return doc;
    }
  } catch (err) {
    console.warn(`[Firestore CMS] Fetch failed for ${key}, falling back:`, err);
  }

  // 2. In-memory cache fallback
  if (memoryCmsCache?.[key]) {
    return memoryCmsCache[key];
  }

  // 3. Local offline JSON fallback
  const localCache = await readLocalCmsCache();
  if (localCache?.[key]) {
    if (!memoryCmsCache) memoryCmsCache = buildSeedCmsMap();
    memoryCmsCache[key] = localCache[key];
    return localCache[key];
  }

  // 4. Default code fallback
  return {
    page_key: key,
    title: CMS_PAGE_TITLES[key],
    content: getDefaultCmsContent(key),
    updated_by: "system-code-fallback",
    updated_at: new Date().toISOString(),
  };
}

/**
 * Fetch all CMS pages at once (used by Admin CMS Dashboard).
 */
export async function getAllCmsPages(): Promise<Record<CmsPageKey, CmsPageRecord>> {
  const result = {} as Record<CmsPageKey, CmsPageRecord>;
  for (const key of ALL_CMS_KEYS) {
    result[key] = {
      page_key: key,
      title: CMS_PAGE_TITLES[key],
      content: getDefaultCmsContent(key),
      updated_by: "system-code-fallback",
      updated_at: new Date().toISOString(),
    };
  }

  // 1. Primary: Google Cloud Firestore batch load via REST
  try {
    const docs = await listFirestoreDocuments<CmsPageRecord>("cms_pages");
    if (docs && docs.length > 0) {
      for (const row of docs) {
        if (row.page_key && ALL_CMS_KEYS.includes(row.page_key as CmsPageKey)) {
          result[row.page_key as CmsPageKey] = row;
          if (!memoryCmsCache) memoryCmsCache = buildSeedCmsMap();
          memoryCmsCache[row.page_key] = row;
        }
      }
      return result;
    }
  } catch (err) {
    console.warn("[Firestore CMS] Batch load failed, falling back:", err);
  }

  // 2. Fallback to local DB cache
  const localCache = await readLocalCmsCache();
  if (localCache) {
    for (const key of ALL_CMS_KEYS) {
      if (localCache[key]) {
        result[key] = localCache[key];
      }
    }
  }

  return result;
}

/**
 * Save CMS modifications to Firebase Cloud Firestore.
 */
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

  // 1. Primary: Persist immediately to Google Cloud Firestore via REST
  try {
    await setFirestoreDocument(
      "cms_pages",
      key,
      record as unknown as Record<string, unknown>
    );
  } catch (err) {
    console.error(`[Firestore CMS Save Error for ${key}]:`, err);
  }

  // 2. Sync to in-memory cache
  if (!memoryCmsCache) memoryCmsCache = buildSeedCmsMap();
  memoryCmsCache[key] = record;

  // 3. Sync to local offline JSON cache
  try {
    const local = (await readLocalCmsCache()) || buildSeedCmsMap();
    local[key] = record;
    await writeLocalCmsCache(local);
  } catch {
    // Non-fatal
  }

  return record;
}

/**
 * Reset a CMS page to factory defaults.
 */
export async function resetCmsPageToDefault(
  key: CmsPageKey,
  actorEmail: string
): Promise<CmsPageRecord> {
  return upsertCmsPage(key, getDefaultCmsContent(key), actorEmail);
}

/**
 * Test Firebase Cloud Firestore CMS connection status.
 */
export async function testFirebaseCmsStatus(): Promise<{
  configured: boolean;
  connected: boolean;
  database: string;
  collection: string;
  message: string;
}> {
  const test = await testFirebaseConnection();
  return {
    configured: test.configured,
    connected: test.connected,
    database: "Firebase Cloud Firestore",
    collection: "cms_pages",
    message: test.message,
  };
}


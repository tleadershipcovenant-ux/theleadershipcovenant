/**
 * ─────────────────────────────────────────────────────────────────────────────
 * GOOGLE CLOUD FIRESTORE EDGE REST CLIENT
 * ─────────────────────────────────────────────────────────────────────────────
 * Zero-dependency, 100% Cloudflare Workers & Node.js Edge Runtime compatible.
 * Replaces heavy firebase-admin / gRPC modules to eliminate 500 crashes on
 * serverless edge networks (Cloudflare Pages / OpenNext).
 * ─────────────────────────────────────────────────────────────────────────────
 */
import path from "path";
import fs from "fs";
import crypto from "crypto";

interface ServiceAccountCredentials {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

let cachedCredentials: ServiceAccountCredentials | null = null;
let cachedAccessToken: { token: string; expiresAt: number } | null = null;
let cachedCryptoKey: CryptoKey | null = null;

function pemToPkcs8Bytes(pem: string): Uint8Array {
  const b64 = pem
    .replace(/-----BEGIN (?:RSA )?PRIVATE KEY-----/g, "")
    .replace(/-----END (?:RSA )?PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function signRs256Assertion(signingInput: string, privateKeyPem: string): Promise<string> {
  // 1. Prefer native Web Crypto API (100% native in Cloudflare Workers workerd & Node.js 18+)
  try {
    if (typeof globalThis.crypto !== "undefined" && globalThis.crypto.subtle) {
      if (!cachedCryptoKey) {
        const pkcs8 = pemToPkcs8Bytes(privateKeyPem);
        cachedCryptoKey = await globalThis.crypto.subtle.importKey(
          "pkcs8",
          pkcs8 as unknown as BufferSource,
          { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
          false,
          ["sign"]
        );
      }
      const sigBuf = await globalThis.crypto.subtle.sign(
        "RSASSA-PKCS1-v1_5",
        cachedCryptoKey,
        new TextEncoder().encode(signingInput)
      );
      return Buffer.from(sigBuf).toString("base64url");
    }
  } catch (webCryptoErr) {
    console.warn("[Web Crypto RS256 signing fallback to node:crypto]:", webCryptoErr);
  }

  // 2. Fallback to Node.js crypto module if available
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(signingInput);
  return sign.sign(privateKeyPem, "base64url");
}

export function loadServiceAccountCredentials(): ServiceAccountCredentials | null {
  if (cachedCredentials) return cachedCredentials;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let rawKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && rawKey) {
    if (rawKey.startsWith('"') && rawKey.endsWith('"')) {
      rawKey = rawKey.slice(1, -1);
    }
    const privateKey = rawKey.replace(/\\n/g, "\n");
    cachedCredentials = {
      projectId: projectId.trim(),
      clientEmail: clientEmail.trim(),
      privateKey,
    };
    return cachedCredentials;
  }

  // Fallback to local service account file if present in project root
  try {
    const localJsonPath = path.join(
      process.cwd(),
      "the-leadership-covenant-firebase-adminsdk-fbsvc-cbada41927.json"
    );
    if (fs.existsSync(localJsonPath)) {
      const fileRaw = fs.readFileSync(localJsonPath, "utf8");
      const parsed = JSON.parse(fileRaw);
      cachedCredentials = {
        projectId: parsed.project_id,
        clientEmail: parsed.client_email,
        privateKey: parsed.private_key,
      };
      return cachedCredentials;
    }
  } catch {
    // Ignore in read-only / cloud environments
  }

  return null;
}

/**
 * Generates an OAuth2 access token for Google Cloud Datastore / Firestore.
 * Caches token in memory until 5 minutes before expiration.
 */
export async function getGoogleAccessToken(): Promise<string | null> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedAccessToken && cachedAccessToken.expiresAt > now + 300) {
    return cachedAccessToken.token;
  }

  const credentials = loadServiceAccountCredentials();
  if (!credentials) return null;

  try {
    const header = Buffer.from(
      JSON.stringify({ alg: "RS256", typ: "JWT" })
    ).toString("base64url");

    const claimSet = Buffer.from(
      JSON.stringify({
        iss: credentials.clientEmail,
        scope: "https://www.googleapis.com/auth/datastore",
        aud: "https://oauth2.googleapis.com/token",
        exp: now + 3600,
        iat: now,
      })
    ).toString("base64url");

    const signingInput = `${header}.${claimSet}`;
    const signature = await signRs256Assertion(signingInput, credentials.privateKey);
    const assertion = `${signingInput}.${signature}`;

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("[Google OAuth Token Error]:", res.status, await res.text());
      return null;
    }

    const json = (await res.json()) as { access_token?: string; expires_in?: number };
    if (!json?.access_token) return null;

    cachedAccessToken = {
      token: json.access_token,
      expiresAt: now + (json.expires_in || 3600),
    };
    return cachedAccessToken.token;
  } catch (err: unknown) {
    if (err && typeof err === "object" && (err as { digest?: string }).digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("[Google OAuth Token Exception]:", err);
    return null;
  }
}

/**
 * Converts a JS object/value into Firestore REST typed field schema.
 */
export function plainToFirestore(obj: unknown): Record<string, unknown> {
  if (obj === null || obj === undefined) return { nullValue: null };
  if (typeof obj === "boolean") return { booleanValue: obj };
  if (typeof obj === "number") {
    return Number.isInteger(obj)
      ? { integerValue: String(obj) }
      : { doubleValue: obj };
  }
  if (typeof obj === "string") return { stringValue: obj };
  if (Array.isArray(obj)) {
    return { arrayValue: { values: obj.map(plainToFirestore) } };
  }
  if (typeof obj === "object") {
    const fields: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) {
        fields[k] = plainToFirestore(v);
      }
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(obj) };
}

/**
 * Converts a Firestore REST typed field schema into a plain JS object/value.
 */
export function firestoreToPlain(field: unknown): unknown {
  if (!field || typeof field !== "object") return field;
  const f = field as Record<string, unknown>;
  if ("nullValue" in f) return null;
  if ("booleanValue" in f) return f.booleanValue;
  if ("integerValue" in f) return Number(f.integerValue);
  if ("doubleValue" in f) return f.doubleValue;
  if ("stringValue" in f) return f.stringValue;
  if ("arrayValue" in f) {
    const arr = f.arrayValue as { values?: unknown[] };
    return (arr.values || []).map(firestoreToPlain);
  }
  if ("mapValue" in f) {
    const map = f.mapValue as { fields?: Record<string, unknown> };
    const res: Record<string, unknown> = {};
    const fields = map.fields || {};
    for (const [k, v] of Object.entries(fields)) {
      res[k] = firestoreToPlain(v);
    }
    return res;
  }
  return null;
}

/**
 * Fetch a single document from Firestore via REST.
 */
export async function getFirestoreDocument<T = Record<string, unknown>>(
  collection: string,
  docId: string
): Promise<T | null> {
  const credentials = loadServiceAccountCredentials();
  if (!credentials) return null;

  const token = await getGoogleAccessToken();
  if (!token) return null;

  try {
    const url = `https://firestore.googleapis.com/v1/projects/${credentials.projectId}/databases/(default)/documents/${collection}/${encodeURIComponent(docId)}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (res.status === 404) return null;
    if (!res.ok) {
      console.warn(`[Firestore REST Fetch ${collection}/${docId}]: ${res.status}`);
      return null;
    }

    const doc = (await res.json()) as { fields?: Record<string, unknown> };
    if (!doc?.fields) return null;

    const plain: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(doc.fields)) {
      plain[k] = firestoreToPlain(v);
    }
    return plain as T;
  } catch (err: unknown) {
    if (err && typeof err === "object" && (err as { digest?: string }).digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error(`[Firestore REST Read Error ${collection}/${docId}]:`, err);
    return null;
  }
}

/**
 * Upsert (PATCH) a single document to Firestore via REST.
 */
export async function setFirestoreDocument(
  collection: string,
  docId: string,
  data: Record<string, unknown>
): Promise<boolean> {
  const credentials = loadServiceAccountCredentials();
  if (!credentials) return false;

  const token = await getGoogleAccessToken();
  if (!token) return false;

  try {
    const fields: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) {
        fields[k] = plainToFirestore(v);
      }
    }

    const url = `https://firestore.googleapis.com/v1/projects/${credentials.projectId}/databases/(default)/documents/${collection}/${encodeURIComponent(docId)}`;
    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
      cache: "no-store",
    });

    return res.ok;
  } catch (err) {
    console.error(`[Firestore REST Write Error ${collection}/${docId}]:`, err);
    return false;
  }
}

/**
 * List all documents from a Firestore collection via REST.
 */
export async function listFirestoreDocuments<T = Record<string, unknown>>(
  collection: string
): Promise<T[]> {
  const credentials = loadServiceAccountCredentials();
  if (!credentials) return [];

  const token = await getGoogleAccessToken();
  if (!token) return [];

  try {
    const url = `https://firestore.googleapis.com/v1/projects/${credentials.projectId}/databases/(default)/documents/${collection}?pageSize=100`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) return [];

    const json = (await res.json()) as {
      documents?: Array<{ fields?: Record<string, unknown> }>;
    };

    if (!Array.isArray(json?.documents)) return [];

    return json.documents
      .map((doc) => {
        if (!doc.fields) return null;
        const plain: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(doc.fields)) {
          plain[k] = firestoreToPlain(v);
        }
        return plain as T;
      })
      .filter(Boolean) as T[];
  } catch (err) {
    console.error(`[Firestore REST List Error ${collection}]:`, err);
    return [];
  }
}

/**
 * Test Firebase Cloud Firestore connection status.
 */
export async function testFirebaseConnection(): Promise<{
  configured: boolean;
  connected: boolean;
  provider: "firebase" | "local_json";
  message: string;
}> {
  const credentials = loadServiceAccountCredentials();
  if (!credentials) {
    return {
      configured: false,
      connected: false,
      provider: "local_json",
      message:
        "Firebase credentials not detected. Falling back to local offline JSON store.",
    };
  }

  const token = await getGoogleAccessToken();
  if (!token) {
    return {
      configured: true,
      connected: false,
      provider: "local_json",
      message:
        "Failed to authenticate with Google Cloud using Service Account credentials.",
    };
  }

  try {
    const url = `https://firestore.googleapis.com/v1/projects/${credentials.projectId}/databases/(default)/documents/cms_pages?pageSize=1`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (res.ok) {
      return {
        configured: true,
        connected: true,
        provider: "firebase",
        message: "Connected to Google Cloud Firestore (Edge REST Engine Active).",
      };
    }

    return {
      configured: true,
      connected: false,
      provider: "local_json",
      message: `Firestore REST query returned status ${res.status}. Safe fallback active.`,
    };
  } catch (err) {
    return {
      configured: true,
      connected: false,
      provider: "local_json",
      message:
        err instanceof Error
          ? err.message
          : "Firebase connection test failed. Fallback active.",
    };
  }
}

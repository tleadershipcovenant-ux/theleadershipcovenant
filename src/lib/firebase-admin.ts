import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import path from "path";
import fs from "fs";

let cachedApp: App | null = null;
let cachedDb: Firestore | null = null;

function loadServiceAccountFromEnvOrFile() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && rawKey) {
    // Standard format: restore escaped newlines
    const privateKey = rawKey.replace(/\\n/g, "\n");
    return {
      projectId,
      clientEmail,
      privateKey,
    };
  }

  // Fallback to local service account file if present in project root
  const localJsonPath = path.join(
    process.cwd(),
    "the-leadership-covenant-firebase-adminsdk-fbsvc-cbada41927.json"
  );
  if (fs.existsSync(localJsonPath)) {
    try {
      const fileRaw = fs.readFileSync(localJsonPath, "utf8");
      const parsed = JSON.parse(fileRaw);
      return {
        projectId: parsed.project_id,
        clientEmail: parsed.client_email,
        privateKey: parsed.private_key,
      };
    } catch {
      // Ignored
    }
  }

  return null;
}

export function getFirebaseAdminApp(): App | null {
  if (cachedApp) return cachedApp;

  const existingApps = getApps();
  if (existingApps.length > 0) {
    cachedApp = existingApps[0];
    return cachedApp;
  }

  const credentials = loadServiceAccountFromEnvOrFile();
  if (!credentials) {
    return null;
  }

  try {
    cachedApp = initializeApp({
      credential: cert(credentials),
    });
    return cachedApp;
  } catch (err) {
    console.error("[Firebase Admin Initialization Error]:", err);
    return null;
  }
}

export function getFirestoreDb(): Firestore | null {
  if (cachedDb) return cachedDb;

  const app = getFirebaseAdminApp();
  if (!app) return null;

  try {
    cachedDb = getFirestore(app);
    return cachedDb;
  } catch (err) {
    console.error("[Firestore Instance Error]:", err);
    return null;
  }
}

export async function testFirebaseConnection(): Promise<{
  configured: boolean;
  connected: boolean;
  provider: "firebase" | "local_json";
  message: string;
}> {
  const db = getFirestoreDb();
  if (!db) {
    return {
      configured: false,
      connected: false,
      provider: "local_json",
      message:
        "Firebase credentials not detected. Falling back to local offline JSON store.",
    };
  }

  try {
    // Quick test query against cms_pages collection
    await db.collection("cms_pages").limit(1).get();
    return {
      configured: true,
      connected: true,
      provider: "firebase",
      message: "Connected to Google Cloud Firestore (CMS Content Active).",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      configured: true,
      connected: false,
      provider: "local_json",
      message: `Firebase Firestore query failed: ${msg}. Safe fallback active.`,
    };
  }
}


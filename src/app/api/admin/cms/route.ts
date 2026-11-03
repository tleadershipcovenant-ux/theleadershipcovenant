import { NextRequest, NextResponse } from "next/server";
import { authenticateAdminRequest } from "@/lib/admin-auth";
import { getCloudinaryConfig } from "@/lib/cloudinary";
import { testFirebaseConnection } from "@/lib/firebase-admin";
import {
  ALL_CMS_KEYS,
  getAllCmsPages,
  resetCmsPageToDefault,
  upsertCmsPage,
  type CmsPageKey,
} from "@/lib/firebase-cms";
import {
  getSupabaseConfig,
  testSupabaseConnection,
} from "@/lib/supabase-store";

export async function GET(req: NextRequest) {
  const session = await authenticateAdminRequest(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const pages = await getAllCmsPages();
  return NextResponse.json({ ok: true, pages });
}

export async function PUT(req: NextRequest) {
  const session = await authenticateAdminRequest(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const pageKey = String(body?.page_key || "").trim() as CmsPageKey;
    const content = body?.content;

    if (!ALL_CMS_KEYS.includes(pageKey)) {
      return NextResponse.json(
        { ok: false, error: "Invalid CMS page key." },
        { status: 400 }
      );
    }

    if (!content || typeof content !== "object") {
      return NextResponse.json(
        { ok: false, error: "CMS content payload must be a JSON object." },
        { status: 400 }
      );
    }

    const saved = await upsertCmsPage(
      pageKey,
      content as Record<string, unknown>,
      session.email
    );
    return NextResponse.json({ ok: true, page: saved });
  } catch (err: unknown) {
    console.error("[ADMIN CMS PUT ERROR]", err);
    return NextResponse.json(
      { ok: false, error: "Failed to save CMS content." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await authenticateAdminRequest(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const action = String(body?.action || "");

    if (action === "reset") {
      const pageKey = String(body?.page_key || "").trim() as CmsPageKey;
      if (!ALL_CMS_KEYS.includes(pageKey)) {
        return NextResponse.json(
          { ok: false, error: "Invalid CMS page key." },
          { status: 400 }
        );
      }
      const restored = await resetCmsPageToDefault(pageKey, session.email);
      return NextResponse.json({ ok: true, page: restored });
    }

    if (action === "diagnostics") {
      const supabaseStatus = await testSupabaseConnection();
      const firebaseStatus = await testFirebaseConnection();
      const supaCfg = getSupabaseConfig();
      const cloudCfg = getCloudinaryConfig();

      return NextResponse.json({
        ok: true,
        diagnostics: {
          firebase: {
            ...firebaseStatus,
            projectId: process.env.FIREBASE_PROJECT_ID || "the-leadership-covenant",
          },
          supabase: {
            ...supabaseStatus,
            hasUrl: Boolean(supaCfg.url),
            hasAnonKey: Boolean(supaCfg.anonKey),
            hasServiceRoleKey: Boolean(supaCfg.serviceRoleKey),
            maskedUrl: supaCfg.url
              ? `${supaCfg.url.slice(0, 22)}…`
              : "Not configured",
          },
          cloudinary: {
            configured: cloudCfg.isConfigured,
            cloudName: cloudCfg.cloudName || "Not configured",
            hasApiKey: Boolean(cloudCfg.apiKey),
            hasApiSecret: Boolean(cloudCfg.apiSecret),
            folder: cloudCfg.folder,
            provider: cloudCfg.isConfigured ? "cloudinary" : "local_fallback",
          },
          adminAuth: {
            email: session.email,
            jwtAlgorithm: "HS256 (Web Crypto Subtle)",
            cookieName: "tlc_admin_jwt (HttpOnly)",
          },
        },
      });
    }

    return NextResponse.json(
      { ok: false, error: "Unsupported action." },
      { status: 400 }
    );
  } catch (err: unknown) {
    console.error("[ADMIN CMS POST ERROR]", err);
    return NextResponse.json(
      { ok: false, error: "Action failed." },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import {
  ALL_CMS_KEYS,
  getAllCmsPages,
  getCmsPage,
  getDefaultCmsContent,
  type CmsPageKey,
} from "@/lib/firebase-cms";

export async function GET(req: NextRequest) {
  const keyParam = req.nextUrl.searchParams.get("key") as CmsPageKey | null;
  const cacheHeaders = {
    "Cache-Control": "public, max-age=5, s-maxage=30, stale-while-revalidate=60",
  };

  try {
    if (keyParam && ALL_CMS_KEYS.includes(keyParam)) {
      const page = await getCmsPage(keyParam);
      return NextResponse.json({ ok: true, page }, { headers: cacheHeaders });
    }

    const pages = await getAllCmsPages();
    return NextResponse.json({ ok: true, pages }, { headers: cacheHeaders });
  } catch (err: unknown) {
    console.warn("[TLC PUBLIC CMS FALLBACK ACTIVATED]", err);

    // Guaranteed Zero-Downtime Fallback: Return code-defined content with HTTP 200
    // so client UI is never broken even if the database is completely stopped.
    if (keyParam && ALL_CMS_KEYS.includes(keyParam)) {
      return NextResponse.json(
        {
          ok: true,
          page: {
            page_key: keyParam,
            title: keyParam,
            content: getDefaultCmsContent(keyParam),
            updated_by: "system-code-fallback",
            updated_at: new Date().toISOString(),
          },
          fallback: true,
        },
        { headers: cacheHeaders }
      );
    }

    const fallbackPages: Record<string, unknown> = {};
    for (const key of ALL_CMS_KEYS) {
      fallbackPages[key] = {
        page_key: key,
        title: key,
        content: getDefaultCmsContent(key),
        updated_by: "system-code-fallback",
        updated_at: new Date().toISOString(),
      };
    }

    return NextResponse.json(
      { ok: true, pages: fallbackPages, fallback: true },
      { headers: cacheHeaders }
    );
  }
}

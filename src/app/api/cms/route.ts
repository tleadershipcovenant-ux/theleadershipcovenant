import { NextRequest, NextResponse } from "next/server";
import {
  ALL_CMS_KEYS,
  getAllCmsPages,
  getCmsPage,
  type CmsPageKey,
} from "@/lib/supabase-store";

export async function GET(req: NextRequest) {
  try {
    const keyParam = req.nextUrl.searchParams.get("key") as CmsPageKey | null;

    if (keyParam && ALL_CMS_KEYS.includes(keyParam)) {
      const page = await getCmsPage(keyParam);
      return NextResponse.json({ ok: true, page });
    }

    const pages = await getAllCmsPages();
    return NextResponse.json({ ok: true, pages });
  } catch (err: unknown) {
    console.error("[TLC PUBLIC CMS READ ERROR]", err);
    return NextResponse.json(
      { ok: false, error: "Failed to load CMS content." },
      { status: 500 }
    );
  }
}


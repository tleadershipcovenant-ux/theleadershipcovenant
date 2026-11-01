import { NextRequest, NextResponse } from "next/server";
import { authenticateAdminRequest } from "@/lib/admin-auth";
import { uploadImageAsset } from "@/lib/cloudinary";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED_MIME_PREFIX = "image/";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const fileEntry = formData.get("file");
    const purpose = String(formData.get("purpose") || "screenshot").trim();

    if (!(fileEntry instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "Please attach a valid image file." },
        { status: 400 }
      );
    }

    if (!fileEntry.type.startsWith(ALLOWED_MIME_PREFIX)) {
      return NextResponse.json(
        { ok: false, error: "Only image files (PNG, JPG, WEBP, GIF) are allowed." },
        { status: 400 }
      );
    }

    if (fileEntry.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { ok: false, error: "Image size must be under 8 MB." },
        { status: 400 }
      );
    }

    // CMS media uploads require an authenticated Admin JWT session
    if (purpose === "cms") {
      const admin = await authenticateAdminRequest(req);
      if (!admin) {
        return NextResponse.json(
          { ok: false, error: "Unauthorized — Admin JWT session required for CMS uploads." },
          { status: 401 }
        );
      }
    }

    const targetFolder =
      purpose === "cms"
        ? "tlc_cms_media"
        : process.env.CLOUDINARY_FOLDER || "tlc_payment_screenshots";

    const uploaded = await uploadImageAsset(fileEntry, targetFolder);

    return NextResponse.json(uploaded, { status: 201 });
  } catch (err: unknown) {
    console.error("[TLC UPLOAD ERROR]", err);
    return NextResponse.json(
      {
        ok: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to upload image. Please try again.",
      },
      { status: 500 }
    );
  }
}


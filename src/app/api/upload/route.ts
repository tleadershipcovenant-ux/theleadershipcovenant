import { NextRequest, NextResponse } from "next/server";
import { authenticateAdminRequest } from "@/lib/admin-auth";
import { uploadImageAsset } from "@/lib/cloudinary";

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2 MB strict limit as requested
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
  "image/heic",
  "image/heif",
  "image/gif",
];

// Helper to check image magic bytes
function isValidImageBuffer(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return true;
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return true;
  }
  // WebP: RIFF .... WEBP
  if (
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return true;
  }
  // GIF: GIF87a or GIF89a
  const gifHeader = buffer.toString("ascii", 0, 6);
  if (gifHeader === "GIF87a" || gifHeader === "GIF89a") {
    return true;
  }
  // HEIC/HEIF: ftypheic / ftypheix / ftypmif1
  if (buffer.toString("ascii", 4, 8) === "ftyp") {
    return true;
  }

  return false;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const fileEntry = formData.get("file");
    const purpose = String(formData.get("purpose") || "screenshot").trim();
    const rawActivitySlug = String(
      formData.get("activity_slug") || formData.get("activity") || ""
    ).trim();

    if (!(fileEntry instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "Please attach a valid image file." },
        { status: 400 }
      );
    }

    const mime = (fileEntry.type || "").toLowerCase();
    const isAllowedMime = ALLOWED_MIME_TYPES.some((t) => mime.includes(t));

    if (!isAllowedMime) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Invalid file format. Only genuine screenshot images (JPG, PNG, WEBP, HEIC) are accepted.",
        },
        { status: 400 }
      );
    }

    if (fileEntry.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Screenshot exceeds the 2 MB size limit. Our built-in compressor will optimize your file automatically.",
        },
        { status: 400 }
      );
    }

    // Inspect file buffer for magic bytes
    const arrayBuf = await fileEntry.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);

    if (!isValidImageBuffer(buffer)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "The uploaded file does not appear to be a valid image receipt screenshot.",
        },
        { status: 400 }
      );
    }

    // CMS media uploads require an authenticated Admin JWT session
    if (purpose === "cms") {
      const admin = await authenticateAdminRequest(req);
      if (!admin) {
        return NextResponse.json(
          {
            ok: false,
            error: "Unauthorized — Admin session required for CMS media uploads.",
          },
          { status: 401 }
        );
      }
    }

    // Clean activity slug to create dedicated folder per activity
    const cleanActivityFolder = rawActivitySlug
      ? rawActivitySlug.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase()
      : "general_activities";

    const baseFolder = process.env.CLOUDINARY_FOLDER || "tlc_payment_screenshots";
    const targetFolder =
      purpose === "cms"
        ? "tlc_cms_media"
        : `${baseFolder}/${cleanActivityFolder}`;

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

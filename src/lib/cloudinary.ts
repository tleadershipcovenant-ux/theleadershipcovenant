import path from "path";
import { promises as fs } from "fs";

export interface CloudinaryUploadResult {
  ok: boolean;
  url: string;
  publicId: string;
  provider: "cloudinary" | "local_fallback";
  width?: number;
  height?: number;
  bytes: number;
  format?: string;
  originalFilename: string;
}

export function getCloudinaryConfig() {
  const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || "").trim();
  const apiKey = (process.env.CLOUDINARY_API_KEY || "").trim();
  const apiSecret = (process.env.CLOUDINARY_API_SECRET || "").trim();
  const folder = (
    process.env.CLOUDINARY_FOLDER || "tlc_payment_screenshots"
  ).trim();

  const isConfigured = Boolean(
    cloudName &&
      apiKey &&
      apiSecret &&
      !cloudName.includes("your-cloud-name") &&
      !apiKey.includes("your-cloudinary")
  );

  return {
    cloudName,
    apiKey,
    apiSecret,
    folder,
    isConfigured,
  };
}

async function sha1Hex(message: string): Promise<string> {
  const data = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Uploads an image File/Blob to Cloudinary using signed SHA-1 REST upload.
 * Gracefully falls back to `public/uploads/<subFolder>` during local development
 * if Cloudinary API credentials have not yet been configured in `.env.local`.
 */
export async function uploadImageAsset(
  file: File,
  customFolder?: string
): Promise<CloudinaryUploadResult> {
  const cfg = getCloudinaryConfig();
  const targetFolder = customFolder || cfg.folder;
  const originalFilename = file.name || `upload-${Date.now()}.png`;

  if (cfg.isConfigured) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    // Cloudinary signature sorts parameters alphabetically: folder=...&timestamp=... + apiSecret
    const paramsToSign = `folder=${targetFolder}&timestamp=${timestamp}${cfg.apiSecret}`;
    const signature = await sha1Hex(paramsToSign);

    const form = new FormData();
    form.append("file", file);
    form.append("api_key", cfg.apiKey);
    form.append("timestamp", timestamp);
    form.append("folder", targetFolder);
    form.append("signature", signature);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(
        cfg.cloudName
      )}/image/upload`,
      {
        method: "POST",
        body: form,
      }
    );

    const json = await res.json();
    if (!res.ok || !json.secure_url) {
      throw new Error(
        json?.error?.message || "Cloudinary image upload failed."
      );
    }

    return {
      ok: true,
      url: json.secure_url as string,
      publicId: json.public_id as string,
      provider: "cloudinary",
      width: json.width,
      height: json.height,
      bytes: json.bytes ?? file.size,
      format: json.format,
      originalFilename,
    };
  }

  // Safe Local Development Fallback when Cloudinary keys are not yet filled in .env.local
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const ext =
    path
      .extname(originalFilename)
      .toLowerCase()
      .replace(/[^.a-z0-9]/g, "") || ".png";
  const safeSlug = originalFilename
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 32);
  const uniqueName = `${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 7)}_${safeSlug}${ext}`;

  try {
    const relDir = customFolder?.includes("cms") ? "cms" : "screenshots";
    const uploadDir = path.join(process.cwd(), "public", "uploads", relDir);
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, uniqueName), buffer);

    return {
      ok: true,
      url: `/uploads/${relDir}/${uniqueName}`,
      publicId: `local_${relDir}/${uniqueName}`,
      provider: "local_fallback",
      bytes: file.size,
      format: ext.replace(".", ""),
      originalFilename,
    };
  } catch {
    // Read-only Edge filesystem fallback: base64 data URI
    const mime = file.type || "image/png";
    const dataUrl = `data:${mime};base64,${buffer.toString("base64")}`;
    return {
      ok: true,
      url: dataUrl,
      publicId: `inline_${uniqueName}`,
      provider: "local_fallback",
      bytes: file.size,
      originalFilename,
    };
  }
}

/**
 * Deletes a Cloudinary asset by public_id if Cloudinary is configured.
 */
export async function deleteCloudinaryAsset(publicId?: string): Promise<boolean> {
  if (!publicId) return false;
  const cfg = getCloudinaryConfig();

  if (publicId.startsWith("local_")) {
    try {
      const rel = publicId.replace(/^local_/, "");
      const localPath = path.join(process.cwd(), "public", "uploads", rel);
      await fs.unlink(localPath);
      return true;
    } catch {
      return false;
    }
  }

  if (!cfg.isConfigured || publicId.startsWith("inline_")) {
    return false;
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}${cfg.apiSecret}`;
    const signature = await sha1Hex(paramsToSign);

    const form = new FormData();
    form.append("public_id", publicId);
    form.append("api_key", cfg.apiKey);
    form.append("timestamp", timestamp);
    form.append("signature", signature);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(
        cfg.cloudName
      )}/image/destroy`,
      {
        method: "POST",
        body: form,
      }
    );
    const json = await res.json();
    return res.ok && json?.result === "ok";
  } catch {
    return false;
  }
}


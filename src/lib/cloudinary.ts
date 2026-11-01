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
  let cloudName = (process.env.CLOUDINARY_CLOUD_NAME || "nrujj7vy").trim();
  let apiKey = (process.env.CLOUDINARY_API_KEY || "649287278276623").trim();
  let apiSecret = (process.env.CLOUDINARY_API_SECRET || "a7nBp2imhXQ3z4HJC-bpNNyoZJk").trim();
  const folder = (
    process.env.CLOUDINARY_FOLDER || "tlc_payment_screenshots"
  ).trim();

  // Also support full CLOUDINARY_URL string e.g. cloudinary://649287278276623:a7nBp...@nrujj7vy
  const cloudinaryUrl = (process.env.CLOUDINARY_URL || "").trim();
  if (cloudinaryUrl.startsWith("cloudinary://")) {
    try {
      const parsed = new URL(cloudinaryUrl);
      apiKey = parsed.username || apiKey;
      apiSecret = parsed.password || apiSecret;
      cloudName = parsed.hostname || cloudName;
    } catch {
      // Ignored if invalid URL
    }
  }

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
 * Uploads an image File/Blob to Cloudinary with automatic optimization.
 * Creates dedicated folders per activity. Gracefully falls back to local storage
 * if Cloudinary cloud name is not yet defined.
 */
export async function uploadImageAsset(
  file: File,
  customFolder?: string
): Promise<CloudinaryUploadResult> {
  const cfg = getCloudinaryConfig();
  const targetFolder = customFolder || cfg.folder;
  const originalFilename = file.name || `upload-${Date.now()}.png`;

  if (cfg.isConfigured) {
    try {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      // Parameters for signed upload with auto quality and auto format
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
      if (res.ok && json.secure_url) {
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
      } else {
        console.warn("[Cloudinary Warning] Falling back to local storage:", json?.error?.message);
      }
    } catch (cErr) {
      console.warn("[Cloudinary Exception] Falling back to local storage:", cErr);
    }
  }

  // Safe local storage fallback organized per activity folder
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
    // Organize by folder, e.g. public/uploads/screenshots/school-impact-summit-2026/
    const sanitizedRel = (targetFolder || "screenshots")
      .replace(/\\/g, "/")
      .replace(/^public\/uploads\//, "")
      .replace(/^tlc_payment_screenshots\/?/, "screenshots/");

    const uploadDir = path.join(process.cwd(), "public", "uploads", sanitizedRel);
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, uniqueName), buffer);

    const publicUrl = `/uploads/${sanitizedRel}/${uniqueName}`.replace(/\/+/g, "/");

    return {
      ok: true,
      url: publicUrl,
      publicId: `local_${sanitizedRel}/${uniqueName}`,
      provider: "local_fallback",
      bytes: file.size,
      format: ext.replace(".", ""),
      originalFilename,
    };
  } catch {
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

/**
 * The Leadership Covenant — Image Compressor & Receipt Screenshot Validator
 * Validates receipt screenshots (dimensions, aspect ratio, file type)
 * and compresses images client-side before sending to server / Cloudinary.
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  dimensions?: { width: number; height: number };
}

export interface CompressionResult {
  compressedFile: File;
  previewUrl: string;
  originalSize: number;
  compressedSize: number;
  savingsPercent: number;
  dimensions: { width: number; height: number };
}

export const MAX_ALLOWED_UPLOAD_BYTES = 2 * 1024 * 1024; // 2 MB strict limit
const MIN_DIMENSION_PX = 150; // Minimum 150x150 to ensure readable transaction details
const MAX_ASPECT_RATIO = 5.5; // Avoid ultra-thin banners or 1-pixel trackers

const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
  "image/heic",
  "image/heif",
];

/**
 * Validates if the file is a plausible payment receipt / transfer screenshot.
 * Catches corrupt files, tracking pixels, or non-image assets.
 */
export async function validateScreenshotFile(
  file: File
): Promise<ValidationResult> {
  if (!file) {
    return { isValid: false, error: "No file selected." };
  }

  // 1. MIME type validation
  const lowerType = (file.type || "").toLowerCase();
  const hasValidMime =
    ACCEPTED_IMAGE_MIME_TYPES.some((t) => lowerType.includes(t)) ||
    /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name);

  if (!hasValidMime) {
    return {
      isValid: false,
      error:
        "Invalid file format. Please upload a clear photo or screenshot in JPG, PNG, WEBP, or HEIC format.",
    };
  }

  // 2. Initial size check (allow camera photos up to 25MB before client compression)
  if (file.size < 1024) {
    return {
      isValid: false,
      error:
        "File size is too small (less than 1 KB). Please upload a complete, genuine payment screenshot.",
    };
  }

  if (file.size > 25 * 1024 * 1024) {
    return {
      isValid: false,
      error:
        "Original file is too large (over 25 MB). Please take a new screenshot or select a smaller image.",
    };
  }

  // 3. Inspect image dimensions and aspect ratio via Image object
  return new Promise((resolve) => {
    // In browser environment
    if (typeof window === "undefined" || typeof Image === "undefined") {
      resolve({ isValid: true });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;

      if (width < MIN_DIMENSION_PX || height < MIN_DIMENSION_PX) {
        resolve({
          isValid: false,
          error: `Image is too small (${width}×${height}px) to be a legible transaction receipt. Minimum resolution is ${MIN_DIMENSION_PX}×${MIN_DIMENSION_PX}px.`,
        });
        return;
      }

      const aspectRatio = Math.max(width / height, height / width);
      if (aspectRatio > MAX_ASPECT_RATIO) {
        resolve({
          isValid: false,
          error:
            "Image aspect ratio appears irregular for a receipt or payment voucher. Please upload a standard screenshot or photo.",
        });
        return;
      }

      resolve({
        isValid: true,
        dimensions: { width, height },
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        isValid: false,
        error:
          "Unable to read this image file. The file may be corrupt or an unsupported format.",
      });
    };

    img.src = objectUrl;
  });
}

/**
 * Compresses an image client-side to ensure it is under 2 MB
 * while keeping typography, transaction references, and dates razor-sharp.
 */
export async function compressScreenshotImage(
  file: File,
  options?: {
    maxSizeBytes?: number;
    maxWidth?: number;
    maxHeight?: number;
    initialQuality?: number;
  }
): Promise<CompressionResult> {
  const targetMaxBytes = options?.maxSizeBytes || 1.8 * 1024 * 1024; // 1.8 MB target
  const maxWidth = options?.maxWidth || 1600;
  const maxHeight = options?.maxHeight || 2400;
  const initialQuality = options?.initialQuality ?? 0.86;

  // If already under 1 MB and not an oversized dimension, we can keep it
  if (file.size <= 1024 * 1024 && typeof window === "undefined") {
    return {
      compressedFile: file,
      previewUrl: "",
      originalSize: file.size,
      compressedSize: file.size,
      savingsPercent: 0,
      dimensions: { width: 0, height: 0 },
    };
  }

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = async () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calculate proportional scale to fit within maxWidth x maxHeight
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Canvas context is unavailable.");
        }

        // High quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        URL.revokeObjectURL(objectUrl);

        // Helper to convert canvas to Blob
        const getBlob = (quality: number, type = "image/webp"): Promise<Blob | null> =>
          new Promise((res) => canvas.toBlob((b) => res(b), type, quality));

        // First attempt with WebP (superior compression and wide mobile support)
        let blob = await getBlob(initialQuality, "image/webp");

        // Fallback to JPEG if WebP is unsupported or empty
        if (!blob) {
          blob = await getBlob(initialQuality, "image/jpeg");
        }

        // If still over target, reduce quality slightly (0.72)
        if (blob && blob.size > targetMaxBytes) {
          const secondPass = await getBlob(0.72, blob.type);
          if (secondPass && secondPass.size < blob.size) {
            blob = secondPass;
          }
        }

        if (!blob) {
          throw new Error("Image compression produced no output.");
        }

        const ext = blob.type.includes("webp") ? ".webp" : ".jpg";
        const cleanName = file.name.replace(/\.[^/.]+$/, "") + ext;
        const compressedFile = new File([blob], cleanName, {
          type: blob.type,
          lastModified: Date.now(),
        });

        const previewUrl = URL.createObjectURL(blob);
        const originalSize = file.size;
        const compressedSize = compressedFile.size;
        const savingsPercent = Math.max(
          0,
          Math.round(((originalSize - compressedSize) / originalSize) * 100)
        );

        resolve({
          compressedFile,
          previewUrl,
          originalSize,
          compressedSize,
          savingsPercent,
          dimensions: { width, height },
        });
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for compression."));
    };

    img.src = objectUrl;
  });
}


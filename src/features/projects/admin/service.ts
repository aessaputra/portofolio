import {
  deleteImageFromR2,
  extractObjectKeyFromUrl,
  generateUniqueFilename,
  uploadImageToR2,
} from "@/shared/lib/storage";

const PROJECT_IMAGE_PREFIX = "project";
const VALID_MIME_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const EXTENSION_BY_MIME: Record<string, string[]> = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/jpg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
};

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const RECOMMENDED_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export type UploadProjectImageResult = {
  imageUrl: string;
  warning?: string;
};

export async function uploadProjectImage(file: File): Promise<UploadProjectImageResult> {
  if (!VALID_MIME_TYPES.has(file.type)) {
    throw new Error("Invalid file type. Only JPEG, PNG, and WebP images are allowed.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const validExtensions = EXTENSION_BY_MIME[file.type] ?? [];
  if (!validExtensions.includes(extension)) {
    throw new Error("File extension does not match the file type.");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File size exceeds the ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB limit.`);
  }

  const shouldWarnAboutSize = file.size > RECOMMENDED_FILE_SIZE_BYTES;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const objectKey = generateUniqueFilename(file.name, PROJECT_IMAGE_PREFIX);
  const contentType = file.type || "image/jpeg";

  const imageUrl = await uploadImageToR2(buffer, contentType, objectKey, {
    cacheControl: "public, max-age=31536000, immutable",
    metadata: {
      "original-filename": file.name,
      "upload-timestamp": Date.now().toString(),
      "file-size": file.size.toString(),
    },
    contentDisposition: `inline; filename="${file.name}"`,
  });

  return {
    imageUrl,
    warning: shouldWarnAboutSize
      ? `File is larger than the recommended ${RECOMMENDED_FILE_SIZE_BYTES / 1024 / 1024}MB. Consider optimizing for better performance.`
      : undefined,
  };
}

export async function deleteProjectImage(imageUrl: string): Promise<void> {
  const objectKey = extractObjectKeyFromUrl(imageUrl);
  if (!objectKey || !objectKey.startsWith(`${PROJECT_IMAGE_PREFIX}-`)) {
    throw new Error("Not a project image");
  }

  await deleteImageFromR2(objectKey);
}

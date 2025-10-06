import {
  deleteImageFromR2,
  uploadImageToR2,
  generateUniqueFilename,
  extractObjectKeyFromUrl,
} from "@/shared/lib/storage";

const PROFILE_IMAGE_PREFIX = "profile";

export async function uploadProfileImage(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const fileName = generateUniqueFilename(file.name, PROFILE_IMAGE_PREFIX);
  const contentType = file.type || "image/jpeg";

  return uploadImageToR2(buffer, contentType, fileName);
}

export async function deleteProfileImage(imageUrl: string): Promise<void> {
  if (!imageUrl) return;
  const objectKey = extractObjectKeyFromUrl(imageUrl);
  if (!objectKey) return;
  await deleteImageFromR2(objectKey);
}

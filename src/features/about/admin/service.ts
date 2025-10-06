import {
  deleteImageFromR2,
  uploadImageToR2,
  generateUniqueFilename,
  extractObjectKeyFromUrl,
  validateImageFile,
} from "@/shared/lib/storage";

const ABOUT_IMAGE_PREFIX = "about";

export async function uploadAboutImage(file: File): Promise<string> {
  // Validate file using centralized validation
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const contentType = file.type || "image/jpeg";

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = generateUniqueFilename(file.name, ABOUT_IMAGE_PREFIX);
    
    return await uploadImageToR2(buffer, contentType, fileName);
  } catch (error: any) {
    throw new Error(`Failed to upload about image: ${error.message}`);
  }
}

export async function deleteAboutImage(imageUrl: string): Promise<void> {
  if (!imageUrl) return;
  const objectKey = extractObjectKeyFromUrl(imageUrl);
  if (!objectKey) return;
  await deleteImageFromR2(objectKey);
}

import "server-only";

// Import the enhanced R2 storage functions
import {
  uploadImageToR2 as enhancedUploadImageToR2,
  deleteImageFromR2 as enhancedDeleteImageFromR2,
  objectExistsInR2 as enhancedObjectExistsInR2,
  copyObjectInR2 as enhancedCopyObjectInR2,
  validateImageFile as enhancedValidateImageFile,
  generateUniqueFilename as enhancedGenerateUniqueFilename,
  buildR2PublicUrl as enhancedEnsurePublicR2Url,
  getPublicUrl as enhancedGetPublicUrl,
  extractR2ObjectKey as enhancedExtractObjectKeyFromUrl,
  resolveR2UrlWithFallback,
  type UploadResult,
  type ImageType,
  type PutObjectOptions,
} from "@/shared/lib/r2Storage";

// Re-export all the enhanced functions with legacy compatibility
export const validateImageFile = enhancedValidateImageFile;
export const generateUniqueFilename = enhancedGenerateUniqueFilename;
export const ensurePublicR2Url = enhancedEnsurePublicR2Url;
export const getPublicUrl = enhancedGetPublicUrl;
export const extractObjectKeyFromUrl = enhancedExtractObjectKeyFromUrl;

// Enhanced upload function with better error handling
export async function uploadImageToR2(
  file: Buffer | Uint8Array,
  contentType: string,
  objectKey: string,
  options?: PutObjectOptions
): Promise<string> {
  const result = await enhancedUploadImageToR2(file, contentType, objectKey, options);
  
  if (!result.success) {
    throw new Error(result.error || "Failed to upload image to R2");
  }
  
  // Return the best available URL
  return result.url || "";
}

// Legacy stream function - now uses the enhanced upload function
export async function streamFileToR2(
  file: Buffer | Uint8Array | ReadableStream,
  contentType: string,
  objectKey: string,
  originalFilename?: string
): Promise<string> {
  const options: PutObjectOptions = {
    metadata: {
      "original-filename": originalFilename || objectKey,
      "content-type": contentType,
      "no-transform": "true",
    },
  };
  
  // Convert ReadableStream to Buffer/Uint8Array for compatibility
  if (file instanceof ReadableStream) {
    // Note: In a real implementation, you would need to convert the ReadableStream to a Buffer
    // This is a simplified version that would need additional implementation
    throw new Error("ReadableStream conversion not implemented in this version");
  }
  
  return uploadImageToR2(
    file instanceof Uint8Array ? file : new Uint8Array(file),
    contentType,
    objectKey,
    options
  );
}

// Enhanced delete function
export const deleteImageFromR2 = enhancedDeleteImageFromR2;

// Enhanced object exists function
export const objectExistsInR2 = enhancedObjectExistsInR2;

// Enhanced copy function
export async function copyObjectInR2(
  sourceObjectKey: string,
  destinationObjectKey: string,
  options?: PutObjectOptions
): Promise<string> {
  const result = await enhancedCopyObjectInR2(sourceObjectKey, destinationObjectKey, options);
  
  if (!result.success) {
    throw new Error(result.error || "Failed to copy object in R2");
  }
  
  return result.url || "";
}

// Export new enhanced functions
export { resolveR2UrlWithFallback };
export type { UploadResult, ImageType, PutObjectOptions };

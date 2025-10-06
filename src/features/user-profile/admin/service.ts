import { uploadImageToR2, deleteImageFromR2, validateImageFile, generateUniqueFilename } from "@/shared/lib/storage";

export async function uploadProfileImage(file: File): Promise<string> {
  // Validate file
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || "Invalid file");
  }

  // Generate unique filename
  const fileName = generateUniqueFilename(file.name, "profile");

  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  // Upload to R2
  const url = await uploadImageToR2(buffer, file.type, fileName);
  
  return url;
}

export async function deleteProfileImage(imageUrl: string): Promise<void> {
  try {
    // Extract object key from URL
    const url = new URL(imageUrl);
    const objectKey = url.pathname.substring(1); // Remove leading slash
    
    await deleteImageFromR2(objectKey);
  } catch (error) {
    console.error("Error deleting profile image:", error);
    throw new Error("Failed to delete profile image");
  }
}

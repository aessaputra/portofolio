"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/auth/server/nextAuth";
import { uploadAboutImage } from "@/features/about/admin/service";
import { updateAboutProfileImage } from "@/entities/about";

const ADMIN_ABOUT_PATH = "/admin/about";
const PUBLIC_ABOUT_PATH = "/(public)/about";

export async function uploadAboutProfileImageAction(formData: FormData) {
  await requireAdmin();

  const file = formData.get("image");
  if (!(file instanceof File)) {
    throw new Error("Image file is required");
  }

  try {
    const url = await uploadAboutImage(file);
    
    // Update database with new image URL
    await updateAboutProfileImage(url);
    
    revalidatePath(ADMIN_ABOUT_PATH);
    revalidatePath(PUBLIC_ABOUT_PATH);

    return url;
  } catch (error) {
    console.error("Error uploading about profile image:", error);
    throw error;
  }
}

export async function deleteAboutProfileImageAction(formData: FormData) {
  await requireAdmin();

  const imageUrl = formData.get("imageUrl");
  if (typeof imageUrl !== "string" || imageUrl.trim() === "") {
    throw new Error("Image URL is required");
  }

  try {
    const { deleteAboutImage } = await import("@/features/about/admin/service");
    await deleteAboutImage(imageUrl);
    
    // Update database to remove image URL (set to empty)
    await updateAboutProfileImage("");
    
    revalidatePath(ADMIN_ABOUT_PATH);
    revalidatePath(PUBLIC_ABOUT_PATH);

    return { success: true };
  } catch (error) {
    console.error("Error deleting about profile image:", error);
    throw error;
  }
}
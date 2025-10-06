"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/auth/server/nextAuth";

const ADMIN_ABOUT_PATH = "/admin/about";
const PUBLIC_ABOUT_PATH = "/(public)/about";

export async function uploadAboutProfileImageAction(formData: FormData) {
  await requireAdmin();

  try {
    const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/admin/about-profile-image/upload", {
      method: "POST",
      body: formData,
      headers: {
        // No need for Content-Type header when using FormData
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to upload about profile image");
    }

    const data = await response.json();
    
    revalidatePath(ADMIN_ABOUT_PATH);
    revalidatePath(PUBLIC_ABOUT_PATH);

    return data.url;
  } catch (error) {
    console.error("Error uploading about profile image:", error);
    throw error;
  }
}

export async function deleteAboutProfileImageAction(formData: FormData) {
  await requireAdmin();

  try {
    const imageUrl = formData.get("imageUrl") as string;
    
    if (!imageUrl) {
      throw new Error("Image URL is required");
    }

    const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/admin/about-profile-image/delete", {
      method: "POST",
      body: JSON.stringify({ imageUrl }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete about profile image");
    }

    revalidatePath(ADMIN_ABOUT_PATH);
    revalidatePath(PUBLIC_ABOUT_PATH);

    return { success: true };
  } catch (error) {
    console.error("Error deleting about profile image:", error);
    throw error;
  }
}
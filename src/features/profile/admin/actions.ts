"use server";

import { revalidatePath } from "next/cache";

import { updateHomeProfileImage } from "@/entities/home";
import { updateAboutProfileImage } from "@/entities/about";
import { requireAdmin } from "@/features/auth/server/nextAuth";
import { deleteProfileImage, uploadProfileImage } from "@/features/profile/admin/service";

const ADMIN_HOME_PATH = "/admin/home";
const ADMIN_ABOUT_PATH = "/admin/about";
const PUBLIC_HOME_PATH = "/(public)";
const PUBLIC_ABOUT_PATH = "/(public)/about";

export async function uploadProfileImageAction(formData: FormData) {
  await requireAdmin();

  const file = formData.get("image");
  if (!(file instanceof File)) {
    throw new Error("Image file is required");
  }

  const url = await uploadProfileImage(file);

  // Only update the home page profile image
  await updateHomeProfileImage(url);

  revalidatePath(ADMIN_HOME_PATH);
  revalidatePath(PUBLIC_HOME_PATH);

  return url;
}

export async function uploadAboutProfileImageAction(formData: FormData) {
  await requireAdmin();

  const file = formData.get("image");
  if (!(file instanceof File)) {
    throw new Error("Image file is required");
  }

  const url = await uploadProfileImage(file);

  // Only update the about page profile image
  await updateAboutProfileImage(url);

  revalidatePath(ADMIN_ABOUT_PATH);
  revalidatePath(PUBLIC_ABOUT_PATH);

  return url;
}

export async function deleteProfileImageAction(formData: FormData) {
  await requireAdmin();

  const imageUrl = formData.get("imageUrl");
  if (typeof imageUrl !== "string" || imageUrl.trim() === "") {
    throw new Error("Image URL is required");
  }

  await deleteProfileImage(imageUrl);

  const fallbackUrlEntry = formData.get("fallbackUrl");
  const fallbackUrl = typeof fallbackUrlEntry === "string" && fallbackUrlEntry.trim() !== "" ? fallbackUrlEntry : "";

  // Only update the home page profile image
  await updateHomeProfileImage(fallbackUrl);

  revalidatePath(ADMIN_HOME_PATH);
  revalidatePath(PUBLIC_HOME_PATH);
}

export async function deleteAboutProfileImageAction(formData: FormData) {
  await requireAdmin();

  const imageUrl = formData.get("imageUrl");
  if (typeof imageUrl !== "string" || imageUrl.trim() === "") {
    throw new Error("Image URL is required");
  }

  await deleteProfileImage(imageUrl);

  const fallbackUrlEntry = formData.get("fallbackUrl");
  const fallbackUrl = typeof fallbackUrlEntry === "string" && fallbackUrlEntry.trim() !== "" ? fallbackUrlEntry : "";

  // Only update the about page profile image
  await updateAboutProfileImage(fallbackUrl);

  revalidatePath(ADMIN_ABOUT_PATH);
  revalidatePath(PUBLIC_ABOUT_PATH);
}

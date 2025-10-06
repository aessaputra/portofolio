"use server";

import { revalidatePath } from "next/cache";

import { updateAboutContent as updateAboutContentEntity } from "@/entities/about";
import type { AboutContentUpdateInput } from "@/entities/about";
import { requireAdmin } from "@/features/auth/server/nextAuth";

const ADMIN_ABOUT_PATH = "/admin/about";
const PUBLIC_ABOUT_PATH = "/(public)/about";

export async function updateAboutContentAction(input: AboutContentUpdateInput) {
  await requireAdmin();

  const updated = await updateAboutContentEntity(input);

  revalidatePath(ADMIN_ABOUT_PATH);
  revalidatePath(PUBLIC_ABOUT_PATH);

  return updated;
}

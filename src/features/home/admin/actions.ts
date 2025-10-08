"use server";

import { revalidatePath } from "next/cache";

import { updateHomeContent as updateHomeContentEntity } from "@/entities/home";
import type { HomeContentUpdateInput } from "@/entities/home";
import { requireAdmin } from "@/features/auth/server/nextAuth";

const ADMIN_HOME_PATH = "/admin/home";
const PUBLIC_HOME_PATH = "/";
const PUBLIC_ABOUT_PATH = "/about";
const PUBLIC_ARTICLES_PATH = "/articles";
const PUBLIC_PROJECTS_PATH = "/projects";
const PUBLIC_CERTIFICATIONS_PATH = "/certifications";

export async function updateHomeContentAction(input: HomeContentUpdateInput) {
  await requireAdmin();

  const updated = await updateHomeContentEntity(input);

  // Revalidate all public pages that use home content
  revalidatePath(ADMIN_HOME_PATH);
  revalidatePath(PUBLIC_HOME_PATH);
  revalidatePath(PUBLIC_ABOUT_PATH);
  revalidatePath(PUBLIC_ARTICLES_PATH);
  revalidatePath(PUBLIC_PROJECTS_PATH);
  revalidatePath(PUBLIC_CERTIFICATIONS_PATH);

  return updated;
}

"use server";

import { revalidatePath } from "next/cache";

import { updateHomeContent as updateHomeContentEntity } from "@/entities/home";
import type { HomeContentUpdateInput } from "@/entities/home";
import { requireAdmin } from "@/features/auth/server/nextAuth";

const ADMIN_HOME_PATH = "/admin/home";
const PUBLIC_HOME_PATH = "/(public)";

export async function updateHomeContentAction(input: HomeContentUpdateInput) {
  await requireAdmin();

  const updated = await updateHomeContentEntity(input);

  revalidatePath(ADMIN_HOME_PATH);
  revalidatePath(PUBLIC_HOME_PATH);

  return updated;
}

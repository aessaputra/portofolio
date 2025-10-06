"use server";

import { revalidatePath } from "next/cache";

import {
  createArticleSource as createArticleSourceEntity,
  deleteArticleSource as deleteArticleSourceEntity,
  getArticleSources,
  updateArticleSource as updateArticleSourceEntity,
  type ArticleSourceInput,
} from "@/entities/articles";
import { requireAdmin } from "@/features/auth/server/nextAuth";

const ADMIN_ARTICLES_PATH = "/admin/articles";
const PUBLIC_ARTICLES_PATH = "/articles";

export async function listArticleSourcesAction() {
  await requireAdmin();

  return getArticleSources();
}

export async function createArticleSourceAction(input: ArticleSourceInput) {
  await requireAdmin();

  const created = await createArticleSourceEntity(input);

  revalidatePath(ADMIN_ARTICLES_PATH);
  revalidatePath(PUBLIC_ARTICLES_PATH);

  return created;
}

export async function updateArticleSourceAction(
  id: number,
  input: ArticleSourceInput
) {
  await requireAdmin();

  const updated = await updateArticleSourceEntity(id, input);
  if (!updated) {
    throw new Error("Article source not found");
  }

  revalidatePath(ADMIN_ARTICLES_PATH);
  revalidatePath(PUBLIC_ARTICLES_PATH);

  return updated;
}

export async function deleteArticleSourceAction(id: number) {
  await requireAdmin();

  const deleted = await deleteArticleSourceEntity(id);
  if (!deleted) {
    throw new Error("Article source not found");
  }

  revalidatePath(ADMIN_ARTICLES_PATH);
  revalidatePath(PUBLIC_ARTICLES_PATH);
}

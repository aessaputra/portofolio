"use server";

import { revalidatePath } from "next/cache";

import {
  createProject as createProjectEntity,
  deleteProject as deleteProjectEntity,
  getProjectById,
  getProjects,
  updateProject as updateProjectEntity,
  updateProjectImage,
  type ProjectCreateInput,
} from "@/entities/projects";
import { requireAdmin } from "@/features/auth/server/nextAuth";
import {
  deleteProjectImage as deleteProjectImageFromStorage,
  uploadProjectImage,
} from "@/features/projects/admin/service";

const ADMIN_PROJECTS_PATH = "/admin/projects";
const PUBLIC_PROJECTS_PATH = "/projects";

export async function listProjectsAction() {
  await requireAdmin();

  return getProjects();
}

export async function getProjectByIdAction(id: number) {
  await requireAdmin();

  return getProjectById(id);
}

export async function createProjectAction(input: ProjectCreateInput) {
  await requireAdmin();

  const created = await createProjectEntity(input);

  revalidatePath(ADMIN_PROJECTS_PATH);
  revalidatePath(PUBLIC_PROJECTS_PATH);

  return created;
}

export async function updateProjectAction(id: number, input: ProjectCreateInput) {
  await requireAdmin();

  const updated = await updateProjectEntity(id, input);
  if (!updated) {
    throw new Error("Project not found");
  }

  revalidatePath(ADMIN_PROJECTS_PATH);
  revalidatePath(PUBLIC_PROJECTS_PATH);

  return updated;
}

export async function deleteProjectAction(id: number) {
  await requireAdmin();

  const existing = await getProjectById(id);

  const deleted = await deleteProjectEntity(id);
  if (!deleted) {
    throw new Error("Project not found");
  }

  if (existing?.imageUrl) {
    try {
      await deleteProjectImageFromStorage(existing.imageUrl);
    } catch (error) {
      console.error("Failed to delete project image", error);
    }
  }

  revalidatePath(ADMIN_PROJECTS_PATH);
  revalidatePath(PUBLIC_PROJECTS_PATH);
}

export async function uploadProjectImageAction(formData: FormData) {
  await requireAdmin();

  const file = formData.get("image");
  if (!(file instanceof File)) {
    throw new Error("Image file is required");
  }

  const projectIdValue = formData.get("projectId");
  const projectId =
    typeof projectIdValue === "string" && projectIdValue.trim() !== ""
      ? Number.parseInt(projectIdValue, 10)
      : null;

  if (projectId !== null && Number.isNaN(projectId)) {
    throw new Error("Invalid project identifier");
  }

  const result = await uploadProjectImage(file);

  if (typeof projectId === "number") {
    await updateProjectImage(projectId, result.imageUrl);
  }

  revalidatePath(ADMIN_PROJECTS_PATH);
  revalidatePath(PUBLIC_PROJECTS_PATH);

  return result;
}

export async function deleteProjectImageAction(formData: FormData) {
  await requireAdmin();

  const imageUrl = formData.get("imageUrl");
  if (typeof imageUrl !== "string" || imageUrl.trim() === "") {
    throw new Error("Image URL is required");
  }

  await deleteProjectImageFromStorage(imageUrl);

  revalidatePath(ADMIN_PROJECTS_PATH);
  revalidatePath(PUBLIC_PROJECTS_PATH);
}

"use server";

import { revalidatePath } from "next/cache";

import { getProjects } from "@/entities/projects";
import type { Project } from "@/entities/projects";

const PROJECTS_ADMIN_PATH = "/admin/projects";

export async function listProjects(): Promise<Project[]> {
  return getProjects();
}

export async function refreshProjectsCache(): Promise<void> {
  revalidatePath(PROJECTS_ADMIN_PATH);
  revalidatePath("/(public)/projects");
}

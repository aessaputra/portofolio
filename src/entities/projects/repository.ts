import { asc, desc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { projects } from "@/db/schema";

import {
  DEFAULT_PROJECT_EDITABLE_TEXT,
  type Project,
  type ProjectCreateInput,
  type ProjectUpdateInput,
} from "./model";
import { mapProject, mapProjects } from "./mappers";

export async function getProjects(): Promise<Project[]> {
  const rows = await db
    .select()
    .from(projects)
    .orderBy(asc(projects.displayOrder), desc(projects.createdAt));

  return mapProjects(rows);
}

export async function getProjectById(id: number): Promise<Project | null> {
  const record = await db.query.projects.findFirst({
    where: eq(projects.id, id),
  });

  return record ? mapProject(record) : null;
}

export async function createProject(input: ProjectCreateInput): Promise<Project> {
  const [record] = await db
    .insert(projects)
    .values({
      title: input.title,
      type: input.type ?? "Project",
      summary: input.summary ?? null,
      description: input.description ?? null,
      editableText: input.editableText ?? DEFAULT_PROJECT_EDITABLE_TEXT,
      imageUrl: input.imageUrl,
      imageAlt: input.imageAlt,
      link: input.link,
      github: input.github,
      tags: input.tags ?? [],
      featured: Boolean(input.featured),
      technologies: input.technologies ?? [],
      displayOrder: input.displayOrder ?? 0,
    })
    .returning();

  return mapProject(record);
}

export async function updateProject(
  id: number,
  input: ProjectUpdateInput
): Promise<Project | null> {
  const [record] = await db
    .update(projects)
    .set({
      title: input.title,
      type: input.type ?? "Project",
      summary: input.summary ?? null,
      description: input.description ?? null,
      editableText: input.editableText ?? DEFAULT_PROJECT_EDITABLE_TEXT,
      imageUrl: input.imageUrl,
      imageAlt: input.imageAlt,
      link: input.link,
      github: input.github,
      tags: input.tags ?? [],
      featured: Boolean(input.featured),
      technologies: input.technologies ?? [],
      displayOrder: input.displayOrder ?? 0,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id))
    .returning();

  return record ? mapProject(record) : null;
}

export async function deleteProject(id: number): Promise<boolean> {
  const result = await db.delete(projects).where(eq(projects.id, id));
  return (result.rowCount ?? 0) > 0;
}

export async function updateProjectImage(id: number, imageUrl: string): Promise<boolean> {
  const result = await db
    .update(projects)
    .set({
      imageUrl,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id));

  return (result.rowCount ?? 0) > 0;
}

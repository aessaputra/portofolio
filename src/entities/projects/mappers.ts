import type { ProjectRecord, Project } from "./model";

export function mapProject(record: ProjectRecord): Project {
  return {
    id: record.id,
    title: record.title,
    type: record.type,
    summary: record.summary ?? null,
    description: record.description ?? null,
    editableText: record.editableText,
    imageUrl: record.imageUrl,
    imageAlt: record.imageAlt,
    link: record.link,
    github: record.github,
    tags: (record.tags ?? []) as string[],
    featured: record.featured,
    technologies: (record.technologies ?? []) as string[],
    displayOrder: record.displayOrder,
    createdAt:
      record.createdAt instanceof Date
        ? record.createdAt.toISOString()
        : String(record.createdAt),
    updatedAt:
      record.updatedAt instanceof Date
        ? record.updatedAt.toISOString()
        : String(record.updatedAt),
  };
}

export function mapProjects(records: ProjectRecord[]): Project[] {
  return records.map(mapProject);
}

import type { InferModel } from "drizzle-orm";

import { projects } from "@/db/schema";

export type ProjectRecord = InferModel<typeof projects>;

export const DEFAULT_PROJECT_EDITABLE_TEXT = "Innovation Meets Usability!";

export type Project = {
  id: number;
  title: string;
  type: string;
  summary: string | null;
  description: string | null;
  editableText: string;
  imageUrl: string;
  imageAlt: string;
  link: string;
  github: string;
  tags: string[];
  featured: boolean;
  technologies: string[];
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ProjectCreateInput = {
  title: string;
  type?: string;
  summary?: string | null;
  description?: string | null;
  editableText?: string | null;
  imageUrl: string;
  imageAlt: string;
  link: string;
  github: string;
  tags?: string[];
  featured?: boolean;
  technologies?: string[];
  displayOrder?: number;
};

export type ProjectUpdateInput = ProjectCreateInput;

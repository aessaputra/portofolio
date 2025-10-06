import {
  DEFAULT_PROJECT_EDITABLE_TEXT,
  type Project,
  type ProjectCreateInput,
} from "@/entities/projects/model";

export type ProjectFormState = {
  title: string;
  type: string;
  summary: string;
  description: string;
  editableText: string;
  imageUrl: string;
  imageAlt: string;
  link: string;
  github: string;
  tags: string;
  featured: boolean;
  technologies: string;
  displayOrder: number;
};

export function createEmptyProjectFormState(): ProjectFormState {
  return {
    title: "",
    type: "Project",
    summary: "",
    description: "",
    editableText: DEFAULT_PROJECT_EDITABLE_TEXT,
    imageUrl: "",
    imageAlt: "",
    link: "",
    github: "",
    tags: "",
    featured: false,
    technologies: "",
    displayOrder: 0,
  };
}

export function projectToFormState(project: Project): ProjectFormState {
  return {
    title: project.title,
    type: project.type,
    summary: project.summary ?? "",
    description: project.description ?? "",
    editableText: project.editableText ?? DEFAULT_PROJECT_EDITABLE_TEXT,
    imageUrl: project.imageUrl,
    imageAlt: project.imageAlt,
    link: project.link,
    github: project.github,
    tags: project.tags.join(", "),
    featured: project.featured,
    technologies: project.technologies.join(", "),
    displayOrder: project.displayOrder,
  };
}

function normalizeCommaSeparated(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function formStateToProjectInput(formState: ProjectFormState): ProjectCreateInput {
  return {
    title: formState.title,
    type: formState.type || "Project",
    summary: formState.summary ? formState.summary : null,
    description: formState.description ? formState.description : null,
    editableText: formState.editableText ? formState.editableText : DEFAULT_PROJECT_EDITABLE_TEXT,
    imageUrl: formState.imageUrl,
    imageAlt: formState.imageAlt,
    link: formState.link,
    github: formState.github,
    tags: normalizeCommaSeparated(formState.tags),
    featured: formState.featured,
    technologies: normalizeCommaSeparated(formState.technologies),
    displayOrder: Number.isFinite(formState.displayOrder)
      ? formState.displayOrder
      : 0,
  };
}

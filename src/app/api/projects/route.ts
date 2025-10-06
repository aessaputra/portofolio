import { NextResponse } from "next/server";

import { getProjects, createProject } from "@/entities/projects";
import { requireAdmin } from "@/features/auth/server/nextAuth";

export async function GET() {
  try {
    const allProjects = await getProjects();
    return NextResponse.json(allProjects);
  } catch (error) {
    console.error("Unexpected error fetching projects:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch projects",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

function validateProjectPayload(body: any) {
  const errors: Record<string, string> = {};

  if (!body?.title) errors.title = "Title is required";
  if (!body?.imageUrl) errors.imageUrl = "Image URL is required";
  if (!body?.imageAlt) errors.imageAlt = "Image alt text is required";
  if (!body?.link) errors.link = "Link is required";
  if (!body?.github) errors.github = "GitHub URL is required";

  if (body?.link) {
    try {
      new URL(body.link);
    } catch {
      errors.link = "Invalid project link";
    }
  }

  if (body?.github) {
    try {
      new URL(body.github);
    } catch {
      errors.github = "Invalid GitHub URL";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export async function POST(request: Request) {
  try {
    // Check if user is admin for POST requests
    await requireAdmin();
    
    const body = await request.json();

    const { isValid, errors } = validateProjectPayload(body);
    if (!isValid) {
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    const project = await createProject({
      title: body.title,
      type: body.type ?? "Project",
      summary: body.summary ?? null,
      description: body.description ?? null,
      editableText: body.editableText ?? null,
      imageUrl: body.imageUrl,
      imageAlt: body.imageAlt,
      link: body.link,
      github: body.github,
      tags: Array.isArray(body.tags) ? body.tags : [],
      featured: Boolean(body.featured),
      technologies: Array.isArray(body.technologies) ? body.technologies : [],
      displayOrder: typeof body.displayOrder === "number" ? body.displayOrder : 0,
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    
    // Handle authentication errors specifically
    if (error instanceof Error && error.message.includes("redirect")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

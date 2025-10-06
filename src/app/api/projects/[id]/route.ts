import { NextResponse } from "next/server";

import {
  deleteProject as deleteProjectRecord,
  getProjectById,
  updateProject as updateProjectRecord,
} from "@/entities/projects";
import { requireAdmin } from "@/features/auth/server/nextAuth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);
    
    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      );
    }

    const project = await getProjectById(projectId);
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is admin for PUT requests
    await requireAdmin();
    
    const { id } = await params;
    const projectId = parseInt(id);
    
    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const { isValid, errors } = validateProjectPayload(body);
    if (!isValid) {
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    const updatedProject = await updateProjectRecord(projectId, {
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

    if (!updatedProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("Error updating project:", error);
    
    // Handle authentication errors specifically
    if (error instanceof Error && error.message.includes("redirect")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is admin for DELETE requests
    await requireAdmin();
    
    const { id } = await params;
    const projectId = parseInt(id);
    
    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      );
    }

    const deleted = await deleteProjectRecord(projectId);
    if (!deleted) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    
    // Handle authentication errors specifically
    if (error instanceof Error && error.message.includes("redirect")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to delete project" },
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

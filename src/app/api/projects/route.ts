import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { projects } from "@/db/schema";
import { asc, desc, eq, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    // Test database connection first with a simpler query
    try {
      const connectionResult = await db.select({ now: sql`NOW()` });
      
      if (!connectionResult) {
        return NextResponse.json(
          {
            error: "Database connection test failed",
            details: "Unable to establish connection to the database"
          },
          { status: 500 }
        );
      }
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return NextResponse.json(
        {
          error: "Database connection failed",
          details: dbError instanceof Error ? dbError.message : "Unknown error"
        },
        { status: 500 }
      );
    }
    
    // Fetch all projects, ordered by display order and then by creation date
    try {
      // Use a simpler query approach to avoid the table name duplication issue
      const allProjects = await db.select({
        id: projects.id,
        title: projects.title,
        type: projects.type,
        summary: projects.summary,
        description: projects.description,
        editableText: projects.editableText,
        imageUrl: projects.imageUrl,
        imageAlt: projects.imageAlt,
        link: projects.link,
        github: projects.github,
        tags: projects.tags,
        featured: projects.featured,
        technologies: projects.technologies,
        displayOrder: projects.displayOrder,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt
      })
      .from(projects)
      .orderBy(asc(projects.displayOrder), desc(projects.createdAt));

      return NextResponse.json(allProjects);
    } catch (queryError) {
      console.error("Query execution error:", queryError);
      return NextResponse.json(
        {
          error: "Failed to execute projects query",
          details: queryError instanceof Error ? queryError.message : "Unknown error"
        },
        { status: 500 }
      );
    }
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

export async function POST(request: Request) {
  try {
    // Check if user is admin for POST requests
    await requireAdmin();
    
    const body = await request.json();
    
    // Extract project data from request body
    const {
      title,
      type = "Project",
      summary,
      description,
      imageUrl,
      imageAlt,
      link,
      github,
      tags = [],
      featured = false,
      technologies = [],
      displayOrder = 0
    } = body;

    // Validate required fields
    if (!title || !imageUrl || !imageAlt || !link || !github) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert new project into database
    const newProject = await db.insert(projects).values({
      title,
      type,
      summary,
      description,
      editableText: "Innovation Meets Usability!",
      imageUrl,
      imageAlt,
      link,
      github,
      tags,
      featured,
      technologies,
      displayOrder
    }).returning();

    return NextResponse.json(newProject[0], { status: 201 });
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
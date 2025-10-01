import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { homeContent } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

// Default home content values
const DEFAULT_HOME_CONTENT = {
  headline: "Welcome to My Portfolio",
  subheadline: "Full Stack Developer & UI/UX Designer",
  resumeUrl: "/resume.pdf",
  contactEmail: "contact@example.com",
  profileImagePath: "/images/profile.jpg",
  githubUrl: "https://github.com",
  linkedinUrl: "https://linkedin.com",
  xUrl: "https://twitter.com",
  showHireMe: true,
};

// GET handler to fetch home content
export async function GET() {
  try {
    await requireAdmin();
    
    let content = await db.query.homeContent.findFirst({
      where: eq(homeContent.id, 1),
    });

    // If no content exists, create default content
    if (!content) {
      try {
        const [newContent] = await db.insert(homeContent).values(DEFAULT_HOME_CONTENT).returning();
        content = newContent;
      } catch (insertError) {
        console.error("Error creating default home content:", insertError);
        return NextResponse.json(
          { error: "Failed to create default home content" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error("Error fetching home content:", error);
    
    // Handle authentication errors specifically
    if (error instanceof Error && error.message.includes("redirect")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch home content" },
      { status: 500 }
    );
  }
}

// PUT handler to update home content
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    
    const body = await request.json();
    const {
      headline,
      subheadline,
      resumeUrl,
      contactEmail,
      profileImagePath,
      githubUrl,
      linkedinUrl,
      xUrl,
      showHireMe,
    } = body;

    // Validate required fields
    if (!headline || !subheadline || !resumeUrl || !contactEmail || !profileImagePath) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if content exists
    const existingContent = await db.query.homeContent.findFirst({
      where: eq(homeContent.id, 1),
    });

    let updatedContent;
    
    if (existingContent) {
      // Update existing content
      const result = await db
        .update(homeContent)
        .set({
          headline,
          subheadline,
          resumeUrl,
          contactEmail,
          profileImagePath,
          githubUrl,
          linkedinUrl,
          xUrl,
          showHireMe,
          updatedAt: new Date(),
        })
        .where(eq(homeContent.id, 1))
        .returning();
      
      updatedContent = result[0];
    } else {
      // Create new content if it doesn't exist
      const [newContent] = await db.insert(homeContent).values({
        id: 1,
        headline,
        subheadline,
        resumeUrl,
        contactEmail,
        profileImagePath,
        githubUrl,
        linkedinUrl,
        xUrl,
        showHireMe,
        updatedAt: new Date(),
      }).returning();
      
      updatedContent = newContent;
    }

    return NextResponse.json(updatedContent);
  } catch (error) {
    console.error("Error updating home content:", error);
    
    // Handle authentication errors specifically
    if (error instanceof Error && error.message.includes("redirect")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update home content" },
      { status: 500 }
    );
  }
}
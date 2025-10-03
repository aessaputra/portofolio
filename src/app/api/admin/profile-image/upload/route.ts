import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { streamFileToR2, generateUniqueFilename } from "@/lib/r2";
import { db } from "@/db/client";
import { homeContent } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    
    const formData = await request.formData();
    const file = formData.get("image") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }
    
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP images are allowed." },
        { status: 400 }
      );
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds the 5MB limit." },
        { status: 400 }
      );
    }
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Generate unique filename
    const objectKey = generateUniqueFilename(file.name);
    
    // Upload to R2 with streaming to preserve original file
    const publicUrl = await streamFileToR2(buffer, file.type, objectKey, file.name);
    
    // Get current home content
    const currentContent = await db.query.homeContent.findFirst({
      where: eq(homeContent.id, 1),
    });
    
    // If there's an existing profile image, we could delete it here
    // But we'll keep it for now in case the user wants to revert
    
    // Update home content with new profile image path
    if (currentContent) {
      await db
        .update(homeContent)
        .set({
          profileImagePath: publicUrl,
          updatedAt: new Date(),
        })
        .where(eq(homeContent.id, 1));
    } else {
      // Create new content if it doesn't exist
      await db.insert(homeContent).values({
        id: 1,
        headline: "Welcome to My Portfolio",
        subheadline: "Full Stack Developer & UI/UX Designer",
        resumeUrl: "/resume.pdf",
        contactEmail: "contact@example.com",
        profileImagePath: publicUrl,
        githubUrl: "https://github.com",
        linkedinUrl: "https://linkedin.com",
        xUrl: "https://twitter.com",
        showHireMe: true,
        updatedAt: new Date(),
      });
    }
    
    return NextResponse.json({
      success: true,
      message: "Profile image uploaded successfully",
      url: publicUrl,
    });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    
    // Handle authentication errors specifically
    if (error instanceof Error && error.message.includes("redirect")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to upload profile image" },
      { status: 500 }
    );
  }
}
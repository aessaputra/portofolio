import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/features/auth/server/nextAuth";
import { streamFileToR2, generateUniqueFilename } from "@/shared/lib/storage";
import { db } from "@/db/client";
import { aboutContent } from "@/db/schema";
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
    const objectKey = generateUniqueFilename(file.name, "about");
    
    // Upload to R2 with streaming to preserve original file
    const publicUrl = await streamFileToR2(buffer, file.type, objectKey, file.name);
    
    // Get current about content
    const currentContent = await db.query.aboutContent.findFirst({
      where: eq(aboutContent.id, 1),
    });
    
    // Update about content with new about profile image path
    if (currentContent) {
      await db
        .update(aboutContent)
        .set({
          aboutProfileImagePath: publicUrl,
          updatedAt: new Date(),
        })
        .where(eq(aboutContent.id, 1));
    } else {
      // Create new content if it doesn't exist
      await db.insert(aboutContent).values({
        id: 1,
        headline: "About Me",
        aboutMeText1: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        aboutMeText2: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        aboutMeText3: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        profileImagePath: "/images/profile/developer-pic-2.jpg",
        aboutProfileImagePath: publicUrl,
        satisfiedClients: "8",
        projectsCompleted: "10",
        yearsOfExperience: "4",
        skills: [],
        experiences: [],
        education: [],
        updatedAt: new Date(),
      });
    }
    
    return NextResponse.json({
      success: true,
      message: "About profile image uploaded successfully",
      url: publicUrl,
    });
  } catch (error) {
    console.error("Error uploading about profile image:", error);
    
    // Handle authentication errors specifically
    if (error instanceof Error && error.message.includes("redirect")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to upload about profile image" },
      { status: 500 }
    );
  }
}
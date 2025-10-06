import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/features/auth/server/nextAuth";
import { deleteImageFromR2 } from "@/shared/lib/storage";
import { db } from "@/db/client";
import { aboutContent } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    
    const body = await request.json();
    const { imageUrl } = body;
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: "No image URL provided" },
        { status: 400 }
      );
    }
    
    // Extract object key from URL
    const url = new URL(imageUrl);
    const objectKey = url.pathname.substring(1); // Remove leading slash
    
    // Get current about content
    const currentContent = await db.query.aboutContent.findFirst({
      where: eq(aboutContent.id, 1),
    });
    
    if (!currentContent) {
      return NextResponse.json(
        { error: "No about content found" },
        { status: 404 }
      );
    }
    
    // Delete the image from R2
    await deleteImageFromR2(objectKey);
    
    // Update about content with default about profile image path
    await db
      .update(aboutContent)
      .set({
        aboutProfileImagePath: "/images/profile/developer-pic-2.jpg", // Default about profile image
        updatedAt: new Date(),
      })
      .where(eq(aboutContent.id, 1));
    
    return NextResponse.json({
      success: true,
      message: "About profile image deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting about profile image:", error);
    
    // Handle authentication errors specifically
    if (error instanceof Error && error.message.includes("redirect")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to delete about profile image" },
      { status: 500 }
    );
  }
}
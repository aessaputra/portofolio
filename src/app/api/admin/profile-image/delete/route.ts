import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/features/auth/server/nextAuth";
import { deleteImageFromR2 } from "@/shared/lib/storage";
import { db } from "@/db/client";
import { homeContent } from "@/db/schema";
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
    
    // Get current home content
    const currentContent = await db.query.homeContent.findFirst({
      where: eq(homeContent.id, 1),
    });
    
    if (!currentContent) {
      return NextResponse.json(
        { error: "No home content found" },
        { status: 404 }
      );
    }
    
    // Delete the image from R2
    await deleteImageFromR2(objectKey);
    
    // Update home content with default profile image path
    await db
      .update(homeContent)
      .set({
        profileImagePath: "/images/profile.jpg", // Default profile image
        updatedAt: new Date(),
      })
      .where(eq(homeContent.id, 1));
    
    return NextResponse.json({
      success: true,
      message: "Profile image deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting profile image:", error);
    
    // Handle authentication errors specifically
    if (error instanceof Error && error.message.includes("redirect")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to delete profile image" },
      { status: 500 }
    );
  }
}

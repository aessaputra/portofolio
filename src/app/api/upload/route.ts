import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/features/auth/server/nextAuth";
import { streamFileToR2, generateUniqueFilename } from "@/shared/lib/storage";

// Disable the default body parser to handle streaming
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    
    // Get content type to ensure it's multipart/form-data
    const contentType = request.headers.get("content-type") || "";
    
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Invalid content type. Expected multipart/form-data." },
        { status: 400 }
      );
    }
    
    // Parse the form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }
    
    // Validate file type
    const allowedTypes = [
      "image/jpeg", 
      "image/jpg", 
      "image/png", 
      "image/webp",
      "image/gif",
      "application/pdf",
      "text/plain"
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only images, PDFs, and text files are allowed." },
        { status: 400 }
      );
    }
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds the 10MB limit." },
        { status: 400 }
      );
    }
    
    // Generate unique filename
    const objectKey = generateUniqueFilename(file.name);
    
    // Convert file to buffer for streaming
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Upload to R2 with streaming and original content type
    const publicUrl = await streamFileToR2(
      buffer,
      file.type,
      objectKey,
      file.name
    );
    
    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      url: publicUrl,
      filename: objectKey,
      originalName: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    
    // Handle authentication errors specifically
    if (error instanceof Error && error.message.includes("redirect")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

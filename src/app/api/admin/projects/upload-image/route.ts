import { NextResponse } from "next/server";
import { r2Client, generateUniqueFilename, uploadImageToR2, extractObjectKeyFromUrl, deleteImageFromR2 } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename for the image with project type
    const fileName = generateUniqueFilename(file.name, 'project');
    
    // Determine content type
    const contentType = file.type || "image/jpeg";

    // Upload image to R2
    const imageUrl = await uploadImageToR2(buffer, contentType, fileName);

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Error uploading project image:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { imageUrl } = await request.json();
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: "No image URL provided" },
        { status: 400 }
      );
    }
    
    // Extract object key from URL
    const objectKey = extractObjectKeyFromUrl(imageUrl);
    
    if (!objectKey) {
      return NextResponse.json(
        { error: "Invalid image URL" },
        { status: 400 }
      );
    }
    
    // Check if this is a project image (starts with "project-")
    if (!objectKey.startsWith('project-')) {
      return NextResponse.json(
        { error: "Not a project image" },
        { status: 400 }
      );
    }
    
    // Delete image from R2
    await deleteImageFromR2(objectKey);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project image:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
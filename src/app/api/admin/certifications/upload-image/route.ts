import { NextResponse } from "next/server";
import { r2Client, generateUniqueFilename, uploadImageToR2, extractObjectKeyFromUrl, deleteImageFromR2 } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    
    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    const certificationId = formData.get("certificationId") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    // Enhanced file type validation with more specific checks
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    // Check both MIME type and file extension for better security
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP images are allowed." },
        { status: 400 }
      );
    }
    
    // Validate file extension matches the MIME type
    if (
      (file.type === "image/jpeg" && !["jpg", "jpeg"].includes(fileExtension || "")) ||
      (file.type === "image/png" && fileExtension !== "png") ||
      (file.type === "image/webp" && fileExtension !== "webp")
    ) {
      return NextResponse.json(
        { error: "File extension does not match the file type." },
        { status: 400 }
      );
    }

    // Enhanced file size validation with different limits for different types
    const maxSize = 10 * 1024 * 1024; // 10MB
    const recommendedSize = 5 * 1024 * 1024; // 5MB
    
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds the ${maxSize / 1024 / 1024}MB limit.` },
        { status: 400 }
      );
    }
    
    // Add a warning for large files
    const sizeWarning = file.size > recommendedSize;
    
    // Additional validation for image dimensions (if possible)
    try {
      const dimensions = await getImageDimensions(file);
      const { width, height } = dimensions;
      
      // Minimum dimensions check
      if (width < 400 || height < 300) {
        return NextResponse.json(
          { error: "Image dimensions are too small. Minimum dimensions are 400x300 pixels." },
          { status: 400 }
        );
      }
      
      // Aspect ratio check (warn if extremely wide or tall)
      const aspectRatio = width / height;
      if (aspectRatio > 5 || aspectRatio < 0.2) {
        return NextResponse.json(
          { error: "Extreme aspect ratio detected. Please use an image with a more balanced aspect ratio." },
          { status: 400 }
        );
      }
    } catch (dimensionError) {
      // If we can't check dimensions, continue with upload but log the error
      console.error("Could not validate image dimensions:", dimensionError);
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename for the image with certification type
    const fileName = generateUniqueFilename(file.name, 'certification');
    
    // Determine content type
    const contentType = file.type || "image/jpeg";

    // Upload image to R2 with enhanced options
    const imageUrl = await uploadImageToR2(buffer, contentType, fileName, {
      cacheControl: 'public, max-age=31536000, immutable', // Cache for 1 year
      metadata: {
        'original-filename': file.name,
        'upload-timestamp': Date.now().toString(),
        'file-size': file.size.toString(),
      },
      contentDisposition: `inline; filename="${file.name}"`,
    });

    // If certification ID is provided, update the certification with the new image URL
    if (certificationId) {
      try {
        const { db } = await import("@/db/client");
        const { certifications } = await import("@/db/schema");
        const { eq } = await import("drizzle-orm");
        
        await db
          .update(certifications)
          .set({
            imageUrl,
            updatedAt: new Date()
          })
          .where(eq(certifications.id, parseInt(certificationId)));
      } catch (updateError) {
        console.error("Error updating certification with new image URL:", updateError);
        // We don't fail the upload if the update fails, just log the error
      }
    }

    return NextResponse.json({
      imageUrl,
      message: certificationId
        ? "Image uploaded and certification updated successfully"
        : "Image uploaded successfully",
      warning: sizeWarning ? `File is larger than the recommended ${recommendedSize / 1024 / 1024}MB. Consider optimizing for better performance.` : undefined
    });
  } catch (error) {
    console.error("Error uploading certification image:", error);
    
    // Handle authentication errors specifically
    if (error instanceof Error && error.message.includes("redirect")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

// Helper function to get image dimensions
async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for dimension validation"));
    };
    
    img.src = url;
  });
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    
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
    
    // Check if this is a certification image (starts with "certification-")
    if (!objectKey.startsWith('certification-')) {
      return NextResponse.json(
        { error: "Not a certification image" },
        { status: 400 }
      );
    }
    
    // Delete image from R2
    await deleteImageFromR2(objectKey);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting certification image:", error);
    
    // Handle authentication errors specifically
    if (error instanceof Error && error.message.includes("redirect")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/features/auth/server/nextAuth";
import { uploadProfileImage, deleteProfileImage } from "@/features/user-profile/admin/service";
import { getUserProfileByEmail, updateUserProfile } from "@/entities/user-profile";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "User email not found in session" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("image") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    // Delete old profile image if exists
    const currentProfile = await getUserProfileByEmail(session.user.email);
    if (currentProfile?.profileImageUrl) {
      try {
        await deleteProfileImage(currentProfile.profileImageUrl);
      } catch (error) {
        console.error("Error deleting old profile image:", error);
      }
    }

    // Upload new profile image
    const imageUrl = await uploadProfileImage(file);

    // Update user profile with new image URL
    const updatedProfile = await updateUserProfile(session.user.email, {
      profileImageUrl: imageUrl,
    });

    if (!updatedProfile) {
      return NextResponse.json(
        { error: "Failed to update user profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    
    if (error instanceof Error && error.message.includes("redirect")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload profile image" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAdmin();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "User email not found in session" },
        { status: 400 }
      );
    }

    const currentProfile = await getUserProfileByEmail(session.user.email);
    if (!currentProfile?.profileImageUrl || currentProfile.profileImageUrl === "/admin/images/profile/admin-profile.jpg") {
      return NextResponse.json(
        { error: "No custom profile image to delete" },
        { status: 404 }
      );
    }

    // Delete the image from storage
    await deleteProfileImage(currentProfile.profileImageUrl);

    // Update user profile to use default image
    const updatedProfile = await updateUserProfile(session.user.email, {
      profileImageUrl: "/admin/images/profile/admin-profile.jpg",
    });

    if (!updatedProfile) {
      return NextResponse.json(
        { error: "Failed to update user profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile image deleted successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error deleting profile image:", error);
    
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

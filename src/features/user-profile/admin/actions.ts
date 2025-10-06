"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/features/auth/server/nextAuth";
import { updateUserProfile, getUserProfileByEmail } from "@/entities/user-profile";
import { uploadProfileImage, deleteProfileImage } from "@/features/user-profile/admin/service";

export async function updateUserProfileAction(formData: FormData) {
  const session = await requireAdmin();
  
  if (!session?.user?.email) {
    throw new Error("User email not found in session");
  }

  const name = formData.get("name") as string;
  const profileImageFile = formData.get("profileImage") as File | null;

  let profileImageUrl: string | undefined;

  // Handle profile image upload if provided
  if (profileImageFile && profileImageFile.size > 0) {
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
    profileImageUrl = await uploadProfileImage(profileImageFile);
  }

  // Update user profile
  const updatedProfile = await updateUserProfile(session.user.email, {
    name: name || undefined,
    profileImageUrl,
  });

  if (!updatedProfile) {
    throw new Error("Failed to update user profile");
  }

  revalidatePath("/admin/profile");
  revalidatePath("/admin");
}

export async function deleteUserProfileImageAction() {
  const session = await requireAdmin();
  
  if (!session?.user?.email) {
    throw new Error("User email not found in session");
  }

  const currentProfile = await getUserProfileByEmail(session.user.email);
  if (!currentProfile?.profileImageUrl || currentProfile.profileImageUrl === "/admin/images/profile/admin-profile.jpg") {
    throw new Error("No custom profile image to delete");
  }

  // Delete the image from storage
  await deleteProfileImage(currentProfile.profileImageUrl);

  // Update user profile to use default image
  await updateUserProfile(session.user.email, {
    profileImageUrl: "/admin/images/profile/admin-profile.jpg",
  });

  revalidatePath("/admin/profile");
  revalidatePath("/admin");
}

import { auth } from "@/features/auth/server/nextAuth";
import { getUserProfileByEmail, upsertUserProfile } from "@/entities/user-profile";
import { redirect } from "next/navigation";
import UserProfileForm from "@/features/user-profile/admin/UserProfileForm";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/admin/sign-in");
  }

  // Get or create user profile
  let userProfile = await getUserProfileByEmail(session.user.email);
  
  if (!userProfile) {
    // Create a basic profile for new users
    userProfile = await upsertUserProfile({
      email: session.user.email,
      name: session.user.originalName || session.user.name || undefined,
      profileImageUrl: session.user.originalImage || session.user.image || "/admin/images/profile/admin-profile.jpg",
    });
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Profile Settings
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your personal information and profile photo.
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <div className="max-w-2xl">
        <UserProfileForm 
          initialData={{
            name: userProfile?.name || session.user.name || "",
            email: session.user.email,
            profileImageUrl: userProfile?.profileImageUrl || session.user.image || "/admin/images/profile/admin-profile.jpg",
          }}
        />
      </div>
    </div>
  );
}

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminSignInWithCheck from "@/components/AdminSignInWithCheck";
import { isAdmin } from "@/lib/isAdmin";

export default async function AdminSignInPage() {
  const { userId } = await auth();
  
  // If user is already authenticated, check if they're an admin
  if (userId) {
    const user = await currentUser();
    
    // If user is an admin, redirect to admin dashboard
    if (isAdmin(user)) {
      redirect("/admin/dashboard");
    }
    
    // If user is authenticated but not an admin, they should not be able to access admin pages
    // The AdminSignInWithCheck component will handle blocking them at the login interface
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <AdminSignInWithCheck />
    </div>
  );
}
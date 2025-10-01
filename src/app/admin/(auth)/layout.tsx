import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/isAdmin";

export default async function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  
  // If user is not authenticated, redirect to sign-in
  if (!userId) {
    const signInUrl = new URL("/admin/sign-in", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
    redirect(signInUrl.toString());
  }

  // Get user information
  const user = await currentUser();
  
  // Check if user is an admin
  const adminStatus = isAdmin(user);
  
  // If user is not an admin, redirect to access-denied
  if (!adminStatus) {
    redirect("/admin/access-denied");
  }

  return <>{children}</>;
}
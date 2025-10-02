import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect, useSearchParams } from "next/navigation";
import { isAdmin } from "@/lib/isAdmin";

export default async function PostSignInPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { userId } = await auth();
  const redirect_url = searchParams.redirect_url as string || "/admin/dashboard";
  
  // If user is not authenticated, redirect to sign-in
  if (!userId) {
    console.log("[PostSignIn] User not authenticated, redirecting to sign-in");
    redirect("/sign-in");
  }

  // Get user information
  const user = await currentUser();
  console.log("[PostSignIn] User authenticated:", user?.id, user?.primaryEmailAddress?.emailAddress);
  
  // Check if user is an admin
  const adminStatus = isAdmin(user);
  console.log("[PostSignIn] Admin status:", adminStatus);
  
  // If user is an admin, redirect to the specified URL or admin dashboard
  if (adminStatus) {
    console.log("[PostSignIn] User is admin, redirecting to:", redirect_url);
    redirect(redirect_url);
  } else {
    console.log("[PostSignIn] User is not admin, redirecting to home page");
    redirect("/");
  }
}
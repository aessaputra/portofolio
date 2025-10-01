import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isAdmin as checkAdmin, type MinimalClerkUser } from "@/lib/isAdmin";

/**
 * Require an authenticated session. Redirects to /sign-in if not present.
 */
export async function requireAuth(): Promise<void> {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
}

/**
 * Require an admin user. Uses robust server-side check against ADMIN_EMAILS.
 * Redirects to /admin/access-denied for non-admins.
 */
export async function requireAdmin(): Promise<void> {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  const user = (await currentUser()) as unknown as MinimalClerkUser | null;
  if (!checkAdmin(user)) {
    redirect("/admin/access-denied");
  }
}

/**
 * Helper: fetch the current user object for server components.
 */
export async function getCurrentUserForServer(): Promise<MinimalClerkUser | null> {
  const { userId } = await auth();
  if (!userId) return null;
  return (await currentUser()) as unknown as MinimalClerkUser | null;
}
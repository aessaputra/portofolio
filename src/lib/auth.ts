import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from 'next/navigation';

export function isAdminEmail(email?: string | null) {
  if (!email) return false;
  const list = (process.env.ALLOWED_ADMIN_EMAILS || "")
    .split(",")
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}

export async function requireAdmin() {
  const { userId } = auth();
  if (!userId) {
    redirect('/sign-in');
  }
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress
    ?? user?.emailAddresses?.[0]?.emailAddress
    ?? null;
  if (!isAdminEmail(email)) {
    redirect('/');
  }
}
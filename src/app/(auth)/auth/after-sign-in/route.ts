import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { isAdminEmail } from "@/lib/auth";

export const runtime = "nodejs"; // Clerk server SDK

export async function GET(request: Request) {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const { userId } = auth();
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress
    ?? user?.emailAddresses?.[0]?.emailAddress
    ?? null;

  // If not logged in or not admin → send home (cannot access /admin/** anyway)
  if (!userId || !isAdminEmail(email)) {
    return NextResponse.redirect(new URL("/", base));
  }

  // Admin OK → go to dashboard
  return NextResponse.redirect(new URL("/admin", base));
}

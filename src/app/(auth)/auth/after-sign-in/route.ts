import { NextResponse } from "next/server";

import { auth } from "@/features/auth/server/nextAuth";
import { isAllowedAdminEmail } from "@/shared/lib/adminAllowlist";

export async function GET(request: Request) {
  const session = await auth();
  const email = session?.user?.email;
  const { origin } = new URL(request.url);

  if (!session || !email || !isAllowedAdminEmail(email)) {
    return NextResponse.redirect(new URL("/not-authorized", origin));
  }

  return NextResponse.redirect(new URL("/admin", origin));
}

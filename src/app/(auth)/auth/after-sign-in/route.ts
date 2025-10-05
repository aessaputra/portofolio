import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { isAllowedAdminEmail } from "@/lib/adminAuthConfig";

export async function GET(request: Request) {
  const session = await auth();
  const email = session?.user?.email;
  const { origin } = new URL(request.url);

  if (!session || !email || !isAllowedAdminEmail(email)) {
    return NextResponse.redirect(new URL("/not-authorized", origin));
  }

  return NextResponse.redirect(new URL("/admin", origin));
}

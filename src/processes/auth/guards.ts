import type { Session } from "next-auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { isAllowedAdminEmail } from "@/shared/lib/adminAllowlist";

const ADMIN_PREFIXES = ["/admin", "/api/admin", "/post-sign-in"];
const ADMIN_PUBLIC_PATHS = ["/admin/sign-in", "/admin/magic-link"];

export type GuardedRequest = NextRequest & {
  auth?: Session | null;
};

export function requiresAdminAuth(pathname: string): boolean {
  if (ADMIN_PUBLIC_PATHS.some((publicPath) => pathname.startsWith(publicPath))) {
    return false;
  }

  return ADMIN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function verifyAdminSession(session: Session | null | undefined): session is Session {
  const email = session?.user?.email;
  if (!email) return false;
  return isAllowedAdminEmail(email);
}

export function withAdminGuard(
  handler: (request: GuardedRequest) => NextResponse | Promise<NextResponse>
) {
  return async (request: GuardedRequest) => {
    if (!requiresAdminAuth(request.nextUrl.pathname)) {
      return handler(request);
    }

    if (!verifyAdminSession(request.auth ?? null)) {
      if (request.nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const signInUrl = new URL("/admin/sign-in", request.url);
      signInUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }

    return handler(request);
  };
}

import { NextResponse } from "next/server";

import { signIn } from "@/lib/auth";
import { sanitizeRedirectPath } from "@/lib/magicLink";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const redirectParam = url.searchParams.get("redirect");
  const redirectPath = sanitizeRedirectPath(redirectParam) ?? "/admin/dashboard";

  if (!token) {
    const errorUrl = new URL("/admin/sign-in", url.origin);
    errorUrl.searchParams.set("error", "missing-token");
    return NextResponse.redirect(errorUrl);
  }

  try {
    return await signIn("admin-magic-link", {
      token,
      redirect: true,
      redirectTo: redirectPath,
    });
  } catch (error) {
    console.error("[MagicLink] Sign-in failed", error);
    const errorUrl = new URL("/admin/sign-in", url.origin);
    errorUrl.searchParams.set("error", "magic-link");
    return NextResponse.redirect(errorUrl);
  }
}

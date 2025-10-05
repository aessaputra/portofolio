import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

const uploadPath = "/api/upload";

export default auth((request) => {
  if (request.nextUrl.pathname.startsWith(uploadPath)) {
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store, no-transform");
    response.headers.set("Content-Disposition", "attachment");
    return response;
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/post-sign-in",
    "/api/admin/:path*",
    "/api/upload",
  ],
};

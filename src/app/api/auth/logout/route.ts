import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/features/auth/server/nextAuth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: "No authenticated user found" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, message: "Logged out successfully" });

    const cookiesToClear = [
      "next-auth.session-token",
      "__Secure-next-auth.session-token",
      "next-auth.csrf-token",
      "__Host-next-auth.csrf-token",
    ];

    for (const name of cookiesToClear) {
      response.cookies.delete(name);
    }
    
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Failed to logout", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

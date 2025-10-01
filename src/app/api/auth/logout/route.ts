import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "No authenticated user found" }, { status: 401 });
    }

    // Get the origin for proper redirect
    const origin = req.headers.get("origin") || "";
    
    // Create response and clear cookies
    const response = NextResponse.json({ success: true, message: "Logged out successfully" });
    
    // Clear Clerk cookies
    response.cookies.delete("__session");
    response.cookies.delete("__client");
    
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Failed to logout", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
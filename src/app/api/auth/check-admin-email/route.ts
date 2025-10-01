import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Get admin emails from environment variable
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";
    
    if (!adminEmails) {
      return NextResponse.json({ error: "No admin emails configured" }, { status: 500 });
    }
    
    // Normalize and check against admin emails
    const normalizedEmail = email.trim().toLowerCase();
    const adminSet = new Set(
      adminEmails
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    );
    
    const isAdmin = adminSet.has(normalizedEmail);
    
    return NextResponse.json({ 
      isAdmin,
      message: isAdmin ? "Email is authorized for admin access" : "Email is not authorized for admin access"
    });
  } catch (error) {
    console.error("Error checking admin email:", error);
    return NextResponse.json(
      { error: "Failed to check admin email", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
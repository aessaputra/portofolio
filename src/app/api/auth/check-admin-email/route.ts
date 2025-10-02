import { NextRequest, NextResponse } from "next/server";
import { logAdminCheckDetails } from "@/lib/debugAdminCheck";

// Simple in-memory rate limiting store
const rateLimitStore = new Map<string, { count: number; lastReset: number }>();

// Rate limiting function
async function checkRateLimit(ip: string, limit: number = 5, windowMs: number = 60000): Promise<boolean> {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  
  if (!record) {
    rateLimitStore.set(ip, { count: 1, lastReset: now });
    return true;
  }
  
  if (now - record.lastReset > windowMs) {
    rateLimitStore.set(ip, { count: 1, lastReset: now });
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    // Apply rate limiting
    const isAllowed = await checkRateLimit(ip, 5, 60000); // 5 requests per minute
    if (!isAllowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }
    
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Get admin emails from environment variable
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";
    
    if (!adminEmails) {
      console.error("No admin emails configured in NEXT_PUBLIC_ADMIN_EMAILS");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }
    
    // Normalize and check against admin emails - using the same logic as in isAdmin.ts
    const normalizedEmail = email.trim().toLowerCase();
    const adminSet = new Set(
      adminEmails
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    );
    
    const isAdmin = adminSet.has(normalizedEmail);
    
    // Log detailed debug information for troubleshooting
    if (process.env.NODE_ENV !== "production") {
      logAdminCheckDetails(email, "check-admin-email API");
    }
    
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
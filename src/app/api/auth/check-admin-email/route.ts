import { NextRequest, NextResponse } from "next/server";

import { isAllowedAdminEmail } from "@/lib/adminAuthConfig";

// Simple in-memory rate limiting store
const rateLimitStore = new Map<string, { count: number; lastReset: number }>();

async function checkRateLimit(
  ip: string,
  limit: number = 5,
  windowMs: number = 60000
): Promise<boolean> {
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
    const ip =
      req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

    const isWithinRateLimit = await checkRateLimit(ip, 5, 60000);
    if (!isWithinRateLimit) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const isAdmin = isAllowedAdminEmail(normalizedEmail);

    return NextResponse.json({
      isAdmin,
      message: isAdmin
        ? "Email is authorized for admin access"
        : "Email is not authorized for admin access",
    });
  } catch (error) {
    console.error("Error checking admin email:", error);
    return NextResponse.json(
      {
        error: "Failed to check admin email",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

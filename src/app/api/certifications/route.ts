import { NextRequest, NextResponse } from "next/server";

import { getCertifications } from "@/entities/certifications";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featuredOnly = searchParams.get("featured") === "true";
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;

    const certifications = await getCertifications({ featuredOnly, limit });
    return NextResponse.json(certifications);
  } catch (error) {
    console.error("Error fetching certifications:", error);
    return NextResponse.json({ error: "Failed to fetch certifications" }, { status: 500 });
  }
}

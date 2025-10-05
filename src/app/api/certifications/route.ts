import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { certifications } from "@/db/schema";
import { eq, asc, sql, desc } from "drizzle-orm";

// Helper function to check if certifications table exists
async function ensureCertificationsTableExists() {
  try {
    // Check if certifications table exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'certifications'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log("Certifications table does not exist");
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error checking certifications table:", error);
    return false;
  }
}

// GET handler to fetch certifications for public display
export async function GET(request: NextRequest) {
  try {
    // Check if certifications table exists
    const tableExists = await ensureCertificationsTableExists();
    if (!tableExists) {
      return NextResponse.json([]);
    }
    
    const { searchParams } = new URL(request.url);
    const featuredOnly = searchParams.get("featured") === "true";
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit") as string) : undefined;
    
    let certificationsList;
    
    // Filter by featured if requested
    if (featuredOnly) {
      certificationsList = await db.query.certifications.findMany({
        where: eq(certifications.featured, true),
        orderBy: [asc(certifications.displayOrder)],
        limit: limit
      });
    } else {
      certificationsList = await db.query.certifications.findMany({
        orderBy: [asc(certifications.displayOrder)],
        limit: limit
      });
    }

    return NextResponse.json(certificationsList);
  } catch (error) {
    console.error("Error fetching certifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch certifications" },
      { status: 500 }
    );
  }
}
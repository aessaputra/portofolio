import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { homeContent } from "@/db/schema";
import { ensurePublicR2Url } from "@/shared/lib/storage";

import type { HomeContent, HomeContentRecord, HomeContentUpdateInput } from "./home.types";


function toIso(value: Date | string): string {
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function mapHomeContent(record: HomeContentRecord | null): HomeContent {
  if (!record) {
    return {
      id: 0,
      headline: "Welcome to My Portfolio",
      subheadline: "Full Stack Developer & UI/UX Designer",
      resumeUrl: "",
      contactEmail: "contact@example.com",
      profileImagePath: "",
      githubUrl: "",
      linkedinUrl: "",
      xUrl: "",
      logoText: "AES",
      showHireMe: true,
      updatedAt: new Date().toISOString(),
    };
  }

  return {
    id: record.id,
    headline: record.headline,
    subheadline: record.subheadline,
    resumeUrl: record.resumeUrl,
    contactEmail: record.contactEmail,
    profileImagePath: ensurePublicR2Url(record.profileImagePath),
    githubUrl: record.githubUrl,
    linkedinUrl: record.linkedinUrl,
    xUrl: record.xUrl,
    logoText: record.logoText,
    showHireMe: record.showHireMe,
    updatedAt: toIso(record.updatedAt),
  };
}

async function ensureHomeContentRecord(): Promise<HomeContentRecord> {
  const existing = await db.query.homeContent.findFirst();
  if (existing) {
    return existing;
  }

  // Create empty record - will be filled via admin panel
  const [created] = await db.insert(homeContent).values({
    headline: "",
    subheadline: "",
    resumeUrl: "",
    contactEmail: "",
    profileImagePath: "",
    githubUrl: "",
    linkedinUrl: "",
    xUrl: "",
    logoText: "",
    showHireMe: true,
  }).returning();
  return created;
}

export async function getHomeContent(): Promise<HomeContent> {
  try {
    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      console.warn("[HomeRepository] DATABASE_URL not available, returning default content");
      return mapHomeContent(null);
    }

    const record = await ensureHomeContentRecord();
    return mapHomeContent(record);
  } catch (error) {
    console.error("[HomeRepository] Failed to fetch home content", error);
    
    // During build time, if database is not available, return default content
    if (error instanceof Error && (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED'))) {
      console.warn("[HomeRepository] Database connection failed during build, using default content");
      return mapHomeContent(null);
    }
    
    return mapHomeContent(null);
  }
}

export async function updateHomeProfileImage(imageUrl: string): Promise<HomeContent> {
  const current = await ensureHomeContentRecord();

  const [updated] = await db
    .update(homeContent)
    .set({
      profileImagePath: imageUrl,
      updatedAt: new Date(),
    })
    .where(eq(homeContent.id, current.id))
    .returning();

  return mapHomeContent(updated ?? current);
}
export async function updateHomeContent(input: HomeContentUpdateInput): Promise<HomeContent> {
  const current = await ensureHomeContentRecord();
  const [updated] = await db
    .update(homeContent)
    .set({
      headline: input.headline,
      subheadline: input.subheadline,
      resumeUrl: input.resumeUrl,
      contactEmail: input.contactEmail,
      profileImagePath: input.profileImagePath,
      githubUrl: input.githubUrl,
      linkedinUrl: input.linkedinUrl,
      xUrl: input.xUrl,
      logoText: input.logoText,
      showHireMe: input.showHireMe,
      updatedAt: new Date(),
    })
    .where(eq(homeContent.id, current.id))
    .returning();

  return mapHomeContent(updated ?? current);
}

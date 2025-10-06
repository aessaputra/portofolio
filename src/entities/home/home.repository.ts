import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { homeContent } from "@/db/schema";

import type { HomeContent, HomeContentRecord, HomeContentUpdateInput } from "./home.types";

export const DEFAULT_HOME_CONTENT: HomeContentUpdateInput = {
  headline: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  subheadline:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  resumeUrl: "/example.pdf",
  contactEmail: "mailto:aessaputra@yahoo.com",
  profileImagePath: "/images/profile/developer-pic-1.png",
  githubUrl: "https://github.com",
  linkedinUrl: "https://linkedin.com",
  xUrl: "https://x.com",
  showHireMe: true,
};

function toIso(value: Date | string): string {
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function mapHomeContent(record: HomeContentRecord): HomeContent {
  return {
    id: record.id,
    headline: record.headline,
    subheadline: record.subheadline,
    resumeUrl: record.resumeUrl,
    contactEmail: record.contactEmail,
    profileImagePath: record.profileImagePath,
    githubUrl: record.githubUrl,
    linkedinUrl: record.linkedinUrl,
    xUrl: record.xUrl,
    showHireMe: record.showHireMe,
    updatedAt: toIso(record.updatedAt),
  };
}

async function ensureHomeContentRecord(): Promise<HomeContentRecord> {
  const existing = await db.query.homeContent.findFirst();
  if (existing) {
    return existing;
  }

  const [created] = await db.insert(homeContent).values(DEFAULT_HOME_CONTENT).returning();
  return created;
}

export async function getHomeContent(): Promise<HomeContent> {
  const record = await ensureHomeContentRecord();
  return mapHomeContent(record);
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
      showHireMe: input.showHireMe,
      updatedAt: new Date(),
    })
    .where(eq(homeContent.id, current.id))
    .returning();

  return mapHomeContent(updated ?? current);
}

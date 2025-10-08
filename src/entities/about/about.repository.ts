import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { aboutContent } from "@/db/schema";
import { ensurePublicR2Url } from "@/shared/lib/storage";

import type {
  AboutContent,
  AboutContentRecord,
  AboutContentUpdateInput,
  AboutEducation,
  AboutExperience,
  AboutSkill,
} from "./about.types";



function toIsoString(value: Date | string | null | undefined): string {
  if (!value) return new Date().toISOString();
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function parseSkills(value: unknown): AboutSkill[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => ({
      name: typeof item?.name === "string" ? item.name : "",
      x: typeof item?.x === "string" ? item.x : "0",
      y: typeof item?.y === "string" ? item.y : "0",
    }))
    .filter((skill) => skill.name.trim() !== "");
}

function parseExperiences(value: unknown): AboutExperience[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => ({
    position: typeof item?.position === "string" ? item.position : "",
    company: typeof item?.company === "string" ? item.company : "",
    companyLink: typeof item?.companyLink === "string" ? item.companyLink : "",
    time: typeof item?.time === "string" ? item.time : "",
    address: typeof item?.address === "string" ? item.address : "",
    work: Array.isArray(item?.work)
      ? item.work.filter((entry: unknown): entry is string => typeof entry === "string")
      : [],
  }));
}

function parseEducation(value: unknown): AboutEducation[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => ({
    type: typeof item?.type === "string" ? item.type : "",
    time: typeof item?.time === "string" ? item.time : "",
    place: typeof item?.place === "string" ? item.place : "",
    info: typeof item?.info === "string" ? item.info : "",
  }));
}

function mergeWithDefaults(record: AboutContentRecord | null): AboutContentRecord {
  if (!record) {
    return {
      id: 0,
      updatedAt: new Date(),
      createdAt: new Date(),
      headline: "",
      aboutMeText1: "",
      aboutMeText2: "",
      aboutMeText3: "",
      profileImagePath: "",
      aboutProfileImagePath: "",
      satisfiedClients: "",
      projectsCompleted: "",
      yearsOfExperience: "",
      skills: [],
      experiences: [],
      education: [],
    } as AboutContentRecord;
  }

  return {
    ...record,
    headline: record.headline ?? "",
    aboutMeText1: record.aboutMeText1 ?? "",
    aboutMeText2: record.aboutMeText2 ?? "",
    aboutMeText3: record.aboutMeText3 ?? "",
    profileImagePath: record.profileImagePath ?? "",
    aboutProfileImagePath: record.aboutProfileImagePath ?? "",
    satisfiedClients: record.satisfiedClients ?? "",
    projectsCompleted: record.projectsCompleted ?? "",
    yearsOfExperience: record.yearsOfExperience ?? "",
    skills: record.skills ?? [],
    experiences: record.experiences ?? [],
    education: record.education ?? [],
  } as AboutContentRecord;
}

function mapAboutContent(record: AboutContentRecord | null): AboutContent {
  const merged = mergeWithDefaults(record);

  return {
    id: merged.id,
    headline: merged.headline ?? "",
    aboutMeText1: merged.aboutMeText1 ?? "",
    aboutMeText2: merged.aboutMeText2 ?? "",
    aboutMeText3: merged.aboutMeText3 ?? "",
    profileImagePath: ensurePublicR2Url(merged.profileImagePath ?? ""),
    aboutProfileImagePath: ensurePublicR2Url(merged.aboutProfileImagePath ?? ""),
    counters: {
      satisfiedClients: merged.satisfiedClients ?? "",
      projectsCompleted: merged.projectsCompleted ?? "",
      yearsOfExperience: merged.yearsOfExperience ?? "",
    },
    skills: parseSkills(merged.skills),
    experiences: parseExperiences(merged.experiences),
    education: parseEducation(merged.education),
    updatedAt: toIsoString(merged.updatedAt),
  };
}

async function ensureAboutContentRecord(): Promise<AboutContentRecord> {
  const existing = await db.query.aboutContent.findFirst();
  if (existing) {
    return existing;
  }

  // Create empty record - will be filled via admin panel
  const [created] = await db.insert(aboutContent).values({
    headline: "",
    aboutMeText1: "",
    aboutMeText2: "",
    aboutMeText3: "",
    profileImagePath: "",
    aboutProfileImagePath: "",
    satisfiedClients: "",
    projectsCompleted: "",
    yearsOfExperience: "",
    skills: [],
    experiences: [],
    education: [],
  }).returning();
  return created;
}

export async function getAboutContent(): Promise<AboutContent> {
  try {
    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      console.warn("[AboutRepository] DATABASE_URL not available, returning default content");
      return mapAboutContent(null);
    }

    const record = await ensureAboutContentRecord();
    return mapAboutContent(record);
  } catch (error) {
    console.error("[AboutRepository] Failed to fetch about content", error);
    
    // During build time, if database is not available, return default content
    if (error instanceof Error && (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED'))) {
      console.warn("[AboutRepository] Database connection failed during build, using default content");
      return mapAboutContent(null);
    }
    
    return mapAboutContent(null);
  }
}

export async function updateAboutMainProfileImage(imageUrl: string): Promise<AboutContent> {
  const current = await ensureAboutContentRecord();

  const [updated] = await db
    .update(aboutContent)
    .set({
      profileImagePath: imageUrl,
      updatedAt: new Date(),
    })
    .where(eq(aboutContent.id, current.id))
    .returning();

  return mapAboutContent(updated ?? current);
}

export async function updateAboutProfileImage(imageUrl: string): Promise<AboutContent> {
  const current = await ensureAboutContentRecord();

  const [updated] = await db
    .update(aboutContent)
    .set({
      aboutProfileImagePath: imageUrl,
      updatedAt: new Date(),
    })
    .where(eq(aboutContent.id, current.id))
    .returning();

  return mapAboutContent(updated ?? current);
}

export async function updateAboutContent(input: AboutContentUpdateInput): Promise<AboutContent> {
  const current = await ensureAboutContentRecord();

  const [updated] = await db
    .update(aboutContent)
    .set({
      headline: input.headline,
      aboutMeText1: input.aboutMeText1,
      aboutMeText2: input.aboutMeText2,
      aboutMeText3: input.aboutMeText3,
      profileImagePath: input.profileImagePath,
      aboutProfileImagePath: input.aboutProfileImagePath,
      satisfiedClients: input.satisfiedClients,
      projectsCompleted: input.projectsCompleted,
      yearsOfExperience: input.yearsOfExperience,
      skills: input.skills,
      experiences: input.experiences,
      education: input.education,
      updatedAt: new Date(),
    })
    .where(eq(aboutContent.id, current.id))
    .returning();

  return mapAboutContent(updated ?? current);
}

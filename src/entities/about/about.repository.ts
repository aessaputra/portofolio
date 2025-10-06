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

const DEFAULT_SKILLS: AboutSkill[] = [
  { name: "HTML", x: "-21vw", y: "2vw" },
  { name: "CSS", x: "-6vw", y: "-9vw" },
  { name: "JavaScript", x: "19vw", y: "6vw" },
  { name: "React", x: "0vw", y: "10vw" },
  { name: "D3.js", x: "-21vw", y: "-15vw" },
  { name: "THREEJS", x: "19vw", y: "-12vw" },
  { name: "NextJS", x: "31vw", y: "-5vw" },
  { name: "Python", x: "19vw", y: "-20vw" },
  { name: "Tailwind CSS", x: "0vw", y: "-20vw" },
  { name: "Figma", x: "-24vw", y: "18vw" },
  { name: "Blender", x: "17vw", y: "17vw" },
];

const DEFAULT_EXPERIENCES: AboutExperience[] = [
  {
    position: "Lorem Ipsum",
    company: "Lorem Ipsum",
    companyLink: "/",
    time: "2022-Present",
    address: "Lorem, Ipsum",
    work: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    ],
  },
  {
    position: "Lorem Ipsum",
    company: "Lorem Ipsum",
    companyLink: "/",
    time: "2022-Present",
    address: "Lorem, Ipsum",
    work: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    ],
  },
  {
    position: "Lorem Ipsum",
    company: "Lorem Ipsum",
    companyLink: "/",
    time: "2022-Present",
    address: "Lorem, Ipsum",
    work: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    ],
  },
];

const DEFAULT_EDUCATION: AboutEducation[] = [
  {
    type: "Lorem Ipsum",
    time: "2022-2026",
    place: "Lorem Ipsum Dolor Sit Amet",
    info: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    type: "Lorem Ipsum",
    time: "2022-2026",
    place: "Lorem Ipsum Dolor Sit Amet",
    info: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    type: "Lorem Ipsum",
    time: "2022-2026",
    place: "Lorem Ipsum Dolor Sit Amet",
    info: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
];

export const DEFAULT_ABOUT_CONTENT: AboutContentUpdateInput = {
  headline: "Lorem Ipsum Dolor Sit Amet!",
  aboutMeText1:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  aboutMeText2:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  aboutMeText3:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  profileImagePath: "/images/profile/developer-pic-2.jpg",
  aboutProfileImagePath: "/images/profile/developer-pic-2.jpg",
  satisfiedClients: "8",
  projectsCompleted: "10",
  yearsOfExperience: "4",
  skills: DEFAULT_SKILLS,
  experiences: DEFAULT_EXPERIENCES,
  education: DEFAULT_EDUCATION,
};

function toIsoString(value: Date | string | null | undefined): string {
  if (!value) return new Date().toISOString();
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function parseSkills(value: unknown): AboutSkill[] {
  if (!Array.isArray(value)) return DEFAULT_SKILLS;
  return value
    .map((item) => ({
      name: typeof item?.name === "string" ? item.name : "",
      x: typeof item?.x === "string" ? item.x : "0",
      y: typeof item?.y === "string" ? item.y : "0",
    }))
    .filter((skill) => skill.name.trim() !== "");
}

function parseExperiences(value: unknown): AboutExperience[] {
  if (!Array.isArray(value)) return DEFAULT_EXPERIENCES;
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
  if (!Array.isArray(value)) return DEFAULT_EDUCATION;
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
      ...DEFAULT_ABOUT_CONTENT,
    } as AboutContentRecord;
  }

  return {
    ...record,
    headline: record.headline ?? DEFAULT_ABOUT_CONTENT.headline,
    aboutMeText1: record.aboutMeText1 ?? DEFAULT_ABOUT_CONTENT.aboutMeText1,
    aboutMeText2: record.aboutMeText2 ?? DEFAULT_ABOUT_CONTENT.aboutMeText2,
    aboutMeText3: record.aboutMeText3 ?? DEFAULT_ABOUT_CONTENT.aboutMeText3,
    profileImagePath: record.profileImagePath ?? DEFAULT_ABOUT_CONTENT.profileImagePath,
    aboutProfileImagePath: record.aboutProfileImagePath ?? DEFAULT_ABOUT_CONTENT.aboutProfileImagePath,
    satisfiedClients: record.satisfiedClients ?? DEFAULT_ABOUT_CONTENT.satisfiedClients,
    projectsCompleted: record.projectsCompleted ?? DEFAULT_ABOUT_CONTENT.projectsCompleted,
    yearsOfExperience: record.yearsOfExperience ?? DEFAULT_ABOUT_CONTENT.yearsOfExperience,
    skills: record.skills ?? DEFAULT_ABOUT_CONTENT.skills,
    experiences: record.experiences ?? DEFAULT_ABOUT_CONTENT.experiences,
    education: record.education ?? DEFAULT_ABOUT_CONTENT.education,
  } as AboutContentRecord;
}

function mapAboutContent(record: AboutContentRecord | null): AboutContent {
  const merged = mergeWithDefaults(record);

  return {
    id: merged.id,
    headline: merged.headline ?? DEFAULT_ABOUT_CONTENT.headline,
    aboutMeText1: merged.aboutMeText1 ?? DEFAULT_ABOUT_CONTENT.aboutMeText1,
    aboutMeText2: merged.aboutMeText2 ?? DEFAULT_ABOUT_CONTENT.aboutMeText2,
    aboutMeText3: merged.aboutMeText3 ?? DEFAULT_ABOUT_CONTENT.aboutMeText3,
    profileImagePath: ensurePublicR2Url(merged.profileImagePath ?? DEFAULT_ABOUT_CONTENT.profileImagePath),
    aboutProfileImagePath: ensurePublicR2Url(merged.aboutProfileImagePath ?? DEFAULT_ABOUT_CONTENT.aboutProfileImagePath),
    counters: {
      satisfiedClients: merged.satisfiedClients ?? DEFAULT_ABOUT_CONTENT.satisfiedClients,
      projectsCompleted: merged.projectsCompleted ?? DEFAULT_ABOUT_CONTENT.projectsCompleted,
      yearsOfExperience: merged.yearsOfExperience ?? DEFAULT_ABOUT_CONTENT.yearsOfExperience,
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

  const [created] = await db.insert(aboutContent).values(DEFAULT_ABOUT_CONTENT).returning();
  return created;
}

export async function getAboutContent(): Promise<AboutContent> {
  try {
    const record = await ensureAboutContentRecord();
    return mapAboutContent(record);
  } catch (error) {
    console.error("[AboutRepository] Failed to fetch about content", error);
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

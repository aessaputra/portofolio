import type { InferModel } from "drizzle-orm";

import { homeContent } from "@/db/schema";

export type HomeContentRecord = InferModel<typeof homeContent>;

export type HomeContent = {
  id: number;
  headline: string;
  subheadline: string;
  resumeUrl: string;
  contactEmail: string;
  profileImagePath: string;
  githubUrl: string;
  linkedinUrl: string;
  xUrl: string;
  showHireMe: boolean;
  updatedAt: string;
};

export type HomeContentUpdateInput = {
  headline: string;
  subheadline: string;
  resumeUrl: string;
  contactEmail: string;
  profileImagePath: string;
  githubUrl: string;
  linkedinUrl: string;
  xUrl: string;
  showHireMe: boolean;
};

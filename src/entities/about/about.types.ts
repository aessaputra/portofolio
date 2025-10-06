import type { InferModel } from "drizzle-orm";

import { aboutContent } from "@/db/schema";

export type AboutContentRecord = InferModel<typeof aboutContent>;

export type AboutSkill = {
  name: string;
  x: string;
  y: string;
};

export type AboutExperience = {
  position: string;
  company: string;
  companyLink: string;
  time: string;
  address: string;
  work: string[];
};

export type AboutEducation = {
  type: string;
  time: string;
  place: string;
  info: string;
};

export type AboutCounters = {
  satisfiedClients: string;
  projectsCompleted: string;
  yearsOfExperience: string;
};

export type AboutContent = {
  id: number;
  headline: string;
  aboutMeText1: string;
  aboutMeText2: string;
  aboutMeText3: string;
  profileImagePath: string;
  counters: AboutCounters;
  skills: AboutSkill[];
  experiences: AboutExperience[];
  education: AboutEducation[];
  updatedAt: string;
};

export type AboutContentUpdateInput = {
  headline: string;
  aboutMeText1: string;
  aboutMeText2: string;
  aboutMeText3: string;
  profileImagePath: string;
  satisfiedClients: string;
  projectsCompleted: string;
  yearsOfExperience: string;
  skills: AboutSkill[];
  experiences: AboutExperience[];
  education: AboutEducation[];
};

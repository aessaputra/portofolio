import type { AboutContent, AboutContentUpdateInput } from "@/entities/about";

type SerializedAboutContent = {
  satisfiedClients?: string;
  projectsCompleted?: string;
  yearsOfExperience?: string;
  skills?: AboutContent["skills"];
  experiences?: AboutContent["experiences"];
  education?: AboutContent["education"];
} & Partial<AboutContent>;

export type AboutFormState = {
  headline: string;
  aboutMeText1: string;
  aboutMeText2: string;
  aboutMeText3: string;
  profileImagePath: string;
  satisfiedClients: string;
  projectsCompleted: string;
  yearsOfExperience: string;
  skills: AboutContent["skills"];
  experiences: AboutContent["experiences"];
  education: AboutContent["education"];
};

export function aboutContentToFormState(content: SerializedAboutContent): AboutFormState {
  const counters = "counters" in content && content.counters
    ? content.counters
    : {
        satisfiedClients: content.satisfiedClients ?? "",
        projectsCompleted: content.projectsCompleted ?? "",
        yearsOfExperience: content.yearsOfExperience ?? "",
      };

  return {
    headline: content.headline ?? "",
    aboutMeText1: content.aboutMeText1 ?? "",
    aboutMeText2: content.aboutMeText2 ?? "",
    aboutMeText3: content.aboutMeText3 ?? "",
    profileImagePath: content.profileImagePath ?? "",
    satisfiedClients: counters.satisfiedClients,
    projectsCompleted: counters.projectsCompleted,
    yearsOfExperience: counters.yearsOfExperience,
    skills: content.skills ?? [],
    experiences: content.experiences ?? [],
    education: content.education ?? [],
  };
}

export function formStateToAboutContentInput(formState: AboutFormState): AboutContentUpdateInput {
  return {
    headline: formState.headline,
    aboutMeText1: formState.aboutMeText1,
    aboutMeText2: formState.aboutMeText2,
    aboutMeText3: formState.aboutMeText3,
    profileImagePath: formState.profileImagePath,
    satisfiedClients: formState.satisfiedClients,
    projectsCompleted: formState.projectsCompleted,
    yearsOfExperience: formState.yearsOfExperience,
    skills: formState.skills,
    experiences: formState.experiences,
    education: formState.education,
  };
}

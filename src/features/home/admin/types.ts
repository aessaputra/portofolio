import type { HomeContent, HomeContentUpdateInput } from "@/entities/home";

export type HomeFormState = {
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

export function homeContentToFormState(content: HomeContent): HomeFormState {
  return {
    headline: content.headline,
    subheadline: content.subheadline,
    resumeUrl: content.resumeUrl,
    contactEmail: content.contactEmail,
    profileImagePath: content.profileImagePath,
    githubUrl: content.githubUrl,
    linkedinUrl: content.linkedinUrl,
    xUrl: content.xUrl,
    showHireMe: content.showHireMe,
  };
}

export function formStateToHomeContentInput(formState: HomeFormState): HomeContentUpdateInput {
  return {
    headline: formState.headline,
    subheadline: formState.subheadline,
    resumeUrl: formState.resumeUrl,
    contactEmail: formState.contactEmail,
    profileImagePath: formState.profileImagePath,
    githubUrl: formState.githubUrl,
    linkedinUrl: formState.linkedinUrl,
    xUrl: formState.xUrl,
    showHireMe: Boolean(formState.showHireMe),
  };
}

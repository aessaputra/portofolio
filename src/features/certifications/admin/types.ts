import type {
  Certification,
  CertificationCreateInput,
} from "@/entities/certifications/certification.types";

export type CertificationFormState = {
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  credentialId: string;
  credentialUrl: string;
  imageUrl: string;
  imageAlt: string;
  description: string;
  tags: string;
  featured: boolean;
  displayOrder: number;
};

export function createEmptyCertificationFormState(): CertificationFormState {
  return {
    title: "",
    issuer: "",
    issueDate: "",
    expiryDate: "",
    credentialId: "",
    credentialUrl: "",
    imageUrl: "",
    imageAlt: "",
    description: "",
    tags: "",
    featured: false,
    displayOrder: 0,
  };
}

export function certificationToFormState(certification: Certification): CertificationFormState {
  return {
    title: certification.title,
    issuer: certification.issuer,
    issueDate: certification.issueDate,
    expiryDate: certification.expiryDate ?? "",
    credentialId: certification.credentialId ?? "",
    credentialUrl: certification.credentialUrl,
    imageUrl: certification.imageUrl,
    imageAlt: certification.imageAlt,
    description: certification.description ?? "",
    tags: certification.tags.join(", "),
    featured: certification.featured,
    displayOrder: certification.displayOrder,
  };
}

export function normalizeTagsInput(tags: string): string[] {
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

export function formStateToCertificationInput(
  formState: CertificationFormState
): CertificationCreateInput {
  return {
    title: formState.title,
    issuer: formState.issuer,
    issueDate: formState.issueDate,
    expiryDate: formState.expiryDate ? formState.expiryDate : null,
    credentialId: formState.credentialId ? formState.credentialId : null,
    credentialUrl: formState.credentialUrl,
    imageUrl: formState.imageUrl,
    imageAlt: formState.imageAlt,
    description: formState.description ? formState.description : null,
    tags: normalizeTagsInput(formState.tags),
    featured: formState.featured,
    displayOrder: Number.isFinite(formState.displayOrder)
      ? formState.displayOrder
      : 0,
  };
}

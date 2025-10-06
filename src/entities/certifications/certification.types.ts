import type { InferModel } from "drizzle-orm";

import { certifications } from "@/db/schema";

export type CertificationRecord = InferModel<typeof certifications>;

export type Certification = {
  id: number;
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate: string | null;
  credentialId: string | null;
  credentialUrl: string;
  imageUrl: string;
  imageAlt: string;
  description: string | null;
  tags: string[];
  featured: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CertificationCreateInput = {
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string | null;
  credentialId?: string | null;
  credentialUrl: string;
  imageUrl: string;
  imageAlt: string;
  description?: string | null;
  tags?: string[];
  featured?: boolean;
  displayOrder?: number;
};

export type CertificationUpdateInput = CertificationCreateInput;

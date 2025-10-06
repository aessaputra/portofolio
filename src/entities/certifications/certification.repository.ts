import { asc, desc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { certifications } from "@/db/schema";
import { ensurePublicR2Url } from "@/shared/lib/storage";

import type {
  Certification,
  CertificationCreateInput,
  CertificationRecord,
  CertificationUpdateInput,
} from "./certification.types";

function toIsoString(value: Date | string): string {
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function mapCertification(record: CertificationRecord): Certification {
  return {
    id: record.id,
    title: record.title,
    issuer: record.issuer,
    issueDate: record.issueDate,
    expiryDate: record.expiryDate ?? null,
    credentialId: record.credentialId ?? null,
    credentialUrl: record.credentialUrl,
    imageUrl: ensurePublicR2Url(record.imageUrl),
    imageAlt: record.imageAlt,
    description: record.description ?? null,
    tags: (record.tags ?? []) as string[],
    featured: record.featured,
    displayOrder: record.displayOrder,
    createdAt: toIsoString(record.createdAt),
    updatedAt: toIsoString(record.updatedAt),
  };
}

type GetCertificationsOptions = {
  featuredOnly?: boolean;
  limit?: number;
};

export async function getCertifications(options: GetCertificationsOptions = {}): Promise<Certification[]> {
  const { featuredOnly = false, limit } = options;

  let query: any = db
    .select()
    .from(certifications)
    .orderBy(asc(certifications.displayOrder), desc(certifications.createdAt));

  if (featuredOnly) {
    query = query.where(eq(certifications.featured, true));
  }

  if (limit && limit > 0) {
    query = query.limit(limit);
  }

  const rows = await query;
  return rows.map(mapCertification);
}

export async function getCertificationById(id: number): Promise<Certification | null> {
  const record = await db.query.certifications.findFirst({
    where: eq(certifications.id, id),
  });
  return record ? mapCertification(record) : null;
}

export async function createCertification(input: CertificationCreateInput): Promise<Certification> {
  const [record] = await db
    .insert(certifications)
    .values({
      title: input.title,
      issuer: input.issuer,
      issueDate: input.issueDate,
      expiryDate: input.expiryDate ?? null,
      credentialId: input.credentialId ?? null,
      credentialUrl: input.credentialUrl,
      imageUrl: input.imageUrl,
      imageAlt: input.imageAlt,
      description: input.description ?? null,
      tags: input.tags ?? [],
      featured: Boolean(input.featured),
      displayOrder: input.displayOrder ?? 0,
    })
    .returning();

  return mapCertification(record);
}

export async function updateCertification(id: number, input: CertificationUpdateInput): Promise<Certification | null> {
  const [record] = await db
    .update(certifications)
    .set({
      title: input.title,
      issuer: input.issuer,
      issueDate: input.issueDate,
      expiryDate: input.expiryDate ?? null,
      credentialId: input.credentialId ?? null,
      credentialUrl: input.credentialUrl,
      imageUrl: input.imageUrl,
      imageAlt: input.imageAlt,
      description: input.description ?? null,
      tags: input.tags ?? [],
      featured: Boolean(input.featured),
      displayOrder: input.displayOrder ?? 0,
      updatedAt: new Date(),
    })
    .where(eq(certifications.id, id))
    .returning();

  return record ? mapCertification(record) : null;
}

export async function deleteCertification(id: number): Promise<boolean> {
  const result = await db.delete(certifications).where(eq(certifications.id, id));
  return (result.rowCount ?? 0) > 0;
}

export async function updateCertificationImage(id: number, imageUrl: string): Promise<boolean> {
  const result = await db
    .update(certifications)
    .set({
      imageUrl,
      updatedAt: new Date(),
    })
    .where(eq(certifications.id, id));

  return (result.rowCount ?? 0) > 0;
}


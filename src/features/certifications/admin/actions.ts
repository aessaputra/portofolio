"use server";

import { revalidatePath } from "next/cache";

import {
  getCertifications,
  getCertificationById,
  createCertification,
  deleteCertification,
  updateCertification,
  updateCertificationImage,
  type CertificationCreateInput,
} from "@/entities/certifications";
import { requireAdmin } from "@/features/auth/server/nextAuth";
import {
  deleteCertificationImage,
  uploadCertificationImage,
} from "@/features/certifications/admin/service";

const ADMIN_CERTIFICATIONS_PATH = "/admin/certifications";
const PUBLIC_CERTIFICATIONS_PATH = "/certifications";

export async function listCertificationsAction() {
  await requireAdmin();

  return getCertifications();
}

export async function getCertificationByIdAction(id: number) {
  await requireAdmin();

  return getCertificationById(id);
}

export async function createCertificationAction(input: CertificationCreateInput) {
  await requireAdmin();

  const created = await createCertification(input);

  revalidatePath(ADMIN_CERTIFICATIONS_PATH);
  revalidatePath(PUBLIC_CERTIFICATIONS_PATH);

  return created;
}

export async function updateCertificationAction(
  id: number,
  input: CertificationCreateInput
) {
  await requireAdmin();

  const updated = await updateCertification(id, input);
  if (!updated) {
    throw new Error("Certification not found");
  }

  revalidatePath(ADMIN_CERTIFICATIONS_PATH);
  revalidatePath(PUBLIC_CERTIFICATIONS_PATH);

  return updated;
}

export async function deleteCertificationAction(id: number) {
  await requireAdmin();

  const existing = await getCertificationById(id);

  const deleted = await deleteCertification(id);
  if (!deleted) {
    throw new Error("Certification not found");
  }

  if (existing?.imageUrl) {
    try {
      await deleteCertificationImage(existing.imageUrl);
    } catch (error) {
      console.error("Failed to delete certification image", error);
    }
  }

  revalidatePath(ADMIN_CERTIFICATIONS_PATH);
  revalidatePath(PUBLIC_CERTIFICATIONS_PATH);
}

export async function uploadCertificationImageAction(formData: FormData) {
  await requireAdmin();

  const file = formData.get("image");
  if (!(file instanceof File)) {
    throw new Error("Image file is required");
  }

  const certificationIdValue = formData.get("certificationId");
  const certificationId =
    typeof certificationIdValue === "string" && certificationIdValue.trim() !== ""
      ? Number.parseInt(certificationIdValue, 10)
      : null;

  if (certificationId !== null && Number.isNaN(certificationId)) {
    throw new Error("Invalid certification identifier");
  }

  const result = await uploadCertificationImage(file);

  if (typeof certificationId === "number") {
    await updateCertificationImage(certificationId, result.imageUrl);
  }

  revalidatePath(ADMIN_CERTIFICATIONS_PATH);
  revalidatePath(PUBLIC_CERTIFICATIONS_PATH);

  return result;
}

export async function deleteCertificationImageAction(formData: FormData) {
  await requireAdmin();

  const imageUrl = formData.get("imageUrl");
  if (typeof imageUrl !== "string" || imageUrl.trim() === "") {
    throw new Error("Image URL is required");
  }

  await deleteCertificationImage(imageUrl);

  revalidatePath(ADMIN_CERTIFICATIONS_PATH);
  revalidatePath(PUBLIC_CERTIFICATIONS_PATH);
}

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { userProfiles } from "@/db/schema";
import type { UserProfile, CreateUserProfileData, UpdateUserProfileData } from "./user-profile.types";

export async function getUserProfileByEmail(email: string): Promise<UserProfile | null> {
  const result = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.email, email),
  });

  return result || null;
}

export async function createUserProfile(data: CreateUserProfileData): Promise<UserProfile> {
  const [result] = await db
    .insert(userProfiles)
    .values({
      email: data.email,
      name: data.name || null,
      profileImageUrl: data.profileImageUrl || null,
    })
    .returning();

  return result;
}

export async function updateUserProfile(
  email: string,
  data: UpdateUserProfileData
): Promise<UserProfile | null> {
  const [result] = await db
    .update(userProfiles)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(userProfiles.email, email))
    .returning();

  return result || null;
}

export async function upsertUserProfile(data: CreateUserProfileData): Promise<UserProfile> {
  const existing = await getUserProfileByEmail(data.email);
  
  if (existing) {
    return await updateUserProfile(data.email, {
      name: data.name,
      profileImageUrl: data.profileImageUrl,
    }) || existing;
  }
  
  return await createUserProfile(data);
}

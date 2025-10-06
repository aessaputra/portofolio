/**
 * Server-only admin authorization utility.
 * Uses the shared admin allowlist for email checks.
 */

import { isAllowedAdminEmail } from "@/shared/lib/adminAllowlist";

export type MinimalAuthUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
};

export function isAdmin(user: MinimalAuthUser | null | undefined): boolean {
  if (!user?.email) {
    return false;
  }

  return isAllowedAdminEmail(user.email);
}

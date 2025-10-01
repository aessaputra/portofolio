/**
 * Server-only admin authorization utility.
 * Reads ADMIN_EMAILS env, normalizes, and checks Clerk user emails.
 * Do not import this into client components.
 */

export type MinimalClerkEmail = {
  emailAddress: string | null;
  verification?: {
    status?: string | null;
  } | null;
};

export type MinimalClerkUser = {
  id: string;
  primaryEmailAddress?: MinimalClerkEmail | null;
  emailAddresses?: MinimalClerkEmail[] | null;
  // Add support for Clerk's User object structure
  email?: string | null;
  primaryEmail_address?: string | null;
};

function buildAdminSet(): Set<string> {
  const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "";
  const set = new Set<string>();
  raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .forEach((email) => set.add(email));
  if (process.env.NODE_ENV !== "production") {
    // Server-only sanity log; never reaches client
    // eslint-disable-next-line no-console
    console.log("[isAdmin] ADMIN_EMAILS normalized:", Array.from(set));
  }
  return set;
}

const ADMIN_SET = buildAdminSet();

function collectUserEmails(user: MinimalClerkUser | null | undefined): string[] {
  if (!user) return [];
  const list: string[] = [];
  
  // Check for direct email property (Clerk's User object)
  if (user.email) {
    list.push(user.email);
  }
  
  // Check for primaryEmail_address property (alternative Clerk structure)
  if (user.primaryEmail_address) {
    list.push(user.primaryEmail_address);
  }
  
  // Check for primaryEmailAddress object
  const primary = user.primaryEmailAddress?.emailAddress ?? null;
  if (primary) list.push(primary);
  
  // Check all email addresses, not just verified ones
  const allEmails = (user.emailAddresses ?? []).filter((e) => {
    return !!e?.emailAddress;
  });
  for (const e of allEmails) {
    if (e.emailAddress) list.push(e.emailAddress);
  }
  
  // Also check verified emails if available
  const verified = (user.emailAddresses ?? []).filter((e) => {
    const status = e?.verification?.status ?? null;
    return !!e?.emailAddress && status === "verified";
  });
  for (const e of verified) {
    if (e.emailAddress) list.push(e.emailAddress);
  }
  
  // normalize unique lowercase
  const normalized = new Set(list.map((e) => e.trim().toLowerCase()).filter(Boolean));
  return Array.from(normalized);
}

export function isAdmin(user: MinimalClerkUser | null | undefined): boolean {
  if (!user) return false;
  if (ADMIN_SET.size === 0) {
    // eslint-disable-next-line no-console
    console.log("[isAdmin] No admin emails configured in NEXT_PUBLIC_ADMIN_EMAILS");
    return false;
  }
  
  const emails = collectUserEmails(user);
  if (emails.length === 0) {
    // eslint-disable-next-line no-console
    console.log("[isAdmin] No emails found for user:", user.id);
    return false;
  }
  
  // eslint-disable-next-line no-console
  console.log("[isAdmin] Checking user emails:", emails, "against admin set:", Array.from(ADMIN_SET));
  
  for (const e of emails) {
    if (ADMIN_SET.has(e)) {
      // eslint-disable-next-line no-console
      console.log("[isAdmin] User is admin with email:", e);
      return true;
    }
  }
  
  // eslint-disable-next-line no-console
  console.log("[isAdmin] User is not admin. Emails checked:", emails);
  return false;
}
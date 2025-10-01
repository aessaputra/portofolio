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
};

function buildAdminSet(): Set<string> {
  const raw = process.env.ADMIN_EMAILS ?? "";
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
  const primary = user.primaryEmailAddress?.emailAddress ?? null;
  if (primary) list.push(primary);
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
  if (ADMIN_SET.size === 0) return false;
  const emails = collectUserEmails(user);
  if (emails.length === 0) return false;
  for (const e of emails) {
    if (ADMIN_SET.has(e)) return true;
  }
  return false;
}
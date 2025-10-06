/**
 * Shared utilities for admin email authorization.
 * Ensures a single source of truth for the allowlist that protects admin routes.
 */

const ALLOWLIST_ENV_WARNING =
  "[AdminAuthConfig] Using NEXT_PUBLIC_ADMIN_EMAILS as fallback for ADMIN_EMAIL_ALLOWLIST. Update your environment configuration.";

function resolveAllowlistSource(): string {
  if (process.env.ADMIN_EMAIL_ALLOWLIST && process.env.ADMIN_EMAIL_ALLOWLIST.trim() !== "") {
    return process.env.ADMIN_EMAIL_ALLOWLIST;
  }

  if (process.env.NEXT_PUBLIC_ADMIN_EMAILS && process.env.NEXT_PUBLIC_ADMIN_EMAILS.trim() !== "") {
    if (process.env.NODE_ENV !== "production") {
      console.warn(ALLOWLIST_ENV_WARNING);
    }

    return process.env.NEXT_PUBLIC_ADMIN_EMAILS;
  }

  return "";
}

function buildAllowlist(): Set<string> {
  const raw = resolveAllowlistSource();
  const entries = raw
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value.length > 0);

  if (entries.length === 0) {
    throw new Error(
      "ADMIN_EMAIL_ALLOWLIST must contain at least one authorized administrator email."
    );
  }

  return new Set(entries);
}

const allowlist = buildAllowlist();

export function getAdminEmailAllowlist(): string[] {
  return Array.from(allowlist);
}

export function isAllowedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return allowlist.has(email.trim().toLowerCase());
}

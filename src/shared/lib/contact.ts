const MAILTO_PREFIX = "mailto:";

function extractEmail(value: string | null | undefined): string {
  if (!value) return "";
  return value.startsWith(MAILTO_PREFIX) ? value.slice(MAILTO_PREFIX.length) : value;
}

export function normalizeMailto(value: string | null | undefined): string {
  const email = extractEmail(value);
  if (!email) {
    return MAILTO_PREFIX;
  }
  return `${MAILTO_PREFIX}${email}`;
}

export function deriveNameFromEmail(value: string | null | undefined, fallback = "Portfolio Owner"): string {
  const email = extractEmail(value);
  if (!email) {
    return fallback;
  }
  const [localPart] = email.split("@");
  if (!localPart) {
    return fallback;
  }
  const words = localPart
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1));

  return words.length > 0 ? words.join(" ") : fallback;
}

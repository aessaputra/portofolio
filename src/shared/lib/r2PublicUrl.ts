/**
 * Shared helpers for working with Cloudflare R2 public URLs.
 *
 * The logic lives outside of the server-only storage client so that it can be
 * consumed by both Server and Client Components without duplicating the
 * normalization rules. All configuration values fall back to the `NEXT_PUBLIC`
 * variants so that the helpers continue to work in the browser bundle.
 */

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

type R2PublicConfig = {
  publicUrl: string;
  bucket: string;
  normalizedPublicUrl: string;
  normalizedBucket: string;
  publicUrlIncludesBucket: boolean;
};

let cachedConfig: R2PublicConfig | null = null;

function readEnv(name: string): string {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
}

function normalizePublicUrl(value: string): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed || trimmed === "/") return "";
  return trimmed.replace(/\/$/, "");
}

function normalizeBucket(value: string): string {
  if (!value) return "";
  return value.trim().replace(/^\/+|\/+$/g, "");
}

function computeConfig(): R2PublicConfig {
  const publicUrl =
    readEnv("CLOUDFLARE_R2_PUBLIC_URL") ||
    readEnv("NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL");

  const bucket =
    readEnv("CLOUDFLARE_R2_BUCKET_NAME") ||
    readEnv("NEXT_PUBLIC_CLOUDFLARE_R2_BUCKET_NAME");

  // Validate required environment variables
  if (!publicUrl) {
    throw new Error(
      "CLOUDFLARE_R2_PUBLIC_URL or NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL environment variable is required"
    );
  }

  if (!bucket) {
    throw new Error(
      "CLOUDFLARE_R2_BUCKET_NAME or NEXT_PUBLIC_CLOUDFLARE_R2_BUCKET_NAME environment variable is required"
    );
  }

  const normalizedBucket = normalizeBucket(bucket);
  const normalizedPublicUrl = normalizePublicUrl(publicUrl);

  if (!normalizedPublicUrl) {
    throw new Error("Invalid CLOUDFLARE_R2_PUBLIC_URL: URL cannot be empty");
  }

  const publicUrlIncludesBucket =
    Boolean(normalizedPublicUrl) &&
    Boolean(normalizedBucket) &&
    normalizedPublicUrl.endsWith(`/${normalizedBucket}`);

  return {
    publicUrl,
    bucket,
    normalizedPublicUrl,
    normalizedBucket,
    publicUrlIncludesBucket,
  };
}

export function getR2PublicConfig(): R2PublicConfig {
  if (!cachedConfig) {
    cachedConfig = computeConfig();
  }
  return cachedConfig;
}

type BuildUrlOptions = {
  fallbackToBase?: boolean;
};

export function buildR2PublicUrlFromKey(
  objectKey: string,
  options: BuildUrlOptions = {}
): string {
  const { fallbackToBase = false } = options;
  const config = getR2PublicConfig();

  const keyPart = objectKey.replace(/^\/+/, "");

  if (!keyPart) {
    return fallbackToBase ? config.normalizedPublicUrl : "";
  }

  // For R2.dev domains, don't include bucket name in path
  if (config.normalizedPublicUrl.includes('.r2.dev')) {
    return `${config.normalizedPublicUrl}/${keyPart}`;
  }

  if (!config.normalizedBucket) {
    return `${config.normalizedPublicUrl}/${keyPart}`;
  }

  if (config.publicUrlIncludesBucket) {
    return `${config.normalizedPublicUrl}/${keyPart}`;
  }

  return `${config.normalizedPublicUrl}/${config.normalizedBucket}/${keyPart}`;
}

export function resolveR2PublicUrl(value: string): string {
  if (!value) {
    return value;
  }

  if (ABSOLUTE_URL_PATTERN.test(value)) {
    return value;
  }

  if (value.startsWith("/")) {
    return value;
  }

  return buildR2PublicUrlFromKey(value, { fallbackToBase: true });
}

export function isR2HostedUrl(url: string): boolean {
  if (!url) return false;
  const config = getR2PublicConfig();
  return url.startsWith(config.normalizedPublicUrl);
}

export function extractR2ObjectKey(url: string): string | null {
  const config = getR2PublicConfig();
  if (!url || !url.startsWith(config.normalizedPublicUrl)) {
    return null;
  }

  let remainder = url.slice(config.normalizedPublicUrl.length);
  if (remainder.startsWith("/")) {
    remainder = remainder.slice(1);
  }

  if (!remainder) {
    return null;
  }

  if (config.normalizedBucket && !config.publicUrlIncludesBucket) {
    const bucketPrefix = `${config.normalizedBucket}/`;
    if (remainder.startsWith(bucketPrefix)) {
      remainder = remainder.slice(bucketPrefix.length);
    } else {
      return null;
    }
  }

  return remainder || null;
}

export function resetR2PublicConfigCache(): void {
  cachedConfig = null;
}


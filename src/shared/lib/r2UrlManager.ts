/**
 * Enhanced R2 URL management with Vercel-specific optimizations
 * Consolidates functionality from the previous r2UrlManager.ts and r2PublicUrl.ts
 */

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

type R2UrlConfig = {
  publicUrl: string;
  nextPublicUrl: string;
  bucket: string;
  nextPublicBucket: string;
  normalizedPublicUrl: string;
  normalizedBucket: string;
  publicUrlIncludesBucket: boolean;
  isR2DevDomain: boolean;
  accountId: string;
  isProduction: boolean;
  isVercel: boolean;
  effectivePublicUrl: string;
};

type BuildUrlOptions = {
  fallbackToBase?: boolean;
  useDirectR2?: boolean;
  useCustomDomain?: boolean;
};

let cachedConfig: R2UrlConfig | null = null;

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

function computeConfig(): R2UrlConfig {
  // Read environment variables
  const publicUrl = readEnv("CLOUDFLARE_R2_PUBLIC_URL");
  const bucket = readEnv("CLOUDFLARE_R2_BUCKET_NAME");
  const accountId = readEnv("CLOUDFLARE_ACCOUNT_ID");
  const nodeEnv = readEnv("NODE_ENV");
  const vercelEnv = readEnv("VERCEL_ENV");

  const isProduction = nodeEnv === "production" || vercelEnv === "production";
  const isVercel = !!vercelEnv;

  const effectivePublicUrl = publicUrl;
  const effectiveBucket = bucket;

  // Validate required environment variables
  if (!effectivePublicUrl) {
    throw new Error("CLOUDFLARE_R2_PUBLIC_URL environment variable is required");
  }

  if (!effectiveBucket) {
    throw new Error("CLOUDFLARE_R2_BUCKET_NAME environment variable is required");
  }

  if (!accountId) {
    throw new Error("CLOUDFLARE_ACCOUNT_ID environment variable is required");
  }

  const normalizedBucket = normalizeBucket(effectiveBucket);
  const normalizedPublicUrl = normalizePublicUrl(effectivePublicUrl);

  if (!normalizedPublicUrl) {
    throw new Error("Invalid CLOUDFLARE_R2_PUBLIC_URL: URL cannot be empty");
  }

  const publicUrlIncludesBucket =
    Boolean(normalizedPublicUrl) &&
    Boolean(normalizedBucket) &&
    normalizedPublicUrl.endsWith(`/${normalizedBucket}`);

  const isR2DevDomain = normalizedPublicUrl.includes('.r2.dev');

  return {
    publicUrl,
    nextPublicUrl: "",
    bucket,
    nextPublicBucket: "",
    normalizedPublicUrl,
    normalizedBucket,
    publicUrlIncludesBucket,
    isR2DevDomain,
    accountId,
    isProduction,
    isVercel,
    effectivePublicUrl,
  };
}

export function getR2UrlConfig(): R2UrlConfig {
  if (!cachedConfig) {
    cachedConfig = computeConfig();
  }
  return cachedConfig;
}

/**
 * Build a public URL for an R2 object with multiple fallback options
 * Optimized for Vercel deployment
 */
export function buildR2PublicUrl(
  objectKey: string,
  options: BuildUrlOptions = {}
): string {
  const { 
    fallbackToBase = false, 
    useDirectR2 = false,
    useCustomDomain = true 
  } = options;
  
  const config = getR2UrlConfig();

  const keyPart = objectKey.replace(/^\/+/, "");

  if (!keyPart) {
    return fallbackToBase ? config.normalizedPublicUrl : "";
  }

  // Priority order optimized for Vercel:
  // 1. Direct R2 URL (if requested or in development)
  // 2. Custom domain (if available and requested)
  // 3. Fallback to base URL

  if (useDirectR2 || (config.isR2DevDomain && !config.isProduction)) {
    // Use direct R2 URL for development or when explicitly requested
    const directUrl = `https://${config.accountId}.r2.cloudflarestorage.com/${config.normalizedBucket}/${keyPart}`;
    return directUrl;
  }

  if (useCustomDomain && !config.isR2DevDomain) {
    // Use custom domain for production - never include bucket in path
    const customDomainUrl = `${config.normalizedPublicUrl}/${keyPart}`;
    return customDomainUrl;
  }

  // Fallback to base URL
  let fallbackUrl;
  if (config.publicUrlIncludesBucket) {
    fallbackUrl = `${config.normalizedPublicUrl}/${keyPart}`;
  } else {
    fallbackUrl = `${config.normalizedPublicUrl}/${config.normalizedBucket}/${keyPart}`;
  }
  
  return fallbackUrl;
}

/**
 * Build a direct R2 URL (bypassing custom domain)
 */
export function buildDirectR2Url(objectKey: string): string {
  const config = getR2UrlConfig();
  const keyPart = objectKey.replace(/^\/+/, "");
  
  if (!keyPart) return "";
  
  const directUrl = `https://${config.accountId}.r2.cloudflarestorage.com/${config.normalizedBucket}/${keyPart}`;
  return directUrl;
}

/**
 * Build a custom domain URL
 */
export function buildCustomDomainUrl(objectKey: string): string {
  const config = getR2UrlConfig();
  const keyPart = objectKey.replace(/^\/+/, "");
  
  if (!keyPart) return "";
  
  // Never include bucket in path
  const customDomainUrl = `${config.normalizedPublicUrl}/${keyPart}`;
  return customDomainUrl;
}

/**
 * Resolve an R2 URL with intelligent fallback
 */
export function resolveR2Url(value: string): string {
  if (!value) {
    return value;
  }

  if (ABSOLUTE_URL_PATTERN.test(value)) {
    return value;
  }

  if (value.startsWith("/")) {
    return value;
  }

  const resolvedUrl = buildR2PublicUrl(value, { fallbackToBase: true });
  return resolvedUrl;
}

/**
 * Check if a URL is hosted on R2
 */
export function isR2HostedUrl(url: string): boolean {
  if (!url) return false;
  const config = getR2UrlConfig();
  const isHosted = url.startsWith(config.normalizedPublicUrl) || 
                  url.includes(`${config.accountId}.r2.cloudflarestorage.com`);
  
  return isHosted;
}

/**
 * Extract object key from R2 URL
 */
export function extractR2ObjectKey(url: string): string | null {
  const config = getR2UrlConfig();
  if (!url) return null;

  // Try custom domain first
  if (url.startsWith(config.normalizedPublicUrl)) {
    let remainder = url.slice(config.normalizedPublicUrl.length);
    if (remainder.startsWith("/")) {
      remainder = remainder.slice(1);
    }

    if (!remainder) return null;

    if (config.normalizedBucket && !config.publicUrlIncludesBucket) {
      const bucketPrefix = `${config.normalizedBucket}/`;
      if (remainder.startsWith(bucketPrefix)) {
        const extractedKey = remainder.slice(bucketPrefix.length);
        return extractedKey;
      }
      return null;
    }

    return remainder || null;
  }

  // Try direct R2 URL
  const directR2Pattern = new RegExp(`https://${config.accountId}\\.r2\\.cloudflarestorage\\.com/${config.normalizedBucket}/(.+)`);
  const directMatch = url.match(directR2Pattern);
  if (directMatch) {
    return directMatch[1];
  }

  return null;
}

/**
 * Get all possible URLs for an object (custom domain, direct R2, etc.)
 */
export function getAllPossibleUrls(objectKey: string): {
  customDomain: string;
  directR2: string;
  r2DevDomain: string;
} {
  const config = getR2UrlConfig();
  const keyPart = objectKey.replace(/^\/+/, "");
  
  if (!keyPart) {
    return {
      customDomain: "",
      directR2: "",
      r2DevDomain: "",
    };
  }

  const urls = {
    customDomain: buildCustomDomainUrl(keyPart),
    directR2: buildDirectR2Url(keyPart),
    r2DevDomain: `https://${config.normalizedBucket}.${config.accountId}.r2.dev/${keyPart}`,
  };
  
  return urls;
}

/**
 * Reset the configuration cache (useful for testing)
 */
export function resetR2UrlConfigCache(): void {
  cachedConfig = null;
}
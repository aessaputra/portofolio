/**
 * Shared helpers for working with Cloudflare R2 public URLs.
 * 
 * This file now delegates to the consolidated r2UrlManager.ts
 * to avoid code duplication and ensure consistent behavior.
 */

import {
  buildR2PublicUrl as buildR2PublicUrlFromManager,
  resolveR2Url as resolveR2UrlFromManager,
  isR2HostedUrl as isR2HostedUrlFromManager,
  extractR2ObjectKey as extractR2ObjectKeyFromManager,
  getR2UrlConfig,
  resetR2UrlConfigCache,
} from "@/shared/lib/r2UrlManager";

type BuildUrlOptions = {
  fallbackToBase?: boolean;
};

/**
 * Build a public URL for an R2 object
 * @deprecated Use buildR2PublicUrl from r2UrlManager instead
 */
export function buildR2PublicUrlFromKey(
  objectKey: string,
  options: BuildUrlOptions = {}
): string {
  return buildR2PublicUrlFromManager(objectKey, options);
}

/**
 * Resolve an R2 URL with intelligent fallback
 * @deprecated Use resolveR2Url from r2UrlManager instead
 */
export function resolveR2PublicUrl(value: string): string {
  return resolveR2UrlFromManager(value);
}

/**
 * Check if a URL is hosted on R2
 * @deprecated Use isR2HostedUrl from r2UrlManager instead
 */
export function isR2HostedUrl(url: string): boolean {
  return isR2HostedUrlFromManager(url);
}

/**
 * Extract object key from R2 URL
 * @deprecated Use extractR2ObjectKey from r2UrlManager instead
 */
export function extractR2ObjectKey(url: string): string | null {
  return extractR2ObjectKeyFromManager(url);
}

/**
 * Get R2 public configuration
 * @deprecated Use getR2UrlConfig from r2UrlManager instead
 */
export function getR2PublicConfig() {
  return getR2UrlConfig();
}

/**
 * Reset the R2 public configuration cache
 * @deprecated Use resetR2UrlConfigCache from r2UrlManager instead
 */
export function resetR2PublicConfigCache(): void {
  resetR2UrlConfigCache();
}

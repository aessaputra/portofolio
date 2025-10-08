import "server-only";

import { 
  DeleteObjectCommand, 
  GetObjectCommand, 
  HeadObjectCommand, 
  PutObjectCommand, 
  S3Client 
} from "@aws-sdk/client-s3";
import {
  buildR2PublicUrl as buildR2PublicUrlFromManager,
  buildDirectR2Url,
  buildCustomDomainUrl,
  getAllPossibleUrls,
  extractR2ObjectKey,
} from "@/shared/lib/r2UrlManager";
import { r2Client as r2ClientInstance, r2Config, validateR2Config } from "@/shared/lib/r2Client";

// Validate configuration at module load
validateR2Config();

// Constants
const DEFAULT_CACHE_CONTROL = "public, max-age=31536000, immutable"; // 1 year
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const MAX_RETRIES = 3; // Maximum number of retries for failed operations
const RETRY_DELAY = 1000; // Delay between retries in milliseconds

// Types
export type PutObjectOptions = {
  cacheControl?: string;
  metadata?: Record<string, string>;
  contentDisposition?: string;
};

export type ImageType = "profile" | "project" | "certification" | "about" | "general";

export type UploadResult = {
  success: boolean;
  url?: string;
  directUrl?: string;
  customDomainUrl?: string;
  error?: string;
  objectKey?: string;
  retries?: number;
};

type UrlCheckResult = {
  customDomain: {
    url: string;
    accessible: boolean;
    status?: number;
    error?: string;
  };
  directR2: {
    url: string;
    accessible: boolean;
    status?: number;
    error?: string;
  };
  r2DevDomain: {
    url: string;
    accessible: boolean;
    status?: number;
    error?: string;
  };
};

// Retry utility for R2 operations
async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries: number = MAX_RETRIES
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation();
      return result;
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.name === "NoSuchBucket" || 
          error.name === "AccessDenied" || 
          error.name === "InvalidAccessKeyId" || 
          error.name === "SignatureDoesNotMatch") {
        throw error;
      }
      
      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
    }
  }
  
  if (!lastError) {
    throw new Error(`Unknown error during ${operationName}`);
  }
  
  throw lastError;
}

// File validation utilities
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  if (file.size === 0) {
    return { valid: false, error: "File is empty" };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `File size exceeds limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
    };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}` 
    };
  }

  return { valid: true };
}

export function generateUniqueFilename(
  originalName: string,
  type: ImageType = "general"
): string {
  const extension = originalName.split(".").pop()?.toLowerCase() ?? "jpg";
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).slice(2, 8);
  return `${type}-${timestamp}-${randomString}.${extension}`;
}

/**
 * Upload an image to R2 with enhanced error handling, retry logic, and fallback URLs
 * Optimized for Vercel serverless environment
 */
export async function uploadImageToR2(
  file: Buffer | Uint8Array,
  contentType: string,
  objectKey: string,
  options: PutObjectOptions = {},
  retryCount: number = 0
): Promise<UploadResult> {
  try {
    // Validate input parameters
    if (!file || file.length === 0) {
      return { success: false, error: "File buffer is empty or invalid" };
    }
    
    if (!contentType || !contentType.trim()) {
      return { success: false, error: "Content type is required" };
    }
    
    if (!objectKey || !objectKey.trim()) {
      return { success: false, error: "Object key is required" };
    }

    // Validate content type
    if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
      return { 
        success: false, 
        error: `Invalid content type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}` 
      };
    }

    // Validate file size
    if (file.length > MAX_FILE_SIZE) {
      return { 
        success: false, 
        error: `File size exceeds limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
      };
    }

    const command = new PutObjectCommand({
      Bucket: r2Config.bucket,
      Key: objectKey,
      Body: file,
      ContentType: contentType,
      CacheControl: options.cacheControl ?? DEFAULT_CACHE_CONTROL,
      Metadata: {
        ...options.metadata,
        "upload-timestamp": new Date().toISOString(),
        "content-type": contentType,
        "environment": r2Config.isProduction ? "production" : "development",
        "platform": r2Config.isVercel ? "vercel" : "other",
      },
      ContentDisposition: options.contentDisposition ?? "inline",
    });

    // Use retry logic for the upload operation
    const result = await withRetry(() => r2ClientInstance.send(command), "Upload to R2");
    
    if (result.$metadata.httpStatusCode && result.$metadata.httpStatusCode >= 400) {
      return { 
        success: false, 
        error: `Upload failed with status ${result.$metadata.httpStatusCode}` 
      };
    }

    // Generate all possible URLs
    const urls = getAllPossibleUrls(objectKey);

    return {
      success: true,
      url: buildR2PublicUrlFromManager(objectKey),
      directUrl: urls.directR2,
      customDomainUrl: urls.customDomain,
      objectKey,
      retries: retryCount,
    };
  } catch (error: any) {
    // Handle specific R2 errors
    if (error.name === "NoSuchBucket") {
      return { success: false, error: `R2 bucket '${r2Config.bucket}' does not exist or is not accessible` };
    } else if (error.name === "AccessDenied") {
      return { success: false, error: "Access denied to R2 bucket. Check your credentials and bucket permissions" };
    } else if (error.name === "InvalidAccessKeyId") {
      return { success: false, error: "Invalid R2 access key ID" };
    } else if (error.name === "SignatureDoesNotMatch") {
      return { success: false, error: "R2 secret access key is invalid" };
    } else if (error.$metadata?.httpStatusCode === 403) {
      return { success: false, error: "Forbidden: Check R2 bucket permissions and credentials" };
    } else if (error.$metadata?.httpStatusCode === 404) {
      return { success: false, error: "R2 bucket or endpoint not found" };
    } else if (error.$metadata?.httpStatusCode >= 500) {
      return { success: false, error: "R2 service error. Please try again later" };
    } else {
      return { success: false, error: `Failed to upload image to storage: ${error.message || "Unknown error"}` };
    }
  }
}

/**
 * Check if an object exists in R2 with retry logic
 */
export async function objectExistsInR2(objectKey: string): Promise<boolean> {
  if (!objectKey || !objectKey.trim()) {
    return false;
  }

  try {
    await withRetry(
      () => r2ClientInstance.send(new HeadObjectCommand({
        Bucket: r2Config.bucket,
        Key: objectKey
      })),
      "Check object existence"
    );
    
    return true;
  } catch (error: any) {
    if (error?.$metadata?.httpStatusCode === 404) {
      return false;
    }
    
    throw new Error(`Failed to check if object exists in storage: ${error.message || "Unknown error"}`);
  }
}

/**
 * Delete an object from R2 with retry logic
 */
export async function deleteImageFromR2(objectKey: string): Promise<void> {
  if (!objectKey || !objectKey.trim()) {
    throw new Error("Object key is required for deletion");
  }

  try {
    await withRetry(
      () => r2ClientInstance.send(new DeleteObjectCommand({
        Bucket: r2Config.bucket,
        Key: objectKey
      })),
      "Delete object"
    );
  } catch (error: any) {
    // Handle specific R2 errors
    if (error.name === "NoSuchKey") {
      // Object doesn't exist, consider it deleted
      return;
    } else if (error.name === "AccessDenied") {
      throw new Error("Access denied to delete object from R2 bucket");
    } else if (error.$metadata?.httpStatusCode === 404) {
      // Object doesn't exist, consider it deleted
      return;
    } else {
      throw new Error(`Failed to delete image from storage: ${error.message || "Unknown error"}`);
    }
  }
}

/**
 * Copy an object within R2 with retry logic
 */
export async function copyObjectInR2(
  sourceObjectKey: string,
  destinationObjectKey: string,
  options: PutObjectOptions = {}
): Promise<UploadResult> {
  try {
    const response = await withRetry(
      () => r2ClientInstance.send(new GetObjectCommand({
        Bucket: r2Config.bucket,
        Key: sourceObjectKey
      })),
      "Get source object for copy"
    );
    
    const bytes = await response.Body?.transformToByteArray();
    if (!bytes) {
      return { success: false, error: "Source object body is empty" };
    }

    return await uploadImageToR2(
      new Uint8Array(bytes),
      response.ContentType || "application/octet-stream",
      destinationObjectKey,
      options
    );
  } catch (error) {
    return { success: false, error: `Failed to copy object in storage: ${error instanceof Error ? error.message : "Unknown error"}` };
  }
}

/**
 * Check URL accessibility for all possible URLs with timeout
 */
export async function checkUrlAccessibility(objectKey: string): Promise<UrlCheckResult> {
  const urls = getAllPossibleUrls(objectKey);
  
  // Use a timeout for fetch operations to avoid hanging in serverless environments
  const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 5000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };
  
  const checkUrl = async (url: string): Promise<{ accessible: boolean; status?: number; error?: string }> => {
    try {
      const response = await fetchWithTimeout(url, { method: 'HEAD' });
      return {
        accessible: response.ok,
        status: response.status,
      };
    } catch (error) {
      return {
        accessible: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  const [customDomain, directR2, r2DevDomain] = await Promise.all([
    checkUrl(urls.customDomain),
    checkUrl(urls.directR2),
    checkUrl(urls.r2DevDomain),
  ]);

  return {
    customDomain: {
      url: urls.customDomain,
      ...customDomain,
    },
    directR2: {
      url: urls.directR2,
      ...directR2,
    },
    r2DevDomain: {
      url: urls.r2DevDomain,
      ...r2DevDomain,
    },
  };
}

/**
 * Get the best available URL for an object
 */
export async function getBestAvailableUrl(objectKey: string): Promise<string | null> {
  const accessibility = await checkUrlAccessibility(objectKey);
  
  // Priority order: custom domain > direct R2 > R2 dev domain
  if (accessibility.customDomain.accessible) {
    return accessibility.customDomain.url;
  }
  
  if (accessibility.directR2.accessible) {
    return accessibility.directR2.url;
  }
  
  if (accessibility.r2DevDomain.accessible) {
    return accessibility.r2DevDomain.url;
  }
  
  return null;
}

/**
 * Resolve R2 URL with fallback to best available URL
 */
export async function resolveR2UrlWithFallback(url: string): Promise<string> {
  // If it's already an absolute URL, check if it's accessible
  if (url.startsWith('http')) {
    const objectKey = extractR2ObjectKey(url);
    if (objectKey) {
      const bestUrl = await getBestAvailableUrl(objectKey);
      if (bestUrl) {
        return bestUrl;
      }
    }
    return url;
  }
  
  // If it's a relative URL or object key, build the full URL
  const fullUrl = buildR2PublicUrlFromManager(url);
  const objectKey = extractR2ObjectKey(fullUrl);
  
  if (objectKey) {
    const bestUrl = await getBestAvailableUrl(objectKey);
    if (bestUrl) {
      return bestUrl;
    }
  }
  
  return fullUrl;
}

// Export legacy compatibility functions
export const ensurePublicR2Url = buildR2PublicUrlFromManager;
export const getPublicUrl = (objectKey: string) => buildR2PublicUrlFromManager(objectKey, { fallbackToBase: true });
export const extractObjectKeyFromUrl = extractR2ObjectKey;
export const buildR2PublicUrl = buildR2PublicUrlFromManager;
export { extractR2ObjectKey, r2ClientInstance as r2Client };
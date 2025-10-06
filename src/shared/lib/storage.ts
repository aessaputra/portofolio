import "server-only";

import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  buildR2PublicUrlFromKey,
  extractR2ObjectKey,
  resolveR2PublicUrl,
} from "@/shared/lib/r2PublicUrl";

// Environment variables with validation
const {
  CLOUDFLARE_ACCOUNT_ID: ACCOUNT_ID = "",
  CLOUDFLARE_R2_ACCESS_KEY_ID: ACCESS_KEY_ID = "",
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: SECRET_ACCESS_KEY = "",
  CLOUDFLARE_R2_BUCKET_NAME: BUCKET = "",
} = process.env;

// Validate required environment variables at module load
if (!ACCOUNT_ID || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY || !BUCKET) {
  throw new Error(
    "Missing required Cloudflare R2 environment variables. Please check your .env file."
  );
}

// Constants
const DEFAULT_CACHE_CONTROL = "public, max-age=31536000, immutable"; // 1 year
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// Types
type PutObjectOptions = {
  cacheControl?: string;
  metadata?: Record<string, string>;
  contentDisposition?: string;
};

type ImageType = "profile" | "project" | "certification" | "about";

// R2 client configuration with best practices
export const r2Client = new S3Client({
  region: "auto", // Required by AWS SDK, ignored by R2
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { 
    accessKeyId: ACCESS_KEY_ID, 
    secretAccessKey: SECRET_ACCESS_KEY 
  },
  forcePathStyle: true,
  // Add retry configuration for better reliability
  maxAttempts: 3,
  retryMode: "adaptive",
});

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
  type: ImageType = "profile"
): string {
  const extension = originalName.split(".").pop()?.toLowerCase() ?? "jpg";
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).slice(2, 8);
  return `${type}-${timestamp}-${randomString}.${extension}`;
}

export const ensurePublicR2Url = resolveR2PublicUrl;

export const getPublicUrl = (objectKey: string) =>
  buildR2PublicUrlFromKey(objectKey, { fallbackToBase: true });

export async function uploadImageToR2(
  file: Buffer | Uint8Array,
  contentType: string,
  objectKey: string,
  options: PutObjectOptions = {}
): Promise<string> {
  // Validate input parameters
  if (!file || file.length === 0) {
    throw new Error("File buffer is empty or invalid");
  }
  
  if (!contentType || !contentType.trim()) {
    throw new Error("Content type is required");
  }
  
  if (!objectKey || !objectKey.trim()) {
    throw new Error("Object key is required");
  }

  // Validate content type
  if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
    throw new Error(`Invalid content type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`);
  }

  // Validate file size
  if (file.length > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: objectKey,
      Body: file,
      ContentType: contentType,
      CacheControl: options.cacheControl ?? DEFAULT_CACHE_CONTROL,
      Metadata: {
        ...options.metadata,
        "upload-timestamp": new Date().toISOString(),
        "content-type": contentType,
      },
      ContentDisposition: options.contentDisposition ?? "inline",
    });

    const result = await r2Client.send(command);
    
    return getPublicUrl(objectKey);
  } catch (error: any) {
    // Handle specific R2 errors
    if (error.name === "NoSuchBucket") {
      throw new Error(`R2 bucket '${BUCKET}' does not exist or is not accessible`);
    } else if (error.name === "AccessDenied") {
      throw new Error("Access denied to R2 bucket. Check your credentials and bucket permissions");
    } else if (error.name === "InvalidAccessKeyId") {
      throw new Error("Invalid R2 access key ID");
    } else if (error.name === "SignatureDoesNotMatch") {
      throw new Error("R2 secret access key is invalid");
    } else if (error.$metadata?.httpStatusCode === 403) {
      throw new Error("Forbidden: Check R2 bucket permissions and credentials");
    } else if (error.$metadata?.httpStatusCode === 404) {
      throw new Error("R2 bucket or endpoint not found");
    } else if (error.$metadata?.httpStatusCode >= 500) {
      throw new Error("R2 service error. Please try again later");
    } else {
      throw new Error(`Failed to upload image to storage: ${error.message || "Unknown error"}`);
    }
  }
}

export async function streamFileToR2(
  file: Buffer | Uint8Array | ReadableStream,
  contentType: string,
  objectKey: string,
  originalFilename?: string
): Promise<string> {
  try {
    await r2Client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: objectKey,
        Body: file,
        ContentType: contentType,
        Metadata: {
          "original-filename": originalFilename ?? objectKey,
          "content-type": contentType,
          "no-transform": "true",
        },
        CacheControl: DEFAULT_CACHE_CONTROL,
      })
    );
    return getPublicUrl(objectKey);
  } catch (error) {
    console.error("Failed to stream file to R2", error);
    throw new Error("Failed to upload file to storage");
  }
}

export const extractObjectKeyFromUrl = (url: string): string | null =>
  extractR2ObjectKey(url);

export const deleteImageFromR2 = async (objectKey: string): Promise<void> => {
  if (!objectKey || !objectKey.trim()) {
    throw new Error("Object key is required for deletion");
  }

  try {
    await r2Client.send(new DeleteObjectCommand({ 
      Bucket: BUCKET, 
      Key: objectKey 
    }));
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
};

export const objectExistsInR2 = async (objectKey: string): Promise<boolean> => {
  if (!objectKey || !objectKey.trim()) {
    return false;
  }

  try {
    await r2Client.send(new HeadObjectCommand({ 
      Bucket: BUCKET, 
      Key: objectKey 
    }));
    return true;
  } catch (error: any) {
    if (error?.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw new Error(`Failed to check if object exists in storage: ${error.message || "Unknown error"}`);
  }
};

export async function copyObjectInR2(
  sourceObjectKey: string,
  destinationObjectKey: string,
  options: PutObjectOptions = {}
): Promise<string> {
  try {
    const response = await r2Client.send(new GetObjectCommand({ Bucket: BUCKET, Key: sourceObjectKey }));
    const bytes = await response.Body?.transformToByteArray();
    if (!bytes) throw new Error("Source object body is empty");

    await r2Client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: destinationObjectKey,
        Body: new Uint8Array(bytes),
        ContentType: response.ContentType,
        CacheControl: options.cacheControl ?? DEFAULT_CACHE_CONTROL,
        Metadata: options.metadata,
        ContentDisposition: options.contentDisposition ?? "inline",
      })
    );

    return getPublicUrl(destinationObjectKey);
  } catch (error) {
    console.error("Failed to copy object in R2", error);
    throw new Error("Failed to copy object in storage");
  }
}

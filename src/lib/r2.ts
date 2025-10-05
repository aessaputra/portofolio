import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

/**
 * Cloudflare R2 Storage Utility
 *
 * This module provides functions for interacting with Cloudflare R2 storage,
 * including uploading, deleting, and managing files.
 *
 * Environment Variables Required:
 * - CLOUDFLARE_ACCOUNT_ID: Cloudflare account ID
 * - CLOUDFLARE_R2_ACCESS_KEY_ID: R2 access key ID
 * - CLOUDFLARE_R2_SECRET_ACCESS_KEY: R2 secret access key
 * - CLOUDFLARE_R2_BUCKET_NAME: R2 bucket name
 * - CLOUDFLARE_R2_PUBLIC_URL: Public URL for R2 objects
 *
 * @module R2Storage
 */

// Initialize S3 client for Cloudflare R2
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
  },
});

/**
 * Generates a unique filename for uploaded files
 *
 * @param {string} originalName - The original filename
 * @param {'profile' | 'project' | 'certification'} [type='profile'] - The type of file
 * @returns {string} A unique filename with timestamp and random string
 */
export function generateUniqueFilename(originalName: string, type: 'profile' | 'project' | 'certification' = 'profile'): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop() || 'jpg';
  return `${type}-${timestamp}-${randomString}.${extension}`;
}

/**
 * Gets the public URL for an R2 object
 *
 * @param {string} objectKey - The object key in R2
 * @returns {string} The public URL for the object
 */
export function getPublicUrl(objectKey: string): string {
  return `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${objectKey}`;
}

/**
 * Uploads an image to Cloudflare R2 with enhanced options
 *
 * @param {Buffer | Uint8Array} file - The file data to upload
 * @param {string} contentType - The MIME type of the file
 * @param {string} objectKey - The object key to use in R2
 * @param {Object} [options={}] - Additional options for the upload
 * @param {string} [options.cacheControl='public, max-age=31536000, immutable'] - Cache control header
 * @param {Record<string, string>} [options.metadata={}] - Additional metadata to store with the object
 * @param {string} [options.contentDisposition='inline'] - Content disposition header
 *
 * @returns {Promise<string>} The public URL of the uploaded image
 * @throws {Error} If the upload fails
 */
export async function uploadImageToR2(
  file: Buffer | Uint8Array,
  contentType: string,
  objectKey: string,
  options: {
    cacheControl?: string;
    metadata?: Record<string, string>;
    contentDisposition?: string;
  } = {}
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME || '',
      Key: objectKey,
      Body: file,
      ContentType: contentType,
      CacheControl: options.cacheControl || 'public, max-age=31536000, immutable', // Cache for 1 year by default
      Metadata: options.metadata || {},
      ContentDisposition: options.contentDisposition || 'inline',
    });

    await r2Client.send(command);
    return getPublicUrl(objectKey);
  } catch (error) {
    console.error('Error uploading image to R2:', error);
    throw new Error('Failed to upload image to storage');
  }
}

// Stream a file to R2 with original content type and no transformations
export async function streamFileToR2(
  file: Buffer | Uint8Array | ReadableStream,
  contentType: string,
  objectKey: string,
  originalFilename?: string
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME || '',
      Key: objectKey,
      Body: file,
      ContentType: contentType,
      // Disable automatic server-side transformations
      Metadata: {
        'original-filename': originalFilename || objectKey,
        'content-type': contentType,
        'no-transform': 'true'
      },
      CacheControl: 'public, max-age=31536000, immutable', // Cache for 1 year
    });

    await r2Client.send(command);
    return getPublicUrl(objectKey);
  } catch (error) {
    console.error('Error streaming file to R2:', error);
    throw new Error('Failed to upload file to storage');
  }
}

// Extract object key from R2 URL
export function extractObjectKeyFromUrl(url: string): string | null {
  if (!url || !process.env.CLOUDFLARE_R2_PUBLIC_URL) {
    return null;
  }
  
  const baseUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
  if (url.startsWith(baseUrl)) {
    return url.substring(baseUrl.length + 1); // +1 to remove the leading slash
  }
  
  return null;
}

/**
 * Deletes an image from Cloudflare R2
 *
 * @param {string} objectKey - The object key to delete from R2
 *
 * @returns {Promise<void>}
 * @throws {Error} If the deletion fails
 */
export async function deleteImageFromR2(objectKey: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME || '',
      Key: objectKey,
    });

    await r2Client.send(command);
  } catch (error) {
    console.error('Error deleting image from R2:', error);
    throw new Error('Failed to delete image from storage');
  }
}

// Check if an object exists in R2
export async function objectExistsInR2(objectKey: string): Promise<boolean> {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME || '',
      Key: objectKey,
    });

    await r2Client.send(command);
    return true;
  } catch (error) {
    // If the object doesn't exist, S3 will throw a NoSuchKey error
    if (error && typeof error === 'object' && '$metadata' in error) {
      const metadata = error.$metadata as { httpStatusCode?: number };
      if (metadata.httpStatusCode === 404) {
        return false;
      }
    }
    console.error('Error checking if object exists in R2:', error);
    throw new Error('Failed to check if object exists in storage');
  }
}

// Copy an object within R2
export async function copyObjectInR2(
  sourceObjectKey: string,
  destinationObjectKey: string,
  options: {
    cacheControl?: string;
    metadata?: Record<string, string>;
    contentDisposition?: string;
  } = {}
): Promise<string> {
  try {
    // First, get the source object
    const getCommand = new GetObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME || '',
      Key: sourceObjectKey,
    });

    const response = await r2Client.send(getCommand);
    
    // Convert the response body to a buffer
    const sourceData = await response.Body?.transformToByteArray();
    if (!sourceData) {
      throw new Error('Failed to read source object data');
    }

    // Upload the data to the destination
    const putCommand = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME || '',
      Key: destinationObjectKey,
      Body: new Uint8Array(sourceData),
      ContentType: response.ContentType,
      CacheControl: options.cacheControl || 'public, max-age=31536000, immutable',
      Metadata: options.metadata || {},
      ContentDisposition: options.contentDisposition || 'inline',
    });

    await r2Client.send(putCommand);
    return getPublicUrl(destinationObjectKey);
  } catch (error) {
    console.error('Error copying object in R2:', error);
    throw new Error('Failed to copy object in storage');
  }
}
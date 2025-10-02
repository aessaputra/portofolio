import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Initialize S3 client for Cloudflare R2
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
  },
});

// Generate a unique filename for the uploaded image
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop() || 'jpg';
  return `profile-${timestamp}-${randomString}.${extension}`;
}

// Get the public URL for an R2 object
export function getPublicUrl(objectKey: string): string {
  return `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${objectKey}`;
}

// Upload an image to R2
export async function uploadImageToR2(
  file: Buffer | Uint8Array,
  contentType: string,
  objectKey: string
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME || '',
      Key: objectKey,
      Body: file,
      ContentType: contentType,
    });

    await r2Client.send(command);
    return getPublicUrl(objectKey);
  } catch (error) {
    console.error('Error uploading image to R2:', error);
    throw new Error('Failed to upload image to storage');
  }
}

// Delete an image from R2
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
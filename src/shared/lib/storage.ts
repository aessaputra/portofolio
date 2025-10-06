import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const {
  CLOUDFLARE_ACCOUNT_ID: ACCOUNT_ID = "",
  CLOUDFLARE_R2_ACCESS_KEY_ID: ACCESS_KEY_ID = "",
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: SECRET_ACCESS_KEY = "",
  CLOUDFLARE_R2_BUCKET_NAME: BUCKET = "",
  CLOUDFLARE_R2_PUBLIC_URL: PUBLIC_URL = "",
} = process.env;

const DEFAULT_CACHE_CONTROL = "public, max-age=31536000, immutable";

type PutObjectOptions = {
  cacheControl?: string;
  metadata?: Record<string, string>;
  contentDisposition?: string;
};

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: ACCESS_KEY_ID, secretAccessKey: SECRET_ACCESS_KEY },
});

export function generateUniqueFilename(
  originalName: string,
  type: "profile" | "project" | "certification" = "profile"
): string {
  const extension = originalName.split(".").pop() ?? "jpg";
  const randomString = Math.random().toString(36).slice(2, 8);
  return `${type}-${Date.now()}-${randomString}.${extension}`;
}

export const getPublicUrl = (objectKey: string) => (PUBLIC_URL ? `${PUBLIC_URL}/${objectKey}` : objectKey);

export async function uploadImageToR2(
  file: Buffer | Uint8Array,
  contentType: string,
  objectKey: string,
  options: PutObjectOptions = {}
): Promise<string> {
  try {
    await r2Client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: objectKey,
        Body: file,
        ContentType: contentType,
        CacheControl: options.cacheControl ?? DEFAULT_CACHE_CONTROL,
        Metadata: options.metadata,
        ContentDisposition: options.contentDisposition ?? "inline",
      })
    );
    return getPublicUrl(objectKey);
  } catch (error) {
    console.error("Failed to upload image to R2", error);
    throw new Error("Failed to upload image to storage");
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

export const extractObjectKeyFromUrl = (url: string): string | null => {
  if (!url || !PUBLIC_URL || !url.startsWith(PUBLIC_URL)) return null;
  const key = url.slice(PUBLIC_URL.length);
  return key.startsWith("/") ? key.slice(1) : key;
};

export const deleteImageFromR2 = async (objectKey: string): Promise<void> => {
  try {
    await r2Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: objectKey }));
  } catch (error) {
    console.error("Failed to delete object from R2", error);
    throw new Error("Failed to delete image from storage");
  }
};

export const objectExistsInR2 = async (objectKey: string): Promise<boolean> => {
  try {
    await r2Client.send(new GetObjectCommand({ Bucket: BUCKET, Key: objectKey }));
    return true;
  } catch (error: any) {
    if (error?.$metadata?.httpStatusCode === 404) return false;
    console.error("Failed to confirm object existence in R2", error);
    throw new Error("Failed to check if object exists in storage");
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

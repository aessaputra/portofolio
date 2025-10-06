import type { Readable } from "stream";

import { PutObjectCommand } from "@aws-sdk/client-s3";

import { r2Client } from "@/shared/lib/storage";

export async function uploadBufferToR2({
  buffer,
  contentType,
  key,
  bucket,
  metadata,
}: {
  buffer: Buffer;
  contentType: string;
  key: string;
  bucket: string;
  metadata?: Record<string, string>;
}) {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      Metadata: metadata,
    })
  );
}

export async function uploadStreamToR2({
  stream,
  contentType,
  key,
  bucket,
  metadata,
}: {
  stream: Readable;
  contentType: string;
  key: string;
  bucket: string;
  metadata?: Record<string, string>;
}) {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: stream,
      ContentType: contentType,
      Metadata: metadata,
    })
  );
}

import "server-only";

import { S3Client } from "@aws-sdk/client-s3";

// Environment variables with validation
const {
  CLOUDFLARE_ACCOUNT_ID: ACCOUNT_ID = "",
  CLOUDFLARE_R2_ACCESS_KEY_ID: ACCESS_KEY_ID = "",
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: SECRET_ACCESS_KEY = "",
  CLOUDFLARE_R2_BUCKET_NAME: BUCKET = "",
  CLOUDFLARE_R2_PUBLIC_URL: PUBLIC_URL = "",
  NODE_ENV: ENV = "development",
} = process.env;

// Validate required environment variables at module load
if (!ACCOUNT_ID || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY || !BUCKET) {
  throw new Error(
    "Missing required Cloudflare R2 environment variables. Please check your .env file."
  );
}

// Determine if we're in production
const isProduction = ENV === "production";

// Create R2 client configuration with best practices
const clientConfig = {
  region: "auto", // Required by AWS SDK, ignored by R2
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { 
    accessKeyId: ACCESS_KEY_ID, 
    secretAccessKey: SECRET_ACCESS_KEY 
  },
  forcePathStyle: true,
  // Add retry configuration for better reliability
  maxAttempts: isProduction ? 5 : 3,
  retryMode: "adaptive",
  // Add request timeout for production
  requestTimeout: isProduction ? 30000 : 10000,
  // Add connection pooling for production
  connectionPool: isProduction ? {
    maxSockets: 50,
    minSockets: 5,
  } : undefined,
};

// Export the R2 client instance
export const r2Client = new S3Client(clientConfig);

// Export a function to create a custom R2 client (useful for different configurations)
export function createCustomR2Client(options?: {
  endpoint?: string;
  region?: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
  maxAttempts?: number;
}) {
  return new S3Client({
    ...clientConfig,
    ...options,
  });
}

// Export configuration values for use in other modules
export const r2Config = {
  accountId: ACCOUNT_ID,
  accessKeyId: ACCESS_KEY_ID,
  bucket: BUCKET,
  publicUrl: PUBLIC_URL,
  isProduction,
  endpoint: clientConfig.endpoint,
};

// Export a function to validate R2 configuration
export function validateR2Config() {
  const errors: string[] = [];
  
  if (!ACCOUNT_ID) errors.push("CLOUDFLARE_ACCOUNT_ID is required");
  if (!ACCESS_KEY_ID) errors.push("CLOUDFLARE_R2_ACCESS_KEY_ID is required");
  if (!SECRET_ACCESS_KEY) errors.push("CLOUDFLARE_R2_SECRET_ACCESS_KEY is required");
  if (!BUCKET) errors.push("CLOUDFLARE_R2_BUCKET_NAME is required");
  
  if (errors.length > 0) {
    throw new Error(`Invalid R2 configuration: ${errors.join(", ")}`);
  }
  
  return true;
}
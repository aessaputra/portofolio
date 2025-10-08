/**
 * Environment variable validation for the application.
 * This file validates critical environment variables at startup.
 */

import { getAdminEmailAllowlist } from "@/shared/lib/adminAllowlist";

function ensureEnvVar(name: string): void {
  const value = process.env[name];

  if (!value || value.trim() === "") {
    throw new Error(`${name} environment variable is required.`);
  }
}

function validateAdminAccessConfiguration(): void {
  const allowlist = getAdminEmailAllowlist();

  if (allowlist.length === 0) {
    throw new Error("ADMIN_EMAIL_ALLOWLIST must include at least one administrator email.");
  }

  // Only log in development mode
  if (process.env.NODE_ENV !== "production") {
    console.log(
      `[Environment Validation] Loaded ${allowlist.length} admin email(s).`
    );
  }
}

function validateNextAuthSecrets(): void {
  ensureEnvVar("NEXTAUTH_SECRET");
  ensureEnvVar("AUTH_GOOGLE_ID");
  ensureEnvVar("AUTH_GOOGLE_SECRET");
}

function validateEmailProviderConfiguration(): void {
  ensureEnvVar("EMAIL_SERVER_HOST");
  ensureEnvVar("EMAIL_SERVER_PORT");
  ensureEnvVar("EMAIL_SERVER_USER");
  ensureEnvVar("EMAIL_SERVER_PASSWORD");
  ensureEnvVar("EMAIL_FROM");

  const port = Number(process.env.EMAIL_SERVER_PORT);
  if (Number.isNaN(port) || port <= 0) {
    throw new Error("EMAIL_SERVER_PORT must be a positive integer.");
  }
}

// Validate Cloudflare R2 environment variables
function validateDatabaseConfiguration(): void {
  ensureEnvVar("DATABASE_URL");
  
  // Only log database configuration in development mode
  if (process.env.NODE_ENV !== "production") {
    console.log("[Environment Validation] Database URL configured successfully.");
  }
}

function validateR2Credentials(): void {
  const requiredVars = [
    'CLOUDFLARE_ACCOUNT_ID',
    'CLOUDFLARE_R2_ACCESS_KEY_ID',
    'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
    'CLOUDFLARE_R2_BUCKET_NAME',
    'CLOUDFLARE_R2_PUBLIC_URL'
  ];

  for (const varName of requiredVars) {
    if (!process.env[varName] || process.env[varName]?.trim() === "") {
      throw new Error(
        `${varName} environment variable is required for Cloudflare R2 storage.`
      );
    }
  }

  // Only log R2 configuration in development mode
  if (process.env.NODE_ENV !== "production") {
    console.log("[Environment Validation] R2 credentials loaded successfully.");
    console.log(`[Environment Validation] R2 Bucket: ${process.env.CLOUDFLARE_R2_BUCKET_NAME}`);
    console.log(`[Environment Validation] R2 Account ID: ${process.env.CLOUDFLARE_ACCOUNT_ID}`);
  }
}

// Validate all environment variables
export function validateEnvironment(): void {
  try {
    validateAdminAccessConfiguration();
    validateNextAuthSecrets();
    validateEmailProviderConfiguration();
    validateDatabaseConfiguration();
    validateR2Credentials();
    if (process.env.NODE_ENV !== "production") {
      console.log("[Environment Validation] All environment variables are valid.");
    }
  } catch (error) {
    console.error("[Environment Validation Error]", error);
    throw error;
  }
}

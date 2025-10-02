/**
 * Environment variable validation for the application.
 * This file validates critical environment variables at startup.
 */

// Validate NEXT_PUBLIC_ADMIN_EMAILS
function validateAdminEmails(): void {
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS;
  
  if (!adminEmails || adminEmails.trim() === "") {
    throw new Error(
      "NEXT_PUBLIC_ADMIN_EMAILS environment variable is required. " +
      "Please set it to a comma-separated list of admin email addresses."
    );
  }
  
  // Parse and validate email format
  const emails = adminEmails
    .split(",")
    .map(email => email.trim().toLowerCase())
    .filter(email => email.length > 0);
  
  if (emails.length === 0) {
    throw new Error(
      "NEXT_PUBLIC_ADMIN_EMAILS must contain at least one valid email address."
    );
  }
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const invalidEmails = emails.filter(email => !emailRegex.test(email));
  
  if (invalidEmails.length > 0) {
    throw new Error(
      `Invalid email format in NEXT_PUBLIC_ADMIN_EMAILS: ${invalidEmails.join(", ")}`
    );
  }
  
  // Log the loaded admin emails for verification (server-side only)
  if (process.env.NODE_ENV !== "production") {
    console.log("[Environment Validation] Admin emails loaded:", emails);
  }
}

// Validate Cloudflare R2 environment variables
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

  // Log the loaded R2 configuration for verification (server-side only)
  if (process.env.NODE_ENV !== "production") {
    console.log("[Environment Validation] R2 credentials loaded successfully.");
  }
}

// Validate all environment variables
export function validateEnvironment(): void {
  try {
    validateAdminEmails();
    validateR2Credentials();
    console.log("[Environment Validation] All environment variables are valid.");
  } catch (error) {
    console.error("[Environment Validation Error]", error);
    throw error;
  }
}
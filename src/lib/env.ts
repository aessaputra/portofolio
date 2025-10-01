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

// Validate all environment variables
export function validateEnvironment(): void {
  try {
    validateAdminEmails();
    console.log("[Environment Validation] All environment variables are valid.");
  } catch (error) {
    console.error("[Environment Validation Error]", error);
    throw error;
  }
}
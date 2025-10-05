/**
 * Debug utility for admin email verification issues.
 * This file provides utilities to help diagnose problems with admin access.
 */

// Function to check if an email is configured as an admin
export function debugAdminEmailCheck(email: string): {
  email: string;
  normalizedEmail: string;
  isAdmin: boolean;
  adminEmails: string[];
  adminSet: Set<string>;
  envVarValue: string;
} {
  const adminEmails = process.env.ADMIN_EMAIL_ALLOWLIST || "";
  const normalizedEmail = email.trim().toLowerCase();

  const adminSet = new Set(
    adminEmails
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );

  const isAdmin = adminSet.has(normalizedEmail);

  return {
    email,
    normalizedEmail,
    isAdmin,
    adminEmails: Array.from(adminSet),
    adminSet,
    envVarValue: adminEmails,
  };
}

// Function to log detailed admin check information
export function logAdminCheckDetails(email: string, source: string): void {
  const debugInfo = debugAdminEmailCheck(email);
  
  console.log(`[${source}] Admin Email Debug Information:`);
  console.log(`[${source}] - Original Email: ${debugInfo.email}`);
  console.log(`[${source}] - Normalized Email: ${debugInfo.normalizedEmail}`);
  console.log(`[${source}] - Is Admin: ${debugInfo.isAdmin}`);
  console.log(`[${source}] - Environment Variable Value: "${debugInfo.envVarValue}"`);
  console.log(`[${source}] - Configured Admin Emails:`, debugInfo.adminEmails);
  console.log(`[${source}] - Admin Set Size: ${debugInfo.adminSet.size}`);
  
  if (!debugInfo.isAdmin && debugInfo.adminSet.size > 0) {
    console.log(`[${source}] - Email not found in admin set. Possible issues:`);
    console.log(`[${source}]   1. Email not added to ADMIN_EMAIL_ALLOWLIST environment variable`);
    console.log(`[${source}]   2. Typo in email address`);
    console.log(`[${source}]   3. Case sensitivity issue (should be normalized)`);
    console.log(`[${source}]   4. Extra spaces in environment variable`);
  }
  
  if (debugInfo.adminSet.size === 0) {
    console.log(`[${source}] - No admin emails configured in ADMIN_EMAIL_ALLOWLIST`);
  }
}

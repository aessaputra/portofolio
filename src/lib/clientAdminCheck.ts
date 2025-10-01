/**
 * Client-side admin email verification utility.
 * This is a safe version that can be used in client components.
 * It only exposes the check function, not the actual admin emails.
 */

export function isAdminEmail(email: string): boolean {
  if (!email) return false;
  
  // Get admin emails from environment variable (this will be injected at build time)
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";
  
  if (!adminEmails) return false;
  
  // Normalize and check against admin emails
  const normalizedEmail = email.trim().toLowerCase();
  const adminSet = new Set(
    adminEmails
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
  
  return adminSet.has(normalizedEmail);
}
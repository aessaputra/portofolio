import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Sign In",
  description: "Sign in to access the admin dashboard",
};

export default function AdminSignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout is intentionally minimal to avoid inheriting admin layout components
  // The page itself will handle all styling and layout
  return <>{children}</>;
}
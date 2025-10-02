import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Sign In Verification",
  description: "Verify your admin sign-in link",
};

export default function AdminVerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {children}
    </div>
  );
}
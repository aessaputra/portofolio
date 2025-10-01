import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Secure admin login portal",
};

export default function AdminLoginLayout({
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
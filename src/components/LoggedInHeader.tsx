import { auth } from "@/lib/auth";
import SignOutButton from "./SignOutButton";
import Link from "next/link";

export default async function LoggedInHeader() {
  const session = await auth();
  
  if (!session?.user) {
    return null;
  }

  // Get user email from session
  const email = session.user.email || "Admin";

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/admin" className="text-xl font-bold text-gray-900">
              Admin Dashboard
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              Logged in as: <span className="font-medium">{email}</span>
            </div>
            <SignOutButton />
          </div>
        </div>
      </div>
    </header>
  );
}
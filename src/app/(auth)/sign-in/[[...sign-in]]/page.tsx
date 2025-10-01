import { auth, currentUser } from "@clerk/nextjs/server";
import { SignIn } from "@clerk/nextjs";
import SignOutButton from "@/components/SignOutButton";
import Link from "next/link";

export default async function SignInPage() {
  const { userId } = await auth();
  
  if (userId) {
    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress || "User";
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">You are logged in</h1>
          <p className="text-gray-600 mb-6">
            You are logged in as <span className="font-medium">{email}</span>
          </p>
          <div className="space-y-4">
            <Link
              href="/"
              className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Return to Home
            </Link>
            <SignOutButton />
          </div>
        </div>
      </div>
    );
  }
  
  // If user is not authenticated, show sign-in form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">Sign In</h1>
        <SignIn
          routing="path"
          path="/sign-in"
          fallbackRedirectUrl="/post-sign-in"
        />
      </div>
    </div>
  );
}
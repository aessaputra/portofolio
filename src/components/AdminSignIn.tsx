"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { isAdminEmail } from "@/lib/clientAdminCheck";
import Link from "next/link";

export default function AdminSignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect_url = searchParams?.get("redirect_url") || "/admin/dashboard";

  // Handle sign-in submission
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!isLoaded) {
      setIsLoading(false);
      return;
    }

    try {
      // Check if the email is an admin email before proceeding
      const adminCheckResponse = await fetch("/api/auth/check-admin-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const adminCheckData = await adminCheckResponse.json();

      if (!adminCheckData.isAdmin) {
        setError("This email is not authorized for admin access. Please use an authorized admin email address.");
        setIsLoading(false);
        return;
      }

      // Start the sign-in process
      const result = await signIn.create({
        identifier: email,
        password,
      });

      // Check if sign-in is complete
      if (result.status === "complete") {
        // Set active session and redirect
        await setActive({
          session: result.createdSessionId,
        });
        router.push(redirect_url);
      } else if (result.status === "needs_first_factor" || result.status === "needs_second_factor") {
        // Show verification UI
        setShowVerification(true);
      }
    } catch (err: any) {
      console.error("Sign-in error:", err);
      setError(err.errors?.[0]?.message || "An error occurred during sign-in.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset the form
  const handleReset = () => {
    setEmail("");
    setPassword("");
    setError("");
    setShowVerification(false);
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-slate-800 px-6 py-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-700 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Admin Access</h1>
          <p className="text-slate-300 text-sm">Sign in to access the admin dashboard</p>
        </div>

        <div className="px-6 py-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {!showVerification && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                  placeholder="Enter your admin email"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-2.5 px-4 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
            </form>
          )}

          {showVerification && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-md">
                <h3 className="font-medium mb-2">Verification Required</h3>
                <p className="text-sm">
                  A verification code has been sent to your email address. Please check your email and enter the code in the Clerk verification component that will appear below.
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-md p-4">
                <h3 className="font-medium mb-2">Next Steps</h3>
                <ol className="text-sm list-decimal pl-5 space-y-1">
                  <li>Check your email for the verification code</li>
                  <li>Enter the code in the verification component</li>
                  <li>After successful verification, you'll be redirected to the admin dashboard</li>
                </ol>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2.5 px-4 rounded transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Return to main site
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-slate-500 text-xs">
        <p>© 2023 Admin Portal. All rights reserved.</p>
        <div className="mt-2 flex justify-center space-x-4">
          <Link href="/privacy" className="text-slate-500 hover:text-slate-700 transition-colors duration-200">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-slate-500 hover:text-slate-700 transition-colors duration-200">
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}
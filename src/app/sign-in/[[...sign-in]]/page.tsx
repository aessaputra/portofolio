"use client";

import { SignIn, useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function SignInPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect_url = searchParams?.get("redirect_url") || "/";

  useEffect(() => {
    // Redirect if user is signed in and loaded
    if (isLoaded && user) {
      router.push("/post-sign-in?redirect_url=" + encodeURIComponent(redirect_url));
    }
  }, [isLoaded, user, router, redirect_url]);

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-slate-800 px-6 py-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-700 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Welcome Back</h1>
          <p className="text-slate-300 text-sm">Sign in to access your account</p>
        </div>

        <div className="px-6 py-8">
          <SignIn
            routing="path"
            path="/sign-in"
            fallbackRedirectUrl={`/post-sign-in?redirect_url=${encodeURIComponent(redirect_url)}`}
            appearance={{
              elements: {
                formButtonPrimary: "w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-2.5 px-4 rounded transition-colors duration-200",
                card: "bg-transparent shadow-none border-0",
                headerTitle: "text-slate-900 font-semibold text-lg mb-1",
                headerSubtitle: "text-slate-600 text-sm",
                socialButtonsBlockButton: "w-full bg-white border border-slate-300 text-slate-700 font-medium py-2.5 px-4 rounded hover:bg-slate-50 transition-colors duration-200",
                formFieldInput: "w-full bg-white border border-slate-300 text-slate-900 font-medium py-2.5 px-4 rounded focus:ring-1 focus:ring-slate-500 focus:border-slate-500 transition-colors duration-200 placeholder:text-slate-500",
                footerActionLink: "text-slate-800 hover:text-slate-600 text-sm font-medium transition-colors duration-200",
                dividerRow: "text-slate-500 my-4",
                dividerText: "text-slate-500 bg-white px-2",
              },
            }}
          />

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
        <p>© 2023 Portfolio Site. All rights reserved.</p>
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
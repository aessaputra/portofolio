"use client";

import { useState, useEffect } from "react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { EmailLinkErrorCodeStatus, isEmailLinkError } from "@clerk/nextjs/errors";
import Link from "next/link";

export default function AdminVerifyEmailLink() {
  const [verificationStatus, setVerificationStatus] = useState('loading');
  const [error, setError] = useState('');
  const { handleEmailLinkVerification, loaded } = useClerk();
  const router = useRouter();

  async function verify() {
    try {
      await handleEmailLinkVerification({
        redirectUrl: `${window.location.origin}/admin/dashboard`,
      });

      // If not redirected at this point, the flow has completed
      setVerificationStatus('verified');
      
      // Redirect to admin dashboard after a short delay
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 2000);
    } catch (err: any) {
      let status = 'failed';

      if (isEmailLinkError(err)) {
        // If link expired, set status to expired
        if (err.code === EmailLinkErrorCodeStatus.Expired) {
          status = 'expired';
          setError('The sign-in link has expired. Please request a new link.');
        } else if (err.code === EmailLinkErrorCodeStatus.ClientMismatch) {
          status = 'client_mismatch';
          setError('You must complete the sign-in on the same device and browser as you started it on.');
        } else {
          setError('An error occurred during verification. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }

      setVerificationStatus(status);
    }
  }

  useEffect(() => {
    if (!loaded) return;

    verify();
  }, [handleEmailLinkVerification, loaded]);

  if (verificationStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-800"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Verifying your sign-in...</h2>
          <p className="text-gray-600">Please wait while we verify your admin access.</p>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'verified') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Sign-in Successful!</h2>
          <p className="text-gray-600 mb-4">You have been successfully verified as an admin user.</p>
          <p className="text-gray-500 text-sm">You will be redirected to the admin dashboard shortly...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Verification Failed</h2>
          <p className="text-gray-600">{error}</p>
        </div>

        <div className="space-y-4">
          <Link
            href="/admin/sign-in"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors duration-200"
          >
            Request New Sign-In Link
          </Link>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>
          
          <Link
            href="/"
            className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors duration-200"
          >
            Return to Main Site
          </Link>
        </div>
      </div>
    </div>
  );
}
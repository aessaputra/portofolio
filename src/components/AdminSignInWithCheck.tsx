"use client";

import * as React from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function AdminSignInWithCheck() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [verifying, setVerifying] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [adminCheckComplete, setAdminCheckComplete] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const router = useRouter();

  // Handle email input change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setAdminCheckComplete(false);
    setIsAdmin(false);
    setError("");
  };

  // Handle email submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent form submission if already loading
    if (isLoading) {
      return;
    }
    
    // Validate email input
    if (!email || email.trim() === "" || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    
    setIsLoading(true);
    setError("");

    if (!isLoaded || !signIn || !setActive) {
      setError("Authentication service is not ready. Please try again.");
      setIsLoading(false);
      return;
    }

    try {
      // Check if the email is authorized for admin access
      const adminCheckResponse = await fetch("/api/auth/check-admin-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!adminCheckResponse.ok) {
        const errorData = await adminCheckResponse.json();
        setError(errorData.error || "Failed to verify admin email. Please try again.");
        setIsLoading(false);
        return;
      }

      const adminCheckData = await adminCheckResponse.json();

      if (!adminCheckData.isAdmin) {
        setError("Access Denied: This email is not authorized for admin access.");
        setIsLoading(false);
        return;
      }

      // Email is authorized, proceed with sign-in
      const signInAttempt = await signIn.create({
        identifier: email.trim(),
      });

      if (signInAttempt.status === "needs_first_factor") {
        const emailCodeFactor = signInAttempt.supportedFirstFactors?.find(
          (factor: any) => factor.strategy === "email_code"
        );

        if (emailCodeFactor) {
          await signIn.prepareFirstFactor({
            strategy: "email_code",
            emailAddressId: (emailCodeFactor as any).emailAddressId,
          });
          setVerifying(true);
        }
      } else if (signInAttempt.status === "complete") {
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: async () => {
            router.push("/admin/dashboard");
          },
        });
      }
    } catch (err: any) {
      setError("An error occurred during sign-in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verification code submission
  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading || !code) {
      return;
    }
    
    setIsLoading(true);
    setError("");

    if (!isLoaded || !signIn || !setActive) {
      setError("Authentication service is not ready. Please try again.");
      setIsLoading(false);
      return;
    }

    try {
      const signInAttempt = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code: code.trim(),
      });

      if (signInAttempt.status === "complete") {
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: async () => {
            router.push("/admin/dashboard");
          },
        });
      } else {
        setError("Verification failed. Please check your code and try again.");
      }
    } catch (err: any) {
      setError("An error occurred during verification. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset the form
  const handleReset = () => {
    setEmail("");
    setCode("");
    setError("");
    setVerifying(false);
  };

  // Render the component
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md sm:max-w-lg">
        <div className="rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-slate-100 backdrop-blur-sm bg-white/80">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 sm:px-8 py-8 sm:py-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 backdrop-blur-sm mb-4 sm:mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Admin Access</h1>
            <p className="mt-2 text-slate-300 text-sm sm:text-base">Secure authentication for administrators</p>
          </div>

          <div className="px-6 sm:px-8 py-8 sm:py-10">
            {/* Error message - always visible if there's an error */}
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Email form - always visible */}
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email || ""}
                    onChange={handleEmailChange}
                    className="block w-full pl-10 pr-3 py-3 sm:py-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900 placeholder-slate-400 transition-colors duration-200 text-base"
                    placeholder="Enter your email"
                    required
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white font-medium py-3 sm:py-4 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-base shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Verification form - only visible when verifying */}
            {verifying && (
              <form onSubmit={handleVerificationSubmit} className="space-y-6 mt-6">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-slate-700 mb-2">
                    Verification Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      id="code"
                      type="text"
                      value={code || ""}
                      onChange={(e) => setCode(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 sm:py-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900 placeholder-slate-400 transition-colors duration-200 text-base"
                      placeholder="Enter verification code"
                      required
                      autoComplete="off"
                      autoFocus
                    />
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    We have sent a verification code to <span className="font-medium text-slate-900">{email}</span>. Please check your email and enter the code above.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                  <button
                    type="submit"
                    disabled={isLoading || !code}
                    className="flex-1 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white font-medium py-3 sm:py-4 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-base shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying...
                      </span>
                    ) : (
                      "Verify Code"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={isLoading}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium py-3 sm:py-4 px-4 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <a
                href="/"
                className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200 group"
              >
                <svg className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Return to main site
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
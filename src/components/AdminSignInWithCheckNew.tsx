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

  // Check admin status immediately when email is entered
  const checkAdminStatus = React.useCallback(async () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      setIsAdmin(false);
      setAdminCheckComplete(false);
      return;
    }

    setIsLoading(true);
    setError("");

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
        console.error("[AdminSignInWithCheck] Admin check failed:", errorData);
        setError(errorData.error || "Failed to verify admin email. Please try again.");
        setIsAdmin(false);
        setAdminCheckComplete(true);
        setIsLoading(false);
        return;
      }

      const adminCheckData = await adminCheckResponse.json();
      console.log("[AdminSignInWithCheck] Admin check response:", adminCheckData);

      if (!adminCheckData.isAdmin) {
        console.error("[AdminSignInWithCheck] Email not authorized for admin access:", email);
        setError("Access Denied: This email is not authorized for admin access. Only pre-registered admin email addresses are allowed to access this system.");
        setIsAdmin(false);
        setAdminCheckComplete(true);
        setIsLoading(false);
        return;
      }

      // Email is authorized for admin access
      console.log("[AdminSignInWithCheck] Email authorized for admin access:", email);
      setIsAdmin(true);
      setAdminCheckComplete(true);
      setIsLoading(false);
    } catch (err: any) {
      console.error("[AdminSignInWithCheck] Admin check error:", err);
      setError("Failed to verify admin status. Please try again.");
      setIsAdmin(false);
      setAdminCheckComplete(true);
      setIsLoading(false);
    }
  }, [email]);

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
      console.log("[AdminSignInWithCheck] Email submission already in progress, ignoring submission");
      return;
    }
    
    // Validate email input
    if (!email || email.trim() === "" || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    
    // First check if admin verification is complete
    if (!adminCheckComplete) {
      await checkAdminStatus();
      return;
    }

    // Block non-admin users immediately
    if (!isAdmin) {
      setError("Access Denied: This email is not authorized for admin access. Only pre-registered admin email addresses are allowed to access this system.");
      return;
    }

    setIsLoading(true);

    if (!isLoaded) {
      console.error("[AdminSignInWithCheck] Clerk not loaded");
      setError("Authentication service is not ready. Please try again.");
      setIsLoading(false);
      return;
    }

    try {
      console.log("[AdminSignInWithCheck] Starting sign-in process for email:", email);
      
      // Email is authorized, proceed with sign-in with a timeout to prevent hanging
      const signInPromise = signIn.create({
        identifier: email.trim(),
      });
      
      // Add timeout to prevent UI freeze
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Sign-in request timed out")), 15000);
      });
      
      const signInAttempt = await Promise.race([signInPromise, timeoutPromise]) as any;

      console.log("[AdminSignInWithCheck] Sign-in attempt status:", signInAttempt.status);

      // Check if we need to prepare email verification
      if (signInAttempt.status === "needs_first_factor") {
        // Find the email code factor
        const emailCodeFactor = signInAttempt.supportedFirstFactors?.find(
          (factor: any) => factor.strategy === "email_code"
        );

        if (!emailCodeFactor) {
          console.error("[AdminSignInWithCheck] Email code factor not found");
          setError("Email code authentication is not available for this account.");
          setIsLoading(false);
          return;
        }

        console.log("[AdminSignInWithCheck] Starting email verification process");
        // Start the email verification process with a timeout
        const prepareFactorPromise = signIn.prepareFirstFactor({
          strategy: "email_code",
          emailAddressId: (emailCodeFactor as any).emailAddressId,
        });
        
        const prepareFactorTimeout = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Email verification preparation timed out")), 15000);
        });
        
        await Promise.race([prepareFactorPromise, prepareFactorTimeout]);
        
        setVerifying(true);
        setIsLoading(false);
      } else if (signInAttempt.status === "complete") {
        console.log("[AdminSignInWithCheck] Sign-in complete, setting active session");
        // If sign-in is already complete, set the session to active
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              console.log("[AdminSignInWithCheck] Session has current task:", session?.currentTask);
              return;
            }
            console.log("[AdminSignInWithCheck] Navigating to admin dashboard");
            router.push("/admin/dashboard");
          },
        });
      } else {
        // Handle other statuses
        console.error("[AdminSignInWithCheck] Unexpected sign-in status:", signInAttempt.status);
        setError("Unexpected sign-in status. Please try again.");
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error("[AdminSignInWithCheck] Admin sign-in error:", err);
      
      // Handle specific error cases
      if (err.message === "Sign-in request timed out") {
        setError("Sign-in request timed out. Please check your connection and try again.");
      } else if (err.message === "Email verification preparation timed out") {
        setError("Email verification preparation timed out. Please try again.");
      } else if (err.errors && err.errors.length > 0) {
        setError(err.errors[0].message || "An error occurred during sign-in.");
      } else {
        setError("An error occurred during sign-in. Please try again.");
      }
      
      setIsLoading(false);
    }
  };

  // Handle verification code submission
  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent form submission if already loading
    if (isLoading) {
      console.log("[AdminSignInWithCheck] Verification already in progress, ignoring submission");
      return;
    }
    
    // Validate code input
    if (!code || code.trim() === "") {
      setError("Please enter the verification code.");
      return;
    }
    
    setError("");
    setIsLoading(true);

    if (!isLoaded) {
      console.error("[AdminSignInWithCheck] Clerk not loaded");
      setError("Authentication service is not ready. Please try again.");
      setIsLoading(false);
      return;
    }

    try {
      console.log("[AdminSignInWithCheck] Starting verification process for code:", code);
      
      // Attempt to verify the code with a timeout to prevent hanging
      const verificationPromise = signIn.attemptFirstFactor({
        strategy: "email_code",
        code: code.trim(),
      });
      
      // Add timeout to prevent UI freeze
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Verification request timed out")), 15000);
      });
      
      const signInAttempt = await Promise.race([verificationPromise, timeoutPromise]) as any;

      console.log("[AdminSignInWithCheck] Verification attempt status:", signInAttempt.status);

      // If verification was completed, set the session to active
      if (signInAttempt.status === "complete") {
        console.log("[AdminSignInWithCheck] Verification complete, setting active session");
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              console.log("[AdminSignInWithCheck] Session has current task:", session?.currentTask);
              return;
            }
            console.log("[AdminSignInWithCheck] Navigating to admin dashboard");
            router.push("/admin/dashboard");
          },
        });
      } else {
        // If the status is not complete, check why
        console.error("[AdminSignInWithCheck] Verification incomplete. Status:", signInAttempt.status);
        setError("Verification failed. Please check your code and try again.");
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error("[AdminSignInWithCheck] Verification error:", err);
      
      // Handle specific error cases
      if (err.message === "Verification request timed out") {
        setError("Verification request timed out. Please check your connection and try again.");
      } else if (err.errors && err.errors.length > 0) {
        setError(err.errors[0].message || "An error occurred during verification.");
      } else {
        setError("An error occurred during verification. Please try again.");
      }
      
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-slate-100">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-8 py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">Admin Access</h1>
          </div>

          <div className="px-8 py-8">
            {error && (
              <div className={`mb-6 p-4 rounded-lg ${error.includes("Access Denied") ? "bg-red-50 border border-red-200 text-red-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
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

          {!verifying ? (
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
                    onBlur={checkAdminStatus}
                    onFocus={(e) => {
                      console.log("[AdminSignInWithCheck] Email input focused");
                      e.target.style.color = 'inherit';
                    }}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900 placeholder-slate-400 transition-colors duration-200"
                    placeholder="Enter your email"
                    required
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !adminCheckComplete || !isAdmin}
                className="w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : !adminCheckComplete ? (
                  "Verify Email"
                ) : isAdmin ? (
                  "Send Verification Code"
                ) : (
                  "Access Denied"
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerificationSubmit} className="space-y-6">
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
                    onChange={(e) => {
                      console.log("[AdminSignInWithCheck] Code input changed:", e.target.value);
                      setCode(e.target.value);
                    }}
                    onFocus={(e) => {
                      console.log("[AdminSignInWithCheck] Code input focused");
                      e.target.style.color = 'inherit';
                    }}
                    onBlur={(e) => {
                      console.log("[AdminSignInWithCheck] Code input blurred");
                      e.target.style.color = 'inherit';
                    }}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900 placeholder-slate-400 transition-colors duration-200"
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

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isLoading || !code}
                  className="flex-1 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium py-3 px-4 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <a
              href="/"
              className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Return to main site
            </a>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-slate-400 text-xs">
        <p>© {new Date().getFullYear()} Admin Portal</p>
      </div>
    </div>
  );
}
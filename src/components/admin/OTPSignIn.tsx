"use client";

import { useState } from "react";
import { useSignIn, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function OTPSignIn() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isLoaded: isAuthLoaded, isSignedIn, signOut } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  if (!isLoaded || !signIn || !isAuthLoaded) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Basic input validation: enforce email-only OTP flow
      const email = identifier.trim();
      if (!email || !email.includes("@")) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }

      // If a session already exists, sign out before starting a new OTP flow
      if (isSignedIn && signOut) {
        await signOut();
      }

      // Start email-only sign-in
      const { supportedFirstFactors } = await signIn!.create({
        identifier: email,
      });

      if (!supportedFirstFactors) {
        setError("No available authentication methods for this email");
        setLoading(false);
        return;
      }

      // Find email_code factor only
      const emailCodeFactor = supportedFirstFactors.find(
        (factor) => factor.strategy === "email_code"
      );

      if (!emailCodeFactor) {
        setError("Email code sign-in is not enabled for this user/application");
        setLoading(false);
        return;
      }

      const { emailAddressId } = emailCodeFactor;
      await signIn!.prepareFirstFactor({
        strategy: "email_code",
        emailAddressId,
      });

      setVerifying(true);
    } catch (err: any) {
      console.error("Error:", JSON.stringify(err, null, 2));
      const message =
        err?.errors?.[0]?.message ||
        err?.message ||
        "Failed to send verification code";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerification(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Always use email_code strategy for verification
      const signInAttempt = await signIn!.attemptFirstFactor({
        strategy: "email_code",
        code,
      });

      if (signInAttempt.status === "complete") {
        await setActive?.({
          session: signInAttempt.createdSessionId,
        });
        router.push("/admin");
      } else {
        setError("Verification failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Error:", JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <div className="space-y-1 mb-6">
          <h1 className="text-2xl font-bold text-center">Admin Login</h1>
          <p className="text-gray-600 text-center">
            Enter your email to receive a one-time verification code
          </p>
        </div>
        {verifying ? (
          <form onSubmit={handleVerification} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <input
                id="code"
                type="text"
                placeholder="Enter the code you received"
                value={code}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>
            <button
              type="button"
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
              onClick={() => setVerifying(false)}
              disabled={loading}
            >
              Back
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="identifier"
                type="email"
                placeholder="Enter your email"
                value={identifier}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIdentifier(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Sending Code..." : "Send One-Time Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
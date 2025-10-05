"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function AdminSignInWithCheck() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get("redirect_url") || "/admin/dashboard";
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const normalizedEmail = email.trim().toLowerCase();
  const errorParam = searchParams?.get("error");

  useEffect(() => {
    if (!errorParam) return;

    if (errorParam === "magic-link") {
      setError("Magic link is invalid or has expired. Please request a new one.");
      setStatus("idle");
    } else if (errorParam === "missing-token") {
      setError("Missing sign-in token. Please request a new magic link.");
      setStatus("idle");
    }
  }, [errorParam]);

  const handleGoogleSignIn = () => {
    void signIn("google", { callbackUrl: redirectUrl });
  };

  const handleEmailSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setStatus("sending");

    try {
      const response = await fetch("/api/auth/send-magic-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: normalizedEmail, redirectUrl }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.error ?? payload?.message ?? "Failed to send sign-in link.");
        setStatus("idle");
        return;
      }

      setStatus("sent");
      setError(null);
    } catch (err) {
      console.error("Email sign-in link error", err);
      setError("Unexpected error during sign-in. Please try again.");
      setStatus("idle");
    }
  };

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
            <p className="mt-2 text-slate-300 text-sm sm:text-base">Authorized administrators only</p>
          </div>

          <div className="px-6 sm:px-8 py-8 sm:py-10 space-y-6">
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}

              {status === "sent" && !error && (
                <p className="text-sm text-emerald-600" role="status">
                  Verification link sent! Check <strong>{email}</strong> and follow the
                  instructions in the email to complete sign-in.
                </p>
              )}

              <button
                type="submit"
                disabled={status === "sending" || email.trim() === ""}
                className="w-full rounded-md bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "sending" ? "Sending link..." : status === "sent" ? "Link sent" : "Email me a sign-in link"}
              </button>
            </form>

            <div className="relative py-2 text-center text-xs uppercase tracking-wide text-slate-400">
              <span className="relative bg-white px-4">or continue with</span>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="w-full bg-white border border-slate-300 text-slate-700 font-medium py-3 sm:py-4 px-4 rounded hover:bg-slate-50 transition-colors duration-200 flex items-center justify-center"
              type="button"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>

            <div className="pt-4 border-t border-slate-100 text-center">
              <Link
                href="/"
                className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200 group"
              >
                <svg className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Return to main site
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

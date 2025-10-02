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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-slate-100">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-8 py-8 text-center">
            <h1 className="text-2xl font-semibold text-white tracking-tight">Admin Access</h1>
          </div>

          <div className="px-8 py-8">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-3 pr-3 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900 placeholder-slate-400"
                  placeholder="Enter your email"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white font-medium py-3 px-4 rounded-xl"
              >
                Sign In
              </button>
            </form>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <a
              href="/"
              className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
            >
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
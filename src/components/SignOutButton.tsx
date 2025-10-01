"use client";

import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignOutButton() {
  const { signOut } = useClerk();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      // Call the logout API route first
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to logout via API");
      }

      // Then use Clerk's signOut with redirect
      await signOut({ redirectUrl: "/" });
    } catch (error) {
      console.error("Error during sign out:", error);
      // Fallback to direct signOut and redirect
      try {
        await signOut({ redirectUrl: "/" });
      } catch (fallbackError) {
        console.error("Fallback signOut failed:", fallbackError);
        // Ultimate fallback: manual redirect
        window.location.href = "/";
      }
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isSigningOut}
      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isSigningOut ? "Signing out..." : "Sign Out"}
    </button>
  );
}
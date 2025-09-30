"use client";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-dvh grid place-items-center p-6">
      <SignIn
        afterSignInUrl="/auth/after-sign-in"
        appearance={{ elements: { rootBox: "w-full max-w-sm" } }}
        signUpUrl={undefined}
      />
    </div>
  );
}
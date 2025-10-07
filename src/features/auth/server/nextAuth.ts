import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { isAllowedAdminEmail } from "@/shared/lib/adminAllowlist";
import { verifyMagicLinkToken } from "@/features/auth/server/magicLink";

export const config = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/sign-in",
    error: "/admin/sign-in",
  },
  providers: [
    CredentialsProvider({
      id: "admin-magic-link",
      name: "Admin Magic Link",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      authorize: async (credentials) => {
        const token = credentials?.token;
        if (!token || typeof token !== "string") {
          return null;
        }

        const payload = await verifyMagicLinkToken(token);
        if (!payload?.email) {
          return null;
        }

        const email = payload.email.toLowerCase();
        if (!isAllowedAdminEmail(email)) {
          return null;
        }

        return {
          id: `admin-${email}`,
          email,
          name: email, // Use email as name for magic link users initially
          role: "admin",
        } as const;
      },
    }),
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    authorized: async ({ auth }) => {
      if (!auth?.user?.email) {
        return false;
      }

      return isAllowedAdminEmail(auth.user.email);
    },
    signIn: async ({ user, account }) => {
      if (!user.email) {
        return false;
      }

      if (!isAllowedAdminEmail(user.email)) {
        return false;
      }

      if (account?.provider === "google" || account?.provider === "admin-magic-link") {
        return true;
      }

      return false;
    },
    jwt: async ({ token, user }) => {
      if (user?.email) {
        token.sub = user.id ?? token.sub;
        token.email = user.email;
        token.name = user.name ?? token.name;
        token.isAdmin = isAllowedAdminEmail(user.email);
        token.role = token.isAdmin ? "admin" : token.role;
        
        // Store basic user info in token - profile data will be fetched in session callback
        token.originalName = user.name || undefined;
        token.originalImage = user.image || undefined;
      }

      return token;
    },
    session: async ({ session, token }) => {
      const user = session.user ?? {};

      session.user = {
        ...user,
        id: typeof token.sub === "string" ? token.sub : user.id,
        email: typeof token.email === "string" ? token.email : user.email,
        name: typeof token.name === "string" ? token.name : user.name,
        image: typeof token.originalImage === "string" ? token.originalImage : user.image,
        isAdmin: Boolean(token.isAdmin),
        role: typeof token.role === "string" ? token.role : user.role,
        originalName: typeof token.originalName === "string" ? token.originalName : undefined,
        originalImage: typeof token.originalImage === "string" ? token.originalImage : undefined,
      };

      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);

/**
 * Require an authenticated admin user. Uses NextAuth.js to check authentication.
 * Throws when authentication or authorization fails.
 */
export async function requireAdmin(): Promise<any> {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("Authentication required");
  }

  if (!isAllowedAdminEmail(session.user.email)) {
    throw new Error("Admin access required");
  }

  return session;
}

/**
 * Helper: check if the current user is logged in and is an admin.
 */
export async function isLoggedInAdmin(): Promise<boolean> {
  const session = await auth();

  if (!session?.user?.email) {
    return false;
  }

  return isAllowedAdminEmail(session.user.email);
}

/**
 * Helper: fetch the current user object for server components.
 */
export async function getCurrentUserForServer(): Promise<any> {
  const session = await auth();
  if (!session) return null;
  return session.user;
}

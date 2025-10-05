import { SignJWT, jwtVerify } from "jose";
import type { NextRequest } from "next/server";

const DEFAULT_MAGIC_LINK_EXPIRY_SECONDS = 15 * 60;

function getSecretKey(): Uint8Array {
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error("NEXTAUTH_SECRET must be set to use magic links.");
  }
  return new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
}

const configuredExpiry = Number(process.env.ADMIN_MAGIC_LINK_MAX_AGE ?? DEFAULT_MAGIC_LINK_EXPIRY_SECONDS);

export const MAGIC_LINK_EXPIRY_SECONDS = Number.isFinite(configuredExpiry) && configuredExpiry > 0
  ? configuredExpiry
  : DEFAULT_MAGIC_LINK_EXPIRY_SECONDS;

export async function generateMagicLinkToken(email: string): Promise<string> {
  const secret = getSecretKey();
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(`${MAGIC_LINK_EXPIRY_SECONDS}s`)
    .sign(secret);
}

export async function verifyMagicLinkToken(token: string): Promise<{ email: string } | null> {
  try {
    const secret = getSecretKey();
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : null;
    if (!email) {
      return null;
    }

    return { email };
  } catch (error) {
    console.error("[MagicLink] Unable to verify token", error);
    return null;
  }
}

export function sanitizeRedirectPath(input: unknown): string | null {
  if (typeof input !== "string") return null;
  if (!input.startsWith("/")) return null;
  // Prevent open redirects by disallowing protocol-relative URLs
  if (input.startsWith("//")) return null;
  return input;
}

export function getMagicLinkBaseUrl(request: NextRequest): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  return `${request.nextUrl.protocol}//${request.nextUrl.host}`;
}

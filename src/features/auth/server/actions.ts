"use server";

import nodemailer from "nodemailer";

import { isAllowedAdminEmail } from "@/shared/lib/adminAllowlist";
import {
  MAGIC_LINK_EXPIRY_SECONDS,
  generateMagicLinkToken,
  getMagicLinkBaseUrl,
  sanitizeRedirectPath,
} from "@/features/auth/server/magicLink";

type RequestMagicLinkInput = {
  email: string;
  redirectUrl?: string | null;
};

let cachedTransport: nodemailer.Transporter | null = null;

function getTransport(): nodemailer.Transporter {
  if (!cachedTransport) {
    cachedTransport = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: process.env.EMAIL_SERVER_SECURE === "true",
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });
  }

  return cachedTransport;
}

export async function requestMagicLinkAction({
  email,
  redirectUrl,
}: RequestMagicLinkInput) {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) {
    throw new Error("Email is required.");
  }

  if (!isAllowedAdminEmail(normalizedEmail)) {
    throw new Error("Email is not authorized for admin access.");
  }

  const token = await generateMagicLinkToken(normalizedEmail);
  const baseUrl = await getMagicLinkBaseUrl();
  const redirectPath = sanitizeRedirectPath(redirectUrl);

  const magicLink = new URL("/auth/magic-link", baseUrl);
  magicLink.searchParams.set("token", token);
  if (redirectPath) {
    magicLink.searchParams.set("redirect", redirectPath);
  }

  const transport = getTransport();
  const expiresInMinutes = Math.max(1, Math.round(MAGIC_LINK_EXPIRY_SECONDS / 60));

  try {
    await transport.sendMail({
      to: normalizedEmail,
      from: process.env.EMAIL_FROM,
      subject: "Your admin sign-in link",
      text: `Sign in to the admin panel by opening the link below.\n\n${magicLink.toString()}\n\nThis link expires in ${expiresInMinutes} minute(s). If you did not request it, you can ignore this email.`,
      html: `<p>Sign in to the admin panel by clicking the button below.</p>
<p><a href="${magicLink.toString()}" style="display:inline-block;padding:12px 20px;background-color:#0f172a;color:#ffffff;border-radius:6px;text-decoration:none;font-weight:600">Sign in to admin panel</a></p>
<p>If the button doesn't work, copy and paste this URL into your browser:</p>
<p><a href="${magicLink.toString()}">${magicLink.toString()}</a></p>
<p>This link expires in ${expiresInMinutes} minute(s). If you did not request it, you can ignore this email.</p>`,
    });
  } catch (error) {
    console.error("[MagicLink] Failed to send email", error);
    throw new Error("Failed to send sign-in link.");
  }

  return {
    success: true as const,
    message: "Sign-in link sent.",
    expiresInMinutes,
  };
}

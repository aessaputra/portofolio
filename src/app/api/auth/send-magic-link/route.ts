import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

import { isAllowedAdminEmail } from "@/lib/adminAuthConfig";
import {
  MAGIC_LINK_EXPIRY_SECONDS,
  generateMagicLinkToken,
  getMagicLinkBaseUrl,
  sanitizeRedirectPath,
} from "@/lib/magicLink";

function buildTransport() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    secure: process.env.EMAIL_SERVER_SECURE === "true",
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const { email, redirectUrl } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isAllowedAdminEmail(normalizedEmail)) {
      return NextResponse.json({ error: "Email is not authorized for admin access." }, { status: 403 });
    }

    const token = await generateMagicLinkToken(normalizedEmail);
    const baseUrl = getMagicLinkBaseUrl(request);
    const redirectPath = sanitizeRedirectPath(redirectUrl);

    const magicLink = new URL("/auth/magic-link", baseUrl);
    magicLink.searchParams.set("token", token);
    if (redirectPath) {
      magicLink.searchParams.set("redirect", redirectPath);
    }

    const transport = buildTransport();
    const expiresInMinutes = Math.max(1, Math.round(MAGIC_LINK_EXPIRY_SECONDS / 60));

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

    return NextResponse.json({ success: true, message: "Sign-in link sent." });
  } catch (error) {
    console.error("[SendMagicLink] Error sending link", error);
    return NextResponse.json({ error: "Failed to send sign-in link." }, { status: 500 });
  }
}

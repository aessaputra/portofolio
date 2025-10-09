"use client";

import Script from "next/script";

/**
 * UmamiAnalytics - Komponen untuk tracking analytics
 * Hanya digunakan di halaman public, tidak di halaman admin
 */

interface UmamiAnalyticsProps {
  websiteId: string;
  src?: string;
  dataTag?: string;
  dataBeforeSend?: string;
}

export default function UmamiAnalytics({
  websiteId,
  src,
  dataTag,
  dataBeforeSend,
}: UmamiAnalyticsProps) {
  // Untuk self-hosted Umami, gunakan URL dari environment variable
  const scriptSrc = src || process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL || "https://analytics.umami.is/script.js";

  // Validasi website ID - hanya di development
  if (!websiteId && process.env.NODE_ENV === "development") {
    console.warn("Umami Analytics: Website ID tidak ditemukan. Pastikan NEXT_PUBLIC_UMAMI_WEBSITE_ID sudah di-set.");
    return null;
  }

  // Jika tidak ada website ID di production, tidak render script
  if (!websiteId) {
    return null;
  }

  return (
    <Script
      defer
      src={scriptSrc}
      data-website-id={websiteId}
      data-tag={dataTag}
      data-before-send={dataBeforeSend}
      strategy="afterInteractive"
      onLoad={() => {
        // Hanya log di development
        if (process.env.NODE_ENV === "development") {
          console.log("Umami Analytics script loaded successfully");
        }
      }}
      onError={(e) => {
        // Hanya log di development
        if (process.env.NODE_ENV === "development") {
          console.error("Umami Analytics script failed to load:", e);
        }
      }}
    />
  );
}

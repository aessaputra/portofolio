"use client";

import { useEffect, useCallback } from "react";

// Production-ready hook untuk track custom events dengan Umami
export function useUmamiTracker() {
  const track = useCallback((eventName: string, eventData?: Record<string, any>) => {
    // Validasi di client-side
    if (typeof window === "undefined") return;
    
    // Cek apakah Umami sudah loaded
    if (!(window as any).umami) {
      // Hanya log error di development
      if (process.env.NODE_ENV === "development") {
        console.warn("Umami not loaded yet, event not tracked:", eventName);
      }
      return;
    }

    try {
      // Sanitize event data untuk production
      const sanitizedData = eventData ? sanitizeEventData(eventData) : undefined;
      (window as any).umami.track(eventName, sanitizedData);
      
      // Hanya log di development
      if (process.env.NODE_ENV === "development") {
        console.log("Umami event tracked:", eventName, sanitizedData);
      }
    } catch (error) {
      // Hanya log error di development
      if (process.env.NODE_ENV === "development") {
        console.error("Error tracking Umami event:", error);
      }
    }
  }, []);

  return { track };
}

// Component untuk track page views
export function UmamiPageTracker({ pageName }: { pageName: string }) {
  const { track } = useUmamiTracker();

  useEffect(() => {
    if (pageName) {
      track("page-view", { page: pageName });
    }
  }, [pageName, track]);

  return null;
}

// Production-ready utility function untuk track events
export const umamiTrack = (eventName: string, eventData?: Record<string, any>) => {
  // Validasi di client-side
  if (typeof window === "undefined") return;
  
  // Cek apakah Umami sudah loaded
  if (!(window as any).umami) {
    // Hanya log error di development
    if (process.env.NODE_ENV === "development") {
      console.warn("Umami not loaded yet, event not tracked:", eventName);
    }
    return;
  }

  try {
    // Sanitize event data untuk production
    const sanitizedData = eventData ? sanitizeEventData(eventData) : undefined;
    (window as any).umami.track(eventName, sanitizedData);
    
    // Hanya log di development
    if (process.env.NODE_ENV === "development") {
      console.log("Umami event tracked:", eventName, sanitizedData);
    }
  } catch (error) {
    // Hanya log error di development
    if (process.env.NODE_ENV === "development") {
      console.error("Error tracking Umami event:", error);
    }
  }
};

// Sanitize event data untuk production
function sanitizeEventData(data: Record<string, any>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(data)) {
    // Hanya string values yang diizinkan
    if (typeof value === "string") {
      // Limit panjang string untuk mencegah abuse
      sanitized[key] = value.length > 100 ? value.substring(0, 100) : value;
    } else if (typeof value === "number" || typeof value === "boolean") {
      // Convert number/boolean ke string
      sanitized[key] = String(value);
    }
    // Ignore objects, arrays, dan types lainnya
  }
  
  return sanitized;
}

// Declare umami global type
declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, any>) => void;
    };
  }
}

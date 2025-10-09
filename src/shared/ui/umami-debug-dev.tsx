"use client";

import { useEffect, useState } from "react";

interface UmamiDebugProps {
  websiteId?: string;
  scriptUrl?: string;
}

// Debug component yang hanya muncul di development
export default function UmamiDebugDev({ websiteId, scriptUrl }: UmamiDebugProps) {
  const [debugInfo, setDebugInfo] = useState({
    umamiLoaded: false,
    websiteId: "",
    scriptUrl: "",
    lastEvent: "",
    eventCount: 0,
  });

  useEffect(() => {
    const checkUmami = () => {
      const umamiLoaded = typeof (window as any).umami !== "undefined";
      const currentWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || "";
      const currentScriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL || "https://analytics.umami.is/script.js";

      setDebugInfo({
        umamiLoaded,
        websiteId: currentWebsiteId,
        scriptUrl: currentScriptUrl,
        lastEvent: "",
        eventCount: 0,
      });
    };

    // Check immediately
    checkUmami();

    // Check again after a delay to see if script loaded
    const timer = setTimeout(checkUmami, 2000);

    return () => clearTimeout(timer);
  }, []);

  const testEvent = () => {
    if ((window as any).umami) {
      (window as any).umami.track("debug-test-event", {
        timestamp: new Date().toISOString(),
        test: true,
      });
      setDebugInfo(prev => ({
        ...prev,
        lastEvent: "debug-test-event",
        eventCount: prev.eventCount + 1,
      }));
    }
  };

  // Hanya render di development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-sm text-xs z-50">
      <h3 className="font-bold mb-2">🔍 Umami Debug (Dev Only)</h3>
      
      <div className="space-y-1">
        <div>
          <span className="font-semibold">Script Loaded:</span>{" "}
          <span className={debugInfo.umamiLoaded ? "text-green-400" : "text-red-400"}>
            {debugInfo.umamiLoaded ? "✅ Yes" : "❌ No"}
          </span>
        </div>
        
        <div>
          <span className="font-semibold">Website ID:</span>{" "}
          <span className={debugInfo.websiteId ? "text-green-400" : "text-red-400"}>
            {debugInfo.websiteId ? "✅ Set" : "❌ Missing"}
          </span>
        </div>
        
        <div>
          <span className="font-semibold">Script URL:</span>{" "}
          <span className="text-blue-400 break-all">
            {debugInfo.scriptUrl}
          </span>
        </div>
        
        <div>
          <span className="font-semibold">Last Event:</span>{" "}
          <span className="text-yellow-400">
            {debugInfo.lastEvent || "None"}
          </span>
        </div>
        
        <div>
          <span className="font-semibold">Event Count:</span>{" "}
          <span className="text-purple-400">
            {debugInfo.eventCount}
          </span>
        </div>
      </div>
      
      <button
        onClick={testEvent}
        disabled={!debugInfo.umamiLoaded}
        className="mt-2 px-2 py-1 bg-blue-600 text-white rounded text-xs disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        Test Event
      </button>
      
      <div className="mt-2 text-xs text-gray-400">
        Environment: {process.env.NODE_ENV}
      </div>
    </div>
  );
}

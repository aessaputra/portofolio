'use client';

import { useEffect, useState, useRef } from 'react';

interface ActiveNowProps {
  initialCount: number;
}

interface ActiveVisitorsResponse {
  visitors: number;
}

export default function ActiveNow({ initialCount }: ActiveNowProps) {
  const [activeVisitors, setActiveVisitors] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const backoffTimeRef = useRef(10000); // Start with 10 seconds

  // Function to fetch active visitors
  const fetchActiveVisitors = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/umami/active', {
        cache: 'no-store',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch active visitors: ${response.status}`);
      }
      
      const data: ActiveVisitorsResponse = await response.json();
      setActiveVisitors(data.visitors);
      setRetryCount(0); // Reset retry count on success
      backoffTimeRef.current = 10000; // Reset backoff time
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      
      // Implement exponential backoff
      setRetryCount(prev => prev + 1);
      backoffTimeRef.current = Math.min(
        backoffTimeRef.current * 2,
        60000 // Max 1 minute
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Set up polling with adaptive interval
  useEffect(() => {
    // Skip if tab is not visible
    if (isPaused) return;

    // Immediate fetch on mount
    fetchActiveVisitors();

    // Set up interval with adaptive timing
    intervalRef.current = setInterval(() => {
      fetchActiveVisitors();
    }, backoffTimeRef.current);

    // Clean up interval on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused]); // Re-run when pause state changes

  // Handle visibility change to pause polling when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPaused(document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        {/* Active indicator with pulsing animation */}
        <div className="h-3 w-3 rounded-full bg-green-500"></div>
        <div className="absolute inset-0 h-3 w-3 rounded-full bg-green-500 animate-ping"></div>
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-green-600 dark:text-green-400">
          {isLoading ? '—' : activeVisitors}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {activeVisitors === 1 ? 'visitor' : 'visitors'}
        </span>
      </div>
      
      {error && (
        <span className="text-xs text-red-500 dark:text-red-400">
          Error updating
        </span>
      )}
    </div>
  );
}
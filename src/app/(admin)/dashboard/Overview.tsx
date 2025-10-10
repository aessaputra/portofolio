'use client';

import { useEffect, useState } from 'react';
import ActiveNow from '@/app/(admin)/dashboard/ActiveNow';
import {
  calculateBounceRate,
  calculateAverageVisitTime,
  calculatePercentageChange,
  formatNumber,
  formatPercentage,
  formatVisitDuration,
  getTrendIndicator,
} from '@/lib/umami-utils';
import { type UmamiActive } from '@/lib/umami-schema';

// Type definitions for the component
interface UmamiStats {
  pageviews: { value: number; prev: number };
  visitors: { value: number; prev: number };
  visits: { value: number; prev: number };
  bounces: { value: number; prev: number };
  totaltime: { value: number; prev: number };
}


interface UmamiOverviewResponse {
  stats: UmamiStats;
  active: UmamiActive;
  startAt: number;
  endAt: number;
}

interface KPICardProps {
  title: string;
  value: string | number;
  delta?: number;
  description: string;
  colorClass: string;
  icon?: React.ReactNode;
}

// KPI Card component
function KPICard({ title, value, delta, description, colorClass, icon }: KPICardProps) {
  const trend = delta !== undefined ? getTrendIndicator(delta) : null;
  
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        {icon && <div className={colorClass}>{icon}</div>}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <p className={`text-2xl font-semibold ${colorClass}`}>
          {value}
        </p>
        {trend && delta !== undefined && (
          <span className={`flex items-center text-sm ${trend.colorClass}`}>
            {trend.icon} {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  );
}

// Loading skeleton component
function OverviewSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="mt-2 h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="mt-2 h-3 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      ))}
    </div>
  );
}

// Error component
function OverviewError({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
      <p className="font-medium">Error loading analytics data</p>
      <p className="text-sm">{message}</p>
    </div>
  );
}

// Main Overview component
export default function Overview({ 
  startAt, 
  endAt 
}: { 
  startAt?: number; 
  endAt?: number; 
}) {
  const [data, setData] = useState<UmamiOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        // Build query parameters
        const params = new URLSearchParams();
        if (startAt) params.append('startAt', startAt.toString());
        if (endAt) params.append('endAt', endAt.toString());
        
        const response = await fetch(`/api/umami/overview?${params.toString()}`, {
          cache: 'no-store',
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }
        
        const result: UmamiOverviewResponse = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [startAt, endAt]);

  if (loading) return <OverviewSkeleton />;
  if (error) return <OverviewError message={error} />;
  if (!data) return <OverviewError message="No data available" />;

  // Calculate derived metrics
  const bounceRate = calculateBounceRate(data.stats.bounces.value, data.stats.visits.value);
  const prevBounceRate = calculateBounceRate(data.stats.bounces.prev, data.stats.visits.prev);
  const bounceRateDelta = calculatePercentageChange(bounceRate, prevBounceRate);

  const avgVisitTime = calculateAverageVisitTime(data.stats.totaltime.value, data.stats.visits.value);
  const prevAvgVisitTime = calculateAverageVisitTime(data.stats.totaltime.prev, data.stats.visits.prev);
  const avgVisitTimeDelta = calculatePercentageChange(avgVisitTime, prevAvgVisitTime);

  // Calculate deltas for other metrics
  const visitorsDelta = calculatePercentageChange(data.stats.visitors.value, data.stats.visitors.prev);
  const pageviewsDelta = calculatePercentageChange(data.stats.pageviews.value, data.stats.pageviews.prev);

  // Format date range for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const dateRange = `${formatDate(data.startAt)} - ${formatDate(data.endAt)}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Overview</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{dateRange}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Visitors Card */}
        <KPICard
          title="Visitors"
          value={formatNumber(data.stats.visitors.value)}
          delta={visitorsDelta}
          description="Unique visitors"
          colorClass="text-blue-600 dark:text-blue-400"
        />

        {/* Pageviews Card */}
        <KPICard
          title="Pageviews"
          value={formatNumber(data.stats.pageviews.value)}
          delta={pageviewsDelta}
          description="Total page views"
          colorClass="text-green-600 dark:text-green-400"
        />

        {/* Bounce Rate Card */}
        <KPICard
          title="Bounce Rate"
          value={formatPercentage(bounceRate)}
          delta={bounceRateDelta}
          description="% of single-page visits"
          colorClass="text-yellow-600 dark:text-yellow-400"
        />

        {/* Visit Duration Card */}
        <KPICard
          title="Visit Duration"
          value={formatVisitDuration(avgVisitTime)}
          delta={avgVisitTimeDelta}
          description="Average visit duration (min:sec)"
          colorClass="text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Active Now Card (Full Width) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Now</h3>
        </div>
        <div className="mt-2">
          <ActiveNow initialCount={data.active.visitors} />
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Visitors currently on site</p>
      </div>
    </div>
  );
}
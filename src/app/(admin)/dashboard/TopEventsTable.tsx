'use client';

import { useEffect, useState } from 'react';
import { 
  TableData, 
  TableProps, 
  formatNumber, 
  TableSkeleton, 
  TableError, 
  TableEmpty, 
  ProgressBar, 
  TableContainer 
} from './shared/TableUtils';

export default function TopEventsTable({ 
  startAt, 
  endAt, 
  url, 
  referrer, 
  event, 
  limit = 10 
}: TableProps) {
  const [events, setEvents] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams({
          type: 'event',
          limit: limit.toString(),
        });
        
        if (startAt) params.append('startAt', startAt.toString());
        if (endAt) params.append('endAt', endAt.toString());
        if (url) params.append('url', url);
        if (referrer) params.append('referrer', referrer);
        if (event) params.append('event', event);
        
        const response = await fetch(`/api/umami/metrics?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setEvents(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [startAt, endAt, url, referrer, event, limit]);

  // Find the maximum value for progress bar calculation
  const maxCount = events.length > 0 ? Math.max(...events.map(event => event.y)) : 0;

  if (loading) {
    return <TableSkeleton title="Top Events" />;
  }

  if (error) {
    return <TableError title="Top Events" error={error} />;
  }

  if (events.length === 0) {
    return <TableEmpty title="Top Events" />;
  }

  return (
    <TableContainer title="Top Events">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" aria-label="Top events by count">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400 w-12">Rank</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Event</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400 w-24">Count</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event, index) => (
              <tr 
                key={event.x} 
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              >
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">
                  {index + 1}
                </td>
                <td className="py-3 px-4">
                  <div className="font-medium text-gray-900 dark:text-white truncate max-w-[150px] md:max-w-[200px] lg:max-w-[250px]" title={event.x}>
                    {event.x}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <ProgressBar 
                    value={event.y} 
                    maxValue={maxCount}
                    colorClass="bg-indigo-500"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </TableContainer>
  );
}
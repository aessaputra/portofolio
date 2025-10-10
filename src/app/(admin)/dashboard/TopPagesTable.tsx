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

export default function TopPagesTable({ startAt, endAt, limit = 10 }: TableProps) {
  const [pages, setPages] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams({
          type: 'url',
          limit: limit.toString(),
        });
        
        if (startAt) params.append('startAt', startAt.toString());
        if (endAt) params.append('endAt', endAt.toString());
        
        const response = await fetch(`/api/umami/metrics?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setPages(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, [startAt, endAt, limit]);

  // Find the maximum value for progress bar calculation
  const maxY = pages.length > 0 ? Math.max(...pages.map(page => page.y)) : 0;

  if (loading) {
    return <TableSkeleton title="Top Pages" />;
  }

  if (error) {
    return <TableError title="Top Pages" error={error} />;
  }

  if (pages.length === 0) {
    return <TableEmpty title="Top Pages" />;
  }

  return (
    <TableContainer title="Top Pages">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" aria-label="Top pages by views">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400 w-12">Rank</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Page URL</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400 w-24">Views</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page, index) => (
              <tr 
                key={page.x} 
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              >
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">
                  {index + 1}
                </td>
                <td className="py-3 px-4">
                  <div className="font-medium text-gray-900 dark:text-white truncate max-w-[150px] md:max-w-[200px] lg:max-w-[250px]" title={page.x}>
                    {page.x}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <ProgressBar 
                    value={page.y} 
                    maxValue={maxY}
                    colorClass="bg-emerald-500"
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
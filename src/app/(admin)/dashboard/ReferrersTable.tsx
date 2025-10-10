'use client';

import { useEffect, useState } from 'react';
import { 
  TableData, 
  TableProps, 
  formatNumber, 
  TableSkeleton, 
  TableError, 
  TableEmpty, 
  TableContainer 
} from './shared/TableUtils';

export default function ReferrersTable({ startAt, endAt, limit = 10 }: TableProps) {
  const [referrers, setReferrers] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReferrers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams({
          type: 'referrer',
          limit: limit.toString(),
        });
        
        if (startAt) params.append('startAt', startAt.toString());
        if (endAt) params.append('endAt', endAt.toString());
        
        const response = await fetch(`/api/umami/metrics?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setReferrers(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchReferrers();
  }, [startAt, endAt, limit]);

  if (loading) {
    return <TableSkeleton title="Top Referrers" />;
  }

  if (error) {
    return <TableError title="Top Referrers" error={error} />;
  }

  if (referrers.length === 0) {
    return <TableEmpty title="Top Referrers" />;
  }

  return (
    <TableContainer title="Top Referrers">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" aria-label="Top referrers by visitors">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Referrer</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400 w-24 text-right">Visitors</th>
            </tr>
          </thead>
          <tbody>
            {referrers.map((referrer) => (
              <tr 
                key={referrer.x} 
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="font-medium text-gray-900 dark:text-white truncate max-w-[150px] md:max-w-[200px] lg:max-w-[250px]" title={referrer.x}>
                    {referrer.x === '(direct)' ? 'Direct' : referrer.x}
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatNumber(referrer.y)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </TableContainer>
  );
}
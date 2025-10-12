import { ReactNode } from 'react';

// Common interface for table data
export interface TableData {
  x: string; // Name/URL/Event
  y: number; // Value/Count
}

// Common props for table components
export interface TableProps {
  startAt?: number;
  endAt?: number;
  limit?: number;
  url?: string;
  referrer?: string;
  event?: string;
}

// Format numbers with locale-specific formatting
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

// Loading skeleton component - Mobile Responsive
export const TableSkeleton = ({ title }: { title: string }) => (
  <div className="bg-white dark:bg-[var(--color-gray-dark)] rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 shadow-sm">
    <div className="flex justify-between items-center mb-3 sm:mb-4">
      <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
    </div>
    <div className="space-y-2 sm:space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-6 sm:w-8 h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="flex-1 h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="w-12 sm:w-16 h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      ))}
    </div>
  </div>
);

// Error state component - Mobile Responsive
export const TableError = ({ title, error }: { title: string; error: string }) => (
  <div className="bg-white dark:bg-[var(--color-gray-dark)] rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 shadow-sm">
    <div className="flex justify-between items-center mb-3 sm:mb-4">
      <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
    </div>
    <div className="flex flex-col items-center justify-center py-6 sm:py-8">
      <div className="text-red-500 mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-red-500 font-medium text-sm sm:text-base">Error loading data</p>
      <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1 text-center px-2">{error}</p>
    </div>
  </div>
);

// Empty state component - Mobile Responsive
export const TableEmpty = ({ title }: { title: string }) => (
  <div className="bg-white dark:bg-[var(--color-gray-dark)] rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 shadow-sm">
    <div className="flex justify-between items-center mb-3 sm:mb-4">
      <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
    </div>
    <div className="flex flex-col items-center justify-center py-6 sm:py-8">
      <div className="text-gray-400 mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">No data available</p>
    </div>
  </div>
);

// Progress bar component - Mobile Responsive
export const ProgressBar = ({ 
  value, 
  maxValue, 
  colorClass = "bg-emerald-500" 
}: { 
  value: number; 
  maxValue: number; 
  colorClass?: string; 
}) => {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <span className="text-gray-700 dark:text-gray-300 dark:hover:text-white font-medium text-xs sm:text-sm min-w-[32px] sm:min-w-[40px] text-right">
        {formatNumber(value)}
      </span>
      <div className="relative h-1.5 sm:h-2 rounded bg-gray-200 dark:bg-gray-700 flex-1 min-w-[40px] sm:min-w-[50px] overflow-hidden">
        <div 
          className={`absolute left-0 h-1.5 sm:h-2 rounded ${colorClass} transition-all duration-300 ease-out`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Table header component - Mobile Responsive
export const TableHeader = ({ title }: { title: string }) => (
  <div className="flex justify-between items-center mb-3 sm:mb-4">
    <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
  </div>
);

// Table container component - Mobile Responsive
export const TableContainer = ({ 
  title, 
  children, 
  className = "" 
}: { 
  title: string; 
  children: ReactNode; 
  className?: string; 
}) => (
  <div className={`bg-white dark:bg-[var(--color-gray-dark)] rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 shadow-sm ${className}`}>
    <TableHeader title={title} />
    {children}
  </div>
);
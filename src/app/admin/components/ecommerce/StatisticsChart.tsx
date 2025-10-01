"use client";
import React from "react";

const StatisticsChart: React.FC = () => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Statistics
        </h3>
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]">
            Month
          </button>
          <button className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]">
            Quarter
          </button>
          <button className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]">
            Year
          </button>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex h-80 items-end justify-between gap-2">
          {/* Bar Chart */}
          <div className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full flex-1 flex-col items-center justify-end gap-2">
              <div className="h-3/5 w-full rounded-t bg-brand-500"></div>
              <div className="h-2/5 w-full rounded-t bg-gray-200 dark:bg-gray-700"></div>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Jan</span>
          </div>

          <div className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full flex-1 flex-col items-center justify-end gap-2">
              <div className="h-4/5 w-full rounded-t bg-brand-500"></div>
              <div className="h-1/5 w-full rounded-t bg-gray-200 dark:bg-gray-700"></div>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Feb</span>
          </div>

          <div className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full flex-1 flex-col items-center justify-end gap-2">
              <div className="h-2/5 w-full rounded-t bg-brand-500"></div>
              <div className="h-3/5 w-full rounded-t bg-gray-200 dark:bg-gray-700"></div>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Mar</span>
          </div>

          <div className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full flex-1 flex-col items-center justify-end gap-2">
              <div className="h-3/5 w-full rounded-t bg-brand-500"></div>
              <div className="h-2/5 w-full rounded-t bg-gray-200 dark:bg-gray-700"></div>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Apr</span>
          </div>

          <div className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full flex-1 flex-col items-center justify-end gap-2">
              <div className="h-4/5 w-full rounded-t bg-brand-500"></div>
              <div className="h-1/5 w-full rounded-t bg-gray-200 dark:bg-gray-700"></div>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">May</span>
          </div>

          <div className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full flex-1 flex-col items-center justify-end gap-2">
              <div className="h-full w-full rounded-t bg-brand-500"></div>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Jun</span>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-brand-500"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Earnings</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-600"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Expenses</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsChart;
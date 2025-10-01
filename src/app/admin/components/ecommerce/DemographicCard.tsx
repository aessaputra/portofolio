"use client";
import React from "react";

const DemographicCard: React.FC = () => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Demographics
      </h3>

      <div className="mt-6 space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              United States
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              45%
            </span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800">
            <div className="h-2 rounded-full bg-brand-500" style={{ width: "45%" }}></div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              United Kingdom
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              25%
            </span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800">
            <div className="h-2 rounded-full bg-brand-500" style={{ width: "25%" }}></div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Canada
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              15%
            </span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800">
            <div className="h-2 rounded-full bg-brand-500" style={{ width: "15%" }}></div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Australia
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              10%
            </span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800">
            <div className="h-2 rounded-full bg-brand-500" style={{ width: "10%" }}></div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Others
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              5%
            </span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800">
            <div className="h-2 rounded-full bg-brand-500" style={{ width: "5%" }}></div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
          By Gender
        </h4>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-brand-500"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Male</span>
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            58%
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-orange-500"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Female</span>
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            42%
          </span>
        </div>
      </div>
    </div>
  );
};

export default DemographicCard;
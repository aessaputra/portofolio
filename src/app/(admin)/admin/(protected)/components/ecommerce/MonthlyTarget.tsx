"use client";
import React from "react";

const MonthlyTarget: React.FC = () => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Monthly Target
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Sep 1 - Sep 30
          </span>
          <svg
            className="text-gray-500 dark:text-gray-400"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 6C5 5.44772 5.44772 5 6 5H14C14.5523 5 15 5.44772 15 6C15 6.55228 14.5523 7 14 7H6C5.44772 7 5 6.55228 5 6Z"
              fill="currentColor"
            />
            <path
              d="M5 10C5 9.44772 5.44772 9 6 9H14C14.5523 9 15 9.44772 15 10C15 10.5523 14.5523 11 14 11H6C5.44772 11 5 10.5523 5 10Z"
              fill="currentColor"
            />
            <path
              d="M6 13C5.44772 13 5 13.4477 5 14C5 14.5523 5.44772 15 6 15H10C10.5523 15 11 14.5523 11 14C11 13.4477 10.5523 13 10 13H6Z"
              fill="currentColor"
            />
            <path
              d="M16.7071 7.70711C17.0976 7.31658 17.0976 6.68342 16.7071 6.29289C16.3166 5.90237 15.6834 5.90237 15.2929 6.29289L12.2929 9.29289C11.9024 9.68342 11.9024 10.3166 12.2929 10.7071L15.2929 13.7071C15.6834 14.0976 16.3166 14.0976 16.7071 13.7071C17.0976 13.3166 17.0976 12.6834 16.7071 12.2929L14.4142 10L16.7071 7.70711Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-gray-800 dark:text-white/90">
              $78,329
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Target: $100,000
            </p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-1 text-sm font-medium text-success-700 dark:bg-success-500/15 dark:text-success-400">
            <svg
              className="fill-success-500 dark:fill-success-400"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.6852 5.18518C10.9286 4.94177 11.3243 4.94177 11.5677 5.18518C11.8111 5.42859 11.8111 5.82432 11.5677 6.06773L7.06773 10.5677C6.82432 10.8111 6.42859 10.8111 6.18518 10.5677L2.43227 6.81482C2.18886 6.57141 2.18886 6.17568 2.43227 5.93227C2.67568 5.68886 3.07141 5.68886 3.31482 5.93227L6.62646 9.24391L10.6852 5.18518Z"
                fill="currentColor"
              />
            </svg>
            78.3%
          </span>
        </div>

        <div className="mt-4 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800">
          <div
            className="h-2 rounded-full bg-success-500"
            style={{ width: "78.3%" }}
          ></div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-brand-500"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Completed
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              $78,329
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Remaining
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              $21,671
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyTarget;
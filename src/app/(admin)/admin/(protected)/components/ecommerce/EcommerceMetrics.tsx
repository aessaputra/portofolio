"use client";
import React from "react";

const EcommerceMetrics: React.FC = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {/* Metric Card 1 */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Revenue
            </p>
            <h4 className="mt-1.5 text-2xl font-bold text-gray-800 dark:text-white/90">
              $45,231.89
            </h4>
          </div>
          <div className="flex items-center justify-center rounded-full bg-brand-50 p-2.5 dark:bg-brand-500/15">
            <svg
              className="fill-brand-500 dark:fill-brand-400"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18.0316 7.96875C17.6566 7.59375 17.0635 7.59375 16.6885 7.96875L10.5004 14.1562L7.31348 10.9688C6.93848 10.5938 6.34535 10.5938 5.97035 10.9688C5.59535 11.3438 5.59535 11.9375 5.97035 12.3125L9.81348 16.1562C10.1885 16.5312 10.7816 16.5312 11.1566 16.1562L18.0316 9.3125C18.4066 8.9375 18.4066 8.34375 18.0316 7.96875Z"
                fill=""
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2.25C6.61522 2.25 2.25 6.61522 2.25 12C2.25 17.3848 6.61522 21.75 12 21.75C17.3848 21.75 21.75 17.3848 21.75 12C21.75 6.61522 17.3848 2.25 12 2.25ZM3.75 12C3.75 7.44365 7.44365 3.75 12 3.75C16.5563 3.75 20.25 7.44365 20.25 12C20.25 16.5563 16.5563 20.25 12 20.25C7.44365 20.25 3.75 16.5563 3.75 12Z"
                fill=""
              />
            </svg>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1">
          <span className="flex items-center gap-0.5 text-sm font-medium text-success-500">
            <svg
              className="fill-current"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.35355 3.14645C8.15829 2.95118 7.84171 2.95118 7.64645 3.14645L3.14645 7.64645C2.95118 7.84171 2.95118 8.15829 3.14645 8.35355C3.34171 8.54882 3.65829 8.54882 3.85355 8.35355L7.5 4.70711V12.5C7.5 12.7761 7.72386 13 8 13C8.27614 13 8.5 12.7761 8.5 12.5V4.70711L12.1464 8.35355C12.3417 8.54882 12.6583 8.54882 12.8536 8.35355C13.0488 8.15829 13.0488 7.84171 12.8536 7.64645L8.35355 3.14645Z"
                fill="currentColor"
              />
            </svg>
            12.5%
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            from last month
          </span>
        </div>
      </div>

      {/* Metric Card 2 */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Subscriptions
            </p>
            <h4 className="mt-1.5 text-2xl font-bold text-gray-800 dark:text-white/90">
              +2,350
            </h4>
          </div>
          <div className="flex items-center justify-center rounded-full bg-orange-50 p-2.5 dark:bg-orange-500/15">
            <svg
              className="fill-orange-500 dark:fill-orange-400"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18.0316 7.96875C17.6566 7.59375 17.0635 7.59375 16.6885 7.96875L10.5004 14.1562L7.31348 10.9688C6.93848 10.5938 6.34535 10.5938 5.97035 10.9688C5.59535 11.3438 5.59535 11.9375 5.97035 12.3125L9.81348 16.1562C10.1885 16.5312 10.7816 16.5312 11.1566 16.1562L18.0316 9.3125C18.4066 8.9375 18.4066 8.34375 18.0316 7.96875Z"
                fill=""
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2.25C6.61522 2.25 2.25 6.61522 2.25 12C2.25 17.3848 6.61522 21.75 12 21.75C17.3848 21.75 21.75 17.3848 21.75 12C21.75 6.61522 17.3848 2.25 12 2.25ZM3.75 12C3.75 7.44365 7.44365 3.75 12 3.75C16.5563 3.75 20.25 7.44365 20.25 12C20.25 16.5563 16.5563 20.25 12 20.25C7.44365 20.25 3.75 16.5563 3.75 12Z"
                fill=""
              />
            </svg>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1">
          <span className="flex items-center gap-0.5 text-sm font-medium text-success-500">
            <svg
              className="fill-current"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.35355 3.14645C8.15829 2.95118 7.84171 2.95118 7.64645 3.14645L3.14645 7.64645C2.95118 7.84171 2.95118 8.15829 3.14645 8.35355C3.34171 8.54882 3.65829 8.54882 3.85355 8.35355L7.5 4.70711V12.5C7.5 12.7761 7.72386 13 8 13C8.27614 13 8.5 12.7761 8.5 12.5V4.70711L12.1464 8.35355C12.3417 8.54882 12.6583 8.54882 12.8536 8.35355C13.0488 8.15829 13.0488 7.84171 12.8536 7.64645L8.35355 3.14645Z"
                fill="currentColor"
              />
            </svg>
            8.2%
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            from last month
          </span>
        </div>
      </div>

      {/* Metric Card 3 */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Sales
            </p>
            <h4 className="mt-1.5 text-2xl font-bold text-gray-800 dark:text-white/90">
              +12,234
            </h4>
          </div>
          <div className="flex items-center justify-center rounded-full bg-success-50 p-2.5 dark:bg-success-500/15">
            <svg
              className="fill-success-500 dark:fill-success-400"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18.0316 7.96875C17.6566 7.59375 17.0635 7.59375 16.6885 7.96875L10.5004 14.1562L7.31348 10.9688C6.93848 10.5938 6.34535 10.5938 5.97035 10.9688C5.59535 11.3438 5.59535 11.9375 5.97035 12.3125L9.81348 16.1562C10.1885 16.5312 10.7816 16.5312 11.1566 16.1562L18.0316 9.3125C18.4066 8.9375 18.4066 8.34375 18.0316 7.96875Z"
                fill=""
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2.25C6.61522 2.25 2.25 6.61522 2.25 12C2.25 17.3848 6.61522 21.75 12 21.75C17.3848 21.75 21.75 17.3848 21.75 12C21.75 6.61522 17.3848 2.25 12 2.25ZM3.75 12C3.75 7.44365 7.44365 3.75 12 3.75C16.5563 3.75 20.25 7.44365 20.25 12C20.25 16.5563 16.5563 20.25 12 20.25C7.44365 20.25 3.75 16.5563 3.75 12Z"
                fill=""
              />
            </svg>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1">
          <span className="flex items-center gap-0.5 text-sm font-medium text-error-500">
            <svg
              className="fill-current"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.64645 12.8536C7.84171 13.0488 8.15829 13.0488 8.35355 12.8536L12.8536 8.35355C13.0488 8.15829 13.0488 7.84171 12.8536 7.64645C12.6583 7.45118 12.3417 7.45118 12.1464 7.64645L8.5 11.2929L4.85355 7.64645C4.65829 7.45118 4.34171 7.45118 4.14645 7.64645C3.95118 7.84171 3.95118 8.15829 4.14645 8.35355L7.64645 12.8536Z"
                fill="currentColor"
              />
            </svg>
            3.4%
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            from last month
          </span>
        </div>
      </div>

      {/* Metric Card 4 */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Active Now
            </p>
            <h4 className="mt-1.5 text-2xl font-bold text-gray-800 dark:text-white/90">
              +18,234
            </h4>
          </div>
          <div className="flex items-center justify-center rounded-full bg-blue-light-50 p-2.5 dark:bg-blue-light-500/15">
            <svg
              className="fill-blue-light-500 dark:fill-blue-light-400"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18.0316 7.96875C17.6566 7.59375 17.0635 7.59375 16.6885 7.96875L10.5004 14.1562L7.31348 10.9688C6.93848 10.5938 6.34535 10.5938 5.97035 10.9688C5.59535 11.3438 5.59535 11.9375 5.97035 12.3125L9.81348 16.1562C10.1885 16.5312 10.7816 16.5312 11.1566 16.1562L18.0316 9.3125C18.4066 8.9375 18.4066 8.34375 18.0316 7.96875Z"
                fill=""
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2.25C6.61522 2.25 2.25 6.61522 2.25 12C2.25 17.3848 6.61522 21.75 12 21.75C17.3848 21.75 21.75 17.3848 21.75 12C21.75 6.61522 17.3848 2.25 12 2.25ZM3.75 12C3.75 7.44365 7.44365 3.75 12 3.75C16.5563 3.75 20.25 7.44365 20.25 12C20.25 16.5563 16.5563 20.25 12 20.25C7.44365 20.25 3.75 16.5563 3.75 12Z"
                fill=""
              />
            </svg>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1">
          <span className="flex items-center gap-0.5 text-sm font-medium text-success-500">
            <svg
              className="fill-current"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.35355 3.14645C8.15829 2.95118 7.84171 2.95118 7.64645 3.14645L3.14645 7.64645C2.95118 7.84171 2.95118 8.15829 3.14645 8.35355C3.34171 8.54882 3.65829 8.54882 3.85355 8.35355L7.5 4.70711V12.5C7.5 12.7761 7.72386 13 8 13C8.27614 13 8.5 12.7761 8.5 12.5V4.70711L12.1464 8.35355C12.3417 8.54882 12.6583 8.54882 12.8536 8.35355C13.0488 8.15829 13.0488 7.84171 12.8536 7.64645L8.35355 3.14645Z"
                fill="currentColor"
              />
            </svg>
            5.7%
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            from last month
          </span>
        </div>
      </div>
    </div>
  );
};

export default EcommerceMetrics;
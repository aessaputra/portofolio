"use client";
import React from "react";
import Image from "next/image";

const RecentOrders: React.FC = () => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Recent Orders
        </h3>
        <button className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300">
          View All
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {/* Order Item 1 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full">
              <Image
                width={40}
                height={40}
                src="/admin/images/user/user-01.jpg"
                alt="User"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                John Doe
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Product: Wireless Headphones
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              $129.99
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
          </div>
        </div>

        {/* Order Item 2 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full">
              <Image
                width={40}
                height={40}
                src="/admin/images/user/user-02.jpg"
                alt="User"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                Jane Smith
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Product: Smart Watch
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              $249.99
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">5 hours ago</p>
          </div>
        </div>

        {/* Order Item 3 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full">
              <Image
                width={40}
                height={40}
                src="/admin/images/user/user-03.jpg"
                alt="User"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                Robert Johnson
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Product: Laptop Stand
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              $49.99
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">1 day ago</p>
          </div>
        </div>

        {/* Order Item 4 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full">
              <Image
                width={40}
                height={40}
                src="/admin/images/user/user-04.jpg"
                alt="User"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                Emily Davis
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Product: USB-C Hub
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              $79.99
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">2 days ago</p>
          </div>
        </div>

        {/* Order Item 5 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full">
              <Image
                width={40}
                height={40}
                src="/admin/images/user/user-05.jpg"
                alt="User"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                Michael Wilson
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Product: Wireless Mouse
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              $39.99
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">3 days ago</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentOrders;
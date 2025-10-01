"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";

// Dashboard Stats Cards
const StatCard = ({ title, value, change, icon: Icon, color }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
        <p className={`mt-1 text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {change >= 0 ? '+' : ''}{change}% from last week
        </p>
      </div>
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

// Recent Activity Table
const RecentActivity = () => {
  const activities = [
    { id: 1, user: "John Doe", action: "Created new project", time: "2 min ago" },
    { id: 2, user: "Jane Smith", action: "Updated profile", time: "1 hour ago" },
    { id: 3, user: "Robert Johnson", action: "Deleted article", time: "3 hours ago" },
    { id: 4, user: "Emily Davis", action: "Added new comment", time: "5 hours ago" },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="pb-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">User</th>
              <th className="pb-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Action</th>
              <th className="pb-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Time</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => (
              <tr key={activity.id} className="border-b border-gray-200 dark:border-gray-800 last:border-0">
                <td className="py-3 text-sm font-medium text-gray-900 dark:text-white">{activity.user}</td>
                <td className="py-3 text-sm text-gray-500 dark:text-gray-400">{activity.action}</td>
                <td className="py-3 text-sm text-gray-500 dark:text-gray-400">{activity.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Quick Actions
const QuickActions = () => {
  const actions = [
    { title: "Add New User", icon: "👤", color: "bg-blue-500" },
    { title: "Create Post", icon: "📝", color: "bg-green-500" },
    { title: "Upload Media", icon: "📁", color: "bg-purple-500" },
    { title: "View Reports", icon: "📊", color: "bg-yellow-500" },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            className="flex flex-col items-center justify-center rounded-xl border border-gray-200 p-4 text-center transition-all hover:border-blue-300 hover:bg-blue-50 dark:border-gray-800 dark:hover:border-blue-800 dark:hover:bg-blue-900/20"
          >
            <span className={`flex h-10 w-10 items-center justify-center rounded-full ${action.color} text-white mb-2`}>
              {action.icon}
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{action.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default function AdminPage() {
  const { user } = useUser();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Welcome back, {user?.fullName || "Admin"}!
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value="1,254"
          change={12}
          icon={({ className }) => (
            <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Posts"
          value="842"
          change={8}
          icon={({ className }) => (
            <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          )}
          color="bg-green-500"
        />
        <StatCard
          title="Revenue"
          value="$12,458"
          change={24}
          icon={({ className }) => (
            <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          color="bg-purple-500"
        />
        <StatCard
          title="Conversion Rate"
          value="4.8%"
          change={3}
          icon={({ className }) => (
            <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          )}
          color="bg-yellow-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  );
}

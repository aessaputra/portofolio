"use client";

import React from "react";
import AppSidebar from "@/features/site/admin/ui/layout/AppSidebar";
import AppHeader from "@/features/site/admin/ui/layout/AppHeader";
import Backdrop from "@/features/site/admin/ui/layout/Backdrop";
import { useSidebar } from "@/features/site/admin/ui/context/SidebarContext";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex admin-layout bg-gray-50 dark:bg-gray-900" style={{ margin: 0, padding: 0 }}>
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out admin-content ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <div className="p-4 mx-auto max-w-7xl md:p-6">{children}</div>
      </div>
    </div>
  );
}

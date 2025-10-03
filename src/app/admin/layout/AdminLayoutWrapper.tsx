"use client";

import AppHeader from "@/app/admin/layout/AppHeader";
import AppSidebar from "@/app/admin/layout/AppSidebar";
import Backdrop from "@/app/admin/layout/Backdrop";
import { useSidebar } from "@/app/admin/context/SidebarContext";
import React from "react";

const AdminLayoutWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div className="min-h-screen flex">
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />
      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6 lg:p-8 xl:p-10">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayoutWrapper;
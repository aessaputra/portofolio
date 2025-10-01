"use client";

import { useSidebar } from "@/app/admin/context/SidebarContext";
import React from "react";

const DynamicMainContent: React.FC<{ children: React.ReactNode }> = ({
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
    <div
      className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
    >
      {children}
    </div>
  );
};

export default DynamicMainContent;
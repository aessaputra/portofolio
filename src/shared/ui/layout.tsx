"use client";

import type { PropsWithChildren } from "react";
import UnderConstruction from "@/shared/ui/under-construction";

interface LayoutProps extends PropsWithChildren {
  className?: string;
  underConstruction?: boolean;
}

export default function Layout({ children, className = "", underConstruction }: LayoutProps) {
  if (underConstruction) {
    return (
      <div>
        <UnderConstruction />
      </div>
    );
  }

  return (
    <div className={`w-full h-full inline-block z-0 bg-light p-16 dark:bg-dark xl:p-12 lg:p-8 md:p-6 sm:p-4 ${className}`}>
      {children}
    </div>
  );
}

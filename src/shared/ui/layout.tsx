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
    <div className={`w-full h-full inline-block z-0 bg-light p-32 dark:bg-dark xl:p-24 lg:p-16 md:p-12 sm:p-8 ${className}`}>
      {children}
    </div>
  );
}

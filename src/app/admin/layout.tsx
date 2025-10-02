"use client";

import React from "react";
import { usePathname } from "next/navigation";
import "@/styles/admin/globals.css";
import { SidebarProvider } from "@/app/admin/context/SidebarContext";
import { ThemeProvider } from "@/app/admin/context/ThemeContext";
import AdminLayoutWrapper from "@/app/admin/layout/AdminLayoutWrapper";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Don't apply admin layout components to sign-in page
  const isSignInPage = pathname === "/admin/sign-in";
  
  if (isSignInPage) {
    return <>{children}</>;
  }
  
  return (
    <ThemeProvider>
      <SidebarProvider>
        <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
      </SidebarProvider>
    </ThemeProvider>
  );
}
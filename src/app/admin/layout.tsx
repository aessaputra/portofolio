"use client";

import React from "react";
import "@/styles/admin/globals.css";
import { SidebarProvider } from "@/app/admin/context/SidebarContext";
import { ThemeProvider } from "@/app/admin/context/ThemeContext";
import AdminLayoutWrapper from "@/app/admin/layout/AdminLayoutWrapper";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
      </SidebarProvider>
    </ThemeProvider>
  );
}
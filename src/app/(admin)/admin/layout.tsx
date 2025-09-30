import { requireAdmin } from "@/lib/auth";
import React from "react";
import { SidebarProvider } from "@/components/admin/context/SidebarContext";
import AdminShell from "@/components/admin/layout/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return (
    <SidebarProvider>
      <AdminShell>{children}</AdminShell>
    </SidebarProvider>
  );
}

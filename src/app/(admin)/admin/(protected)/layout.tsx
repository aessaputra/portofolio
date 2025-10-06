import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { ThemeProvider } from "@/shared/ui/theme-provider";
import { SidebarProvider } from "@/features/site/admin/ui/context/SidebarContext";
import AdminShell from "@/features/site/admin/ui/layout/AdminShell";
import { auth } from "@/features/auth/server/nextAuth";
import { isAllowedAdminEmail } from "@/shared/lib/adminAllowlist";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/admin/sign-in");
  }

  if (!isAllowedAdminEmail(session.user.email)) {
    redirect("/sign-in");
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider>
        <AdminShell>{children}</AdminShell>
      </SidebarProvider>
    </ThemeProvider>
  );
}

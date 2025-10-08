import type { ReactNode } from "react";

import { getHomeContent } from "@/entities/home";

import PublicShell from "./PublicShell";

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const homeContent = await getHomeContent();

  return <PublicShell homeContent={homeContent}>{children}</PublicShell>;
}

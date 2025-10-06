import type { ReactNode } from "react";

import { getHomeContent } from "@/entities/home";

import PublicShell from "./PublicShell";

export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const homeContent = await getHomeContent();

  return <PublicShell homeContent={homeContent}>{children}</PublicShell>;
}

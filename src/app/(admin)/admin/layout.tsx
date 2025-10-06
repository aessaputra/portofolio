import type { ReactNode } from "react";

import "@/styles/admin/globals.css";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}

import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { isAllowedAdminEmail } from "@/lib/adminAuthConfig";

export default async function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/admin/sign-in");
  }

  if (!isAllowedAdminEmail(session.user.email)) {
    redirect("/");
  }

  return <>{children}</>;
}

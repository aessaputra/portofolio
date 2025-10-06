import { redirect } from "next/navigation";

import { auth } from "@/features/auth/server/nextAuth";
import { isAllowedAdminEmail } from "@/shared/lib/adminAllowlist";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/admin/sign-in");
  }

  if (!isAllowedAdminEmail(session.user.email)) {
    redirect("/sign-in");
  }

  redirect("/admin/dashboard");
}

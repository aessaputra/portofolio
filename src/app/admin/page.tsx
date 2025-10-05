import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { isAllowedAdminEmail } from "@/lib/adminAuthConfig";

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

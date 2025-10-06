import { redirect } from "next/navigation";

import AdminSignInWithCheck from "@/features/auth/components/AdminSignInWithCheck";
import { auth } from "@/features/auth/server/nextAuth";
import { isAllowedAdminEmail } from "@/shared/lib/adminAllowlist";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const redirectUrl =
    (Array.isArray(searchParams.redirect_url)
      ? searchParams.redirect_url[0]
      : searchParams.redirect_url) || "/admin/dashboard";

  const session = await auth();

  if (session?.user?.email && isAllowedAdminEmail(session.user.email)) {
    redirect(redirectUrl);
  }

  return <AdminSignInWithCheck />;
}

import { redirect } from "next/navigation";

import AdminSignInWithCheck from "@/features/auth/components/AdminSignInWithCheck";
import { auth } from "@/features/auth/server/nextAuth";
import { isAllowedAdminEmail } from "@/shared/lib/adminAllowlist";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const redirectUrl =
    (Array.isArray(resolvedSearchParams.redirect_url)
      ? resolvedSearchParams.redirect_url[0]
      : resolvedSearchParams.redirect_url) || "/admin/dashboard";

  const session = await auth();

  if (session?.user?.email && isAllowedAdminEmail(session.user.email)) {
    redirect(redirectUrl);
  }

  return <AdminSignInWithCheck />;
}

import { redirect } from "next/navigation";

import { auth } from "@/features/auth/server/nextAuth";
import { isAllowedAdminEmail } from "@/shared/lib/adminAllowlist";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function PostSignInPage({ searchParams }: { searchParams: SearchParams }) {
  const resolvedSearchParams = await searchParams;
  const redirectUrl =
    (Array.isArray(resolvedSearchParams.redirect_url)
      ? resolvedSearchParams.redirect_url[0]
      : resolvedSearchParams.redirect_url) || "/admin/dashboard";

  const session = await auth();

  if (!session?.user?.email) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`);
  }

  if (isAllowedAdminEmail(session.user.email)) {
    redirect(redirectUrl);
  }

  redirect("/");
}

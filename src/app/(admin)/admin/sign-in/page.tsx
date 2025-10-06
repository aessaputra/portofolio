import { redirect } from "next/navigation";
import AdminSignInWithCheck from "@/features/auth/components/AdminSignInWithCheck";
import { auth } from "@/features/auth/server/nextAuth";
import { isAllowedAdminEmail } from "@/shared/lib/adminAllowlist";

export default async function AdminSignInPage() {
  const session = await auth();

  if (session?.user?.email && isAllowedAdminEmail(session.user.email)) {
    redirect("/admin/dashboard");
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <AdminSignInWithCheck />
    </div>
  );
}

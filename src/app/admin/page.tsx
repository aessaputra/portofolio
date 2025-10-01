import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function AdminPage() {
  const { userId } = await auth();
  
  // If user is not authenticated, redirect to admin login
  if (!userId) {
    redirect("/admin/login");
  }
  
  // If user is authenticated, redirect to admin dashboard
  redirect("/admin/dashboard");
}
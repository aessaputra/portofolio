import { redirect } from "next/navigation";

export default function AdminVerifyEmailLink() {
  redirect("/admin/sign-in");
}

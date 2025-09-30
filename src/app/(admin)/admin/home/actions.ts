'use server'
import { requireAdmin } from '@/lib/auth'

export async function updateHomeContent(prevState: any, formData: FormData) {
  await requireAdmin()

  console.log("updateHomeContent executed");
  // TODO: Implement the actual update logic here
  const data = Object.fromEntries(formData.entries());
  console.log(data);

  return { success: true, error: null };
}
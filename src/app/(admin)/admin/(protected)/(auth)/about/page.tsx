import { getAboutContent } from "@/entities/about";
import { aboutContentToFormState } from "@/features/about/admin/types";

import AboutClient from "./AboutClient";

export default async function AdminAboutPage() {
  const content = await getAboutContent();

  return (
    <AboutClient
      initialState={aboutContentToFormState(content)}
      fallbackProfileImagePath=""
    />
  );
}

import { getHomeContent } from "@/entities/home";
import { homeContentToFormState } from "@/features/home/admin/types";

import HomeClient from "./HomeClient";

export default async function AdminHomePage() {
  const content = await getHomeContent();

  return (
    <HomeClient
      initialState={homeContentToFormState(content)}
      fallbackProfileImagePath=""
    />
  );
}

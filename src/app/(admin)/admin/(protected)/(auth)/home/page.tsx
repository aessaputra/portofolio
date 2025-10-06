import { getHomeContent, DEFAULT_HOME_CONTENT } from "@/entities/home";
import { homeContentToFormState } from "@/features/home/admin/types";

import HomeClient from "./HomeClient";

export default async function AdminHomePage() {
  const content = await getHomeContent();

  return (
    <HomeClient
      initialState={homeContentToFormState(content)}
      fallbackProfileImagePath={DEFAULT_HOME_CONTENT.profileImagePath}
    />
  );
}

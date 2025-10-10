import type { Metadata } from "next";

import Layout from "@/shared/ui/layout";
import TransitionEffect from "@/shared/ui/transition-effect";
import ArticlesContent from "@/features/articles/public/components/ArticlesContent";
import { fetchArticles } from "@/entities/articles";
import { UmamiPageTracker } from "@/shared/ui/umami-tracker";

export const metadata: Metadata = {
  title: "Aes Saputra | Articles Page",
  description: "Read articles and insights from Aes Saputra.",
};

export default async function ArticlesPage() {
  const articles = await fetchArticles({ limit: 20 });

  return (
    <>
      <TransitionEffect />
      <main className="mb-16 flex w-full flex-col items-center justify-center overflow-hidden">
        <Layout className="pt-16">
          <UmamiPageTracker pageName="articles" />
          <ArticlesContent articles={articles} />
        </Layout>
      </main>
    </>
  );
}

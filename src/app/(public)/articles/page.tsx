import type { Metadata } from "next";
import Layout from "@/components/Layout";
import TransitionEffect from "@/components/TransitionEffect";
import ArticlesContent from "@/components/articles/ArticlesContent";

export const metadata: Metadata = {
  title: "Aes Saputra | Articles Page",
  description: "Read articles and insights from Aes Saputra.",
};

export default function ArticlesPage() {
  return (
    <>
      <TransitionEffect />
      <main className="mb-16 flex w-full flex-col items-center justify-center overflow-hidden">
        <Layout underConstruction className="pt-16 ">
          <ArticlesContent />
        </Layout>
      </main>
    </>
  );
}

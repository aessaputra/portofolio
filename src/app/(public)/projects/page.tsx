import type { Metadata } from "next";
import Layout from "@/components/Layout";
import TransitionEffect from "@/components/TransitionEffect";
import ProjectsContent from "@/components/projects/ProjectsContent";

export const metadata: Metadata = {
  title: "Aes Saputra| Portofolio",
  description: "Explore highlighted work and projects from Aes Saputra.",
};

export default function ProjectsPage() {
  return (
    <>
      <TransitionEffect />
      <main className="mb-16 flex w-full flex-col items-center justify-center dark:text-light">
        <Layout className="pt-16">
          <ProjectsContent />
        </Layout>
      </main>
    </>
  );
}

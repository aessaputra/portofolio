import type { Metadata } from "next";
import Layout from "@/shared/ui/layout";
import TransitionEffect from "@/shared/ui/transition-effect";
import ProjectsContent from "@/features/projects/public/components/ProjectsContent";
import { getProjects } from "@/entities/projects";

export const metadata: Metadata = {
  title: "Aes Saputra| Portofolio",
  description: "Explore highlighted work and projects from Aes Saputra.",
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <TransitionEffect />
      <main className="mb-16 flex w-full flex-col items-center justify-center dark:text-light">
        <Layout className="pt-16">
          <ProjectsContent projects={projects} />
        </Layout>
      </main>
    </>
  );
}

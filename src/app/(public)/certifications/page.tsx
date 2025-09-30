import type { Metadata } from "next";
import Layout from "@/components/Layout";
import TransitionEffect from "@/components/TransitionEffect";

export const metadata: Metadata = {
  title: "Aes Saputra | Certifications Page",
  description:
    "A page of my certifications.",
};

export default function CertificationsPage() {
  return (
    <>
      <TransitionEffect />
      <main className="mb-16 flex w-full flex-col items-center justify-center overflow-hidden">
        <Layout underConstruction className="pt-16">
          <h1 className="text-light">Certifications</h1>
          {/** <DndCharacterGenerator /> */}
        </Layout>
      </main>
    </>
  );
}

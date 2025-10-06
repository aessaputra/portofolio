import type { Metadata } from "next";

import CertificationsContent from "@/features/certifications/public/components/CertificationsContent";
import Layout from "@/shared/ui/layout";
import TransitionEffect from "@/shared/ui/transition-effect";
import { getCertifications } from "@/entities/certifications";

export const metadata: Metadata = {
  title: "Aes Saputra | Certifications",
  description: "Professional certifications and achievements of Aes Saputra.",
};

export default async function CertificationsPage() {
  const certifications = await getCertifications();

  return (
    <>
      <TransitionEffect />
      <main className="mb-16 flex w-full flex-col items-center justify-center dark:text-light">
        <Layout className="pt-16">
          <CertificationsContent certifications={certifications} />
        </Layout>
      </main>
    </>
  );
}

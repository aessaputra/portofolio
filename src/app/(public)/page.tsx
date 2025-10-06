import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import AnimatedText from "@/shared/ui/animated-text";
import HireMe from "@/features/home/public/components/HireMe";
import { LinkArrow } from "@/shared/ui/icons";
import Layout from "@/shared/ui/layout";
import TransitionEffect from "@/shared/ui/transition-effect";
import { normalizeMailto } from "@/shared/lib/contact";
import { getHomeContent } from "@/entities/home";

export const metadata: Metadata = {
  title: "Welcome to my Portfolio",
  description: "Aes Saputra Portfolio",
};

export default async function HomePage() {
  const content = await getHomeContent();
  const shouldUnoptimize = !content.profileImagePath.endsWith(".png");
  const contactHref = normalizeMailto(content.contactEmail);

  return (
    <>
      <TransitionEffect />
      <main className="flex min-h-screen w-full items-center text-dark dark:text-light">
        <Layout className="pt-0 md:p-16 sm:pt-8">
          <div className="flex w-full items-center justify-between lg:flex-col">
            <div className="w-1/2 md:w-full lg:mb-8 lg:flex lg:justify-center">
              <div className="relative w-full max-w-lg aspect-square lg:max-w-md md:max-w-md sm:max-w-sm">
                <Image
                  src={content.profileImagePath}
                  alt="AES"
                  fill
                  className="rounded-full object-contain"
                  priority
                  sizes="(max-width: 640px) 80vw, (max-width: 768px) 60vw, (max-width: 1024px) 50vw, 40vw"
                  quality={90}
                  unoptimized={shouldUnoptimize}
                />
              </div>
            </div>
            <div className="flex w-1/2 flex-col items-center self-center lg:w-full lg:text-center lg:mt-8">
              <AnimatedText
                text={content.headline}
                className="text-6xl! text-left! xl:text-5xl! lg:text-center! lg:text-6xl! md:text-5xl! sm:text-3xl! sm:pt-2"
              />
              <p className="my-4 text-base font-medium md:text-sm sm:text-xs">{content.subheadline}</p>
              <div className="mt-2 flex items-center self-start lg:self-center">
                <Link
                  href={content.resumeUrl}
                  target="_blank"
                  download
                  className="flex items-center rounded-lg border-2 border-solid border-transparent bg-dark p-2.5 px-6 text-lg font-semibold text-light transition-colors hover:border-dark hover:bg-light hover:text-dark dark:bg-light dark:text-dark hover:dark:border-light hover:dark:bg-dark hover:dark:text-light md:p-2 md:px-4 md:text-base"
                >
                  Resume
                  <LinkArrow className="ml-1 w-6" />
                </Link>
                <Link
                  href={contactHref}
                  className="ml-4 text-lg font-medium capitalize text-dark underline dark:text-light md:text-base"
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </Layout>
        {content.showHireMe && <HireMe contactEmail={content.contactEmail} />}
      </main>
    </>
  );
}

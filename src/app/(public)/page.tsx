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
import styles from "@/styles/home.module.css";

export const metadata: Metadata = {
  title: "Welcome to my Portfolio",
  description: "Aes Saputra Portfolio",
};

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const content = await getHomeContent();
  const hasProfileImage = content.profileImagePath && content.profileImagePath.trim() !== "";
  // Always unoptimize images from custom domain to avoid Next.js optimization issues
  const shouldUnoptimize = hasProfileImage ? true : undefined;
  const contactHref = normalizeMailto(content.contactEmail);

  return (
    <>
      <TransitionEffect />
      <main className="flex min-h-screen w-full items-center text-dark dark:text-light">
        <Layout className="pt-0 md:p-16 sm:pt-8">
          <div className="flex items-center justify-between w-full lg:flex-col">
            <div className="w-1/2 md:w-full sm:w-full">
              {hasProfileImage ? (
                <Image
                  src={content.profileImagePath}
                  alt="AES"
                  width={800}
                  height={800}
                  className={`${styles.profileImage} w-full h-auto lg:hidden md:inline-block md:w-full sm:block`}
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                  quality={95}
                  unoptimized={shouldUnoptimize}
                />
              ) : (
                <div className={`${styles.profileImage} w-full h-auto lg:hidden md:inline-block md:w-full sm:block flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-lg`}>
                  <span className="text-gray-500 dark:text-gray-400 text-lg">No Profile Image</span>
                </div>
              )}
            </div>
            <div className="w-1/2 flex flex-col items-center self-center lg:w-full lg:text-center">
              <AnimatedText
                text={content.headline}
                className={`${styles.headlineText} text-6xl text-left xl:text-5xl lg:text-center lg:text-6xl sm:pt-2`}
              />
              <p className="my-4 text-base font-medium md:text-sm sm:text-xs">
                {content.subheadline}
              </p>
              <div className="flex items-center self-start mt-2 lg:self-center">
                <Link
                  href={content.resumeUrl}
                  target="_blank"
                  download
                  className="flex items-center bg-dark text-light p-2.5 px-6 rounded-lg text-lg font-semibold hover:bg-light hover:text-dark border-2 
                  border-solid border-transparent hover:border-dark dark:bg-light dark:text-dark hover:dark:bg-dark hover:dark:text-light hover:dark:border-light md:p-2 md:px-4 md:text-base"
                >
                  Resume
                  <LinkArrow className="w-6 ml-1" />
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

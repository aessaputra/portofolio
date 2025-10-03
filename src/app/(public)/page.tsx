import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AnimatedText from "@/components/AnimatedText";
import HireMe from "@/components/HireMe";
import { LinkArrow } from "@/components/Icons";
import Layout from "@/components/Layout";
import TransitionEffect from "@/components/TransitionEffect";
import { db } from "@/db/client";
import { homeContent } from "@/db/schema";
import { eq } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Welcome to my Portfolio",
  description: "Aes Saputra Portfolio",
};

// Original hardcoded data used as a fallback to prevent visual regressions
const fallbackData = {
  headline: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  subheadline:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  resumeUrl: "/example.pdf",
  contactEmail: "mailto:aessaputra@yahoo.com",
  profileImagePath: "/images/profile/developer-pic-1.png",
  showHireMe: true,
  githubUrl: "https://github.com",
  linkedinUrl: "https://linkedin.com",
  xUrl: "https://x.com",
};

async function getHomeContent() {
  try {
    const content = await db.query.homeContent.findFirst({
      where: eq(homeContent.id, 1),
    });
    return content || fallbackData;
  } catch (error) {
    console.error("Database query failed, using fallback data:", error);
    return fallbackData;
  }
}

export default async function HomePage() {
  const content = await getHomeContent();

  return (
    <>
      <TransitionEffect />
      <main className="flex min-h-screen w-full items-center text-dark dark:text-light">
        <Layout className="pt-0 md:p-16 sm:pt-8">
          <div className="flex w-full items-center justify-between lg:flex-col">
            <div className="w-1/2 md:w-full lg:mb-8 lg:flex lg:justify-center">
              <div className="relative w-full max-w-lg aspect-square lg:max-w-md md:max-w-md sm:max-w-sm">
                {content.profileImagePath.endsWith('.png') ? (
                  <img
                    src={content.profileImagePath}
                    alt="AES"
                    className="w-full h-full object-contain rounded-full"
                    style={{
                      backgroundColor: 'transparent',
                      background: 'transparent',
                      backgroundImage: 'none',
                      backgroundClip: 'padding-box',
                      maxWidth: '100%',
                      height: 'auto',
                    }}
                  />
                ) : (
                  <Image
                    src={content.profileImagePath}
                    alt="AES"
                    fill
                    className="object-contain rounded-full"
                    priority
                    sizes="(max-width: 640px) 80vw, (max-width: 768px) 60vw, (max-width: 1024px) 50vw, 40vw"
                    quality={90}
                    unoptimized
                  />
                )}
              </div>
            </div>
            <div className="flex w-1/2 flex-col items-center self-center lg:w-full lg:text-center lg:mt-8">
              <AnimatedText
                text={content.headline}
                className="text-6xl! text-left! xl:text-5xl! lg:text-center! lg:text-6xl! md:text-5xl! sm:text-3xl! sm:pt-2"
              />
              <p className="my-4 text-base font-medium md:text-sm sm:text-xs">
                {content.subheadline}
              </p>
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
                  href={content.contactEmail}
                  target="_blank"
                  className="ml-4 text-lg font-medium capitalize text-dark underline dark:text-light md:text-base"
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </Layout>
        {content.showHireMe && <HireMe />}
      </main>
    </>
  );
}
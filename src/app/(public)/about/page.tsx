import type { Metadata } from "next";
import Image from "next/image";

import AnimatedText from "@/shared/ui/animated-text";
import Education from "@/features/about/public/components/Education";
import Experience from "@/features/about/public/components/Experience";
import Layout from "@/shared/ui/layout";
import Skills from "@/features/about/public/components/Skills";
import TransitionEffect from "@/shared/ui/transition-effect";
import AboutCounters from "@/features/about/public/components/AboutCounters";
import { getAboutContent } from "@/entities/about";
import styles from "@/styles/About.module.css";

export const metadata: Metadata = {
  title: "Aes Saputra | About Page",
  description: "Learn more about Aes Saputra, a web developer and UI/UX designer.",
};

export default async function AboutPage() {
  const content = await getAboutContent();
  const hasAboutProfileImage = content.aboutProfileImagePath && content.aboutProfileImagePath.trim() !== "";

  return (
    <>
      <TransitionEffect />
      <main className="flex w-full flex-col items-center justify-center dark:text-light">
        <Layout className="pt-16">
          <AnimatedText
            text={content.headline}
            className="mb-16 lg:text-7xl! sm:mb-8 sm:text-6xl! xs:text-4xl!"
          />
          <div className={`grid w-full grid-cols-8 gap-16 sm:gap-8 ${styles.mobileAboutContainer}`}>
            <div className={`col-span-3 flex flex-col items-start justify-start xl:col-span-4 md:order-2 md:col-span-8 ${styles.mobileTextColumn}`}>
              <h2 className="mb-4 text-lg font-bold uppercase text-dark/75 dark:text-light/75">
                About Me
              </h2>
              <div className={styles.mobileTextContainer}>
                {content.aboutMeText && (
                  <div className={`font-medium ${styles.mobileAboutMeText1} ${styles.aboutMeTextJustified}`}>
                    {content.aboutMeText.split('\n').map((paragraph, index) => (
                      paragraph.trim() && (
                        <p key={index} className="mb-4 last:mb-0">
                          {paragraph.trim()}
                        </p>
                      )
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={`relative col-span-3 h-max rounded-2xl border-2 border-solid border-dark bg-light p-8 dark:border-light dark:bg-dark xl:col-span-4 md:order-1 md:col-span-8 ${styles.mobileImageColumn}`}>
              <div className="absolute top-0 -right-3 -z-10 h-[103%] w-[102%] rounded-4xl bg-dark dark:bg-light" />
              {hasAboutProfileImage ? (
                <Image
                  src={content.aboutProfileImagePath}
                  alt="Aes"
                  className={`h-auto w-full rounded-2xl ${styles.mobileProfileImage}`}
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                  width={500}
                  height={500}
                />
              ) : (
                <div className={`h-auto w-full rounded-2xl ${styles.mobileProfileImage} flex items-center justify-center bg-gray-200 dark:bg-gray-700`}>
                  <span className="text-gray-500 dark:text-gray-400 text-lg">No Profile Image</span>
                </div>
              )}
            </div>

            <AboutCounters data={content.counters} />
          </div>

          <Skills data={{ skills: content.skills }} />
          <Experience data={{ experiences: content.experiences }} />
          <Education data={{ education: content.education }} />
        </Layout>
      </main>
    </>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import AnimatedText from "@/components/AnimatedText";
import Education from "@/components/Education";
import Experience from "@/components/Experience";
import Layout from "@/components/Layout";
import Skills from "@/components/Skills";
import TransitionEffect from "@/components/TransitionEffect";
import AboutCounters from "@/components/about/AboutCounters";
import { db, testConnection, pool } from "@/db/client";
import { aboutContent } from "@/db/schema";
import { eq } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Aes Saputra | About Page",
  description: "Learn more about Aes Saputra, a web developer and UI/UX designer.",
};

// Original hardcoded data used as a fallback to prevent visual regressions
const fallbackData = {
  headline: "Lorem Ipsum Dolor Sit Amet!",
  aboutMeText1: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  aboutMeText2: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  aboutMeText3: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  profileImagePath: "/images/profile/developer-pic-2.jpg",
  satisfiedClients: "8",
  projectsCompleted: "10",
  yearsOfExperience: "4",
  skills: [
    { name: "HTML", x: "-21vw", y: "2vw" },
    { name: "CSS", x: "-6vw", y: "-9vw" },
    { name: "JavaScript", x: "19vw", y: "6vw" },
    { name: "React", x: "0vw", y: "10vw" },
    { name: "D3.js", x: "-21vw", y: "-15vw" },
    { name: "THREEJS", x: "19vw", y: "-12vw" },
    { name: "NextJS", x: "31vw", y: "-5vw" },
    { name: "Python", x: "19vw", y: "-20vw" },
    { name: "Tailwind CSS", x: "0vw", y: "-20vw" },
    { name: "Figma", x: "-24vw", y: "18vw" },
    { name: "Blender", x: "17vw", y: "17vw" },
  ],
  experiences: [
    {
      position: "Lorem Ipsum",
      company: "Lorem Ipsum",
      companyLink: "/",
      time: "2022-Present",
      address: "Lorem, Ipsum",
      work: [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
      ]
    },
    {
      position: "Lorem Ipsum",
      company: "Lorem Ipsum",
      companyLink: "/",
      time: "2022-Present",
      address: "Lorem, Ipsum",
      work: [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
      ]
    },
    {
      position: "Lorem Ipsum",
      company: "Lorem Ipsum",
      companyLink: "/",
      time: "2022-Present",
      address: "Lorem, Ipsum",
      work: [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
      ]
    }
  ],
  education: [
    {
      type: "Lorem Ipsum",
      time: "2022-2026",
      place: "Lorem Ipsum Dolor Sit Amet",
      info: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
      type: "Lorem Ipsum",
      time: "2022-2026",
      place: "Lorem Ipsum Dolor Sit Amet",
      info: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
      type: "Lorem Ipsum",
      time: "2022-2026",
      place: "Lorem Ipsum Dolor Sit Amet",
      info: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    }
  ],
};

async function getAboutContent() {
  try {
    // Test database connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error("Database connection test failed, using fallback data");
      return fallbackData;
    }

    // Check if the table exists and has the required columns
    try {
      const tableCheck = await pool.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'about_content'
        ORDER BY ordinal_position
      `);
      
      console.log("Table columns:", tableCheck.rows);
      
      // Check if the new columns exist
      const columns = tableCheck.rows.map(row => row.column_name);
      const hasSkills = columns.includes('skills');
      const hasExperiences = columns.includes('experiences');
      const hasEducation = columns.includes('education');
      
      console.log("Schema check - skills:", hasSkills, "experiences:", hasExperiences, "education:", hasEducation);
      
      // If the new columns don't exist, we need to run the migration
      if (!hasSkills || !hasExperiences || !hasEducation) {
        console.error("Database schema is missing new columns, using fallback data");
        return fallbackData;
      }
    } catch (schemaError) {
      console.error("Schema check failed:", schemaError);
      return fallbackData;
    }

    // Now try to fetch the content
    const content = await db.query.aboutContent.findFirst({
      where: eq(aboutContent.id, 1),
    });
    
    if (!content) {
      console.log("No content found in database, using fallback data");
      return fallbackData;
    }
    
    console.log("Successfully retrieved content from database");
    return content;
  } catch (error) {
    console.error("Database query failed, using fallback data:", error);
    
    // Provide more detailed error information
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return fallbackData;
  }
}

export default async function AboutPage() {
  const content = await getAboutContent();

  return (
    <>
      <TransitionEffect />
      <main className="flex w-full flex-col items-center justify-center dark:text-light">
        <Layout className="pt-16">
          <AnimatedText
            text={content.headline}
            className="mb-16 lg:text-7xl! sm:mb-8 sm:text-6xl! xs:text-4xl!"
          />
          <div className="grid w-full grid-cols-8 gap-16 sm:gap-8">
            <div className="col-span-3 flex flex-col items-start justify-start xl:col-span-4 md:order-2 md:col-span-8">
              <h2 className="mb-4 text-lg font-bold uppercase text-dark/75 dark:text-light/75">
                About Me
              </h2>
              <p className="font-medium">
                {content.aboutMeText1}
              </p>
              <p className="my-4 font-medium">
                {content.aboutMeText2}
              </p>
              <p className="font-medium">
                {content.aboutMeText3}
              </p>
            </div>

            <div className="relative col-span-3 h-max rounded-2xl border-2 border-solid border-dark bg-light p-8 dark:border-light dark:bg-dark xl:col-span-4 md:order-1 md:col-span-8">
              <div className="absolute top-0 -right-3 -z-10 h-[103%] w-[102%] rounded-4xl bg-dark dark:bg-light" />
              <Image
                src={content.profileImagePath}
                alt="Aes"
                className="h-auto w-full rounded-2xl"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                width={500}
                height={500}
              />
            </div>
            <AboutCounters
              data={{
                satisfiedClients: content.satisfiedClients,
                projectsCompleted: content.projectsCompleted,
                yearsOfExperience: content.yearsOfExperience,
              }}
            />
          </div>

          <Skills data={{ skills: content.skills as any[] }} />

          <Experience data={{ experiences: content.experiences as any[] }} />
          <Education data={{ education: content.education as any[] }} />
        </Layout>
      </main>
    </>
  );
}

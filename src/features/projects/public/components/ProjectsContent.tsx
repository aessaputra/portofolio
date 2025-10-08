"use client";

import Image from "next/image";
import Link from "next/link";

import AnimatedText from "@/shared/ui/animated-text";
import { GithubIcon } from "@/shared/ui/icons";
import { makeMotion } from "@/shared/ui/motion";
import type { Project } from "@/entities/projects";

const MotionImage = makeMotion(Image);

type FeaturedProjectProps = {
  type: string;
  title: string;
  summary: string;
  editableText: string;
  img: string;
  link: string;
  github: string;
};

type ProjectCardProps = {
  title: string;
  type: string;
  img: string;
  link: string;
  github: string;
};

type ProjectsContentProps = {
  projects: Project[];
};

const FeaturedProject = ({ type, title, summary, editableText, img, link, github }: FeaturedProjectProps) => {
  const hasImage = img && img.trim() !== "";
  
  return (
    <article className="relative flex w-full items-center justify-between rounded-3xl rounded-br-2xl border border-solid border-dark bg-light p-8 shadow-2xl dark:border-light dark:bg-dark xl:flex-col xl:p-6 lg:flex-col lg:p-6 md:p-6 sm:rounded-2xl sm:rounded-br-3xl sm:p-4 xs:p-3">
      <div className="absolute top-0 -right-3 -z-10 h-[103%] w-full rounded-[2.5rem] rounded-br-3xl bg-dark dark:bg-light xl:-right-2 xl:h-[102%] xl:w-full xl:rounded-3xl lg:-right-2 lg:h-[102%] lg:w-full lg:rounded-3xl md:-right-2 md:h-[102%] md:w-full md:rounded-3xl sm:-right-2 sm:h-[102%] sm:w-full sm:rounded-3xl xs:-right-1 xs:h-[101%] xs:w-full xs:rounded-2xl" />
      <Link href={link} target="_blank" className="w-1/2 cursor-pointer overflow-hidden rounded-lg xl:w-full xl:mb-6 lg:w-full lg:mb-6 md:w-full md:mb-4 sm:w-full sm:mb-4">
        {hasImage ? (
          <MotionImage
            src={img}
            alt={title}
            width={600}
            height={400}
            className="h-auto w-full rounded-xl"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          />
        ) : (
          <div className="h-auto w-full rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center aspect-[3/2]">
            <span className="text-gray-500 dark:text-gray-400 text-lg">No Image</span>
          </div>
        )}
      </Link>

    <div className="flex w-1/2 flex-col items-start justify-between pl-6 xl:w-full xl:pl-0 xl:pt-0 lg:w-full lg:pl-0 lg:pt-0 md:w-full md:pl-0 md:pt-0 sm:w-full sm:pl-0 sm:pt-0">
      <div className="mb-2">
        <span className="text-xl font-medium text-primary dark:text-primaryDark xl:text-lg lg:text-lg md:text-base sm:text-sm xs:text-xs">{type}</span>
      </div>
      <Link href={link} target="_blank" className="hover:underline underline-offset-2">
        <h2 className="my-2 w-full text-left text-4xl font-bold dark:text-light xl:text-3xl lg:text-3xl md:text-2xl sm:text-xl xs:text-lg">{title}</h2>
      </Link>
      <div className="mb-4">
        <p className="text-lg font-medium text-dark dark:text-light xl:text-base lg:text-base md:text-sm sm:text-sm xs:text-xs line-clamp-3">{summary}</p>
        <p className="text-xl font-bold text-primary dark:text-primaryDark mt-2 xl:text-lg lg:text-lg md:text-base sm:text-sm xs:text-xs">{editableText}</p>
      </div>
      <div className="mt-2 flex items-center w-full gap-4 sm:gap-2 xs:gap-2">
        <Link href={github} target="_blank" className="w-10 xl:w-8 lg:w-8 md:w-7 sm:w-6 xs:w-5 flex-shrink-0">
          <GithubIcon />
        </Link>
        <Link
          href={link}
          target="_blank"
          className="rounded-lg bg-dark p-2 px-6 text-lg font-semibold text-light dark:bg-light dark:text-dark xl:px-4 xl:text-base lg:px-4 lg:text-base md:px-3 md:text-sm sm:px-3 sm:text-sm xs:px-2 xs:text-xs flex-1 text-center"
        >
          Visit Project
        </Link>
      </div>
    </div>
  </article>
  );
};

const ProjectCard = ({ title, type, img, link, github }: ProjectCardProps) => {
  const hasImage = img && img.trim() !== "";
  
  return (
    <article className="relative flex w-full flex-col items-center justify-center rounded-2xl border border-solid border-dark bg-light p-6 dark:border-light dark:bg-dark xl:p-5 lg:p-5 md:p-4 sm:p-3 xs:p-3 transition-all duration-300 hover:shadow-lg">
      <div className="absolute top-0 -right-3 -z-10 h-[103%] w-full rounded-4xl rounded-br-3xl bg-dark dark:bg-light xl:-right-2 xl:w-[101%] xl:rounded-3xl lg:-right-2 lg:w-[101%] lg:rounded-3xl md:-right-2 md:w-[101%] md:rounded-3xl sm:-right-1 sm:h-[102%] sm:w-full sm:rounded-3xl xs:-right-1 xs:h-[101%] xs:w-full xs:rounded-2xl" />
      <div className="w-full cursor-pointer overflow-hidden rounded-lg mb-4">
        <Link href={link} target="_blank">
          {hasImage ? (
            <MotionImage
              src={img}
              alt={title}
              width={600}
              height={400}
              className="h-auto w-full rounded-xl"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            />
          ) : (
            <div className="h-auto w-full rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center aspect-[3/2]">
              <span className="text-gray-500 dark:text-gray-400 text-lg">No Image</span>
            </div>
          )}
        </Link>
      </div>

    <div className="flex w-full flex-col items-start justify-between">
      <div className="mb-2">
        <span className="text-lg font-medium text-primary dark:text-primaryDark xl:text-base lg:text-base md:text-sm sm:text-xs xs:text-xs">{type}</span>
      </div>
      <Link href={link} target="_blank" className="hover:underline underline-offset-2 w-full">
        <h2 className="my-1 w-full text-left text-2xl font-bold dark:text-light xl:text-xl lg:text-xl md:text-lg sm:text-base xs:text-sm line-clamp-1">{title}</h2>
      </Link>

      <div className="mt-3 flex w-full items-center justify-between gap-2">
        <Link href={link} target="_blank" className="text-base font-semibold text-primary dark:text-primaryDark hover:underline xl:text-sm lg:text-sm md:text-xs sm:text-xs xs:text-xs flex-1">
          Visit Project
        </Link>
        <Link href={github} target="_blank" className="w-8 xl:w-7 lg:w-7 md:w-6 sm:w-5 xs:w-5 flex-shrink-0">
          <GithubIcon />
        </Link>
      </div>
    </div>
  </article>
  );
};

export default function ProjectsContent({ projects }: ProjectsContentProps) {
  const featuredProjects = projects.filter((project) => project.featured);
  const regularProjects = projects.filter((project) => !project.featured);

  const hasNoProjects = projects.length === 0;
  const headingText =
    featuredProjects[0]?.editableText ??
    projects[0]?.editableText ??
    "Highlighted Projects";

  return (
    <>
      <AnimatedText
        text={headingText}
        className="mb-16 xl:text-7xl! lg:text-7xl! md:text-6xl! sm:mb-8 sm:text-5xl! xs:text-4xl!"
      />

      <div className="grid grid-cols-12 gap-24 gap-y-32 xl:gap-x-16 xl:gap-y-24 lg:gap-x-8 lg:gap-y-20 md:gap-x-6 md:gap-y-16 sm:gap-x-4 sm:gap-y-12 xs:gap-x-2 xs:gap-y-8">
        {featuredProjects.map((project) => (
          <div key={project.id} className="col-span-12">
            <FeaturedProject
              title={project.title}
              img={project.imageUrl}
              summary={project.summary ?? ""}
              editableText={project.editableText}
              link={project.link}
              type={project.type}
              github={project.github}
            />
          </div>
        ))}

        {regularProjects.map((project) => (
          <div key={project.id} className="col-span-6 xl:col-span-6 lg:col-span-6 md:col-span-6 sm:col-span-12 xs:col-span-12">
            <ProjectCard
              title={project.title}
              img={project.imageUrl}
              link={project.link}
              type={project.type}
              github={project.github}
            />
          </div>
        ))}

        {hasNoProjects && (
          <div className="col-span-12 text-center py-8">
            <p className="text-lg xl:text-base lg:text-base md:text-sm sm:text-sm xs:text-xs text-gray-600 dark:text-gray-400">
              No projects available at the moment.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

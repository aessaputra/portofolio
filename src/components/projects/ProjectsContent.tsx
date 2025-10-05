"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AnimatedText from "@/components/AnimatedText";
import { GithubIcon } from "@/components/Icons";
import { makeMotion } from "@/components/motion/Motion";

interface Project {
  id: number;
  title: string;
  type: string;
  summary?: string;
  description?: string;
  editableText: string;
  imageUrl: string;
  imageAlt: string;
  link: string;
  github: string;
  tags: string[];
  featured: boolean;
  technologies: string[];
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

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

type ProjectProps = {
  title: string;
  type: string;
  img: string;
  link: string;
  github: string;
};

const FeaturedProject = ({ type, title, summary, editableText, img, link, github }: FeaturedProjectProps) => (
  <article className="relative flex w-full items-center justify-between rounded-3xl rounded-br-2xl border border-solid border-dark bg-light p-8 shadow-2xl dark:border-light dark:bg-dark lg:flex-col lg:p-6 md:p-6 sm:rounded-2xl sm:rounded-br-3xl sm:p-4">
    <div className="absolute top-0 -right-3 -z-10 h-[103%] w-full rounded-[2.5rem] rounded-br-3xl bg-dark dark:bg-light xs:-right-2 xs:h-[102%] xs:w-full xs:rounded-3xl" />
    <Link href={link} target="_blank" className="w-1/2 cursor-pointer overflow-hidden rounded-lg lg:w-full lg:mb-6">
      <MotionImage
        src={img}
        alt={title}
        width={600}
        height={400}
        className="h-auto w-full rounded-xl"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      />
    </Link>

    <div className="flex w-1/2 flex-col items-start justify-between pl-6 lg:w-full lg:pl-0 lg:pt-0">
      <div className="mb-2">
        <span className="text-xl font-medium text-primary dark:text-primaryDark lg:text-lg md:text-base sm:text-base">{type}</span>
      </div>
      <Link href={link} target="_blank" className="hover:underline underline-offset-2">
        <h2 className="my-2 w-full text-left text-4xl font-bold dark:text-light lg:text-3xl md:text-2xl sm:text-xl">{title}</h2>
      </Link>
      <div className="mb-4">
        <p className="text-lg font-medium text-dark dark:text-light lg:text-base md:text-sm line-clamp-3">{summary}</p>
        <p className="text-xl font-bold text-primary dark:text-primaryDark mt-2 lg:text-lg md:text-base sm:text-base">{editableText}</p>
      </div>
      <div className="mt-2 flex items-center w-full">
        <Link href={github} target="_blank" className="w-10 lg:w-8 md:w-7">
          <GithubIcon />
        </Link>
        <Link
          href={link}
          target="_blank"
          className="ml-4 rounded-lg bg-dark p-2 px-6 text-lg font-semibold text-light dark:bg-light dark:text-dark lg:px-4 lg:text-base md:px-3 md:text-sm sm:px-3 sm:text-sm flex-1 text-center"
        >
          Visit Project
        </Link>
      </div>
    </div>
  </article>
);

const Project = ({ title, type, img, link, github }: ProjectProps) => (
  <article className="relative flex w-full flex-col items-center justify-center rounded-2xl border border-solid border-dark bg-light p-6 dark:border-light dark:bg-dark md:p-5 sm:p-4 transition-all duration-300 hover:shadow-lg">
    <div className="absolute top-0 -right-3 -z-10 h-[103%] w-full rounded-4xl rounded-br-3xl bg-dark dark:bg-light md:-right-2 md:w-[101%] sm:h-[102%] sm:rounded-3xl" />
    <div className="w-full cursor-pointer overflow-hidden rounded-lg mb-4">
      <Link href={link} target="_blank">
        <MotionImage
          src={img}
          alt={title}
          width={600}
          height={400}
          className="h-auto w-full rounded-xl"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        />
      </Link>
    </div>

    <div className="flex w-full flex-col items-start justify-between">
      <div className="mb-2">
        <span className="text-lg font-medium text-primary dark:text-primaryDark lg:text-base md:text-sm sm:text-sm">{type}</span>
      </div>
      <Link href={link} target="_blank" className="hover:underline underline-offset-2 w-full">
        <h2 className="my-1 w-full text-left text-2xl font-bold dark:text-light lg:text-xl md:text-lg sm:text-lg line-clamp-1">{title}</h2>
      </Link>

      <div className="mt-3 flex w-full items-center justify-between">
        <Link href={link} target="_blank" className="text-base font-semibold text-primary dark:text-primaryDark hover:underline md:text-sm">
          Visit Project
        </Link>
        <Link href={github} target="_blank" className="w-8 md:w-7 sm:w-6">
          <GithubIcon />
        </Link>
      </div>
    </div>
  </article>
);

export default function ProjectsContent() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setError(null);
      const response = await fetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || "Unknown error";
        const errorDetails = errorData.details || "";
        console.error("Failed to fetch projects:", errorMessage, errorDetails);
        setError(`${errorMessage}${errorDetails ? `: ${errorDetails}` : ""}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error fetching projects:", error);
      setError(`Network error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <button
          onClick={fetchProjects}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  // Separate featured and regular projects
  const featuredProjects = projects.filter(project => project.featured);
  const regularProjects = projects.filter(project => !project.featured);

  return (
    <>
      <AnimatedText
        text="Innovation Meets Usability!"
        className="mb-16 lg:text-7xl! sm:mb-8 sm:text-6xl! xs:text-4xl!"
      />

      <div className="grid grid-cols-12 gap-24 gap-y-32 xl:gap-x-16 lg:gap-x-8 md:gap-y-24 sm:gap-x-4">
        {featuredProjects.map((project, index) => (
          <div key={project.id} className="col-span-12">
            <FeaturedProject
              title={project.title}
              img={project.imageUrl}
              summary={project.summary || ""}
              editableText={project.editableText || "Innovation Meets Usability!"}
              link={project.link}
              type={project.type}
              github={project.github}
            />
          </div>
        ))}

        {regularProjects.map((project, index) => (
          <div key={project.id} className="col-span-6 lg:col-span-6 md:col-span-6 sm:col-span-12">
            <Project
              title={project.title}
              img={project.imageUrl}
              link={project.link}
              type={project.type}
              github={project.github}
            />
          </div>
        ))}

        {projects.length === 0 && (
          <div className="col-span-12 text-center py-8">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              No projects available at the moment.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

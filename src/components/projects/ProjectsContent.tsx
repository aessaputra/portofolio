"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import AnimatedText from "@/components/AnimatedText";
import { GithubIcon } from "@/components/Icons";
import { makeMotion } from "@/components/motion/Motion";
import Omnifood from "@/../public/images/projects/crypto-screener-cover-image.jpg";
import QuoteCloud from "@/../public/images/projects/nft-collection-website-cover-image.jpg";
import ReflectionMat from "@/../public/images/projects/fashion-studio-website.jpg";
import StarShower from "@/../public/images/projects/agency-website-cover-image.jpg";
import SunsetRacer from "@/../public/images/projects/portfolio-cover-image.jpg";

const MotionImage = makeMotion(Image);

type FeaturedProjectProps = {
  type: string;
  title: string;
  summary: string;
  img: StaticImageData;
  link: string;
  github: string;
};

type ProjectProps = {
  title: string;
  type: string;
  img: StaticImageData;
  link: string;
  github: string;
};

const FeaturedProject = ({ type, title, summary, img, link, github }: FeaturedProjectProps) => (
  <article className="relative flex w-full items-center justify-between rounded-3xl rounded-br-2xl border border-solid border-dark bg-light p-12 shadow-2xl dark:border-light dark:bg-dark lg:flex-col lg:p-8 xs:rounded-2xl xs:rounded-br-3xl xs:p-4">
    <div className="absolute top-0 -right-3 -z-10 h-[103%] w-full rounded-[2.5rem] rounded-br-3xl bg-dark dark:bg-light xs:-right-2 xs:h-[102%] xs:w-full xs:rounded-3xl" />
    <Link href={link} target="_blank" className="w-1/2 cursor-pointer overflow-hidden rounded-lg lg:w-full">
      <MotionImage
        src={img}
        alt={title}
        className="h-auto w-full rounded-xl"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      />
    </Link>

    <div className="flex w-1/2 flex-col items-start justify-between pl-6 lg:w-full lg:pl-0 lg:pt-6">
      <span className="text-xl font-medium text-primary dark:text-primaryDark xs:text-base">{type}</span>
      <Link href={link} target="_blank" className="hover:underline underline-offset-2">
        <h2 className="my-2 w-full text-left text-4xl font-bold dark:text-light sm:text-sm">{title}</h2>
      </Link>
      <p className="my-2 font-medium text-dark dark:text-light sm:text-sm">{summary}</p>
      <div className="mt-2 flex items-center">
        <Link href={github} target="_blank" className="w-10">
          <GithubIcon />
        </Link>
        <Link
          href={link}
          target="_blank"
          className="ml-4 rounded-lg bg-dark p-2 px-6 text-lg font-semibold text-light dark:bg-light dark:text-dark sm:px-4 sm:text-base"
        >
          Visit Project
        </Link>
      </div>
    </div>
  </article>
);

const Project = ({ title, type, img, link, github }: ProjectProps) => (
  <article className="relative flex w-full flex-col items-center justify-center rounded-2xl border border-solid border-dark bg-light p-6 dark:border-light dark:bg-dark xs:p-4">
    <div className="absolute top-0 -right-3 -z-10 h-[103%] w-full rounded-4xl rounded-br-3xl bg-dark dark:bg-light md:-right-2 md:w-[101%] xs:h-[102%] xs:rounded-3xl" />
    <Link href={link} target="_blank" className="w-full cursor-pointer overflow-hidden rounded-lg">
      <MotionImage
        src={img}
        alt={title}
        className="h-auto w-full rounded-xl"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      />
    </Link>

    <div className="mt-4 flex w-full flex-col items-start justify-between">
      <span className="text-xl font-medium text-primary dark:text-primaryDark lg:text-lg md:text-base">{type}</span>
      <Link href={link} target="_blank" className="hover:underline underline-offset-2">
        <h2 className="my-2 w-full text-left text-3xl font-bold lg:text-2xl">{title}</h2>
      </Link>

      <div className="mt-2 flex w-full items-center justify-between">
        <Link href={link} target="_blank" className="ml-4 text-lg font-semibold underline md:text-base">
          Visit
        </Link>
        <Link href={github} target="_blank" className="w-8 md:w-6">
          <GithubIcon />
        </Link>
      </div>
    </div>
  </article>
);

export default function ProjectsContent() {
  return (
    <>
      <AnimatedText
        text="Innovation Meets Usability!"
        className="mb-16 lg:text-7xl! sm:mb-8 sm:text-6xl! xs:text-4xl!"
      />

      <div className="grid grid-cols-12 gap-24 gap-y-32 xl:gap-x-16 lg:gap-x-8 md:gap-y-24 sm:gap-x-0">
        <div className="col-span-12">
          <FeaturedProject
            title="ThreeJS Quote Cloud"
            img={QuoteCloud}
            summary="A quote made of 3D Text floating in a cloud of randomly generated geometry."
            link="https://quote-cloud.vercel.app/"
            type="Featured Project"
            github="https://github.com/aessaputra/quote-cloud"
          />
        </div>
        <div className="col-span-6 sm:col-span-12">
          <Project
            title="Star Shower"
            img={StarShower}
            link="https://starshowerbkw.netlify.app/"
            type="Project"
            github="https://github.com/aessaputra/Star-Shower"
          />
        </div>
        <div className="col-span-6 sm:col-span-12">
          <Project
            title="Sunset Racer"
            img={SunsetRacer}
            link="https://sunsetracer.netlify.app/"
            type="Project"
            github="https://github.com/aessaputra/Sunset-Racing"
          />
        </div>
        <div className="col-span-12">
          <FeaturedProject
            title="Reflection Material ThreeJS"
            img={ReflectionMat}
            summary="Experimenting with geometries and materials in threejs"
            link="https://materialexp.netlify.app/"
            type="Featured Project"
            github="https://github.com/aessaputra/material-experimentation"
          />
        </div>
        <div className="col-span-6 sm:col-span-12">
          <Project
            title="Omnifood Food Delivery"
            img={Omnifood}
            link="https://omnifoodbkw.netlify.app/"
            type="Project"
            github="https://github.com/aessaputra/Omnifood-project"
          />
        </div>
      </div>
    </>
  );
}

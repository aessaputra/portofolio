"use client";

import { useRef } from "react";
import { motion, useScroll } from "./motion/Motion";
import LiIcon from "./LiIcon";

interface DetailsProps {
  position: string;
  company: string;
  companyLink: string;
  time: string;
  address: string;
  work?: string[];
}

interface ExperienceData {
  experiences: Array<{
    position: string;
    company: string;
    companyLink: string;
    time: string;
    address: string;
    work: string[];
  }>;
}

const Details = ({ position, company, companyLink, time, address, work = [] }: DetailsProps) => {
  const ref = useRef<HTMLLIElement>(null);
  return (
    <li ref={ref} className="my-8 first:mt-0 last:mb-0 w-[60%] mx-auto flex flex-col items-center justify-between md:w-[80%]">
      <LiIcon reference={ref} />
      <motion.div initial={{ y: 50 }} whileInView={{ y: 0 }} transition={{ duration: 0.5, type: "spring" }}>
        <h3 className="capitalize font-bold text-2xl sm:text-xl xs:text-lg">
          {position}&nbsp;
          <a href={companyLink} target="_blank" rel="noreferrer" className="text-primary capitalize">
            @{company}
          </a>
        </h3>
        <span className="capitalize font-medium text-dark/75 dark:text-light/75 xs:text-sm">
          {time} | {address}
        </span>
        <div className="space-y-2">
          {work.map((item, index) => (
            <p key={`${item}-${index}`} className="text-justify">{item}</p>
          ))}
        </div>
      </motion.div>
    </li>
  );
};

export default function Experience({ data }: { data?: ExperienceData }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center start"],
  });

  // Fallback experiences if data is not provided
  const fallbackExperiences = [
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
  ];

  const experiences = data?.experiences || fallbackExperiences;

  return (
    <div className="my-64">
      <h2 className="font-bold text-8xl mb-32 w-full text-center md:text-6xl xs:text-4xl md:mb-16">
        Experience
      </h2>

      <div ref={ref} className="w-[75%] mx-auto relative lg:w-[90%] md:w-full">
        <motion.div
          style={{ scaleY: scrollYProgress }}
          className="absolute left-9 top-0 w-[4px] h-full bg-dark origin-top dark:bg-light md:w-[2px] md:left-[30px] xs:left-[20px]"
        />
        <ul className="w-full flex flex-col items-start justify-between ml-4 xs:ml-2 ">
          {experiences.map((experience, index) => (
            <Details
              key={`${experience.position}-${index}`}
              position={experience.position}
              company={experience.company}
              companyLink={experience.companyLink}
              time={experience.time}
              address={experience.address}
              work={experience.work}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

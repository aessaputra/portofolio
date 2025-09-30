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
        <ul className="list-disc list-inside">
          {work.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </motion.div>
    </li>
  );
};

export default function Experience() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center start"],
  });

  const workRikerWeb: string[] = [
    "Specialize in full-stack web development using HTML/CSS, JavaScript, and Tailwind CSS",
    "Follow design mockups and wireframes for precise implementation",
    "Collaborate closely with backend developers for seamless integration",
    "Leverage Tailwind CSS utilities to create custom layouts and styles",
    "Delivered projects for various industries, increasing online leads by 25% for an HVAC company",
    "Boosted user engagement by 30% and reduced load times by 15% for a food delivery service",
    "Contributed to a 20% increase in overall project delivery efficiency",
  ];

  const workCodingForHermitCrabs: string[] = [
    "Developed and maintained websites for small businesses using HTML, CSS, and JavaScript",
    "Optimized websites for mobile responsiveness and cross-browser compatibility",
    "Implemented SEO best practices to improve search engine rankings",
    "Collaborated with clients to understand their needs and deliver custom solutions",
    "Helped write articles introducing underpriveledged teens to careers in tech",
    "Provided ongoing support and maintenance to ensure optimal performance",
  ];

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
          <Details
            position="Lorem Ipsum"
            company="Lorem Ipsum"
            companyLink="/"
            time="2022-Present"
            address="Lorem, Ipsum"
            work={["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."]}
          />
          <Details
            position="Lorem Ipsum"
            company="Lorem Ipsum"
            companyLink="/"
            time="2022-Present"
            address="Lorem, Ipsum"
            work={["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."]}
          />
          <Details
            position="Lorem Ipsum"
            company="Lorem Ipsum"
            companyLink="/"
            time="2022-Present"
            address="Lorem, Ipsum"
            work={["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."]}
          />
        </ul>
      </div>
    </div>
  );
}

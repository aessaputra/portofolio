"use client";

import { useRef, type MouseEvent } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import AnimatedText from "@/components/AnimatedText";
import { m, makeMotion, useMotionValue } from "@/components/motion/Motion";
import article1 from "@/../public/images/articles/pagination component in reactjs.jpg";
import article2 from "@/../public/images/articles/form validation in reactjs using custom react hook.png";

const MotionImage = makeMotion(Image);

type MovingImgProps = {
  title: string;
  img: StaticImageData;
  link: string;
};

type ArticleItemProps = {
  img: StaticImageData;
  title: string;
  time: string;
  link: string;
};

type FeaturedArticleProps = {
  img: StaticImageData;
  title: string;
  time: string;
  summary: string;
  link: string;
};

const MovingImg = ({ title, img, link }: MovingImgProps) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleMouse = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!imgRef.current) return;
    imgRef.current.style.display = "inline-block";
    x.set(event.pageX);
    y.set(-10);
  };

  const handleMouseLeave = () => {
    if (!imgRef.current) return;
    imgRef.current.style.display = "none";
    x.set(0);
    y.set(0);
  };

  return (
    <Link href={link} target="_blank" onMouseMove={handleMouse} onMouseLeave={handleMouseLeave}>
      <h2 className="text-xl font-semibold capitalize hover:underline">{title}</h2>
      <MotionImage
        style={{ x, y }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1, transition: { duration: 0.2 } }}
        ref={imgRef}
        src={img}
        alt={title}
        className="absolute z-20 hidden h-auto w-96 rounded-lg object-cover md:hidden!"
      />
    </Link>
  );
};

const ArticleItem = ({ img, title, time, link }: ArticleItemProps) => (
  <m.li
    initial={{ y: 200 }}
    whileInView={{ y: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
    viewport={{ once: true }}
    className="relative my-4 flex w-full items-center justify-between rounded-xl bg-light p-4 py-6 text-dark first:mt-0 dark:border-light dark:bg-dark dark:text-light sm:flex-col"
  >
    <MovingImg title={title} img={img} link={link} />
    <span className="pl-4 font-semibold text-primary sm:self-start sm:pl-0 xs:text-sm">
      {time}
    </span>
  </m.li>
);

const FeaturedArticle = ({ img, title, time, summary, link }: FeaturedArticleProps) => (
  <li className="relative col-span-1 w-full rounded-2xl border border-solid border-dark bg-light p-4">
    <div className="absolute top-0 -right-3 -z-10 h-[103%] w-full rounded-4xl rounded-br-3xl bg-dark" />
    <Link href={link} target="_blank" className="inline-block w-full cursor-pointer overflow-hidden rounded-lg">
      <MotionImage
        src={img}
        alt={title}
        className="h-auto w-full"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      />
    </Link>
    <Link href={link} target="_blank">
      <h2 className="my-2 mt-4 text-2xl font-bold capitalize hover:underline xs:text-lg">{title}</h2>
    </Link>
    <p className="mb-2 text-sm sm:text-hidden">{summary}</p>
    <span className="font-semibold text-primary">{time}</span>
  </li>
);

export default function ArticlesContent() {
  return (
    <>
      <AnimatedText
        text="I Don't Know, Satan Is Pretty Cool"
        className="mb-16 lg:text-7xl! sm:mb-8 sm:text-6xl! xs:text-4xl!"
      />
      <ul className="grid grid-cols-2 gap-16 lg:gap-8 md:grid-cols-1 md:gap-y-16">
        <FeaturedArticle
          title="Build A Custom Pagination Component In Reactjs From Scratch"
          summary="Learn how to build a custom pagination component in ReactJS from scratch. Follow this step-by-step guide to integrate Pagination component in your ReactJS project."
          time="9 min read"
          link="/"
          img={article1}
        />
        <FeaturedArticle
          title="Build A Custom Pagination Component In Reactjs From Scratch"
          summary="Learn how to build a custom pagination component in ReactJS from scratch. Follow this step-by-step guide to integrate Pagination component in your ReactJS project."
          time="9 min read"
          link="/"
          img={article1}
        />
      </ul>
      <h2 className="my-16 mt-32 w-full text-center text-4xl font-bold">All Articles</h2>
      <ul>
        <ArticleItem
          title="Form Validation In Reactjs: Build A Reusable Custom Hook For Inputs And Error Handling"
          time="5 min"
          link="/"
          img={article2}
        />
      </ul>
    </>
  );
}

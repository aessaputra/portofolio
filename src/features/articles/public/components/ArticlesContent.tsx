"use client";

import { useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";

import AnimatedText from "@/shared/ui/animated-text";
import { m, makeMotion, useMotionValue } from "@/shared/ui/motion";
import type { Article } from "@/entities/articles";

const MotionImage = makeMotion(Image);

type MovingImgProps = {
  title: string;
  img: { src: string; width: number; height: number } | null;
  link: string;
  imageAlt?: string | null;
};

type ArticleItemProps = {
  article: Article;
};

type FeaturedArticleProps = {
  article: Article;
};

type ArticlesContentProps = {
  articles: Article[];
};

function asStaticImageData(url: string | null, alt: string | null, fallbackAlt: string): { src: string; width: number; height: number; alt: string } | null {
  if (!url) return null;
  return {
    src: url,
    width: 600,
    height: 400,
    alt: alt ?? fallbackAlt,
  };
}

const MovingImg = ({ title, img, link, imageAlt }: MovingImgProps) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgError, setImgError] = useState(false);

  const handleMouse = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!imgRef.current || !img) return;
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
      <h2 className="text-xl font-semibold capitalize hover:underline dark:text-light">{title}</h2>
      {img && !imgError ? (
        <MotionImage
          style={{ x, y }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1, transition: { duration: 0.2 } }}
          ref={imgRef}
          src={img.src}
          alt={imageAlt ?? title}
          width={img.width}
          height={img.height}
          className="absolute z-20 hidden h-auto w-96 rounded-lg object-cover md:hidden!"
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          ref={imgRef as any}
          className="absolute z-20 hidden h-auto w-96 rounded-lg bg-gray-200 p-4 text-center text-gray-500 dark:bg-gray-700 dark:text-gray-400 md:hidden!"
          style={{ transform: `translate(${x.get()}px, ${y.get()}px)` }}
        >
          Image not available
        </div>
      )}
    </Link>
  );
};

const ArticleItem = ({ article }: ArticleItemProps) => {
  const imageData = asStaticImageData(article.imageUrl, article.imageAlt, article.title);
  return (
    <m.li
      initial={{ y: 200 }}
      whileInView={{ y: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
      viewport={{ once: true }}
      className="relative my-4 flex w-full items-center justify-between rounded-2xl border border-solid border-dark border-r-4 bg-light p-4 py-6 text-dark first:mt-0 transition-all duration-300 hover:shadow-lg dark:bg-dark dark:border-light dark:border-r-4 dark:text-light sm:flex-col"
    >
      <div className="flex-1">
        <MovingImg title={article.title} img={imageData} link={article.link} imageAlt={article.imageAlt} />
      </div>
      <span className="pl-4 font-semibold text-primary sm:self-start sm:pl-0 xs:text-sm">
        {new Date(article.date).toLocaleDateString()}
      </span>
    </m.li>
  );
};

const FeaturedArticle = ({ article }: FeaturedArticleProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const imageData = asStaticImageData(article.imageUrl, article.imageAlt, article.title);

  return (
    <li
      className="relative w-full rounded-2xl border border-solid border-dark border-r-4 bg-light p-4 transition-all duration-300 hover:shadow-lg dark:bg-dark dark:border-light dark:border-r-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute top-0 -right-3 -z-10 h-[103%] w-full rounded-4xl rounded-br-3xl bg-dark dark:bg-light" />
      <Link href={article.link} target="_blank" className="inline-block w-full cursor-pointer overflow-hidden rounded-lg">
        <div className="relative h-64 w-full">
          {imageData && !imgError ? (
            <MotionImage
              src={imageData.src}
              alt={imageData.alt}
              fill
              className="h-auto w-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-200 dark:bg-gray-700">
              <span className="text-gray-500 dark:text-gray-400">Image not available</span>
            </div>
          )}
        </div>
      </Link>

      <div className="mt-4">
        <span className="text-sm font-semibold uppercase text-primary dark:text-primaryDark">{article.source}</span>
        <Link href={article.link} target="_blank" className="hover:underline underline-offset-2">
          <h2 className="my-2 w-full text-left text-3xl font-bold hover:underline dark:text-light lg:text-2xl md:text-xl">
            {article.title}
          </h2>
        </Link>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{article.excerpt}</p>

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>{new Date(article.date).toLocaleDateString()}</span>
          {isHovered && <span>Click to read</span>}
        </div>
      </div>
    </li>
  );
};

export default function ArticlesContent({ articles }: ArticlesContentProps) {
  if (articles.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-lg text-gray-600 dark:text-gray-400">No articles available at the moment.</p>
      </div>
    );
  }

  const [featured, ...rest] = articles;
  const headingText = featured?.source ? `${featured.source} Highlights` : "Latest Articles";

  return (
    <>
      <AnimatedText
        text={headingText}
        className="mb-16 lg:text-7xl! sm:mb-8 sm:text-6xl! xs:text-4xl!"
      />

      <div className="grid grid-cols-12 gap-16 md:gap-8 sm:gap-6">
        {featured && (
          <div className="col-span-12 md:col-span-6">
            <h2 className="mb-4 text-2xl font-bold dark:text-light">Featured Article</h2>
            <FeaturedArticle article={featured} />
          </div>
        )}

        <div className="col-span-12 md:col-span-6">
          <h2 className="mb-4 text-2xl font-bold dark:text-light">Latest Articles</h2>
          <ul className="flex flex-col">
            {rest.map((article) => (
              <ArticleItem key={article.id} article={article} />
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

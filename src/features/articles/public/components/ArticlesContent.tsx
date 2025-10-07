"use client";

import { useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";

import AnimatedText from "@/shared/ui/animated-text";
import { m, makeMotion, useMotionValue } from "@/shared/ui/motion";
import type { Article } from "@/entities/articles";
import styles from "@/styles/Articles.module.css";

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

function formatAuthorName(name: string): string {
  // Convert AESSAPUTRA to Aes Saputra
  if (name === "AESSAPUTRA") {
    return "Aes Saputra";
  }
  // For other names, add spaces between words if they're all caps
  if (name === name.toUpperCase() && name.length > 1) {
    return name
      .toLowerCase()
      .split('')
      .map((char, index) => {
        if (index === 0) return char.toUpperCase();
        if (char === char.toUpperCase() && index > 0) return ' ' + char.toLowerCase();
        return char;
      })
      .join('')
      .replace(/\s+/g, ' ')
      .trim();
  }
  return name;
}

const MovingImg = ({ title, img, link, imageAlt }: MovingImgProps) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgError, setImgError] = useState(false);

  const handleMouse = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!imgRef.current || !img) return;
    imgRef.current.style.display = "inline-block";
    
    // More responsive positioning based on screen size
    const rect = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Adjust positioning based on viewport width
    const viewportWidth = window.innerWidth;
    let offsetX = mouseX;
    let offsetY = -10;
    
    if (viewportWidth < 640) {
      // Mobile: smaller offset, position relative to element
      offsetX = Math.min(mouseX, rect.width - 200);
      offsetY = -5;
    } else if (viewportWidth < 1024) {
      // Tablet: medium offset
      offsetX = Math.min(mouseX, rect.width - 250);
      offsetY = -8;
    } else {
      // Desktop: full offset
      offsetX = mouseX;
      offsetY = -10;
    }
    
    x.set(offsetX);
    y.set(offsetY);
  };

  const handleMouseLeave = () => {
    if (!imgRef.current) return;
    imgRef.current.style.display = "none";
    x.set(0);
    y.set(0);
  };

  return (
    <Link href={link} target="_blank" onMouseMove={handleMouse} onMouseLeave={handleMouseLeave}>
      <h2 className={styles.articleTitle}>{title}</h2>
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
          className="absolute z-20 hidden h-auto w-64 rounded-lg object-cover sm:w-80 md:w-96 lg:w-[20rem] xl:w-[22rem]"
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          ref={imgRef as any}
          className="absolute z-20 hidden h-auto w-64 rounded-lg bg-gray-200 p-3 text-center text-gray-500 dark:bg-gray-700 dark:text-gray-400 sm:w-80 sm:p-4 md:w-96 lg:w-[20rem] xl:w-[22rem]"
          style={{ transform: `translate(${x.get()}px, ${y.get()}px)` }}
        >
          <span className="text-sm">Image not available</span>
        </div>
      )}
    </Link>
  );
};

const ArticleItem = ({ article }: ArticleItemProps) => {
  const imageData = asStaticImageData(article.imageUrl, article.imageAlt, article.title);
  
  // Responsive animation based on screen size
  const getAnimationProps = () => {
    if (typeof window !== 'undefined') {
      const viewportWidth = window.innerWidth;
      if (viewportWidth < 640) {
        // Mobile: smaller initial offset, faster animation
        return {
          initial: { y: 100, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { duration: 0.4 }
        };
      } else if (viewportWidth < 1024) {
        // Tablet: medium offset, standard animation
        return {
          initial: { y: 150, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { duration: 0.5 }
        };
      } else {
        // Desktop: full offset, smooth animation
        return {
          initial: { y: 200, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { duration: 0.6 }
        };
      }
    }
    // Default fallback
    return {
      initial: { y: 200, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      transition: { duration: 0.5 }
    };
  };

  const animationProps = getAnimationProps();

  return (
    <m.li
      initial={animationProps.initial}
      whileInView={animationProps.animate}
      transition={animationProps.transition}
      viewport={{ once: true, margin: "-50px" }}
      className={styles.articleItem}
    >
      <div className={styles.articleContent}>
        <MovingImg title={article.title} img={imageData} link={article.link} imageAlt={article.imageAlt} />
      </div>
      <span className={styles.articleDate}>
        {new Date(article.date).toLocaleDateString()}
      </span>
    </m.li>
  );
};

const FeaturedArticle = ({ article }: FeaturedArticleProps) => {
  const [imgError, setImgError] = useState(false);
  const imageData = asStaticImageData(article.imageUrl, article.imageAlt, article.title);

  return (
    <div
      className={styles.featuredCard}
    >
      <Link href={article.link} target="_blank" className={styles.featuredImageLink}>
        <div className={styles.featuredImageContainer}>
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
            <div className={styles.imageErrorFallback}>
              <span>Image not available</span>
            </div>
          )}
        </div>
      </Link>

      <div className={styles.featuredContent}>
        <div>
          <span className={styles.featuredSource}>{formatAuthorName(article.source)}</span>
          <Link href={article.link} target="_blank" className={styles.featuredTitleLink}>
            <h2 className={styles.featuredTitleText}>
              {article.title}
            </h2>
          </Link>
        </div>

        <div className={styles.featuredFooter}>
        </div>
      </div>
    </div>
  );
};

export default function ArticlesContent({ articles }: ArticlesContentProps) {
  if (articles.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyStateText}>No articles available at the moment.</p>
      </div>
    );
  }

  const [featured, secondFeatured, thirdFeatured, ...rest] = articles;
  const headingText = featured?.source ? `${featured.source} Highlights` : "Latest Articles";

  return (
    <>
      <AnimatedText
        text={headingText}
        className="mb-12 lg:text-7xl! sm:mb-8 sm:text-6xl! xs:text-4xl!"
      />

      {/* Featured Articles Section - Three Card Layout */}
      {(featured || secondFeatured || thirdFeatured) && (
        <div className={styles.featuredSection}>
          <h2 className={styles.featuredTitle}>Featured Articles</h2>
          <div className={styles.featuredGrid}>
            {featured && <FeaturedArticle article={featured} />}
            {secondFeatured && <FeaturedArticle article={secondFeatured} />}
            {thirdFeatured && <FeaturedArticle article={thirdFeatured} />}
          </div>
        </div>
      )}

      {/* Latest Articles Section */}
      {rest.length > 0 && (
        <div className={styles.latestSection}>
          <h2 className={styles.latestTitle}>Latest Articles</h2>
          <div className={styles.latestGrid}>
            {rest.map((article) => (
              <ArticleItem key={article.id} article={article} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

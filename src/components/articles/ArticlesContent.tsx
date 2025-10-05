"use client";

import { useRef, type MouseEvent, useEffect, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import AnimatedText from "@/components/AnimatedText";
import { m, makeMotion, useMotionValue } from "@/components/motion/Motion";

// Article interface
interface Article {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  link: string;
  imageUrl?: string;
  imageAlt?: string;
  source: string;
}

const MotionImage = makeMotion(Image);

// Helper function to create a StaticImageData object from a URL
function createStaticImageData(url: string): StaticImageData {
  return {
    src: url,
    height: 400,
    width: 600,
    blurDataURL: url,
  };
}

// Custom Image component with error handling
const SafeImage = ({ src, alt, fallback, ...props }: any) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [imgError, setImgError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const handleError = () => {
    if (!imgError && fallback) {
      setImgSrc(fallback);
      setImgError(true);
    }
    setIsLoading(false);
  };
  
  const handleLoad = () => {
    setIsLoading(false);
  };
  
  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 animate-pulse">
          <div className="text-gray-500 dark:text-gray-400">Loading image...</div>
        </div>
      )}
      {imgError && !isLoading ? (
        <div className="flex items-center justify-center bg-gray-200 dark:bg-gray-700">
          <div className="text-gray-500 dark:text-gray-400 p-4 text-center">Image not available</div>
        </div>
      ) : (
        <Image
          src={imgSrc}
          alt={alt}
          onError={handleError}
          onLoad={handleLoad}
          {...props}
        />
      )}
    </div>
  );
};

type MovingImgProps = {
  title: string;
  img: StaticImageData | null;
  link: string;
  imageAlt?: string;
};

type ArticleItemProps = {
  img: StaticImageData | null;
  title: string;
  time: string;
  link: string;
  imageAlt?: string;
};

type FeaturedArticleProps = {
  img: StaticImageData | null;
  title: string;
  time: string;
  summary: string;
  link: string;
  imageAlt?: string;
};

const MovingImg = ({ title, img, link, imageAlt }: MovingImgProps) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgError, setImgError] = useState(false);

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

  const handleImageError = () => {
    setImgError(true);
  };

  return (
    <Link href={link} target="_blank" onMouseMove={handleMouse} onMouseLeave={handleMouseLeave}>
      <h2 className="text-xl font-semibold capitalize hover:underline dark:text-light">{title}</h2>
      {!img || imgError ? (
        <div
          ref={imgRef as any}
          style={{
            transform: `translate(${x.get()}px, ${y.get()}px)`
          }}
          className="absolute z-20 hidden h-auto w-96 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center md:hidden!"
        >
          <span className="text-gray-500 dark:text-gray-400">Image not available</span>
        </div>
      ) : (
        <MotionImage
          style={{ x, y }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1, transition: { duration: 0.2 } }}
          ref={imgRef}
          src={img}
          alt={imageAlt || title}
          className="absolute z-20 hidden h-auto w-96 rounded-lg object-cover md:hidden!"
          onError={handleImageError}
        />
      )}
    </Link>
  );
};

const ArticleItem = ({ img, title, time, link, imageAlt }: ArticleItemProps) => (
  <m.li
    initial={{ y: 200 }}
    whileInView={{ y: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
    viewport={{ once: true }}
    className="relative my-4 flex w-full items-center justify-between rounded-2xl border border-solid border-dark border-r-4 bg-light p-4 py-6 text-dark first:mt-0 transition-all duration-300 hover:shadow-lg dark:bg-dark dark:border-light dark:border-r-4 dark:text-light sm:flex-col"
  >
    <div className="flex-1">
      <MovingImg title={title} img={img} link={link} imageAlt={imageAlt} />
    </div>
    <span className="pl-4 font-semibold text-primary sm:self-start sm:pl-0 xs:text-sm">
      {time}
    </span>
  </m.li>
);

const FeaturedArticle = ({ img, title, time, summary, link, imageAlt }: FeaturedArticleProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  
  const handleImageError = () => {
    setImgError(true);
  };
  
  return (
    <li
      className="relative w-full rounded-2xl border border-solid border-dark border-r-4 bg-light p-4 transition-all duration-300 hover:shadow-lg dark:bg-dark dark:border-light dark:border-r-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute top-0 -right-3 -z-10 h-[103%] w-full rounded-4xl rounded-br-3xl bg-dark dark:bg-light" />
      <Link href={link} target="_blank" className="inline-block w-full cursor-pointer overflow-hidden rounded-lg">
        <div className="relative h-64 w-full">
          {!img || imgError ? (
            <div className="flex items-center justify-center h-full w-full bg-gray-200 dark:bg-gray-700">
              <span className="text-gray-500 dark:text-gray-400">Image not available</span>
            </div>
          ) : (
            <MotionImage
              src={img}
              alt={imageAlt || title}
              className="h-auto w-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              onError={handleImageError}
              fill
            />
          )}
          {isHovered && (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Read Article</span>
            </div>
          )}
        </div>
      </Link>
      <Link href={link} target="_blank">
        <h2 className="my-2 mt-4 text-2xl font-bold capitalize hover:underline xs:text-lg transition-colors duration-300 dark:text-light">{title}</h2>
      </Link>
      <p className="mb-2 text-sm sm:text-hidden dark:text-light/80">{summary}</p>
      <span className="font-semibold text-primary">{time}</span>
    </li>
  );
};

export default function ArticlesContent() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/articles?limit=10");
      
      if (response.ok) {
        const data = await response.json();
        setArticles(data);
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch articles:", errorData.error || "Unknown error");
        setError(errorData.error || "Unknown error");
      }
    } catch (fetchError) {
      const errorMessage = fetchError instanceof Error ? fetchError.message : "Unknown error";
      console.error("Error fetching articles:", fetchError);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchArticles();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} min read`;
  };

  // Featured articles (first 2)
  const featuredArticles = articles.slice(0, 2);
  
  // Remaining articles
  const remainingArticles = articles.slice(2);

  return (
    <>
      <AnimatedText
        text="Latest Articles"
        className="mb-16 lg:text-7xl! sm:mb-8 sm:text-6xl! xs:text-4xl!"
      />
      
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <div className="text-lg text-gray-700 dark:text-gray-300">Loading articles...</div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-red-500 mb-4">Error: {error}</div>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4"
          >
            Retry
          </button>
          {retryCount >= 3 && (
            <div className="text-center mt-4">
              <div className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Unable to load articles at this time
              </div>
              <div className="text-gray-500 dark:text-gray-400">
                Please check back later or try refreshing the page
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {featuredArticles.length > 0 && (
            <div className="flex flex-col md:flex-row gap-8 w-full">
              <div className="md:w-1/2">
                <FeaturedArticle
                  key={featuredArticles[0].id}
                  title={featuredArticles[0].title}
                  summary={featuredArticles[0].excerpt}
                  time={calculateReadTime(featuredArticles[0].content)}
                  link={featuredArticles[0].link}
                  img={featuredArticles[0].imageUrl ? createStaticImageData(featuredArticles[0].imageUrl) : null}
                  imageAlt={featuredArticles[0].imageAlt || featuredArticles[0].title}
                />
              </div>

              <div className="md:w-1/2">
                {featuredArticles.length > 1 ? (
                  <FeaturedArticle
                    key={featuredArticles[1].id}
                    title={featuredArticles[1].title}
                    summary={featuredArticles[1].excerpt}
                    time={calculateReadTime(featuredArticles[1].content)}
                    link={featuredArticles[1].link}
                    img={featuredArticles[1].imageUrl ? createStaticImageData(featuredArticles[1].imageUrl) : null}
                    imageAlt={featuredArticles[1].imageAlt || featuredArticles[1].title}
                  />
                ) : null}
              </div>
            </div>
          )}

          
          {remainingArticles.length > 0 && (
            <>
              <h2 className="my-16 mt-32 w-full text-center text-4xl font-bold">All Articles</h2>
              <ul className="space-y-4">
                {remainingArticles.map((article) => (
                  <ArticleItem
                    key={article.id}
                    title={article.title}
                    time={formatDate(article.date)}
                    link={article.link}
                    img={article.imageUrl ? createStaticImageData(article.imageUrl) : null}
                    imageAlt={article.imageAlt || article.title}
                  />
                ))}
              </ul>
            </>
          )}
          
          {articles.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                No articles found at this time.
              </div>
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                Please check back later for new content.
              </div>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Refresh
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}

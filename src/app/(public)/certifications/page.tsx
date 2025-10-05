"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AnimatedText from "@/components/AnimatedText";
import { m, makeMotion } from "@/components/motion/Motion";

interface Certification {
  id: number;
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl: string;
  imageUrl: string;
  imageAlt: string;
  description?: string;
  tags: string[];
  featured: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

const MotionImage = makeMotion(Image);

type CertificationCardProps = {
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  description?: string;
  img: string;
  link: string;
  imageAlt?: string;
  tags: string[];
  featured?: boolean;
};

const CertificationCard = ({
  title,
  issuer,
  issueDate,
  expiryDate,
  description,
  img,
  link,
  imageAlt,
  tags,
  featured = false
}: CertificationCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <m.article
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeInOut" } }}
      viewport={{ once: true }}
      className={`relative w-full rounded-2xl border border-solid border-dark border-r-4 bg-light p-4 transition-all duration-300 hover:shadow-lg dark:bg-dark dark:border-light dark:border-r-4 dark:text-light ${
        featured ? 'md:col-span-2' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {featured && (
        <div className="absolute top-0 -right-3 -z-10 h-[103%] w-full rounded-[2.5rem] rounded-br-3xl bg-dark dark:bg-light xs:-right-2 xs:h-[102%] xs:w-full xs:rounded-3xl" />
      )}
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className={`w-full ${featured ? 'md:w-1/3' : 'md:w-2/5'} cursor-pointer overflow-hidden rounded-lg`}>
          <Link href={link} target="_blank">
            <MotionImage
              src={img}
              alt={imageAlt || title}
              width={600}
              height={400}
              className="h-auto w-full rounded-xl object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
          </Link>
        </div>

        <div className={`flex-1 flex flex-col ${featured ? 'md:w-2/3' : 'md:w-3/5'}`}>
          <div className="mb-2">
            <span className="text-lg font-medium text-primary dark:text-primaryDark lg:text-base md:text-base sm:text-base">
              {issuer}
            </span>
            {featured && (
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full">
                Featured
              </span>
            )}
          </div>
          
          <Link href={link} target="_blank" className="hover:underline underline-offset-2">
            <h2 className={`my-2 w-full text-left font-bold capitalize hover:underline dark:text-light ${
              featured ? 'text-3xl' : 'text-2xl'
            } lg:text-2xl md:text-xl sm:text-lg`}>
              {title}
            </h2>
          </Link>
          
          <div className="mb-3 text-sm text-gray-600 dark:text-gray-300">
            <div className="font-medium">Issued: {issueDate}</div>
            {expiryDate && (
              <div className="font-medium">Expires: {expiryDate}</div>
            )}
          </div>
          
          {description && (
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
              {description}
            </p>
          )}
          
          {tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="mt-auto flex justify-between items-center">
            <Link
              href={link}
              target="_blank"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primaryDark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-primaryDark dark:hover:bg-primary"
            >
              View Credential
            </Link>
            
            {isHovered && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Click to verify
              </div>
            )}
          </div>
        </div>
      </div>
    </m.article>
  );
};

export default function CertificationsPage() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/certifications");
      
      if (response.ok) {
        const data = await response.json();
        setCertifications(data);
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch certifications:", errorData.error || "Unknown error");
        setError(errorData.error || "Unknown error");
      }
    } catch (fetchError) {
      const errorMessage = fetchError instanceof Error ? fetchError.message : "Unknown error";
      console.error("Error fetching certifications:", fetchError);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <div className="text-lg text-gray-700 dark:text-gray-300">
            Loading certifications...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <button
          onClick={fetchCertifications}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  // Separate featured and regular certifications
  const featuredCertifications = certifications.filter(certification => certification.featured);
  const regularCertifications = certifications.filter(certification => !certification.featured);

  return (
    <div className="w-full mb-16 flex flex-col items-center justify-center">
      <AnimatedText
        text="Professional Certifications"
        className="mb-16 lg:text-7xl! sm:mb-8 sm:text-6xl! xs:text-4xl!"
      />

      {certifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            No certifications available at the moment.
          </div>
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            Please check back later for new certifications.
          </div>
          <button
            onClick={fetchCertifications}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-24 gap-y-32 xl:gap-x-16 lg:gap-x-8 md:gap-y-24 sm:gap-x-4">
          {featuredCertifications.map((certification) => (
            <div key={certification.id} className="col-span-12">
              <CertificationCard
                title={certification.title}
                issuer={certification.issuer}
                issueDate={certification.issueDate}
                expiryDate={certification.expiryDate}
                description={certification.description}
                img={certification.imageUrl}
                link={certification.credentialUrl}
                imageAlt={certification.imageAlt}
                tags={certification.tags}
                featured={certification.featured}
              />
            </div>
          ))}

          {regularCertifications.map((certification) => (
            <div key={certification.id} className="col-span-12">
              <CertificationCard
                title={certification.title}
                issuer={certification.issuer}
                issueDate={certification.issueDate}
                expiryDate={certification.expiryDate}
                description={certification.description}
                img={certification.imageUrl}
                link={certification.credentialUrl}
                imageAlt={certification.imageAlt}
                tags={certification.tags}
                featured={certification.featured}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

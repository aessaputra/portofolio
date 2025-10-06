"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import AnimatedText from "@/shared/ui/animated-text";
import { makeMotion } from "@/shared/ui/motion";
import type { Certification } from "@/entities/certifications";

const MotionImage = makeMotion(Image);

type CertificationCardProps = {
  certification: Certification;
};

function CertificationCard({ certification }: CertificationCardProps) {
  const {
    title,
    issuer,
    issueDate,
    expiryDate,
    description,
    imageUrl,
    imageAlt,
    credentialUrl,
    tags,
    featured,
  } = certification;

  const [isHovered, setIsHovered] = useState(false);

  return (
    <article
      className={`relative w-full rounded-2xl border border-solid border-dark border-r-4 bg-light p-4 transition-all duration-300 hover:shadow-lg dark:bg-dark dark:border-light dark:border-r-4 dark:text-light ${
        featured ? "md:col-span-2" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {featured && (
        <div className="absolute top-0 -right-3 -z-10 h-[103%] w-full rounded-[2.5rem] rounded-br-3xl bg-dark dark:bg-light xs:-right-2 xs:h-[102%] xs:w-full xs:rounded-3xl" />
      )}

      <div className="flex flex-col gap-6 md:flex-row">
        <div className={`w-full ${featured ? "md:w-1/3" : "md:w-2/5"} cursor-pointer overflow-hidden rounded-lg`}>
          <Link href={credentialUrl} target="_blank">
            <MotionImage
              src={imageUrl}
              alt={imageAlt ?? title}
              width={600}
              height={400}
              className="h-auto w-full rounded-xl object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
          </Link>
        </div>

        <div className={`flex flex-col ${featured ? "md:w-2/3" : "md:w-3/5"}`}>
          <div className="mb-2">
            <span className="text-lg font-medium text-primary dark:text-primaryDark lg:text-base md:text-base sm:text-base">
              {issuer}
            </span>
            {featured && (
              <span className="ml-2 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                Featured
              </span>
            )}
          </div>

          <Link href={credentialUrl} target="_blank" className="hover:underline underline-offset-2">
            <h2
              className={`my-2 w-full text-left font-bold capitalize hover:underline dark:text-light ${
                featured ? "text-3xl" : "text-2xl"
              } lg:text-2xl md:text-xl sm:text-lg`}
            >
              {title}
            </h2>
          </Link>

          <div className="mb-3 text-sm text-gray-600 dark:text-gray-300">
            <div className="font-medium">Issued: {issueDate}</div>
            {expiryDate && <div className="font-medium">Expires: {expiryDate}</div>}
          </div>

          {description && (
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{description}</p>
          )}

          {tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={`${tag}-${index}`}
                  className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto flex items-center justify-between">
            <Link
              href={credentialUrl}
              target="_blank"
              className="inline-flex items-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primaryDark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:bg-primaryDark dark:hover:bg-primary"
            >
              View Credential
            </Link>

            {isHovered && <div className="text-sm text-gray-500 dark:text-gray-400">Click to verify</div>}
          </div>
        </div>
      </div>
    </article>
  );
}

type CertificationsContentProps = {
  certifications: Certification[];
};

export default function CertificationsContent({ certifications }: CertificationsContentProps) {
  const featured = certifications.filter((certification) => certification.featured);
  const regular = certifications.filter((certification) => !certification.featured);

  return (
    <>
      <AnimatedText
        text="Certifications & Achievements"
        className="mb-16 lg:text-7xl! sm:mb-8 sm:text-6xl! xs:text-4xl!"
      />

      <div className="grid grid-cols-12 gap-12 md:gap-8 sm:gap-6">
        {featured.map((certification) => (
          <div key={certification.id} className="col-span-12">
            <CertificationCard certification={certification} />
          </div>
        ))}

        {regular.map((certification) => (
          <div key={certification.id} className="col-span-12 md:col-span-6">
            <CertificationCard certification={certification} />
          </div>
        ))}

        {certifications.length === 0 && (
          <div className="col-span-12 text-center py-8">
            <p className="text-lg text-gray-600 dark:text-gray-400">No certifications available at the moment.</p>
          </div>
        )}
      </div>
    </>
  );
}

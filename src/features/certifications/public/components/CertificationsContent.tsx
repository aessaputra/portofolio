"use client";

import Image from "next/image";
import Link from "next/link";

import AnimatedText from "@/shared/ui/animated-text";
import { resolveR2PublicUrl } from "@/shared/lib/r2PublicUrl";
import { makeMotion } from "@/shared/ui/motion";
import type { Certification } from "@/entities/certifications";
import styles from "@/styles/Certifications.module.css";

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

  const resolvedImageUrl = resolveR2PublicUrl(imageUrl);

  return (
    <Link href={credentialUrl} target="_blank" className="block">
      <article
        className={`${styles.certificationCard} ${
          featured ? "md:col-span-2" : ""
        }`}
      >
        {featured && (
          <div className="absolute top-0 -right-3 -z-10 h-[103%] w-full rounded-[2.5rem] rounded-br-3xl bg-light dark:bg-dark xs:-right-2 xs:h-[102%] xs:w-full xs:rounded-3xl" />
        )}

        <div className={styles.cardContent}>
          <div className={styles.imageContainer}>
            <MotionImage
              src={resolvedImageUrl}
              alt={imageAlt ?? title}
              width={600}
              height={400}
              className={styles.certificationImage}
              unoptimized
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className={styles.contentContainer}>
            <div>
              <span className={styles.issuerText}>
                {issuer}
              </span>
              {featured && (
                <span className={styles.featuredBadge}>
                </span>
              )}
            </div>

            <h2
              className={`${styles.titleText} ${featured ? styles.featuredTitle : ""}`}
            >
              {title}
            </h2>

          </div>
        </div>
      </article>
    </Link>
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

      {featured.length > 0 && (
        <div className={styles.featuredCardsContainer}>
          {featured.slice(0, 2).map((certification) => (
            <div key={certification.id} className={styles.featuredCard}>
              <CertificationCard certification={certification} />
            </div>
          ))}
        </div>
      )}

      <div className={styles.certificationsContainer}>
        {regular.map((certification) => (
          <div key={certification.id} className={styles.regularCard}>
            <CertificationCard certification={certification} />
          </div>
        ))}

        {certifications.length === 0 && (
          <div className={styles.emptyState}>
            <p className={styles.emptyStateText}>No certifications available at the moment.</p>
          </div>
        )}
      </div>
    </>
  );
}

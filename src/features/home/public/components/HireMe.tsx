"use client";

import Link from "next/link";

import { CircularText } from "@/shared/ui/icons";
import { normalizeMailto } from "@/shared/lib/contact";
import { umamiTrack } from "@/shared/ui/umami-tracker";

type HireMeProps = {
  contactEmail: string;
};

export default function HireMe({ contactEmail }: HireMeProps) {
  const contactHref = normalizeMailto(contactEmail);

  return (
    <div className="fixed left-4 bottom-4 flex items-center justify-center overflow-hidden md:absolute md:right-8 md:left-auto md:top-0 md:bottom-auto sm:right-0">
      <div className="relative flex h-auto w-48 items-center justify-center md:w-24">
        <CircularText className="animate-spin-slow fill-dark dark:fill-light" />

        <Link
          href={contactHref}
          onClick={() => umamiTrack("hire-me-click", { 
            location: "home-badge",
            type: "circular-badge"
          })}
          className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-solid border-dark bg-dark font-semibold text-light shadow-md transition-colors hover:bg-light hover:text-dark dark:bg-light dark:text-dark hover:dark:border-light hover:dark:bg-dark hover:dark:text-light md:h-12 md:w-12 md:text-[10px]"
        >
          Hire Me
        </Link>
      </div>
    </div>
  );
}

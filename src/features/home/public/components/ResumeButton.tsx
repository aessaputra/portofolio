"use client";

import Link from "next/link";
import { LinkArrow } from "@/shared/ui/icons";
import { umamiTrack } from "@/shared/ui/umami-tracker";

interface ResumeButtonProps {
  resumeUrl: string;
  className?: string;
}

export default function ResumeButton({ resumeUrl, className }: ResumeButtonProps) {
  const handleClick = () => {
    umamiTrack("resume-link-click", { 
      location: "home-hero",
      type: "link",
      url: resumeUrl
    });
  };

  return (
    <Link
      href={resumeUrl}
      target="_blank"
      onClick={handleClick}
      className={className}
    >
      Resume
      <LinkArrow className="w-6 ml-1" />
    </Link>
  );
}

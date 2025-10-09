"use client";

import Link from "next/link";
import { umamiTrack } from "@/shared/ui/umami-tracker";

interface ContactButtonProps {
  contactHref: string;
  className?: string;
}

export default function ContactButton({ contactHref, className }: ContactButtonProps) {
  const handleClick = () => {
    umamiTrack("contact-click", { 
      location: "home-hero",
      type: "text-link"
    });
  };

  return (
    <Link
      href={contactHref}
      onClick={handleClick}
      className={className}
    >
      Contact
    </Link>
  );
}

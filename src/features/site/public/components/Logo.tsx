"use client";

import Link from "next/link";

import { m } from "@/shared/ui/motion";

type LogoProps = {
  label: string;
};

function computeInitials(label: string): string {
  const tokens = label
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (tokens.length === 0) {
    return "LOGO";
  }

  const initials = tokens
    .map((token) => token[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 3);

  return initials || "LOGO";
}

export default function Logo({ label }: LogoProps) {
  const initials = computeInitials(label);

  return (
    <div className="mt-2 flex items-center justify-center">
      <Link href="/" aria-label={label}>
        <m.div
          className="flex h-16 w-16 items-center justify-center rounded-full border border-solid border-transparent bg-dark text-2xl font-bold text-light dark:border-light"
          whileHover={{
            backgroundColor: [
              "#121212",
              "rgba(131,58,180,1)",
              "rgba(253,29,29,1)",
              "rgba(252,176,69,1)",
              "rgba(131,58,180,1)",
              "#121212",
            ],
            transition: { duration: 1, repeat: Infinity },
          }}
        >
          {initials}
        </m.div>
      </Link>
    </div>
  );
}

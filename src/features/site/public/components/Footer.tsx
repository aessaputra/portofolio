import Link from "next/link";

import type { HomeContent } from "@/entities/home";
import { deriveNameFromEmail, normalizeMailto } from "@/shared/lib/contact";

type FooterProps = {
  homeContent: Pick<HomeContent, "contactEmail">;
};

export default function Footer({ homeContent }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const contactHref = normalizeMailto(homeContent.contactEmail);
  const ownerName = deriveNameFromEmail(homeContent.contactEmail);

  return (
    <footer className="w-full border-t-2 border-solid border-dark font-medium text-lg dark:border-light dark:text-light sm:text-base">
      <div className="flex items-center justify-between px-32 py-8 lg:flex-col lg:px-16 lg:py-6 md:px-12 sm:px-8">
        <span>
          {currentYear} &copy; {ownerName || "Portfolio"}
        </span>
        <div className="flex items-center lg:py-2">
          Built with
          <span className="px-1 text-2xl text-primary dark:text-primaryDark">&#9825;</span>
          by
          <strong className="ml-1 font-semibold">{ownerName || "the team"}</strong>
        </div>
        <Link href={contactHref} className="underline underline-offset-2">
          Say hello
        </Link>
      </div>
    </footer>
  );
}

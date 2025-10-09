"use client";

import type { PropsWithChildren } from "react";

import { usePathname } from "next/navigation";

import type { HomeContent } from "@/entities/home";
import { AnimatePresence } from "@/shared/ui/motion";
import UmamiAnalytics from "@/shared/ui/umami-analytics";
import Footer from "@/features/site/public/components/Footer";
import NavBar from "@/features/site/public/components/NavBar";

type PublicShellProps = PropsWithChildren<{
  homeContent: HomeContent;
}>;

export default function PublicShell({ children, homeContent }: PublicShellProps) {
  const pathname = usePathname();

  return (
    <main className="flex min-h-screen w-full flex-col">
      {/* Umami Analytics - Hanya tracking halaman public, tidak admin */}
      <UmamiAnalytics 
        websiteId={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || ""} 
      />
      <NavBar
        socialLinks={{
          github: homeContent.githubUrl,
          linkedin: homeContent.linkedinUrl,
          x: homeContent.xUrl,
        }}
        brandName={homeContent.logoText}
      />
      <AnimatePresence mode="wait" initial={false}>
        <div key={pathname} className="flex-1">
          {children}
        </div>
      </AnimatePresence>
      <Footer homeContent={homeContent} />
    </main>
  );
}

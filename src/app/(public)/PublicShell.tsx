"use client";

import type { PropsWithChildren } from "react";
import { AnimatePresence } from "@/components/motion/Motion";
import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";

export default function PublicShell({ children }: PropsWithChildren) {
  const pathname = usePathname();

  return (
    <main className="flex min-h-screen w-full flex-col">
      <NavBar />
      <AnimatePresence mode="wait" initial={false}>
        <div key={pathname} className="flex-1">
          {children}
        </div>
      </AnimatePresence>
      <Footer />
    </main>
  );
}

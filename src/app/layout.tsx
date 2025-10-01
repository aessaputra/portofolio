import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { validateEnvironment } from "@/lib/env";
import "../styles/globals.css";

// Validate environment variables at startup
validateEnvironment();

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-mont",
  preload: true,
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aes Saputra | Portfolio",
  description: "Portfolio site showcasing work by Aes Saputra.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#b63e96",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning className={montserrat.variable} data-scroll-behavior="smooth">
        <body className="font-mont bg-light dark:bg-dark w-full min-h-screen">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

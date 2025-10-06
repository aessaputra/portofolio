import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/shared/ui/theme-provider";
import { validateEnvironment } from "@/shared/lib/env";
import { Providers } from "@/shared/providers/session-provider";
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
    <html lang="en" suppressHydrationWarning className={montserrat.variable} data-scroll-behavior="smooth">
      <body className="font-mont bg-light dark:bg-dark w-full min-h-screen">
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}

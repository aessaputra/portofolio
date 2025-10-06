"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import { motion } from "@/shared/ui/motion";
import {
  GithubIcon,
  LinkedInIcon,
  MoonIcon,
  SunIcon,
  TwitterIcon,
} from "@/shared/ui/icons";

import Logo from "./Logo";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type ThemeToggleButtonProps = {
  className?: string;
};

function ThemeToggleButton({ className }: ThemeToggleButtonProps) {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleThemeChange = (event: Event) => {
      if (!(event instanceof CustomEvent)) return;
      const mode = (event.detail as { mode?: string } | undefined)?.mode;
      if (mode) {
        setTheme(mode);
      }
    };

    window.addEventListener("portfolio:theme-change", handleThemeChange);

    return () => {
      window.removeEventListener("portfolio:theme-change", handleThemeChange);
    };
  }, [setTheme]);

  const effectiveTheme = theme === "system" ? systemTheme : theme;
  const isDark = effectiveTheme === "dark";
  const toggleLabel = !mounted
    ? "Toggle theme"
    : isDark
    ? "Enable light theme"
    : "Enable dark theme";

  const toggleTheme = () => {
    const nextTheme = isDark ? "light" : "dark";
    setTheme(nextTheme);

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("portfolio:theme-change", { detail: { mode: nextTheme } })
      );
    }
  };

  const baseToggle = "flex items-center justify-center rounded-full p-1 transition-colors";
  const themeClass = !mounted
    ? "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
    : isDark
    ? "bg-dark text-light"
    : "bg-light text-dark";

  return (
    <button
      type="button"
      aria-label={toggleLabel}
      onClick={toggleTheme}
      className={cn(baseToggle, themeClass, className)}
    >
      {!mounted ? (
        <SunIcon className="h-5 w-5 opacity-0" />
      ) : isDark ? (
        <SunIcon className="h-5 w-5" />
      ) : (
        <MoonIcon className="h-5 w-5" />
      )}
    </button>
  );
}

interface CustomLinkProps {
  href: string;
  title: string;
  className?: string;
}

interface CustomMobileLinkProps extends CustomLinkProps {
  toggle?: () => void;
}

const CustomLink = ({ href, title, className = "" }: CustomLinkProps) => {
  const pathname = usePathname();

  return (
    <Link href={href} className={cn(className, "relative group")}>
      {title}
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-0 -bottom-0.5 inline-block h-px w-0 bg-dark transition-[width] duration-300 ease group-hover:w-full dark:bg-light",
          pathname === href && "w-full"
        )}
      >
        &nbsp;
      </span>
    </Link>
  );
};

const CustomMobileLink = ({ href, title, className = "", toggle }: CustomMobileLinkProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleClick = () => {
    if (toggle) toggle();
    router.push(href);
  };

  return (
    <button
      type="button"
      className={cn(className, "relative my-2 group text-light dark:text-dark")}
      onClick={handleClick}
    >
      {title}
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-0 -bottom-0.5 inline-block h-px w-0 bg-light transition-[width] duration-300 ease group-hover:w-full dark:bg-dark",
          pathname === href && "w-full"
        )}
      >
        &nbsp;
      </span>
    </button>
  );
};

const NAV_LINKS: CustomLinkProps[] = [
  { href: "/", title: "Home", className: "mr-4" },
  { href: "/about", title: "About", className: "mx-4" },
  { href: "/projects", title: "Projects", className: "mx-4" },
  { href: "/articles", title: "Articles", className: "ml-4" },
  { href: "/certifications", title: "Certifications", className: "ml-4" },
];

type SocialLinks = {
  github?: string | null;
  linkedin?: string | null;
  x?: string | null;
};

type NavBarProps = {
  socialLinks?: SocialLinks;
  brandName?: string;
};

const socialLinkMotionProps = {
  whileHover: { y: -2 },
  whileTap: { scale: 0.9 },
};

export default function NavBar({ socialLinks, brandName = "Portfolio" }: NavBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const resolvedSocialLinks = useMemo(() => {
    const entries = [
      { href: socialLinks?.github, label: "GitHub", Icon: GithubIcon },
      { href: socialLinks?.linkedin, label: "LinkedIn", Icon: LinkedInIcon },
      { href: socialLinks?.x, label: "X", Icon: TwitterIcon },
    ];

    return entries.filter(
      (entry): entry is { href: string; label: string; Icon: typeof GithubIcon } =>
        typeof entry.href === "string" && entry.href.trim().length > 0
    );
  }, [socialLinks?.github, socialLinks?.linkedin, socialLinks?.x]);

  const handleToggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <header className="w-full px-32 py-8 font-medium flex items-center justify-between dark:text-light relative z-10 lg:px-16 md:px-12 sm:px-8">
      <button
        type="button"
        className="flex flex-col items-center justify-center hidden lg:flex"
        onClick={handleToggleMenu}
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
      >
        <span
          className={cn(
            "block h-0.5 w-6 rounded-xs bg-dark transition-all duration-300 ease-out dark:bg-light",
            isOpen ? "translate-y-1 rotate-45" : "-translate-y-0.5"
          )}
        />
        <span
          className={cn(
            "my-0.5 block h-0.5 w-6 rounded-xs bg-dark transition-all duration-300 ease-out dark:bg-light",
            isOpen ? "opacity-0" : "opacity-100"
          )}
        />
        <span
          className={cn(
            "block h-0.5 w-6 rounded-xs bg-dark transition-all duration-300 ease-out dark:bg-light",
            isOpen ? "-translate-y-1 -rotate-45" : "translate-y-0.5"
          )}
        />
      </button>

      <div className="w-full flex justify-between items-center lg:hidden">
        <nav className="flex items-center">
          {NAV_LINKS.map(({ href, title, className = "" }) => (
            <CustomLink key={href} href={href} title={title} className={className} />
          ))}
        </nav>

        <nav className="flex flex-wrap items-center justify-center gap-6">
          {resolvedSocialLinks.map(({ href, label, Icon }) => (
            <motion.a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="w-6"
              {...socialLinkMotionProps}
            >
              <Icon />
            </motion.a>
          ))}

          <ThemeToggleButton />
        </nav>
      </div>

      {isOpen ? (
        <motion.div
          initial={{ scale: 0, opacity: 0, x: "-50%", y: "-50%" }}
          animate={{ scale: 1, opacity: 1, x: "-50%", y: "-50%" }}
          className="min-w-[70vw] flex flex-col justify-between z-30 items-center fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-dark/90 dark:bg-light/75 rounded-lg backdrop-blur-md py-32"
        >
          <nav className="flex flex-col items-center justify-center">
            {NAV_LINKS.map(({ href, title }) => (
              <CustomMobileLink
                key={href}
                href={href}
                title={title}
                toggle={handleToggleMenu}
              />
            ))}
          </nav>

          <nav className="flex items-center justify-center flex-wrap mt-2">
            {resolvedSocialLinks.map(({ href, label, Icon }, index) => (
              <motion.a
                key={`mobile-${label}`}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className={cn(
                  "w-6",
                  index === 0
                    ? "mr-3 rounded-full bg-light dark:bg-dark"
                    : "mx-3"
                )}
                {...socialLinkMotionProps}
              >
                <Icon />
              </motion.a>
            ))}

            <ThemeToggleButton className="ml-3" />
          </nav>
        </motion.div>
      ) : null}

      <div className="absolute left-1/2 top-2 -translate-x-1/2">
        <Logo label={brandName} />
      </div>
    </header>
  );
}

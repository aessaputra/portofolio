"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion } from "./motion/Motion";
import Logo from "./Logo";
import { LinkedInIcon, GithubIcon, SunIcon, MoonIcon } from "./Icons";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type ThemeToggleButtonProps = {
  className?: string;
};

function ThemeToggleButton({ className }: ThemeToggleButtonProps) {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const effective = theme === "system" ? systemTheme : theme;
  const isDark = effective === "dark";
  const baseToggle =
    "flex items-center justify-center rounded-full p-1 transition-colors";
  const themeCls = !mounted
    ? "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
    : isDark
    ? "bg-dark text-light"
    : "bg-light text-dark";
  const label = !mounted
    ? "Toggle theme"
    : isDark
    ? "Enable light theme"
    : "Enable dark theme";
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(baseToggle, themeCls, className)}
    >
      {!mounted ? (
        <SunIcon className="w-5 h-5 opacity-0" />
      ) : isDark ? (
        <SunIcon className="w-5 h-5" />
      ) : (
        <MoonIcon className="w-5 h-5" />
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
    <Link href={href} className={`${className} relative group`}>
      {title}

      <span
        className={`h-px inline-block bg-dark absolute left-0 -bottom-0.5 group-hover:w-full transition-[width] ease duration-300 
        ${pathname === href ? "w-full" : "w-0"}
        dark:bg-light`}
      >
        &nbsp;
      </span>
    </Link>
  );
};

const CustomMobileLink = ({
  href,
  title,
  className = "",
  toggle,
}: CustomMobileLinkProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleClick = () => {
    if (toggle) {
      toggle();
    }
    router.push(href);
  };

  return (
    <button
      type="button"
      className={`${className} relative group text-light dark:text-dark my-2`}
      onClick={handleClick}
    >
      {title}

      <span
        className={`bg-light h-px inline-block absolute left-0 -bottom-0.5 group-hover:w-full transition-[width] ease duration-300 
        ${pathname === href ? "w-full" : "w-0"}
        dark:bg-dark`}
      >
        &nbsp;
      </span>
    </button>
  );
};

const socialLinkMotionProps = {
  whileHover: { y: -2 },
  whileTap: { scale: 0.9 },
};

const NAV_LINKS: CustomLinkProps[] = [
  { href: "/", title: "Home", className: "mr-4" },
  { href: "/about", title: "About", className: "mx-4" },
  { href: "/projects", title: "Projects", className: "mx-4" },
  { href: "/articles", title: "Articles", className: "ml-4" },
  { href: "/certifications", title: "Certifications", className: "ml-4" },
];

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <header className="w-full px-32 py-8 font-medium flex items-center justify-between dark:text-light relative z-10 lg:px-16 md:px-12 sm:px-8">
      <button
        type="button"
        className="flex-col justify-center items-center hidden lg:flex"
        onClick={handleToggleMenu}
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
      >
        <span
          className={`bg-dark dark:bg-light block transition-all duration-300 ease-out h-0.5 w-6 rounded-xs ${
            isOpen ? "rotate-45 translate-y-1" : "-translate-y-0.5"
          }`}
        ></span>
        <span
          className={`bg-dark dark:bg-light block transition-all duration-300 ease-out h-0.5 w-6 rounded-xs my-0.5 ${
            isOpen ? "opacity-0" : "opacity-100"
          }`}
        ></span>
        <span
          className={`bg-dark dark:bg-light block transition-all duration-300 ease-out h-0.5 w-6 rounded-xs ${
            isOpen ? "-rotate-45 -translate-y-1" : "translate-y-0.5"
          }`}
        ></span>
      </button>

      <div className="w-full flex justify-between items-center lg:hidden">
        <nav className="flex items-center">
          {NAV_LINKS.map(({ href, title, className = "" }) => (
            <CustomLink
              key={href}
              href={href}
              title={title}
              className={className}
            />
          ))}
        </nav>

        <nav className="flex items-center justify-center flex-wrap gap-6">
          <motion.a
            href="https://github.com/aessaputra"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="w-6"
            {...socialLinkMotionProps}
          >
            <GithubIcon />
          </motion.a>
          <motion.a
            href="https://www.linkedin.com/in/aes-saputra/"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="w-6"
            {...socialLinkMotionProps}
          >
            <LinkedInIcon />
          </motion.a>

          <ThemeToggleButton />
        </nav>
      </div>

      {isOpen ? (
        <motion.div
          initial={{ scale: 0, opacity: 0, x: "-50%", y: "-50%" }}
          animate={{ scale: 1, opacity: 1, x: "-50%", y: "-50%" }}
          className="min-w-[70vw] flex flex-col justify-between z-30 items-center fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-dark/90 dark:bg-light/75 rounded-lg backdrop-blur-md py-32"
        >
          <nav className="flex items-center flex-col justify-center">
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
            <motion.a
              href="https://github.com/aessaputra"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="w-6 mr-3 bg-light rounded-full dark:bg-dark"
              {...socialLinkMotionProps}
            >
              <GithubIcon />
            </motion.a>
            <motion.a
              href="https://www.linkedin.com/in/aes-saputra/"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="w-6 mx-3"
              {...socialLinkMotionProps}
            >
              <LinkedInIcon />
            </motion.a>

            <ThemeToggleButton className="ml-3" />
          </nav>
        </motion.div>
      ) : null}

      <div className="absolute left-1/2 top-2 -translate-x-1/2">
        <Logo />
      </div>
    </header>
  );
}

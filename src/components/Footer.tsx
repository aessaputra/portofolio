import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full border-t-2 border-solid border-dark font-medium text-lg dark:text-light dark:border-light sm:text-base">
      <div className="py-8 px-32 flex items-center justify-between lg:py-6 lg:px-16 md:px-12 sm:px-8 lg:flex-col">
        <span>2025 &copy; All Rights Reserved.</span>
        <div className="flex items-center lg:py-2">
          Built with <span className="text-primary dark:text-primaryDark text-2xl px-1">&#9825;</span> by <b className="ml-1">Aes Saputra</b>
        </div>
        <Link href="/" target={"_blank"} className="underline underline-offset-2">
          Say Hello
        </Link>
      </div>
    </footer>
  );
};

export default Footer;

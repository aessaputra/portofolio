"use client";
import React from "react";
import Link from "next/link";

interface DropdownItemProps {
  children: React.ReactNode;
  onItemClick?: () => void;
  className?: string;
  tag?: "a" | "button" | "div";
  href?: string;
  [key: string]: any;
}

const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  onItemClick,
  className = "",
  tag = "div",
  href = "",
  ...rest
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (onItemClick) {
      onItemClick();
    }
  };

  const Tag = tag;

  if (tag === "a" && href) {
    return (
      <Link
        href={href}
        className={className}
        onClick={handleClick}
        {...rest}
      >
        {children}
      </Link>
    );
  }

  return (
    <Tag
      className={className}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default DropdownItem;
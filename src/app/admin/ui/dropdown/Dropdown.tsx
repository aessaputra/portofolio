"use client";
import React, { useEffect, useRef, useState } from "react";

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  dropdownRef?: React.RefObject<HTMLButtonElement | null>;
  width?: number;
}

const Dropdown: React.FC<DropdownProps> = ({
  isOpen,
  onClose,
  children,
  className = "",
  dropdownRef,
  width = 260, // Default width from UserDropdown
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownContentRef.current &&
        !dropdownContentRef.current.contains(event.target as Node) &&
        dropdownRef?.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const updatePosition = () => {
      if (dropdownRef?.current && dropdownContentRef.current) {
        const triggerRect = dropdownRef.current.getBoundingClientRect();
        const dropdownWidth = width; // Use provided width parameter
        
        // Calculate position to ensure dropdown stays within viewport
        let left = triggerRect.left + triggerRect.width - dropdownWidth;
        
        // If dropdown would go off the left side of the viewport, align it to the left
        if (left < 10) {
          left = 10;
        }
        
        // If dropdown would go off the right side of the viewport, align it to the right
        if (left + dropdownWidth > window.innerWidth - 10) {
          left = window.innerWidth - dropdownWidth - 10;
        }
        
        // Set position directly below the trigger button
        setPosition({
          top: triggerRect.bottom + 5, // 5px gap
          left: left,
          width: dropdownWidth,
        });
      }
    };

    if (isOpen) {
      updatePosition();
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [isOpen, onClose, dropdownRef, width]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownContentRef}
      className={`fixed z-50 ${className}`}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
      }}
    >
      {children}
    </div>
  );
};

export default Dropdown;
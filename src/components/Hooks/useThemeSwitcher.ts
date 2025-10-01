"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

const PREFER_DARK_QUERY = "(prefers-color-scheme: dark)";
const STORAGE_KEY = "theme";

export type ThemeMode = "light" | "dark";

type UseThemeSwitcherReturn = [ThemeMode, Dispatch<SetStateAction<ThemeMode>>];

function resolveStoredMode(): ThemeMode | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  return null;
}

function applyTheme(mode: ThemeMode) {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  // Apply theme to html element for consistent styling
  const htmlElement = document.documentElement;
  if (mode === "dark") {
    htmlElement.classList.add("dark");
  } else {
    htmlElement.classList.remove("dark");
  }
  
  // Store preference
  window.localStorage.setItem(STORAGE_KEY, mode);
  
  // Dispatch custom event for other components to react to theme changes
  window.dispatchEvent(new CustomEvent('themeChange', { detail: { mode } }));
}

export default function useThemeSwitcher(): UseThemeSwitcherReturn {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const stored = resolveStoredMode();
    if (stored) {
      return stored;
    }

    if (typeof window !== "undefined") {
      return window.matchMedia(PREFER_DARK_QUERY).matches ? "dark" : "light";
    }

    return "light";
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia(PREFER_DARK_QUERY);

    const handleChange = () => {
      const stored = resolveStoredMode();
      if (stored) {
        setMode(stored);
        return;
      }

      const nextMode: ThemeMode = mediaQuery.matches ? "dark" : "light";
      setMode(nextMode);
    };

    handleChange();

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    applyTheme(mode);
  }, [mode]);

  return [mode, setMode];
}

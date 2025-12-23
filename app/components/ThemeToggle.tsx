"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    const systemDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    const initialTheme = stored ?? (systemDark ? "dark" : "light");
    console.log(initialTheme, "initialTheme");

    document.documentElement.classList.toggle("dark", initialTheme === "dark");

    setTheme(initialTheme);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
    setTheme(next);
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="group rounded-md p-2 cursor-pointer transition-colors duration-200 hover:bg-black dark:hover:bg-neutral-800"
    >
      <span className="block transition-colors duration-200 dark:group-hover:text-neutral-200">
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </span>
    </button>
  );
}

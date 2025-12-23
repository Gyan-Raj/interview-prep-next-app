"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    const systemDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const initial = stored ?? (systemDark ? "dark" : "light");

    document.documentElement.setAttribute("data-theme", initial);
    setTheme(initial);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    setTheme(next);
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="rounded-md p-2 transition cursor-pointer"
      style={{
        backgroundColor: "transparent",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.backgroundColor = "var(--color-border)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.backgroundColor = "transparent")
      }
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

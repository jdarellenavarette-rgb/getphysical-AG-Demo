"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "../ui/button";

/** Follows the system setting until the operator chooses; the choice is remembered in a cookie. */
export function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const isDark = root.dataset.theme
      ? root.dataset.theme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    const next = isDark ? "light" : "dark";
    root.dataset.theme = next;
    document.cookie = `gp_theme=${next}; path=/; max-age=31536000; samesite=lax`;
  };
  return (
    <Button variant="secondary" size="sm" onClick={toggle} aria-label="Switch between light and dark theme">
      <Sun size={16} aria-hidden className="hidden [[data-theme=dark]_&]:block" />
      <Moon size={16} aria-hidden className="[[data-theme=dark]_&]:hidden" />
      Theme
    </Button>
  );
}

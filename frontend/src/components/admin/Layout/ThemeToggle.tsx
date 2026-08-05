"use client";

import { Moon, Sun } from "lucide-react";
import { useAdminTheme } from "@/lib/context/AdminThemeContext";
import { cn } from "@/lib/utils/cn";

export function ThemeToggle({ className }: { className?: string }) {
  const { mode, toggle, isDark } = useAdminTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "flex w-full items-center gap-2 rounded-sm px-2 py-2 text-xs transition-colors",
        "text-parchment-100/60 hover:bg-parchment-100/5 hover:text-parchment-100",
        className
      )}
    >
      {isDark ? <Sun className="h-3.5 w-3.5 text-gold-300" /> : <Moon className="h-3.5 w-3.5" />}
      <span>{isDark ? "Light mode" : "Dark mode"}</span>
      <span
        className={cn(
          "ml-auto rounded-full px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide",
          isDark ? "bg-gold-500/20 text-gold-300" : "bg-parchment-100/10 text-parchment-100/50"
        )}
      >
        {mode}
      </span>
    </button>
  );
}

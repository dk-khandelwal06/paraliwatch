"use client";

import React from "react";
import { Sun, Moon, Sunset } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { ThemeMode } from "@/lib/types";

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themes: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { mode: "light", label: "Light", icon: <Sun className="w-4 h-4" /> },
    { mode: "dark", label: "Dark", icon: <Moon className="w-4 h-4" /> },
    { mode: "dusk", label: "Dusk", icon: <Sunset className="w-4 h-4" /> },
  ];

  return (
    <div
      role="group"
      aria-label="Theme selector"
      className="inline-flex items-center p-1 rounded-full border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-sm"
    >
      {themes.map((t) => {
        const isActive = theme === t.mode;
        return (
          <button
            key={t.mode}
            onClick={() => setTheme(t.mode)}
            title={`Switch to ${t.label} theme`}
            aria-pressed={isActive}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
              isActive
                ? "bg-[var(--accent-green)] text-white shadow"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
};


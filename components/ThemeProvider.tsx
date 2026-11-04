"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ThemeMode } from "@/lib/types";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check saved preference
    const saved = localStorage.getItem("paraliwatch-theme") as ThemeMode | null;
    if (saved && (saved === "light" || saved === "dark" || saved === "dusk")) {
      setThemeState(saved);
      applyTheme(saved);
    } else {
      // Respect system preference
      const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initial = isSystemDark ? "dark" : "light";
      setThemeState(initial);
      applyTheme(initial);
    }
    setMounted(true);
  }, []);

  const applyTheme = (mode: ThemeMode) => {
    const root = document.documentElement;
    root.classList.remove("light", "dark", "dusk");
    root.classList.add(mode);
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem("paraliwatch-theme", mode);
    applyTheme(mode);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div style={{ visibility: mounted ? "visible" : "visible" }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

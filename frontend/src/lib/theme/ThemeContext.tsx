"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark";
export type ColorPalette = "obsidian-mint" | "navy-gold" | "gunmetal-copper";

export interface PaletteMeta {
  id: ColorPalette;
  name: string;
  subtitle: string;
  colors: {
    dominant60: string;
    secondary30: string;
    accent10: string;
    dominantLabel: string;
    secondaryLabel: string;
    accentLabel: string;
  };
}

export const MIZAN_PALETTES: PaletteMeta[] = [
  {
    id: "obsidian-mint",
    name: "Obsidian & Signal Mint",
    subtitle: "Modern Fintech & Katılım",
    colors: {
      dominant60: "#08080C",
      secondary30: "#F4F4F5",
      accent10: "#10B981",
      dominantLabel: "Midnight Obsidian",
      secondaryLabel: "Pure Mist",
      accentLabel: "Signal Mint",
    },
  },
  {
    id: "navy-gold",
    name: "Deep Navy & Warm Gold",
    subtitle: "Kurumsal Prestij & Güven",
    colors: {
      dominant60: "#14213D",
      secondary30: "#F5F2EB",
      accent10: "#D97706",
      dominantLabel: "Deep Navy",
      secondaryLabel: "Warm Cream",
      accentLabel: "Burnished Gold",
    },
  },
  {
    id: "gunmetal-copper",
    name: "Gunmetal & Molten Copper",
    subtitle: "Yüksek Enerji & Terminal",
    colors: {
      dominant60: "#0D0E12",
      secondary30: "#E4E6EB",
      accent10: "#FF5A1F",
      dominantLabel: "Gunmetal Night",
      secondaryLabel: "Fog Silver",
      accentLabel: "Molten Copper",
    },
  },
];

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
  palette: ColorPalette;
  setPalette: (palette: ColorPalette) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>("light");
  const [palette, setPaletteState] = useState<ColorPalette>("obsidian-mint");

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("mizan_theme") as Theme | null;
      if (savedTheme === "dark" || savedTheme === "light") {
        setThemeState(savedTheme);
        applyTheme(savedTheme);
      } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const initialTheme: Theme = prefersDark ? "dark" : "light";
        setThemeState(initialTheme);
        applyTheme(initialTheme);
      }

      const savedPalette = localStorage.getItem("mizan_palette") as ColorPalette | null;
      if (
        savedPalette === "obsidian-mint" ||
        savedPalette === "navy-gold" ||
        savedPalette === "gunmetal-copper"
      ) {
        setPaletteState(savedPalette);
        applyPalette(savedPalette);
      } else {
        applyPalette("obsidian-mint");
      }
    } catch {
      applyPalette("obsidian-mint");
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }
  };

  const applyPalette = (newPalette: ColorPalette) => {
    document.documentElement.setAttribute("data-palette", newPalette);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    try {
      localStorage.setItem("mizan_theme", newTheme);
    } catch {
      // ignore
    }
  };

  const setPalette = (newPalette: ColorPalette) => {
    setPaletteState(newPalette);
    applyPalette(newPalette);
    try {
      localStorage.setItem("mizan_palette", newPalette);
    } catch {
      // ignore
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === "dark",
        palette,
        setPalette,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

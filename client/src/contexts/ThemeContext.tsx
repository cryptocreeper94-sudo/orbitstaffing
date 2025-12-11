import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { allThemes } from "@/data/themes";

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
  watermark?: string;
  category: ThemeCategory;
}

export type ThemeCategory = 
  | "classic" 
  | "nfl" | "mlb" | "nba" | "nhl" | "mls" 
  | "wsl" | "epl" | "laliga" | "bundesliga" | "seriea" | "ligue1" 
  | "college" | "golf" | "nature";

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "orbit_theme_id";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const savedId = localStorage.getItem(STORAGE_KEY);
      if (savedId) {
        const found = allThemes.find(t => t.id === savedId);
        if (found) return found;
      }
    }
    return allThemes.find(t => t.id === "orbit-dark") || allThemes[0];
  });

  const setTheme = (themeId: string) => {
    const theme = allThemes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      localStorage.setItem(STORAGE_KEY, themeId);
    }
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, currentTheme.id);
    
    const root = document.documentElement;
    root.setAttribute('data-theme', currentTheme.id);
    
    const isLight = currentTheme.colors.background.includes('slate-50') || 
                    currentTheme.colors.background.includes('bg-white') ||
                    currentTheme.colors.textPrimary.includes('text-slate-900');
    
    if (isLight) {
      document.body.classList.remove('dark');
      document.body.classList.add('light-mode');
      root.classList.add('light-mode');
      root.classList.remove('dark');
    } else {
      document.body.classList.add('dark');
      document.body.classList.remove('light-mode');
      root.classList.remove('light-mode');
      root.classList.add('dark');
    }
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, availableThemes: allThemes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

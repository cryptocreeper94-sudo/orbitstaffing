import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { allThemes, Theme } from "../data/themes";

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "orbit_theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedThemeId = localStorage.getItem(STORAGE_KEY);
      return allThemes.find((t: Theme) => t.id === savedThemeId) || allThemes[0];
    }
    return allThemes[0];
  });

  useEffect(() => {
    const root = document.documentElement;
    const theme = currentTheme;
    
    root.setAttribute('data-theme', theme.id);
    
    if (theme.isLight) {
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

  const setTheme = (themeId: string) => {
    const theme = allThemes.find((t: Theme) => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      localStorage.setItem(STORAGE_KEY, themeId);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, availableThemes: allThemes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

export type { Theme };

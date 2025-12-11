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
    
    root.style.setProperty('--theme-bg', theme.colors.background);
    root.style.setProperty('--theme-card', theme.colors.cardBg);
    root.style.setProperty('--theme-text', theme.colors.textPrimary);
    root.style.setProperty('--theme-text-secondary', theme.colors.textSecondary);
    
    if (theme.colors.background.includes('slate-50') || 
        theme.colors.background.includes('white') ||
        theme.colors.background.includes('gray-50')) {
      document.body.classList.remove('dark');
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.add('dark');
      document.body.classList.remove('light-mode');
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

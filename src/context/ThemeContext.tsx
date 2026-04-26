import React, { createContext, useContext, useState, useCallback } from "react";
import { storage } from "../storage";
import { lightColors, darkColors, ThemeColors } from "../constants/theme";

const THEME_STORAGE_KEY = "app-dark-mode";

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
  colors: lightColors,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    return storage.getBoolean(THEME_STORAGE_KEY) ?? false;
  });

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      storage.set(THEME_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

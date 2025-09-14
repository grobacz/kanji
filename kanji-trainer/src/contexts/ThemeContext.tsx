import React, { useEffect, useState } from 'react';
import { themes, getAvailableThemes } from '../constants/themes';
import { ThemeContext } from './ThemeContextDefinition';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentThemeId, setCurrentThemeId] = useState<string>('default');
  
  // Load theme from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('kanji-trainer-theme');
    if (saved && themes[saved]) {
      setCurrentThemeId(saved);
    }
  }, []);

  // Apply theme to CSS custom properties
  useEffect(() => {
    const theme = themes[currentThemeId];
    if (!theme) return;

    const root = document.documentElement;
    
    // Set color variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Set gradient variables
    Object.entries(theme.gradients).forEach(([key, value]) => {
      root.style.setProperty(`--gradient-${key}`, value);
    });
    
    // Set font variables
    Object.entries(theme.fonts).forEach(([key, value]) => {
      root.style.setProperty(`--font-${key}`, value);
    });
    
    // Set effect variables
    Object.entries(theme.effects).forEach(([key, value]) => {
      root.style.setProperty(`--effect-${key}`, value);
    });

    // Apply theme class to body for additional styling
    document.body.className = `theme-${currentThemeId}`;
  }, [currentThemeId]);

  const setTheme = (themeId: string) => {
    if (themes[themeId]) {
      setCurrentThemeId(themeId);
      localStorage.setItem('kanji-trainer-theme', themeId);
    }
  };

  const value = {
    currentTheme: themes[currentThemeId],
    setTheme,
    availableThemes: getAvailableThemes(),
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
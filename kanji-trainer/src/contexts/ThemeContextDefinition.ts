import { createContext } from 'react';
import { type Theme } from '../constants/themes';

export interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  availableThemes: Theme[];
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
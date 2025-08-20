import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    success: string;
    warning: string;
    error: string;
  };
  gradients: {
    primary: string;
    background: string;
    surface: string;
  };
  fonts: {
    primary: string;
    kanji: string;
  };
  effects: {
    blur: string;
    shadow: string;
    glow: string;
  };
}

export const themes: Record<string, Theme> = {
  default: {
    id: 'default',
    name: 'Ocean Breeze',
    description: 'Modern glass morphism with ocean-inspired colors',
    colors: {
      primary: '#0ea5e9',
      secondary: '#8b5cf6',
      accent: '#06b6d4',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#1e293b',
      textSecondary: '#64748b',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)',
      background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
      surface: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
    },
    fonts: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      kanji: "'Noto Sans JP', sans-serif",
    },
    effects: {
      blur: 'blur(10px)',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      glow: '0 0 20px rgba(14, 165, 233, 0.4)',
    },
  },
  
  sakura: {
    id: 'sakura',
    name: 'Sakura Bloom',
    description: 'Gentle cherry blossom inspired theme',
    colors: {
      primary: '#ec4899',
      secondary: '#f97316',
      accent: '#f472b6',
      background: '#fdf2f8',
      surface: '#ffffff',
      text: '#881337',
      textSecondary: '#be185d',
      success: '#65a30d',
      warning: '#d97706',
      error: '#dc2626',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)',
      background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
      surface: 'linear-gradient(135deg, rgba(252, 231, 243, 0.3), rgba(253, 242, 248, 0))',
    },
    fonts: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      kanji: "'Noto Serif JP', serif",
    },
    effects: {
      blur: 'blur(12px)',
      shadow: '0 8px 32px rgba(236, 72, 153, 0.15)',
      glow: '0 0 20px rgba(236, 72, 153, 0.4)',
    },
  },
  
  midnight: {
    id: 'midnight',
    name: 'Midnight Scholar',
    description: 'Dark theme for late-night study sessions',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#a855f7',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#f87171',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      surface: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0))',
    },
    fonts: {
      primary: "'JetBrains Mono', 'Fira Code', monospace",
      kanji: "'Noto Sans JP', sans-serif",
    },
    effects: {
      blur: 'blur(8px)',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      glow: '0 0 20px rgba(99, 102, 241, 0.5)',
    },
  },
  
  zen: {
    id: 'zen',
    name: 'Zen Garden',
    description: 'Minimalist earth tones for focused study',
    colors: {
      primary: '#059669',
      secondary: '#0891b2',
      accent: '#0d9488',
      background: '#f9fafb',
      surface: '#ffffff',
      text: '#374151',
      textSecondary: '#6b7280',
      success: '#047857',
      warning: '#d97706',
      error: '#dc2626',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #059669 0%, #0891b2 100%)',
      background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
      surface: 'linear-gradient(135deg, rgba(243, 244, 246, 0.3), rgba(249, 250, 251, 0))',
    },
    fonts: {
      primary: "'Source Sans Pro', -apple-system, BlinkMacSystemFont, sans-serif",
      kanji: "'Noto Serif JP', serif",
    },
    effects: {
      blur: 'blur(6px)',
      shadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
      glow: '0 0 16px rgba(5, 150, 105, 0.3)',
    },
  },
  
  cyber: {
    id: 'cyber',
    name: 'Cyber Punk',
    description: 'Futuristic neon theme for digital natives',
    colors: {
      primary: '#06ffa5',
      secondary: '#ff0080',
      accent: '#00d4ff',
      background: '#0a0a0a',
      surface: '#1a1a1a',
      text: '#ffffff',
      textSecondary: '#a0a0a0',
      success: '#00ff88',
      warning: '#ffaa00',
      error: '#ff4444',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #06ffa5 0%, #00d4ff 100%)',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 100%)',
      surface: 'linear-gradient(135deg, rgba(26, 26, 26, 0.9), rgba(10, 10, 10, 0.5))',
    },
    fonts: {
      primary: "'Orbitron', 'JetBrains Mono', monospace",
      kanji: "'Noto Sans JP', sans-serif",
    },
    effects: {
      blur: 'blur(4px)',
      shadow: '0 0 32px rgba(6, 255, 165, 0.3)',
      glow: '0 0 24px rgba(6, 255, 165, 0.6)',
    },
  },
};

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

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
    availableThemes: Object.values(themes),
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
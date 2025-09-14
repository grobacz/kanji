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
      primary: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #8b5cf6 100%)',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      surface: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
    },
    fonts: {
      primary: '"Inter", system-ui, -apple-system, sans-serif',
      kanji: '"Noto Sans JP", "Hiragino Sans", "Yu Gothic", sans-serif',
    },
    effects: {
      blur: 'blur(20px)',
      shadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
      glow: '0 0 20px rgba(14, 165, 233, 0.5)',
    },
  },
  
  // Sakura Theme - inspired by cherry blossoms
  sakura: {
    id: 'sakura',
    name: 'Cherry Blossom',
    description: 'Soft pink and warm tones inspired by Japanese sakura',
    colors: {
      primary: '#f472b6',
      secondary: '#a855f7',
      accent: '#ec4899',
      background: '#fdf2f8',
      surface: '#ffffff',
      text: '#374151',
      textSecondary: '#6b7280',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #f472b6 0%, #ec4899 50%, #a855f7 100%)',
      background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
      surface: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(253,242,248,0.7) 100%)',
    },
    fonts: {
      primary: '"Inter", system-ui, -apple-system, sans-serif',
      kanji: '"Noto Sans JP", "Hiragino Sans", "Yu Gothic", sans-serif',
    },
    effects: {
      blur: 'blur(20px)',
      shadow: '0 8px 32px rgba(244, 114, 182, 0.37)',
      glow: '0 0 20px rgba(244, 114, 182, 0.5)',
    },
  },

  // Forest Theme - natural greens
  forest: {
    id: 'forest',
    name: 'Zen Garden',
    description: 'Calming greens inspired by Japanese gardens',
    colors: {
      primary: '#059669',
      secondary: '#0d9488',
      accent: '#22c55e',
      background: '#f0fdf4',
      surface: '#ffffff',
      text: '#1f2937',
      textSecondary: '#6b7280',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #22c55e 100%)',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      surface: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,253,244,0.7) 100%)',
    },
    fonts: {
      primary: '"Inter", system-ui, -apple-system, sans-serif',
      kanji: '"Noto Sans JP", "Hiragino Sans", "Yu Gothic", sans-serif',
    },
    effects: {
      blur: 'blur(20px)',
      shadow: '0 8px 32px rgba(5, 150, 105, 0.37)',
      glow: '0 0 20px rgba(5, 150, 105, 0.5)',
    },
  },

  // Midnight Theme - dark mode
  midnight: {
    id: 'midnight',
    name: 'Midnight Sky',
    description: 'Dark theme with celestial blue accents',
    colors: {
      primary: '#60a5fa',
      secondary: '#a78bfa',
      accent: '#34d399',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f8fafc',
      textSecondary: '#cbd5e1',
      success: '#10b981',
      warning: '#fbbf24',
      error: '#f87171',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #a78bfa 100%)',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      surface: 'linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.7) 100%)',
    },
    fonts: {
      primary: '"Inter", system-ui, -apple-system, sans-serif',
      kanji: '"Noto Sans JP", "Hiragino Sans", "Yu Gothic", sans-serif',
    },
    effects: {
      blur: 'blur(20px)',
      shadow: '0 8px 32px rgba(96, 165, 250, 0.37)',
      glow: '0 0 20px rgba(96, 165, 250, 0.5)',
    },
  },
};

export const getAvailableThemes = (): Theme[] => Object.values(themes);

export const getThemeById = (id: string): Theme | undefined => themes[id];
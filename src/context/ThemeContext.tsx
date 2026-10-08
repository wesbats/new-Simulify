import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode } from '../types';

export interface PresetColor {
  name: string;
  value: string;
}

export const PRESET_THEME_COLORS: PresetColor[] = [
  { name: 'Cobalto / Indigo', value: '#4F46E5' },
  { name: 'Violeta Real', value: '#8B5CF6' },
  { name: 'Esmeralda', value: '#10B981' },
  { name: 'Sky / Azul Céu', value: '#0EA5E9' },
  { name: 'Ciano Tech', value: '#06B6D4' },
  { name: 'Âmbar / Ouro', value: '#F59E0B' },
  { name: 'Rose / Rosa', value: '#F43F5E' },
  { name: 'Laranja Fogo', value: '#F97316' },
];

interface ThemeContextType {
  themeMode: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  primaryColor: string;
  setPrimaryColor: (hex: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function hexToRgbValues(hex: string): { r: number; g: number; b: number; rgbString: string } {
  const clean = hex.replace('#', '');
  const parsed = parseInt(clean, 16);
  const r = (parsed >> 16) & 255;
  const g = (parsed >> 8) & 255;
  const b = parsed & 255;
  return {
    r,
    g,
    b,
    rgbString: `${r} ${g} ${b}`,
  };
}

function adjustBrightness(hex: string, percent: number): string {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return '#' + (0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1);
}

function applyCustomColor(color: string) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const { rgbString } = hexToRgbValues(color);
  const hoverColor = adjustBrightness(color, -15);
  const { r, g, b } = hexToRgbValues(color);
  const contrastColor = (r * 299 + g * 587 + b * 114) / 1000 > 160 ? '#0F172A' : '#FFFFFF';

  root.style.setProperty('--primary', color);
  root.style.setProperty('--primary-hover', hoverColor);
  root.style.setProperty('--primary-rgb', rgbString);
  root.style.setProperty('--primary-light', `rgba(${rgbString.replace(/ /g, ', ')}, 0.15)`);
  root.style.setProperty('--primary-contrast', contrastColor);
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('simulify_theme_mode');
    return (saved as ThemeMode) || 'system';
  });

  const [primaryColor, setPrimaryColorState] = useState<string>(() => {
    return localStorage.getItem('simulify_theme_color') || '#4F46E5';
  });

  const [systemDark, setSystemDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Listen to browser/OS theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemDark(e.matches);
    };

    setSystemDark(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const resolvedTheme: 'light' | 'dark' = themeMode === 'system'
    ? (systemDark ? 'dark' : 'light')
    : themeMode;

  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [resolvedTheme]);

  useEffect(() => {
    applyCustomColor(primaryColor);
  }, [primaryColor]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem('simulify_theme_mode', mode);
  };

  const setPrimaryColor = (color: string) => {
    setPrimaryColorState(color);
    localStorage.setItem('simulify_theme_color', color);
    applyCustomColor(color);
  };

  const toggleTheme = () => {
    if (themeMode === 'system') {
      setThemeMode(resolvedTheme === 'dark' ? 'light' : 'dark');
    } else if (themeMode === 'light') {
      setThemeMode('dark');
    } else {
      setThemeMode('system');
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        resolvedTheme,
        setThemeMode,
        toggleTheme,
        primaryColor,
        setPrimaryColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

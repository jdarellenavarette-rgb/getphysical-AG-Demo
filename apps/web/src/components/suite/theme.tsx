'use client';

import React, { createContext, useContext, useState } from 'react';

export interface WebTheme {
  isDark: boolean;
  bgScreen: string;
  bgHeader: string;
  bgCard: string;
  bgCardSecondary: string;
  bgCardTertiary: string;
  bgDock: string;
  borderColor: string;
  borderLight: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  accentMuted: string;
  accentGreen: string;
  accentGreenMuted: string;
  shadowCard: string;
  shadowPill: string;
  waveStroke: string;
  waveFill: string;
}

export const lightTheme: WebTheme = {
  isDark: false,
  bgScreen: '#F4F4F5',
  bgHeader: '#FFFFFF',
  bgCard: '#FFFFFF',
  bgCardSecondary: '#F8FAFC',
  bgCardTertiary: '#F1F5F9',
  bgDock: '#FFFFFF',
  borderColor: '#E2E8F0',
  borderLight: '#F1F5F9',
  textPrimary: '#09090B',
  textSecondary: '#475569',
  textMuted: '#64748B',
  accent: '#E11D48',
  accentHover: '#BE123C',
  accentMuted: 'rgba(225, 29, 72, 0.08)',
  accentGreen: '#059669',
  accentGreenMuted: 'rgba(5, 150, 105, 0.1)',
  shadowCard: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
  shadowPill: '0 4px 12px rgba(225, 29, 72, 0.25)',
  waveStroke: '#E11D48',
  waveFill: 'rgba(225, 29, 72, 0.14)',
};

export const darkTheme: WebTheme = {
  isDark: true,
  bgScreen: '#0D0F12',
  bgHeader: '#12151B',
  bgCard: '#161920',
  bgCardSecondary: '#1E232E',
  bgCardTertiary: '#252B38',
  bgDock: '#13161C',
  borderColor: '#262B37',
  borderLight: '#1E232E',
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  accent: '#FF4D6D',
  accentHover: '#FB7185',
  accentMuted: 'rgba(255, 77, 109, 0.16)',
  accentGreen: '#10B981',
  accentGreenMuted: 'rgba(16, 185, 129, 0.15)',
  shadowCard: '0 12px 32px rgba(0, 0, 0, 0.45)',
  shadowPill: '0 8px 24px rgba(255, 77, 109, 0.45)',
  waveStroke: '#FF4D6D',
  waveFill: 'rgba(255, 77, 109, 0.28)',
};

interface ThemeContextValue {
  theme: WebTheme;
  isDark: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
  setThemeMode: () => {},
});

export function SuiteThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setThemeMode = (newMode: 'light' | 'dark') => {
    setMode(newMode);
  };

  const currentTheme = mode === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, isDark: mode === 'dark', toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useSuiteTheme() {
  return useContext(ThemeContext);
}

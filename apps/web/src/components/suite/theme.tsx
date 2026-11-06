'use client';

import React, { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from 'react';
import { DARK_PALETTE, LIGHT_PALETTE, type DesignThemeMode } from 'sodia-core/design-tokens';
import { THEME_STORAGE_KEY, resolveEffects } from '../../lib/theme-css';
import { T, type ThemeVars } from '../../lib/theme-vars';

/**
 * Existing field names are preserved so every view keeps working. Values are
 * `var(--gp-*)` references generated from the sodia-core palettes, so the same
 * string renders on the server and the client and the browser swaps colours.
 */
export interface WebTheme extends ThemeVars {
  isDark: boolean;
}

/** Concrete (non-variable) theme objects for code that needs literal colours, e.g. WebGL. */
function buildLiteralTheme(mode: DesignThemeMode): WebTheme {
  const palette = mode === 'dark' ? DARK_PALETTE : LIGHT_PALETTE;
  const effects = resolveEffects(mode);
  return {
    isDark: mode === 'dark',
    bgScreen: palette.bgScreen,
    bgHeader: palette.bgHeader,
    bgCard: palette.bgCard,
    bgCardSecondary: palette.bgCardSecondary,
    bgCardTertiary: palette.bgCardTertiary,
    bgDock: palette.bgDock,
    bgInput: palette.bgInput,
    borderColor: palette.borderColor,
    borderLight: palette.borderLight,
    textPrimary: palette.textPrimary,
    textSecondary: palette.textSecondary,
    textMuted: palette.textMuted,
    textOnAccent: palette.textOnAccent,
    accent: palette.accent,
    accentHover: palette.accentHover,
    accentText: palette.accentText,
    accentMuted: palette.accentMuted,
    accentGreen: palette.accentGreen,
    accentGreenMuted: palette.accentGreenMuted,
    warning: palette.warning,
    danger: palette.danger,
    info: palette.info,
    skeletonBase: palette.skeletonBase,
    skeletonHighlight: palette.skeletonHighlight,
    overlayScrim: palette.overlayScrim,
    focusRing: palette.focusRing,
    ...effects,
  };
}

export const lightTheme: WebTheme = buildLiteralTheme('light');
export const darkTheme: WebTheme = buildLiteralTheme('dark');

const LIGHT_VARS: WebTheme = { ...T, isDark: false };
const DARK_VARS: WebTheme = { ...T, isDark: true };

// ---- Theme mode store (html[data-theme] + localStorage + prefers-color-scheme) ----

const DARK_QUERY = '(prefers-color-scheme: dark)';
const listeners = new Set<() => void>();

function readMode(): DesignThemeMode {
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'light' || attr === 'dark') return attr;
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const mql = window.matchMedia(DARK_QUERY);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== THEME_STORAGE_KEY) return;
    if (e.newValue === 'light' || e.newValue === 'dark') {
      document.documentElement.setAttribute('data-theme', e.newValue);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    listener();
  };
  mql.addEventListener('change', listener);
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    mql.removeEventListener('change', listener);
    window.removeEventListener('storage', onStorage);
  };
}

function writeMode(mode: DesignThemeMode) {
  document.documentElement.setAttribute('data-theme', mode);
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Private mode / storage disabled: the choice still applies for this session.
  }
  listeners.forEach((l) => l());
}

interface ThemeContextValue {
  theme: WebTheme;
  isDark: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: DesignThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: LIGHT_VARS,
  isDark: false,
  toggleTheme: () => {},
  setThemeMode: () => {},
});

export function SuiteThemeProvider({ children }: { children: React.ReactNode }) {
  // Server snapshot is 'light'; after hydration React re-reads the real mode.
  // Colours never depend on this value (they are CSS variables), so there is no flash.
  const mode = useSyncExternalStore<DesignThemeMode>(subscribe, readMode, () => 'light');

  const setThemeMode = useCallback((next: DesignThemeMode) => writeMode(next), []);
  const toggleTheme = useCallback(() => writeMode(readMode() === 'dark' ? 'light' : 'dark'), []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme: mode === 'dark' ? DARK_VARS : LIGHT_VARS, isDark: mode === 'dark', toggleTheme, setThemeMode }),
    [mode, toggleTheme, setThemeMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useSuiteTheme() {
  return useContext(ThemeContext);
}

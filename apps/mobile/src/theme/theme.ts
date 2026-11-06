import { create } from "zustand";
import { DARK_PALETTE, LIGHT_PALETTE, type DesignPalette, type DesignThemeMode } from "sodia-core";

export type ThemeMode = DesignThemeMode;

/**
 * Mobile palette = sodia-core WCAG-AA design tokens + RN-only fields.
 * Field names from the legacy palette (bgScreen, textMuted, accent...) are preserved.
 */
export interface ColorPalette extends DesignPalette {
  readonly statusBarStyle: "light-content" | "dark-content";
  /** Always-dark media scrim used for pills/badges rendered over photos & video. */
  readonly mediaScrim: string;
  /** Text/icon colour rendered on top of `mediaScrim` or imagery. */
  readonly textOnMedia: string;
  readonly textOnMediaMuted: string;
  readonly verified: string;
}

const MEDIA_FIELDS = {
  mediaScrim: "rgba(9, 9, 11, 0.82)",
  textOnMedia: "#FAFAFA",
  textOnMediaMuted: "#D4D4D8",
} as const;

export const darkTheme: ColorPalette = {
  ...DARK_PALETTE,
  ...MEDIA_FIELDS,
  statusBarStyle: "light-content",
  verified: "#38BDF8",
};

export const lightTheme: ColorPalette = {
  ...LIGHT_PALETTE,
  ...MEDIA_FIELDS,
  statusBarStyle: "dark-content",
  verified: "#0284C7",
};

export function paletteForMode(mode: ThemeMode): ColorPalette {
  return mode === "light" ? lightTheme : darkTheme;
}

interface ThemeState {
  themeMode: ThemeMode;
  colors: ColorPalette;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  themeMode: "light",
  colors: lightTheme,
  setThemeMode: (mode) => set({ themeMode: mode, colors: paletteForMode(mode) }),
  toggleTheme: () =>
    set((state) => {
      const nextMode: ThemeMode = state.themeMode === "light" ? "dark" : "light";
      return { themeMode: nextMode, colors: paletteForMode(nextMode) };
    }),
}));

/** Selector hook — subscribes only to the palette. */
export function useColors(): ColorPalette {
  return useThemeStore((s) => s.colors);
}

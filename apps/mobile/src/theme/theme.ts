import { create } from "zustand";

export type ThemeMode = "dark" | "light";

export interface ColorPalette {
  mode: ThemeMode;
  bgScreen: string;
  bgHeader: string;
  bgCard: string;
  bgCardSecondary: string;
  bgDock: string;
  bgInput: string;
  borderColor: string;
  borderLight: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentMuted: string;
  accentGreen: string;
  statusBarStyle: "light-content" | "dark-content";
}

export const darkTheme: ColorPalette = {
  mode: "dark",
  bgScreen: "#09090B",
  bgHeader: "#09090B",
  bgCard: "#141418",
  bgCardSecondary: "#18181B",
  bgDock: "#16161A",
  bgInput: "#18181B",
  borderColor: "#27272A",
  borderLight: "#202026",
  textPrimary: "#FAFAFA",
  textSecondary: "#A1A1AA",
  textMuted: "#71717A",
  accent: "#E11D48",
  accentMuted: "rgba(225, 29, 72, 0.15)",
  accentGreen: "#10B981",
  statusBarStyle: "light-content",
};

export const lightTheme: ColorPalette = {
  mode: "light",
  bgScreen: "#F4F4F5",
  bgHeader: "#FFFFFF",
  bgCard: "#FFFFFF",
  bgCardSecondary: "#F8FAFC",
  bgDock: "#FFFFFF",
  bgInput: "#E4E4E7",
  borderColor: "#E2E8F0",
  borderLight: "#F1F5F9",
  textPrimary: "#09090B",
  textSecondary: "#475569",
  textMuted: "#64748B",
  accent: "#E11D48",
  accentMuted: "rgba(225, 29, 72, 0.1)",
  accentGreen: "#059669",
  statusBarStyle: "dark-content",
};

interface ThemeState {
  themeMode: ThemeMode;
  colors: ColorPalette;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  themeMode: "light",
  colors: lightTheme,
  setThemeMode: (mode) =>
    set({
      themeMode: mode,
      colors: mode === "light" ? lightTheme : darkTheme,
    }),
  toggleTheme: () =>
    set((state) => {
      const nextMode = state.themeMode === "light" ? "dark" : "light";
      return {
        themeMode: nextMode,
        colors: nextMode === "light" ? lightTheme : darkTheme,
      };
    }),
}));

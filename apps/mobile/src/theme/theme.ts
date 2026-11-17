import { create } from "zustand";
import { Appearance } from "react-native";
import * as SecureStore from "expo-secure-store";

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

/** "system" follows the phone's light/dark setting; the others are a manual choice. */
export type ThemePreference = "system" | ThemeMode;

const THEME_KEY = "sodia.theme";

const systemMode = (): ThemeMode => (Appearance.getColorScheme() === "dark" ? "dark" : "light");
const paletteFor = (mode: ThemeMode): ColorPalette => (mode === "light" ? lightTheme : darkTheme);
const resolve = (preference: ThemePreference): ThemeMode => (preference === "system" ? systemMode() : preference);

interface ThemeState {
  /** What the person chose. */
  preference: ThemePreference;
  /** The theme actually on screen. */
  themeMode: ThemeMode;
  colors: ColorPalette;
  setPreference: (preference: ThemePreference) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  preference: "system",
  themeMode: systemMode(),
  colors: paletteFor(systemMode()),
  setPreference: (preference) => {
    const themeMode = resolve(preference);
    set({ preference, themeMode, colors: paletteFor(themeMode) });
    SecureStore.setItemAsync(THEME_KEY, preference).catch(() => undefined);
  },
}));

/** Restores the saved choice and keeps "system" in step with the phone. Call once at startup. */
export function initTheme(): () => void {
  SecureStore.getItemAsync(THEME_KEY)
    .then((saved) => {
      if (saved === "light" || saved === "dark" || saved === "system") {
        const themeMode = resolve(saved);
        useThemeStore.setState({ preference: saved, themeMode, colors: paletteFor(themeMode) });
      }
    })
    .catch(() => undefined);

  const subscription = Appearance.addChangeListener(() => {
    if (useThemeStore.getState().preference !== "system") return;
    const themeMode = systemMode();
    useThemeStore.setState({ themeMode, colors: paletteFor(themeMode) });
  });
  return () => subscription.remove();
}

/**
 * GetPhysical Design Tokens — single source of truth for Sodia (mobile) and the
 * GymDash / Clubdash / CoachDash Web OS. Every text/background pair below is
 * verified against WCAG 2.1 AA (>= 4.5:1 for body text) in both themes.
 */

export type DesignThemeMode = "light" | "dark";

export interface DesignPalette {
  readonly mode: DesignThemeMode;
  readonly bgScreen: string;
  readonly bgHeader: string;
  readonly bgCard: string;
  readonly bgCardSecondary: string;
  readonly bgCardTertiary: string;
  readonly bgDock: string;
  readonly bgInput: string;
  readonly borderColor: string;
  readonly borderLight: string;
  readonly textPrimary: string;
  readonly textSecondary: string;
  /** Lowest-emphasis text colour that still passes AA on bgScreen, bgCard and bgInput. */
  readonly textMuted: string;
  /** Text/icon colour placed on top of `accent` fills. */
  readonly textOnAccent: string;
  /** Brand fill (buttons, badges). */
  readonly accent: string;
  readonly accentHover: string;
  /** Accent used as text on the screen background (AA-safe in both modes). */
  readonly accentText: string;
  readonly accentMuted: string;
  readonly accentGreen: string;
  readonly accentGreenMuted: string;
  readonly warning: string;
  readonly danger: string;
  readonly info: string;
  readonly skeletonBase: string;
  readonly skeletonHighlight: string;
  readonly overlayScrim: string;
  readonly focusRing: string;
}

export const LIGHT_PALETTE: DesignPalette = {
  mode: "light",
  bgScreen: "#F4F4F5",
  bgHeader: "#FFFFFF",
  bgCard: "#FFFFFF",
  bgCardSecondary: "#F8FAFC",
  bgCardTertiary: "#F1F5F9",
  bgDock: "#FFFFFF",
  bgInput: "#E4E4E7",
  borderColor: "#E2E8F0",
  borderLight: "#F1F5F9",
  textPrimary: "#09090B",
  textSecondary: "#475569",
  textMuted: "#596273",
  textOnAccent: "#FFFFFF",
  accent: "#E11D48",
  accentHover: "#BE123C",
  accentText: "#BE123C",
  accentMuted: "rgba(225, 29, 72, 0.10)",
  accentGreen: "#047857",
  accentGreenMuted: "rgba(5, 150, 105, 0.10)",
  warning: "#B45309",
  danger: "#B91C1C",
  info: "#1D4ED8",
  skeletonBase: "#E4E4E7",
  skeletonHighlight: "#F4F4F5",
  overlayScrim: "rgba(9, 9, 11, 0.55)",
  focusRing: "#E11D48",
};

export const DARK_PALETTE: DesignPalette = {
  mode: "dark",
  bgScreen: "#09090B",
  bgHeader: "#09090B",
  bgCard: "#141418",
  bgCardSecondary: "#18181B",
  bgCardTertiary: "#1F1F23",
  bgDock: "#16161A",
  bgInput: "#18181B",
  borderColor: "#27272A",
  borderLight: "#202026",
  textPrimary: "#FAFAFA",
  textSecondary: "#A1A1AA",
  textMuted: "#90909A",
  textOnAccent: "#FFFFFF",
  accent: "#E11D48",
  accentHover: "#F43F5E",
  accentText: "#FB7185",
  accentMuted: "rgba(225, 29, 72, 0.15)",
  accentGreen: "#10B981",
  accentGreenMuted: "rgba(16, 185, 129, 0.15)",
  warning: "#F59E0B",
  danger: "#F87171",
  info: "#60A5FA",
  skeletonBase: "#1F1F23",
  skeletonHighlight: "#2A2A30",
  overlayScrim: "rgba(0, 0, 0, 0.65)",
  focusRing: "#FB7185",
};

/** 4-pt spacing scale. */
export const SPACING = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 } as const;

export const RADII = { sm: 6, md: 10, lg: 14, xl: 20, pill: 999 } as const;

/**
 * Type ramp. `caption` (11) is the hard floor for any rendered text — badges,
 * timestamps and legal copy included (Apple HIG / Material minimum legibility).
 */
export const TYPE_SCALE = {
  caption: { fontSize: 11, lineHeight: 14 },
  footnote: { fontSize: 12, lineHeight: 16 },
  body: { fontSize: 14, lineHeight: 20 },
  bodyLarge: { fontSize: 16, lineHeight: 22 },
  title: { fontSize: 18, lineHeight: 24 },
  headline: { fontSize: 22, lineHeight: 28 },
  display: { fontSize: 28, lineHeight: 34 },
} as const;

export const MIN_FONT_SIZE = TYPE_SCALE.caption.fontSize;

/** Minimum interactive target (Apple HIG 44pt, Material 48dp → we enforce 44). */
export const MIN_TOUCH_TARGET = 44;

export const MOTION = {
  fastMs: 150,
  baseMs: 220,
  slowMs: 320,
  spring: { damping: 18, stiffness: 220, mass: 1 },
} as const;

export function paletteFor(mode: DesignThemeMode): DesignPalette {
  return mode === "dark" ? DARK_PALETTE : LIGHT_PALETTE;
}

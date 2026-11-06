/**
 * Server-safe theme object: every value is a `var(--gp-*)` reference into the
 * tokens emitted by buildThemeCss(). Server Components import `T` directly;
 * Client Components receive the same values via useSuiteTheme().
 */
import { cssVarName, type ThemeTokenName } from './theme-css';

export interface ThemeVars {
  bgScreen: string;
  bgHeader: string;
  bgCard: string;
  bgCardSecondary: string;
  bgCardTertiary: string;
  bgDock: string;
  bgInput: string;
  borderColor: string;
  borderLight: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textOnAccent: string;
  accent: string;
  accentHover: string;
  accentText: string;
  accentMuted: string;
  accentGreen: string;
  accentGreenMuted: string;
  warning: string;
  danger: string;
  info: string;
  skeletonBase: string;
  skeletonHighlight: string;
  overlayScrim: string;
  focusRing: string;
  shadowCard: string;
  shadowPill: string;
  waveStroke: string;
  waveFill: string;
  waveFillOpacity: string;
  trackColor: string;
}

const KEYS: readonly (keyof ThemeVars & ThemeTokenName)[] = [
  'bgScreen', 'bgHeader', 'bgCard', 'bgCardSecondary', 'bgCardTertiary', 'bgDock', 'bgInput',
  'borderColor', 'borderLight', 'textPrimary', 'textSecondary', 'textMuted', 'textOnAccent',
  'accent', 'accentHover', 'accentText', 'accentMuted', 'accentGreen', 'accentGreenMuted',
  'warning', 'danger', 'info', 'skeletonBase', 'skeletonHighlight', 'overlayScrim', 'focusRing',
  'shadowCard', 'shadowPill', 'waveStroke', 'waveFill', 'waveFillOpacity', 'trackColor',
];

export const T: ThemeVars = Object.fromEntries(KEYS.map((k) => [k, `var(${cssVarName(k)})`])) as Record<
  keyof ThemeVars,
  string
>;

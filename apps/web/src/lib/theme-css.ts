/**
 * Builds the Web OS colour system from the sodia-core WCAG-AA palettes.
 * Every colour is emitted as a CSS custom property so Server and Client
 * renders produce identical markup (no hydration mismatch); the active theme is
 * selected by `data-theme` on <html> (set pre-paint by THEME_BOOT_SCRIPT) or,
 * when the user has never chosen, by `prefers-color-scheme`.
 */
import { DARK_PALETTE, LIGHT_PALETTE, type DesignPalette, type DesignThemeMode } from 'sodia-core/design-tokens';

export const THEME_STORAGE_KEY = 'gp-web-theme';

/** Theme values that are not part of the shared palette (web-only effects). */
interface WebEffects {
  readonly shadowCard: string;
  readonly shadowPill: string;
  readonly waveStroke: string;
  readonly waveFill: string;
  readonly waveFillOpacity: string;
  readonly trackColor: string;
}

const LIGHT_EFFECTS: WebEffects = {
  shadowCard: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
  shadowPill: '0 4px 12px rgba(225, 29, 72, 0.25)',
  waveStroke: LIGHT_PALETTE.accent,
  waveFill: 'rgba(225, 29, 72, 0.14)',
  waveFillOpacity: '0.22',
  trackColor: LIGHT_PALETTE.borderColor,
};

const DARK_EFFECTS: WebEffects = {
  shadowCard: '0 12px 32px rgba(0, 0, 0, 0.45)',
  shadowPill: '0 8px 24px rgba(225, 29, 72, 0.45)',
  waveStroke: DARK_PALETTE.accentText,
  waveFill: 'rgba(251, 113, 133, 0.28)',
  waveFillOpacity: '0.35',
  trackColor: DARK_PALETTE.borderColor,
};

export type ThemeTokenName = Exclude<keyof DesignPalette, 'mode'> | keyof WebEffects;

function kebab(name: string): string {
  return name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}

export function cssVarName(token: ThemeTokenName): string {
  return `--gp-${kebab(token)}`;
}

function declarations(palette: DesignPalette, effects: WebEffects): string {
  const entries: [string, string][] = [];
  (Object.keys(palette) as (keyof DesignPalette)[]).forEach((key) => {
    if (key === 'mode') return;
    entries.push([cssVarName(key), palette[key]]);
  });
  (Object.keys(effects) as (keyof WebEffects)[]).forEach((key) => {
    entries.push([cssVarName(key), effects[key]]);
  });
  return entries.map(([k, v]) => `${k}:${v};`).join('') + `color-scheme:${palette.mode};`;
}

export function buildThemeCss(): string {
  const light = declarations(LIGHT_PALETTE, LIGHT_EFFECTS);
  const dark = declarations(DARK_PALETTE, DARK_EFFECTS);
  return [
    `:root{${light}}`,
    `@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){${dark}}}`,
    `:root[data-theme="dark"]{${dark}}`,
  ].join('');
}

export function resolveEffects(mode: DesignThemeMode): WebEffects {
  return mode === 'dark' ? DARK_EFFECTS : LIGHT_EFFECTS;
}

/**
 * Runs before first paint: applies a persisted explicit choice. With no stored
 * choice the attribute stays unset and the CSS media query follows the OS.
 */
export const THEME_BOOT_SCRIPT = `(function(){try{var m=localStorage.getItem('${THEME_STORAGE_KEY}');if(m==='light'||m==='dark'){document.documentElement.setAttribute('data-theme',m);}}catch(e){}})();`;

/**
 * Public web origin used in shareable QR codes and facility links
 * (https://<host>/q/<token>, https://<host>/f/<slug>). Must be a domain the
 * app is registered for as a universal / app link.
 */
export const APP_URL = (process.env.EXPO_PUBLIC_APP_URL ?? "https://getphysical.app").replace(/\/+$/, "");

export const APP_HOSTS: readonly string[] = [new URL(APP_URL).hostname.toLowerCase()];

export function facilityLink(slug: string): string {
  return `${APP_URL}/f/${encodeURIComponent(slug)}`;
}

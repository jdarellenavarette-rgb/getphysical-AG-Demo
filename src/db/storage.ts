/**
 * Absolute Truth Persistent Database Layer
 * Provides auto-hydration from localStorage with safe fallback to official ecosystem defaults.
 */

const STORAGE_PREFIX = 'getphysical_db_v4_';

export function loadPersistentItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[GetPhysical DB] Failed to load ${key}, falling back to defaults`, err);
    return defaultValue;
  }
}

export function savePersistentItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[GetPhysical DB] Failed to save ${key}`, err);
  }
}

export function clearDatabase(): void {
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (err) {
    console.warn('[GetPhysical DB] Clear failed', err);
  }
}

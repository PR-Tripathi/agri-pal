// Lightweight localStorage cache for offline mode
const PREFIX = "km_cache_";

export function setCache<T>(key: string, value: T) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ at: Date.now(), value }));
  } catch {}
}

export function getCache<T>(key: string): { at: number; value: T } | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function useOnline() {
  if (typeof window === "undefined") return true;
  return window.navigator.onLine;
}

// Simple event-based approach for cookie consent management
const listeners = new Set<() => void>();
let shouldShowCookieSettings = false;

export function openCookieSettings() {
  shouldShowCookieSettings = true;
  listeners.forEach(listener => listener());
}

export function closeCookieSettings() {
  shouldShowCookieSettings = false;
}

export function subscribeToCookieSettings(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getShouldShowCookieSettings() {
  return shouldShowCookieSettings;
}

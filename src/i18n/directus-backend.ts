// ============ DIRECTUS I18N BACKEND ============
// Loads UI translations from Directus CMS and merges them into i18next
// Falls back to bundled translations if Directus is unavailable

import i18n from 'i18next';

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055';
const BASE_URL = import.meta.env.DEV ? '/directus-api' : DIRECTUS_URL;

// Fallback URL for development
const FALLBACK_URL = 'http://localhost:8055';
const CACHE_KEY = 'asturias-ui-translations';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface TranslationRow {
  languages_code: string;
  name: string;
}

interface UITranslation {
  key: string;
  translations: TranslationRow[];
}

/**
 * Fetch all UI translations from Directus and merge into i18next.
 * Uses localStorage cache to avoid re-fetching on every page load.
 */
export async function loadDirectusTranslations(): Promise<void> {
  // Loading Directus translations
  try {
    // Check cache first
    const cached = getCachedTranslations();
    if (cached) {
      // Using cached translations
      mergeTranslations(cached);
      // Test translation from cache
      // Still refresh in background
      fetchAndCache().catch(() => {});
      return;
    }

    // No cache, fetching from API
    await fetchAndCache();
  } catch (err) {
    // Failed to load translations from Directus, using bundled fallback
    // Test translation from fallback
  }
}

async function fetchAndCache(): Promise<void> {
  let url = `${BASE_URL}/items/ui_translations?fields=key,translations.*&filter[status][_eq]=published&limit=-1`;
  let res: Response;
  
  try {
    // Fetching translations from BASE_URL
    res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (error) {
    // Primary URL failed, trying fallback
    url = `${FALLBACK_URL}/items/ui_translations?fields=key,translations.*&filter[status][_eq]=published&limit=-1`;
    // Fetching translations from fallback
    res = await fetch(url);
    if (!res.ok) throw new Error(`Fallback HTTP ${res.status}`);
  }
  
  const json = await res.json();
  const items: UITranslation[] = json.data || [];
  
  // API response
  if (items.length > 0) {
    // Sample item
  }

  if (items.length === 0) return;

  // Transform to { es: { key: value }, en: { key: value }, fr: { key: value } }
  const byLang: Record<string, Record<string, string>> = { es: {}, en: {}, fr: {} };

  for (const item of items) {
    if (!item.translations) continue;
    for (const t of item.translations) {
      if (t.languages_code && t.name != null) {
        const lang = t.languages_code;
        if (!byLang[lang]) byLang[lang] = {};
        byLang[lang][item.key] = t.name;
      }
    }
  }

  // Cache
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: byLang }));
  } catch { /* quota exceeded */ }

  // Merged translations
  mergeTranslations(byLang);
  // Loaded translations from Directus
  // Test translation after merge
}

function mergeTranslations(byLang: Record<string, Record<string, string>>): void {
  // Merging translations for languages
  for (const [lang, translations] of Object.entries(byLang)) {
    const translationCount = Object.keys(translations).length;
    // Merging translations
    if (translationCount > 0) {
      // Sample translations
      i18n.addResourceBundle(lang, 'translation', translations, true, true);
      // Added bundle for lang
    }
  }
  // All languages after merge
}

function getCachedTranslations(): Record<string, Record<string, string>> | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return data;
  } catch {
    return null;
  }
}

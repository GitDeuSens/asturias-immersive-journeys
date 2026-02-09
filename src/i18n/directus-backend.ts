// ============ DIRECTUS I18N BACKEND ============
// Loads UI translations from Directus CMS and merges them into i18next
// Falls back to bundled translations if Directus is unavailable

import i18n from 'i18next';

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055';
const BASE_URL = import.meta.env.DEV ? '/directus-api' : DIRECTUS_URL;
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
  try {
    // Check cache first
    const cached = getCachedTranslations();
    if (cached) {
      mergeTranslations(cached);
      // Still refresh in background
      fetchAndCache().catch(() => {});
      return;
    }

    await fetchAndCache();
  } catch (err) {
    console.warn('[i18n] Failed to load translations from Directus, using bundled fallback:', err);
  }
}

async function fetchAndCache(): Promise<void> {
  const url = `${BASE_URL}/items/ui_translations?fields=key,translations.languages_code,translations.name&filter[status][_eq]=published&limit=-1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const items: UITranslation[] = json.data || [];

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

  mergeTranslations(byLang);
  console.log(`[i18n] Loaded ${items.length} translations from Directus`);
}

function mergeTranslations(byLang: Record<string, Record<string, string>>): void {
  for (const [lang, translations] of Object.entries(byLang)) {
    if (Object.keys(translations).length > 0) {
      i18n.addResourceBundle(lang, 'translation', translations, true, true);
    }
  }
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

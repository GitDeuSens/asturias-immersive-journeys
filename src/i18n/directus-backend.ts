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
  console.log('[i18n] Loading Directus translations...');
  try {
    // Check cache first
    const cached = getCachedTranslations();
    if (cached) {
      console.log('[i18n] Using cached translations');
      mergeTranslations(cached);
      console.log('[i18n] Test translation from cache:', i18n.t('a11y.closeMenu'));
      // Still refresh in background
      fetchAndCache().catch(() => {});
      return;
    }

    console.log('[i18n] No cache, fetching from API');
    await fetchAndCache();
  } catch (err) {
    console.warn('[i18n] Failed to load translations from Directus, using bundled fallback:', err);
    console.log('[i18n] Test translation from fallback:', i18n.t('a11y.closeMenu'));
  }
}

async function fetchAndCache(): Promise<void> {
  let url = `${BASE_URL}/items/ui_translations?fields=key,translations.*&filter[status][_eq]=published&limit=-1`;
  let res: Response;
  
  try {
    console.log('[i18n] Fetching translations from:', BASE_URL);
    res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (error) {
    console.warn('[i18n] Primary URL failed, trying fallback:', error);
    url = `${FALLBACK_URL}/items/ui_translations?fields=key,translations.*&filter[status][_eq]=published&limit=-1`;
    console.log('[i18n] Fetching translations from fallback:', FALLBACK_URL);
    res = await fetch(url);
    if (!res.ok) throw new Error(`Fallback HTTP ${res.status}`);
  }
  
  const json = await res.json();
  const items: UITranslation[] = json.data || [];
  
  console.log(`[i18n] API response: ${items.length} items`);
  if (items.length > 0) {
    console.log('[i18n] Sample item:', items[0]);
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

  console.log('[i18n] Merged translations:', Object.keys(byLang).map(lang => `${lang}: ${Object.keys(byLang[lang]).length} keys`));
  mergeTranslations(byLang);
  console.log(`[i18n] Loaded ${items.length} translations from Directus`);
  console.log('[i18n] Test translation after merge:', i18n.t('a11y.closeMenu'));
}

function mergeTranslations(byLang: Record<string, Record<string, string>>): void {
  console.log('[i18n] Merging translations for languages:', Object.keys(byLang));
  for (const [lang, translations] of Object.entries(byLang)) {
    const translationCount = Object.keys(translations).length;
    console.log(`[i18n] Merging ${translationCount} translations for ${lang}`);
    if (translationCount > 0) {
      console.log(`[i18n] Sample translations for ${lang}:`, Object.entries(translations).slice(0, 3));
      i18n.addResourceBundle(lang, 'translation', translations, true, true);
      console.log(`[i18n] Added bundle for ${lang}, test:`, i18n.t('a11y.closeMenu', { lng: lang }));
    }
  }
  console.log('[i18n] All languages after merge:', Object.keys(i18n.options.resources || {}));
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

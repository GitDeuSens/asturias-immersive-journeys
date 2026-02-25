import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { setAccessMode } from '@/lib/analytics';

export type Language = 'es' | 'en' | 'fr';

export function useLanguage() {
  const { i18n } = useTranslation();
  const language = (i18n.language as Language) || 'es';

  const setLanguage = useCallback((lang: Language) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('asturias-inmersivo-lang', lang);
  }, [i18n]);

  const t = useCallback(<T extends Record<string, string>>(texts: T): string => {
    return texts[language] || texts['es'] || '';
  }, [language]);

  return { language, setLanguage, t };
}

export function useExplorationMode() {
  const [mode, setModeState] = useState<'home' | 'here' | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('asturias-mode');
      if (saved === 'home' || saved === 'here') {
        return saved;
      }
    }
    return null;
  });

  const setMode = useCallback((m: 'home' | 'here') => {
    setModeState(m);
    localStorage.setItem('asturias-mode', m);
    setAccessMode(m === 'here' ? 'on_location' : 'home');
  }, []);

  const clearMode = useCallback(() => {
    setModeState(null);
    localStorage.removeItem('asturias-mode');
  }, []);

  return { mode, setMode, clearMode };
}

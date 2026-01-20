import { useState, useEffect, useCallback } from 'react';

export type Language = 'es' | 'en' | 'fr';

const LANGUAGE_KEY = 'asturias-inmersivo-lang';

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LANGUAGE_KEY);
      if (saved === 'es' || saved === 'en' || saved === 'fr') {
        return saved;
      }
    }
    return 'es';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_KEY, lang);
  }, []);

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
  }, []);

  const clearMode = useCallback(() => {
    setModeState(null);
    localStorage.removeItem('asturias-mode');
  }, []);

  return { mode, setMode, clearMode };
}

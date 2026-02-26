import { useState, useEffect, useCallback } from 'react';

export type Theme = 'light';

const THEME_KEY = 'asturias-inmersivo-theme';

function getSystemTheme(): Theme {
  return 'light';
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'light') {
        return saved;
      }
    }
    // Default to system preference
    return getSystemTheme();
  });

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    root.classList.remove('light');
    root.classList.add(theme);
    
    // Update meta theme-color
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'light' ? '#7AB800' : '#7AB800');
    }
  }, [theme]);

  // Listen for system theme changes (only if no saved preference)
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) return; // User has explicit preference, don't follow system

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = 'light';
      setThemeState(newTheme);
      document.documentElement.classList.add(newTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme('light');
  }, [theme, setTheme]);

  return { 
    theme, 
    setTheme, 
    toggleTheme,
    isDark: theme === 'light',
  };
}

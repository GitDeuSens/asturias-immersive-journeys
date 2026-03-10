import { useState, useCallback, useEffect } from 'react';

export type FavoriteType = 'tour' | 'route' | 'ar' | 'vr' | 'poi';

export interface FavoriteItem {
  id: string;
  type: FavoriteType;
  title: string;
  image?: string;
  addedAt: number;
}

const STORAGE_KEY = 'asturias-favorites';

function loadFavorites(): FavoriteItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveFavorites(items: FavoriteItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(loadFavorites);

  // Sync across tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setFavorites(loadFavorites());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const isFavorite = useCallback((id: string) => {
    return favorites.some(f => f.id === id);
  }, [favorites]);

  const toggleFavorite = useCallback((item: Omit<FavoriteItem, 'addedAt'>) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.id === item.id);
      const next = exists
        ? prev.filter(f => f.id !== item.id)
        : [...prev, { ...item, addedAt: Date.now() }];
      saveFavorites(next);
      return next;
    });
  }, []);

  const getFavoritesByType = useCallback((type: FavoriteType) => {
    return favorites.filter(f => f.type === type);
  }, [favorites]);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    getFavoritesByType,
    count: favorites.length,
  };
}

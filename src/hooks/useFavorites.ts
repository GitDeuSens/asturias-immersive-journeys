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
const FAVORITES_UPDATED_EVENT = 'favorites:updated';

function loadFavorites(): FavoriteItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveFavorites(items: FavoriteItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(FAVORITES_UPDATED_EVENT));
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(loadFavorites);

  // Sync across tabs and same-tab component instances
  useEffect(() => {
    const storageHandler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setFavorites(loadFavorites());
    };

    const localHandler = () => {
      setFavorites(loadFavorites());
    };

    window.addEventListener('storage', storageHandler);
    window.addEventListener(FAVORITES_UPDATED_EVENT, localHandler);

    return () => {
      window.removeEventListener('storage', storageHandler);
      window.removeEventListener(FAVORITES_UPDATED_EVENT, localHandler);
    };
  }, []);

  const isFavorite = useCallback((id: string, type?: FavoriteType) => {
    return favorites.some(f => f.id === id && (!type || f.type === type));
  }, [favorites]);

  const toggleFavorite = useCallback((item: Omit<FavoriteItem, 'addedAt'>) => {
    const latest = loadFavorites();
    const exists = latest.some(f => f.id === item.id && f.type === item.type);
    const next = exists
      ? latest.filter(f => !(f.id === item.id && f.type === item.type))
      : [...latest, { ...item, addedAt: Date.now() }];

    saveFavorites(next);
    setFavorites(next);
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

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'asturias-visited';

function loadVisited(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveVisited(data: Record<string, string[]>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useVisited() {
  const [visited, setVisited] = useState<Record<string, string[]>>(loadVisited);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setVisited(loadVisited());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const isVisited = useCallback((routeId: string, pointId: string) => {
    return visited[routeId]?.includes(pointId) ?? false;
  }, [visited]);

  const toggleVisited = useCallback((routeId: string, pointId: string) => {
    setVisited(prev => {
      const routeVisited = prev[routeId] || [];
      const exists = routeVisited.includes(pointId);
      const next = {
        ...prev,
        [routeId]: exists
          ? routeVisited.filter(id => id !== pointId)
          : [...routeVisited, pointId],
      };
      saveVisited(next);
      return next;
    });
  }, []);

  const getRouteProgress = useCallback((routeId: string, totalPoints: number) => {
    const count = visited[routeId]?.length || 0;
    return {
      visited: count,
      total: totalPoints,
      percent: totalPoints > 0 ? Math.round((count / totalPoints) * 100) : 0,
    };
  }, [visited]);

  const getVisitedCount = useCallback((routeId: string) => {
    return visited[routeId]?.length || 0;
  }, [visited]);

  return {
    visited,
    isVisited,
    toggleVisited,
    getRouteProgress,
    getVisitedCount,
  };
}

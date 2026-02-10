import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRoutes, getVirtualTours, getCategories, getPOIs } from '@/lib/api/directus-client';
import type { ImmersiveRoute, KuulaTour, Category, POI } from '@/data/types';
import type { Language } from '@/lib/directus-types';

// Query keys for cache invalidation
export const queryKeys = {
  routes: ['routes'] as const,
  tours: ['tours'] as const,
  categories: ['categories'] as const,
  pois: ['pois'] as const,
  
  // Dynamic keys
  routesByLanguage: (language: Language) => ['routes', language] as const,
  toursByLanguage: (language: Language) => ['tours', language] as const,
  categoriesByLanguage: (language: Language) => ['categories', language] as const,
  poisByLanguage: (language: Language) => ['pois', language] as const,
};

// Routes hook with React Query
export function useRoutesQuery(language: Language = 'es') {
  return useQuery({
    queryKey: queryKeys.routesByLanguage(language),
    queryFn: () => getRoutes(language),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Tours hook with React Query
export function useToursQuery(language: Language = 'es') {
  return useQuery({
    queryKey: queryKeys.toursByLanguage(language),
    queryFn: () => getVirtualTours(language),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Categories hook with React Query
export function useCategoriesQuery(language: Language = 'es') {
  return useQuery({
    queryKey: queryKeys.categoriesByLanguage(language),
    queryFn: () => getCategories(language),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

// POIs hook with React Query
export function usePOIsQuery(language: Language = 'es') {
  return useQuery({
    queryKey: queryKeys.poisByLanguage(language),
    queryFn: () => getPOIs(language),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for invalidating all queries
export function useInvalidateQueries() {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => queryClient.invalidateQueries(),
    invalidateRoutes: () => queryClient.invalidateQueries({ queryKey: queryKeys.routes }),
    invalidateTours: () => queryClient.invalidateQueries({ queryKey: queryKeys.tours }),
    invalidateCategories: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories }),
    invalidatePOIs: () => queryClient.invalidateQueries({ queryKey: queryKeys.pois }),
  };
}

// Prefetch hook for loading data in background
export function usePrefetchQueries() {
  const queryClient = useQueryClient();
  
  return {
    prefetchRoutes: (language: Language = 'es') => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.routesByLanguage(language),
        queryFn: () => getRoutes(language),
        staleTime: 5 * 60 * 1000,
      });
    },
    prefetchTours: (language: Language = 'es') => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.toursByLanguage(language),
        queryFn: () => getVirtualTours(language),
        staleTime: 10 * 60 * 1000,
      });
    },
  };
}

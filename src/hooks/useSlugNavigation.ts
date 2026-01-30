// Hook for SEO-friendly slug-based navigation
import { useNavigate, useParams } from 'react-router-dom';
import { useMemo, useCallback } from 'react';
import { slugify, slugifyWithId, matchesSlug } from '@/lib/slugify';
import { useLanguage } from '@/hooks/useLanguage';

interface SlugItem {
  id: string;
  title: Record<string, string>;
  [key: string]: any;
}

/**
 * Hook for navigating to items using SEO-friendly slugs
 */
export function useSlugNavigation<T extends SlugItem>(
  items: T[],
  basePath: string
) {
  const navigate = useNavigate();
  const { language } = useLanguage();

  // Generate slug for an item
  const getSlug = useCallback((item: T): string => {
    const title = item.title[language] || item.title.es || '';
    return slugifyWithId(title, item.id);
  }, [language]);

  // Navigate to an item
  const navigateToItem = useCallback((item: T) => {
    const slug = getSlug(item);
    navigate(`${basePath}/${slug}`);
  }, [navigate, basePath, getSlug]);

  // Get full URL for an item
  const getItemUrl = useCallback((item: T): string => {
    const slug = getSlug(item);
    return `${basePath}/${slug}`;
  }, [basePath, getSlug]);

  return {
    getSlug,
    navigateToItem,
    getItemUrl
  };
}

/**
 * Hook for finding an item from a URL slug
 */
export function useSlugResolver<T extends SlugItem>(
  items: T[],
  slugParam?: string
) {
  const { language } = useLanguage();

  const resolvedItem = useMemo(() => {
    if (!slugParam || items.length === 0) return null;

    // Try to find matching item
    for (const item of items) {
      const title = item.title[language] || item.title.es || '';
      
      if (matchesSlug(slugParam, title, item.id)) {
        return item;
      }
    }

    // Fallback: try matching just by ID
    const byId = items.find(item => 
      item.id.toLowerCase() === slugParam.toLowerCase() ||
      slugify(item.id) === slugParam
    );
    if (byId) return byId;

    // Fallback: try partial match on title
    const byTitle = items.find(item => {
      const title = item.title[language] || item.title.es || '';
      const titleSlug = slugify(title);
      return slugParam.includes(titleSlug) || titleSlug.includes(slugParam);
    });

    return byTitle || null;
  }, [items, slugParam, language]);

  return {
    item: resolvedItem,
    found: resolvedItem !== null
  };
}

/**
 * Hook that combines both navigation and resolution
 */
export function useSlugRouting<T extends SlugItem>(
  items: T[],
  basePath: string,
  paramName: string = 'slug'
) {
  const params = useParams();
  const slugParam = params[paramName];
  
  const navigation = useSlugNavigation(items, basePath);
  const resolver = useSlugResolver(items, slugParam);

  return {
    ...navigation,
    ...resolver,
    currentSlug: slugParam
  };
}

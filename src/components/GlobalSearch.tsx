// ============ GLOBAL SEARCH COMPONENT ============
// Real-time search with categorized results

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, MapPin, Route, Sparkles, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { searchContent } from "@/lib/api/directus-client";
import { trackSearch } from "@/lib/analytics";
import type { Language, SearchResults } from "@/lib/types";

interface GlobalSearchProps {
  locale?: Language;
  placeholder?: string;
  onClose?: () => void;
  isOpen?: boolean;
}

const texts = {
  placeholder: { es: "Buscar experiencias...", en: "Search experiences...", fr: "Rechercher des expériences..." },
  museums: { es: "Museos", en: "Museums", fr: "Musées" },
  routes: { es: "Rutas", en: "Routes", fr: "Itinéraires" },
  ar: { es: "Experiencias AR", en: "AR Experiences", fr: "Expériences AR" },
  pois: { es: "Puntos de interés", en: "Points of interest", fr: "Points d'intérêt" },
  noResults: { es: "No se encontraron resultados", en: "No results found", fr: "Aucun résultat trouvé" },
  viewAll: { es: "Ver todos los resultados", en: "View all results", fr: "Voir tous les résultats" },
  recentSearches: { es: "Búsquedas recientes", en: "Recent searches", fr: "Recherches récentes" },
};

/**
 * Filters an array of items by matching a query against specified text fields
 * @param items - Array of items to filter
 * @param query - Search query string
 * @param getFields - Function that extracts searchable text fields from an item
 * @returns Filtered array of items that match the query
 */
export function filterByText<T>(
  items: T[],
  query: string,
  getFields: (item: T) => string[]
): T[] {
  if (!query || query.trim().length === 0) return items;
  
  const normalizedQuery = query.toLowerCase().trim();
  const queryWords = normalizedQuery.split(/\s+/).filter(Boolean);
  
  return items.filter((item) => {
    const fields = getFields(item)
      .filter(Boolean)
      .map((f) => f.toLowerCase());
    
    // Match if all query words are found in any of the fields
    return queryWords.every((word) =>
      fields.some((field) => field.includes(word))
    );
  });
};

export function GlobalSearch({ locale = "es", placeholder, onClose, isOpen = true }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 300);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("asturias-recent-searches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        // Invalid JSON
      }
    }
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Perform search
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      performSearch(debouncedQuery);
    } else {
      setResults(null);
      setShowDropdown(false);
    }
  }, [debouncedQuery, locale]);

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);

    try {
      const data = await searchContent(searchQuery, locale);
      setResults(data);
      setShowDropdown(true);

      // Track search
      trackSearch(searchQuery, data.total);

      // Save to recent searches
      saveRecentSearch(searchQuery);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveRecentSearch = (searchQuery: string) => {
    const updated = [searchQuery, ...recentSearches.filter((q) => q !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("asturias-recent-searches", JSON.stringify(updated));
  };

  // Apply local text filtering to results
  const filteredResults = useMemo(() => {
    if (!results) return null;

    const filteredMuseums = filterByText(results.museums, query, (m) => [
      m.name.es, m.name.en, m.name.fr, m.municipality, m.address
    ]);

    const filteredRoutes = filterByText(results.routes, query, (r: any) => [
      r.title?.es, r.title?.en, r.title?.fr, r.description?.es
    ]);

    const filteredArScenes = filterByText(results.ar_scenes, query, (a) => [
      a.title.es, a.title.en, a.title.fr, a.description?.es
    ]);

    const filteredPois = filterByText(results.pois, query, (p: any) => [
      p.title?.es, p.title?.en, p.title?.fr, p.address
    ]);

    return {
      museums: filteredMuseums,
      routes: filteredRoutes,
      ar_scenes: filteredArScenes,
      pois: filteredPois,
      total: filteredMuseums.length + filteredRoutes.length + filteredArScenes.length + filteredPois.length
    };
  }, [results, query]);

  const getAllResults = useCallback(() => {
    if (!filteredResults) return [];
    return [
      ...filteredResults.museums.map((m) => ({ type: "museum", data: m })),
      ...filteredResults.routes.map((r) => ({ type: "route", data: r })),
      ...filteredResults.ar_scenes.map((a) => ({ type: "ar", data: a })),
      ...filteredResults.pois.map((p) => ({ type: "poi", data: p })),
    ];
  }, [filteredResults]);

  const navigateToResult = useCallback(
    (result: { type: string; data: any }) => {
      switch (result.type) {
        case "museum":
          navigate(`/tours?museum=${result.data.id}`);
          break;
        case "route":
          navigate(`/routes?route=${result.data.id}`);
          break;
        case "ar":
          navigate(`/ar/${result.data.slug}`);
          break;
        case "poi":
          navigate(`/routes?poi=${result.data.id}`);
          break;
      }
      setShowDropdown(false);
      setQuery("");
      onClose?.();
    },
    [navigate, onClose],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const allResults = getAllResults();

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, allResults.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, -1));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && allResults[selectedIndex]) {
            navigateToResult(allResults[selectedIndex]);
          }
          break;
        case "Escape":
          setShowDropdown(false);
          inputRef.current?.blur();
          onClose?.();
          break;
      }
    },
    [getAllResults, selectedIndex, navigateToResult, onClose],
  );

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-primary/30 text-foreground rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case "museum":
        return <Building2 className="w-4 h-4" />;
      case "route":
        return <Route className="w-4 h-4" />;
      case "ar":
        return <Sparkles className="w-4 h-4" />;
      case "poi":
        return <MapPin className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowDropdown(true)}
          placeholder={placeholder || texts.placeholder[locale]}
          className="pl-10 pr-10 h-12 text-base bg-background border-border"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setQuery("");
              setResults(null);
              setShowDropdown(false);
            }}
            className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
        {isLoading && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Dropdown results */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-popover border border-border rounded-xl shadow-lg overflow-hidden max-h-[70vh] overflow-y-auto"
          >
            {filteredResults && filteredResults.total > 0 ? (
              <div className="p-2">
                {/* Museums */}
                {filteredResults.museums.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">
                      {texts.museums[locale]}
                    </p>
                    {filteredResults.museums.slice(0, 3).map((museum, idx) => (
                      <button
                        key={museum.id}
                        onClick={() => navigateToResult({ type: "museum", data: museum })}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                          selectedIndex === idx ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                        }`}
                      >
                        <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {highlightMatch(museum.name[locale] || museum.name.es, query)}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{museum.municipality}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Routes */}
                {filteredResults.routes.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">
                      {texts.routes[locale]}
                    </p>
                    {filteredResults.routes.slice(0, 3).map((route: any, idx: number) => (
                      <button
                        key={route.id}
                        onClick={() => navigateToResult({ type: "route", data: route })}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                          selectedIndex === filteredResults.museums.length + idx
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        <Route className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {highlightMatch(route.title[locale] || route.title.es, query)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* AR Scenes */}
                {filteredResults.ar_scenes.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">
                      {texts.ar[locale]}
                    </p>
                    {filteredResults.ar_scenes.slice(0, 3).map((scene, idx) => (
                      <button
                        key={scene.id}
                        onClick={() => navigateToResult({ type: "ar", data: scene })}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                          selectedIndex === filteredResults.museums.length + filteredResults.routes.length + idx
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        <Sparkles className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {highlightMatch(scene.title[locale] || scene.title.es, query)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : filteredResults && filteredResults.total === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">{texts.noResults[locale]}</p>
                <p className="text-sm text-muted-foreground/60 mt-1">"{query}"</p>
              </div>
            ) : recentSearches.length > 0 && !query ? (
              <div className="p-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">
                  {texts.recentSearches[locale]}
                </p>
                {recentSearches.map((recent, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(recent)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{recent}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default GlobalSearch;

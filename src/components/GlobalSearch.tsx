// ============ GLOBAL SEARCH COMPONENT ============
// Real-time search with categorized results or local filtering

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, MapPin, Route, Sparkles, Building2, View } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { searchContent } from "@/lib/api/directus-client";
import { trackSearch } from "@/lib/analytics";
import type { Language, SearchResults } from "@/lib/types";

// Generic item for local filtering
export interface LocalSearchItem {
  id: string;
  title: Record<string, string> | string;
  subtitle?: string;
  image?: string;
  type?: string;
}

interface GlobalSearchProps {
  locale?: Language;
  placeholder?: string;
  onClose?: () => void;
  isOpen?: boolean;
  // Local filtering mode
  localData?: LocalSearchItem[];
  onLocalSelect?: (item: LocalSearchItem) => void;
  localIcon?: React.ReactNode;
}

const texts = {
  placeholder: { es: "Buscar experiencias...", en: "Search experiences...", fr: "Rechercher des expériences..." },
  placeholderLocal: { es: "Buscar...", en: "Search...", fr: "Rechercher..." },
  museums: { es: "Museos", en: "Museums", fr: "Musées" },
  routes: { es: "Rutas", en: "Routes", fr: "Itinéraires" },
  ar: { es: "Experiencias AR", en: "AR Experiences", fr: "Expériences AR" },
  pois: { es: "Puntos de interés", en: "Points of interest", fr: "Points d'intérêt" },
  noResults: { es: "No se encontraron resultados", en: "No results found", fr: "Aucun résultat trouvé" },
  viewAll: { es: "Ver todos los resultados", en: "View all results", fr: "Voir tous les résultats" },
  recentSearches: { es: "Búsquedas recientes", en: "Recent searches", fr: "Recherches récentes" },
  results: { es: "Resultados", en: "Results", fr: "Résultats" },
};

export function GlobalSearch({
  locale = "es",
  placeholder,
  onClose,
  isOpen = true,
  localData,
  onLocalSelect,
  localIcon,
}: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [localResults, setLocalResults] = useState<LocalSearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 300);

  const isLocalMode = !!localData;

  // Load recent searches from localStorage
  useEffect(() => {
    if (isLocalMode) return;
    const saved = localStorage.getItem("asturias-recent-searches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        // Invalid JSON
      }
    }
  }, [isLocalMode]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Perform search (API or local)
  useEffect(() => {
    if (isLocalMode) {
      // Local filtering
      if (debouncedQuery.length >= 1) {
        performLocalSearch(debouncedQuery);
      } else {
        setLocalResults([]);
        setShowDropdown(false);
      }
    } else {
      // API search
      if (debouncedQuery.length >= 2) {
        performSearch(debouncedQuery);
      } else {
        setResults(null);
        setShowDropdown(false);
      }
    }
  }, [debouncedQuery, locale, isLocalMode, localData]);

  const getItemTitle = (item: LocalSearchItem): string => {
    if (typeof item.title === "string") return item.title;
    return item.title[locale] || item.title.es || "";
  };

  // Get all text values from title for search (supports multilingual)
  const getAllTitleText = (item: LocalSearchItem): string => {
    if (typeof item.title === "string") return item.title;
    return Object.values(item.title).join(" ");
  };

  const performLocalSearch = (searchQuery: string) => {
    if (!localData) return;

    const normalizedQuery = searchQuery
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const filtered = localData.filter((item) => {
      // Search across all language variants
      const allTitles = getAllTitleText(item)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      const subtitle = (item.subtitle || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      return allTitles.includes(normalizedQuery) || subtitle.includes(normalizedQuery);
    });

    setLocalResults(filtered);
    setShowDropdown(true);
    setSelectedIndex(-1);
  };

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);

    try {
      const data = await searchContent(searchQuery, locale);
      // Search data
      setResults(data);
      setShowDropdown(true);

      // Track search
      trackSearch(searchQuery, data.total);

      // Save to recent searches
      saveRecentSearch(searchQuery);
    } catch (error) {
      // Search error
    } finally {
      setIsLoading(false);
    }
  };

  const saveRecentSearch = (searchQuery: string) => {
    const updated = [searchQuery, ...recentSearches.filter((q) => q !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("asturias-recent-searches", JSON.stringify(updated));
  };

  const getAllResults = useCallback(() => {
    if (!results) return [];
    return [
      ...results.museums.map((m) => ({ type: "museum", data: m })),
      ...results.routes.map((r) => ({ type: "route", data: r })),
      ...results.ar_scenes.map((a) => ({ type: "ar", data: a })),
      ...results.pois.map((p) => ({ type: "poi", data: p })),
    ];
  }, [results]);

  const handleLocalKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, localResults.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, -1));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && localResults[selectedIndex]) {
            onLocalSelect?.(localResults[selectedIndex]);
            setShowDropdown(false);
            setQuery("");
          }
          break;
        case "Escape":
          setShowDropdown(false);
          inputRef.current?.blur();
          onClose?.();
          break;
      }
    },
    [localResults, selectedIndex, onLocalSelect, onClose],
  );

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

  const search = (event: any) => {
    // Debug search event
  };

  const defaultPlaceholder = isLocalMode ? texts.placeholderLocal[locale] : texts.placeholder[locale];

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
          onKeyDown={isLocalMode ? handleLocalKeyDown : handleKeyDown}
          onFocus={() => {
            if (isLocalMode && query.length >= 1) setShowDropdown(true);
            else if (!isLocalMode && query.length >= 2) setShowDropdown(true);
          }}
          placeholder={placeholder || defaultPlaceholder}
          className="pl-10 pr-10 h-12 text-base bg-background border-border"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setQuery("");
              setResults(null);
              setLocalResults([]);
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
            {/* Local mode results */}
            {isLocalMode && localResults.length > 0 && (
              <div className="p-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">
                  {texts.results[locale]} ({localResults.length})
                </p>
                {localResults.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onLocalSelect?.(item);
                      setShowDropdown(false);
                      setQuery("");
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                      selectedIndex === idx ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                    }`}
                  >
                    {localIcon || <View className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {highlightMatch(getItemTitle(item), query)}
                      </p>
                      {item.subtitle && <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Local mode no results */}
            {isLocalMode && localResults.length === 0 && query.length >= 1 && (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">{texts.noResults[locale]}</p>
                <p className="text-sm text-muted-foreground/60 mt-1">"{query}"</p>
              </div>
            )}

            {/* API mode results */}
            {!isLocalMode && results && results.total > 0 ? (
              <div className="p-2">
                {/* Museums */}
                {results.museums.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">
                      {texts.museums[locale]}
                    </p>
                    {results.museums.slice(0, 3).map((museum, idx) => (
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
                {results.routes.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">
                      {texts.routes[locale]}
                    </p>
                    {results.routes.slice(0, 3).map((route: any, idx: number) => (
                      <button
                        key={route.id}
                        onClick={() => navigateToResult({ type: "route", data: route })}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                          selectedIndex === results.museums.length + idx
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
                {results.ar_scenes.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">
                      {texts.ar[locale]}
                    </p>
                    {results.ar_scenes.slice(0, 3).map((scene, idx) => (
                      <button
                        key={scene.id}
                        onClick={() => navigateToResult({ type: "ar", data: scene })}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                          selectedIndex === results.museums.length + results.routes.length + idx
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
            ) : !isLocalMode && results && results.total === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">{texts.noResults[locale]}</p>
                <p className="text-sm text-muted-foreground/60 mt-1">"{query}"</p>
              </div>
            ) : !isLocalMode && recentSearches.length > 0 && !query ? (
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

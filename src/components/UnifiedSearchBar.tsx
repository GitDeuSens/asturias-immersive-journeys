/**
 * UnifiedSearchBar — modern search field with inline expandable filters.
 * On focus, reveals filter chips (categories, difficulty, view mode, custom filters)
 * inside the same container. Active filters shown as mini-chips.
 */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, SlidersHorizontal, Check, Gauge, Route, MapPin,
  Mountain, Landmark, Compass, UtensilsCrossed, BookOpen, Tag
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { Separator } from '@/components/ui/separator';
import type { Category } from '@/data/types';

type Difficulty = 'easy' | 'medium' | 'hard';
type ViewMode = 'routes' | 'points';

export interface CustomFilter {
  id: string;
  label: Record<string, string>;
  icon?: React.ReactNode;
}

interface UnifiedSearchBarProps {
  // Search
  query: string;
  onQueryChange: (q: string) => void;
  placeholder?: string;

  // Categories (optional)
  categories?: Category[];
  selectedCategoryIds?: string[];
  onToggleCategory?: (id: string) => void;

  // Difficulty (optional)
  selectedDifficulties?: Difficulty[];
  onToggleDifficulty?: (d: Difficulty) => void;

  // View mode toggle (optional)
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;

  // Custom filter chips (e.g. AR type filters)
  customFilters?: CustomFilter[];
  selectedCustomFilters?: string[];
  onToggleCustomFilter?: (id: string) => void;

  // Extra action (e.g. locate button)
  extraAction?: React.ReactNode;

  // Result count
  resultCount?: number;

  className?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Mountain, Landmark, Compass, UtensilsCrossed, BookOpen, Tag,
};

const difficultyLabels: Record<Difficulty, Record<string, string>> = {
  easy: { es: 'Fácil', en: 'Easy', fr: 'Facile' },
  medium: { es: 'Media', en: 'Medium', fr: 'Moyenne' },
  hard: { es: 'Difícil', en: 'Hard', fr: 'Difficile' },
};

const difficultyColors: Record<Difficulty, string> = {
  easy: 'border-primary/40 bg-primary/10 text-primary',
  medium: 'border-warm/40 bg-warm/10 text-warm',
  hard: 'border-destructive/40 bg-destructive/10 text-destructive',
};

const viewModeLabels: Record<ViewMode, Record<string, string>> = {
  routes: { es: 'Rutas', en: 'Routes', fr: 'Itinéraires' },
  points: { es: 'Ubicaciones', en: 'Locations', fr: 'Emplacements' },
};

export function UnifiedSearchBar({
  query,
  onQueryChange,
  placeholder,
  categories,
  selectedCategoryIds = [],
  onToggleCategory,
  selectedDifficulties = [],
  onToggleDifficulty,
  viewMode,
  onViewModeChange,
  customFilters,
  selectedCustomFilters = [],
  onToggleCustomFilter,
  extraAction,
  resultCount,
  className = '',
}: UnifiedSearchBarProps) {
  const { t, language: lang } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const totalActive = selectedCategoryIds.length + selectedDifficulties.length + selectedCustomFilters.length;
  const hasFilters = !!(categories?.length || onToggleDifficulty || customFilters?.length || onViewModeChange);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    };
    if (expanded) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [expanded]);

  const clearAll = () => {
    onQueryChange('');
    selectedCategoryIds.forEach(id => onToggleCategory?.(id));
    selectedDifficulties.forEach(d => onToggleDifficulty?.(d));
    selectedCustomFilters.forEach(id => onToggleCustomFilter?.(id));
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Main search container */}
      <div
        className={`rounded-2xl border transition-all duration-300 bg-card ${
          expanded
            ? 'border-primary/40 shadow-lg ring-2 ring-primary/15'
            : 'border-border/50 shadow-sm hover:border-border'
        }`}
      >
        {/* Search input row */}
        <div className="flex items-center gap-2 px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onFocus={() => setExpanded(true)}
            placeholder={placeholder || t({ es: 'Buscar...', en: 'Search...', fr: 'Rechercher...' })}
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm focus:outline-none min-w-0"
          />

          {/* Active filter count badge */}
          {totalActive > 0 && !expanded && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shrink-0"
            >
              {totalActive}
            </motion.span>
          )}

          {/* Filter toggle button */}
          {hasFilters && (
            <button
              onClick={() => setExpanded(!expanded)}
              className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors shrink-0 ${
                expanded || totalActive > 0
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted/50'
              }`}
              aria-label={t({ es: 'Filtros', en: 'Filters', fr: 'Filtres' })}
              aria-expanded={expanded}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          )}

          {/* Clear button */}
          {(query || totalActive > 0) && (
            <button
              onClick={clearAll}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
              aria-label={t({ es: 'Limpiar', en: 'Clear', fr: 'Effacer' })}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Active filter chips (shown when collapsed) */}
        {!expanded && totalActive > 0 && (
          <div className="px-3 pb-2 flex items-center gap-1.5 flex-wrap">
            {selectedCategoryIds.map(id => {
              const cat = categories?.find(c => c.id === id);
              if (!cat) return null;
              return (
                <button
                  key={id}
                  onClick={() => onToggleCategory?.(id)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium border border-primary/20 hover:bg-primary/20 transition-colors"
                >
                  {t(cat.label)}
                  <X className="w-3 h-3" />
                </button>
              );
            })}
            {selectedDifficulties.map(d => (
              <button
                key={d}
                onClick={() => onToggleDifficulty?.(d)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border hover:opacity-80 transition-colors ${difficultyColors[d]}`}
              >
                {difficultyLabels[d][lang] || difficultyLabels[d].en}
                <X className="w-3 h-3" />
              </button>
            ))}
            {selectedCustomFilters.map(id => {
              const f = customFilters?.find(c => c.id === id);
              if (!f) return null;
              return (
                <button
                  key={id}
                  onClick={() => onToggleCustomFilter?.(id)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/15 text-accent-foreground text-[11px] font-medium border border-accent/20 hover:bg-accent/20 transition-colors"
                >
                  {f.label[lang] || f.label.es}
                  <X className="w-3 h-3" />
                </button>
              );
            })}
          </div>
        )}

        {/* Expandable filter panel */}
        <AnimatePresence>
          {expanded && hasFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 space-y-2">
                <Separator className="mb-1" />

                {/* View mode toggle */}
                {onViewModeChange && viewMode && (
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      {t({ es: 'Vista', en: 'View', fr: 'Vue' })}
                    </p>
                    <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted/60 border border-border/40">
                      {(['routes', 'points'] as ViewMode[]).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => onViewModeChange(mode)}
                          className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold px-2 py-1.5 rounded-md transition-all ${
                            viewMode === mode
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {mode === 'routes' ? <Route className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                          {viewModeLabels[mode][lang] || viewModeLabels[mode].en}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Categories */}
                {categories && categories.length > 0 && onToggleCategory && (
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      {t({ es: 'Categorías', en: 'Categories', fr: 'Catégories' })}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {categories.map(category => {
                        const isSelected = selectedCategoryIds.includes(category.id);
                        const IconComponent = iconMap[category.icon] || Tag;
                        return (
                          <button
                            key={category.id}
                            onClick={() => onToggleCategory(category.id)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                              isSelected
                                ? 'bg-primary/15 text-primary border-primary/30'
                                : 'bg-muted/40 text-foreground border-border/40 hover:bg-muted/60'
                            }`}
                          >
                            <IconComponent className="w-3.5 h-3.5 shrink-0" />
                            {t(category.label)}
                            {isSelected && <Check className="w-3 h-3 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Difficulty */}
                {onToggleDifficulty && (
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      {t({ es: 'Dificultad', en: 'Difficulty', fr: 'Difficulté' })}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => {
                        const isSelected = selectedDifficulties.includes(d);
                        return (
                          <button
                            key={d}
                            onClick={() => onToggleDifficulty(d)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                              isSelected
                                ? difficultyColors[d] + ' border-current/30'
                                : 'bg-muted/40 text-foreground border-border/40 hover:bg-muted/60'
                            }`}
                          >
                            <Gauge className="w-3.5 h-3.5 shrink-0" />
                            {difficultyLabels[d][lang] || difficultyLabels[d].en}
                            {isSelected && <Check className="w-3 h-3 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Custom filters */}
                {customFilters && customFilters.length > 0 && onToggleCustomFilter && (
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      {t({ es: 'Tipo', en: 'Type', fr: 'Type' })}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {customFilters.map(f => {
                        const isSelected = selectedCustomFilters.includes(f.id);
                        return (
                          <button
                            key={f.id}
                            onClick={() => onToggleCustomFilter(f.id)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                              isSelected
                                ? 'bg-accent/15 text-accent-foreground border-accent/30'
                                : 'bg-muted/40 text-foreground border-border/40 hover:bg-muted/60'
                            }`}
                          >
                            {f.icon}
                            {f.label[lang] || f.label.es}
                            {isSelected && <Check className="w-3 h-3 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Extra action (e.g. locate me) */}
                {extraAction && (
                  <div className="pt-1">
                    {extraAction}
                  </div>
                )}

                {/* Result count */}
                {resultCount !== undefined && (
                  <p className="text-[10px] text-muted-foreground text-right pt-1">
                    {resultCount} {t({ es: 'resultados', en: 'results', fr: 'résultats' })}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

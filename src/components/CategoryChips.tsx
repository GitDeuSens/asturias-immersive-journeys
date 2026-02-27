import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import type { Category } from '@/data/types';
import { Mountain, Landmark, Compass, UtensilsCrossed, BookOpen, Tag, SlidersHorizontal, Check, Gauge, Route, MapPin } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

type Difficulty = 'easy' | 'medium' | 'hard';
type ViewMode = 'routes' | 'points';

interface CategoryChipsProps {
  categories: Category[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  selectedDifficulties?: Difficulty[];
  onToggleDifficulty?: (d: Difficulty) => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
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
  easy: 'text-primary',
  medium: 'text-warm',
  hard: 'text-destructive',
};

const viewModeLabels: Record<ViewMode, Record<string, string>> = {
  routes: { es: 'Rutas', en: 'Routes', fr: 'Itinéraires' },
  points: { es: 'Puntos', en: 'Points', fr: 'Points' },
};

export function CategoryChips({ categories, selectedIds, onToggle, selectedDifficulties = [], onToggleDifficulty, viewMode, onViewModeChange, className = '' }: CategoryChipsProps) {
  const { t, language: lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const count = selectedIds.length + selectedDifficulties.length;

  return (
    <div className={`flex ${className}`}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="category-chip flex items-center gap-2 text-sm px-4 py-2 active">
            <SlidersHorizontal className="w-4 h-4" />
            <span>{t({ es: 'Filtros', en: 'Filters', fr: 'Filtres' })}</span>
            {count > 0 && (
              <span className="ml-1 flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {count}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-56 p-2" sideOffset={8}>
          {/* View mode toggle */}
          {onViewModeChange && viewMode && (
            <>
              <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t({ es: 'Vista', en: 'View', fr: 'Vue' })}
              </p>
              <div className="flex items-center gap-1 mx-2 mb-1 p-0.5 rounded-lg bg-muted/60 border border-border/40">
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
              <Separator className="my-2" />
            </>
          )}

          {/* Categories section */}
          <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t({ es: 'Categorías', en: 'Categories', fr: 'Catégories' })}
          </p>
          <div className="flex flex-col gap-0.5">
            {categories.map(category => {
              const isSelected = selectedIds.includes(category.id);
              const IconComponent = iconMap[category.icon] || Tag;
              return (
                <button
                  key={category.id}
                  onClick={() => onToggle(category.id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors w-full text-left
                    ${isSelected ? 'bg-primary/15 text-primary font-medium' : 'hover:bg-muted/60 text-foreground'}`}
                >
                  <IconComponent className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{t(category.label)}</span>
                  {isSelected && <Check className="w-4 h-4 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Difficulty section */}
          {onToggleDifficulty && (
            <>
              <Separator className="my-2" />
              <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t({ es: 'Dificultad', en: 'Difficulty', fr: 'Difficulté' })}
              </p>
              <div className="flex flex-col gap-0.5">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => {
                  const isSelected = selectedDifficulties.includes(d);
                  return (
                    <button
                      key={d}
                      onClick={() => onToggleDifficulty(d)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors w-full text-left
                        ${isSelected ? 'bg-primary/15 font-medium ' + difficultyColors[d] : 'hover:bg-muted/60 text-foreground'}`}
                    >
                      <Gauge className="w-4 h-4 shrink-0" />
                      <span className="flex-1">{difficultyLabels[d][lang] || difficultyLabels[d].en}</span>
                      {isSelected && <Check className="w-4 h-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

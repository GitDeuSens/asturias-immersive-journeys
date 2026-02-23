import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import type { Category } from '@/data/types';
import { Mountain, Landmark, Compass, UtensilsCrossed, BookOpen, Tag, SlidersHorizontal, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface CategoryChipsProps {
  categories: Category[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  className?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Mountain,
  Landmark,
  Compass,
  UtensilsCrossed,
  BookOpen,
  Tag,
};

export function CategoryChips({ categories, selectedIds, onToggle, className = '' }: CategoryChipsProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const count = selectedIds.length;

  return (
    <div className={`flex ${className}`}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className="category-chip flex items-center gap-2 text-sm px-4 py-2 active"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{t({ es: 'Categorías', en: 'Categories', fr: 'Catégories' })}</span>
            {count > 0 && (
              <span className="ml-1 flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {count}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-56 p-2" sideOffset={8}>
          <div className="flex flex-col gap-1">
            {categories.map(category => {
              const isSelected = selectedIds.includes(category.id);
              const IconComponent = iconMap[category.icon] || Tag;

              return (
                <button
                  key={category.id}
                  onClick={() => onToggle(category.id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors w-full text-left
                    ${isSelected
                      ? 'bg-primary/15 text-primary font-medium'
                      : 'hover:bg-muted/60 text-foreground'
                    }`}
                >
                  <IconComponent className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{t(category.label)}</span>
                  {isSelected && <Check className="w-4 h-4 shrink-0" />}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

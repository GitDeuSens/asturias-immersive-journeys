import { useLanguage } from '@/hooks/useLanguage';
import type { Category } from '@/data/types';
import { Mountain, Landmark, Compass, UtensilsCrossed, BookOpen, Tag } from 'lucide-react';

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

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {categories.map(category => {
        const isSelected = selectedIds.includes(category.id);
        const IconComponent = iconMap[category.icon] || Tag;
        
        return (
          <button
            key={category.id}
            onClick={() => onToggle(category.id)}
            className={`category-chip flex items-center gap-2 mb-4 w-40 text-base ${isSelected ? 'active' : ''}`}
          >
            <IconComponent className="w-4 h-4" />
            <span>{t(category.label)}</span>
          </button>
        );
      })}
    </div>
  );
}

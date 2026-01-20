import { useLanguage } from '@/hooks/useLanguage';
import { Category } from '@/data/mockData';
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
    <div className={`flex flex-wrap gap-2 justify-center ${className}`}>
      {categories.map(category => {
        const isSelected = selectedIds.includes(category.id);
        const IconComponent = iconMap[category.icon] || Tag;
        
        return (
          <button
            key={category.id}
            onClick={() => onToggle(category.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
              isSelected 
                ? 'bg-primary/20 border-primary/50 text-primary' 
                : 'bg-muted/30 border-border/50 text-foreground/70 hover:bg-muted/50 hover:border-border'
            }`}
          >
            <IconComponent className="w-4 h-4" />
            <span>{t(category.label)}</span>
          </button>
        );
      })}
    </div>
  );
}

import { motion } from "framer-motion";
import { MapPin, Clock, ChevronRight, RotateCw, Mountain, Utensils, Landmark } from "lucide-react";
import { ImmersiveRoute } from "@/data/immersiveRoutes";
import { useLanguage } from "@/hooks/useLanguage";
import { getCategoryById } from "@/data/mockData";

interface RouteCardProps {
  route: ImmersiveRoute;
  onClick: () => void;
}

export function RouteCard({ route, onClick }: RouteCardProps) {
  const { t } = useLanguage();

  const difficultyColors = {
    easy: "bg-primary/20 text-primary border-primary/30",
    medium: "bg-warm/20 text-warm border-warm/30",
    hard: "bg-destructive/20 text-destructive border-destructive/30",
  };

  const difficultyLabels = {
    easy: { es: "Fácil", en: "Easy", fr: "Facile" },
    medium: { es: "Media", en: "Medium", fr: "Moyenne" },
    hard: { es: "Difícil", en: "Hard", fr: "Difficile" },
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="w-full text-left rounded-xl bg-card/50 border border-border/50 hover:border-primary/50 hover:bg-card/80 transition-all group overflow-hidden"
    >
      {/* Cover image */}
      <div
        className="w-full h-36 bg-cover bg-center relative"
        style={{
          backgroundImage: route.coverImage
            ? `url(${route.coverImage})`
            : "linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--muted-foreground)/0.2) 100%)",
        }}
      >
        {/* Route ID badge */}
        <span className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-white text-xs font-bold">
          {route.id}
        </span>

        {/* Circular badge */}
        {route.isCircular && (
          <span className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-card/90 backdrop-blur-sm text-primary text-[10px] font-bold uppercase tracking-wide border border-primary/30">
            <RotateCw className="w-3 h-3" />
            Circular
          </span>
        )}

        {/* 360 tour badge */}
        {route.tour360?.available && (
          <span className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-primary/90 text-white text-[10px] font-bold uppercase">
            360°
          </span>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-sans font-bold text-foreground text-lg group-hover:text-primary transition-colors mb-1 line-clamp-1">
          {t(route.title)}
        </h3>

        {/* Theme */}
        <p className="text-xs text-primary font-medium mb-2">{t(route.theme)}</p>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{t(route.shortDescription)}</p>

        {/* Footer metadata */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Duration */}
          {route.duration && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
              <Clock className="w-3 h-3" />
              {t(route.duration)}
            </span>
          )}

          {/* Points count */}
          <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
            <MapPin className="w-3 h-3" />
            {route.points.length} pts
          </span>

          {/* Difficulty */}
          {route.difficulty && (
            <span
              className={`px-2 py-0.5 rounded-md text-sm text-[10px] font-bold border ${difficultyColors[route.difficulty]}`}
            >
              {t(difficultyLabels[route.difficulty])}
            </span>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <div className="flex gap-1">
              {route.categoryIds.slice(0, 2).map((catId) => {
                const cat = getCategoryById(catId);
                return cat ? (
                  <span key={catId} className="category-chip text-[10px]">
                    {t(cat.label)}
                  </span>
                ) : null;
              })}
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>
      </div>
    </motion.button>
  );
}

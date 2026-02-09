import { forwardRef } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, RotateCw, ChevronRight, Ruler, Mountain } from "lucide-react";
import type { ImmersiveRoute } from "@/data/types";
import { useTranslation } from "react-i18next";
import { useDirectusCategories } from "@/hooks/useDirectusData";
import { calculateRouteDistance, formatDistance } from "@/lib/mapUtils";

interface RouteCardProps {
  route: ImmersiveRoute;
  onClick: () => void;
}

export const RouteCard = forwardRef<HTMLButtonElement, RouteCardProps>(function RouteCard({ route, onClick }, ref) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as "es" | "en" | "fr";
  const { getCategoryById } = useDirectusCategories(lang);

  const difficultyColors = {
    easy: "bg-primary/20 text-primary border-primary/30",
    medium: "bg-warm/20 text-warm border-warm/30",
    hard: "bg-destructive/20 text-destructive border-destructive/30",
  };

  // Use distance from DB, fallback to calculated from polyline
  const calculatedDistance = calculateRouteDistance(route.polyline);
  const distance = route.distanceKm || calculatedDistance;

  return (
    <motion.button
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      onClick={onClick}
      className="w-full text-left rounded-2xl bg-card/50 border border-border/50 hover:border-primary/50 hover:bg-card/80 transition-all duration-200 group overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      aria-label={`${t("common.viewDetails")}: ${route.title[lang]}`}
    >
      {/* Cover image */}
      <div
        className="w-full h-36 bg-cover bg-center relative"
        style={{
          backgroundImage: route.coverImage
            ? `url(${route.coverImage})`
            : "linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--muted-foreground)/0.2) 100%)",
        }}
        role="img"
        aria-label={route.title[lang]}
      >
        {/* Route ID badge */}
        <span className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-white text-xs font-bold">
          {route.id}
        </span>

        {/* Circular badge */}
        {route.isCircular && (
          <span className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-card/90 backdrop-blur-sm text-primary text-[10px] font-bold uppercase tracking-wide border border-primary/30">
            <RotateCw className="w-3 h-3" aria-hidden="true" />
            {t("routes.circular")}
          </span>
        )}

        {/* 360 tour badge */}
        {route.tour360?.available && (
          <span className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-primary/90 text-white text-[10px] font-bold uppercase">
            360°
          </span>
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent"
          aria-hidden="true"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-sans font-bold text-foreground text-lg group-hover:text-primary transition-colors mb-1 line-clamp-1">
          {route.title[lang]}
        </h3>

        {/* Theme */}
        <p className="text-xs text-primary font-medium mb-2">{route.theme[lang]}</p>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{route.shortDescription[lang]}</p>

        {/* Footer metadata */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Duration */}
          {route.duration && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
              <Clock className="w-3 h-3" aria-hidden="true" />
              {route.duration[lang]}
            </span>
          )}

          {/* Distance */}
          {distance > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
              <Ruler className="w-3 h-3" aria-hidden="true" />
              {route.distanceKm ? `${route.distanceKm} km` : formatDistance(distance)}
            </span>
          )}

          {/* Elevation */}
          {route.elevationGainMeters && route.elevationGainMeters > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
              <Mountain className="w-3 h-3" aria-hidden="true" />
              {route.elevationGainMeters} m
            </span>
          )}

          {/* Points count */}
          <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
            <MapPin className="w-3 h-3" aria-hidden="true" />
            {route.points.length} {t("routes.points")}
          </span>

          {/* Difficulty */}
          {route.difficulty && (
            <span
              className={`px-2 py-0.5 rounded-md text-sm text-[10px] font-bold border ${difficultyColors[route.difficulty]}`}
            >
              {t(`difficulty.${route.difficulty}`)}
            </span>
          )}

          {/* Categories */}
          <div className="flex items-center justify-between">
            <div className="flex gap-3 w-64">
              {route.categoryIds.slice(0, 2).map((catId) => {
                const cat = getCategoryById(catId);
                return cat ? (
                  <span key={catId} className="category-chip text-[10px] w-32 text-base">
                    {cat.label[lang]}
                  </span>
                ) : null;
              })}
            </div>
            <ChevronRight
              className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </motion.button>
  );
});

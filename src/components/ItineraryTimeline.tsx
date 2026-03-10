import { MapPin, Calendar } from 'lucide-react';
import type { RoutePoint } from '@/data/types';

interface ItineraryDay {
  day: number;
  title: Record<string, string>;
  poiIds: string[];
}

interface ItineraryTimelineProps {
  days: ItineraryDay[];
  points: RoutePoint[];
  lang: string;
  onSelectPoint?: (point: RoutePoint) => void;
}

export function ItineraryTimeline({ days, points, lang, onSelectPoint }: ItineraryTimelineProps) {
  if (!days || days.length === 0) return null;

  const getPointById = (id: string) => points.find(p => p.id === id || p.poiUUID === id);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
        <Calendar className="w-4 h-4 text-primary" />
        {lang === 'es' ? 'Itinerario por días' : lang === 'en' ? 'Day-by-day itinerary' : 'Itinéraire jour par jour'}
      </h3>
      <div className="space-y-1">
        {days.map((day, dayIdx) => (
          <div key={day.day} className="relative">
            {/* Day header */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
                {day.day}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {lang === 'es' ? `Día ${day.day}` : lang === 'en' ? `Day ${day.day}` : `Jour ${day.day}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {day.title[lang] || day.title.es || day.title.en}
                </p>
              </div>
            </div>

            {/* Points for this day */}
            <div className={`ml-4 pl-4 ${dayIdx < days.length - 1 ? 'border-l-2 border-primary/20 pb-4' : 'border-l-2 border-transparent'}`}>
              <div className="space-y-2">
                {day.poiIds.map((poiId, poiIdx) => {
                  const point = getPointById(poiId);
                  if (!point) return null;
                  const pointTitle = typeof point.title === 'string' ? point.title : (point.title[lang] || point.title.es || point.title.en);
                  return (
                    <button
                      key={poiId}
                      onClick={() => onSelectPoint?.(point)}
                      className="w-full flex items-center gap-2.5 p-2 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-primary" />
                        {poiIdx < day.poiIds.length - 1 && (
                          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-px h-3 bg-border" />
                        )}
                      </div>
                      <span className="text-sm text-foreground truncate">{pointTitle}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

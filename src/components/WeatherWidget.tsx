import { useWeather } from '@/hooks/useWeather';
import {
  Wind, Droplets, Sun, SunMedium, CloudSun, Cloud, CloudFog,
  CloudDrizzle, CloudRain, CloudRainWind, CloudSnow, Snowflake,
  CloudLightning, Thermometer
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sun, SunMedium, CloudSun, Cloud, CloudFog,
  CloudDrizzle, CloudRain, CloudRainWind, CloudSnow, Snowflake,
  CloudLightning, Thermometer,
};

interface WeatherWidgetProps {
  lat: number;
  lng: number;
  className?: string;
}

export function WeatherWidget({ lat, lng, className = '' }: WeatherWidgetProps) {
  const { weather, loading } = useWeather(lat, lng);

  if (loading) {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50 animate-pulse ${className}`}>
        <div className="w-10 h-10 bg-muted rounded-lg" />
        <div className="space-y-1.5 flex-1">
          <div className="h-4 w-20 bg-muted rounded" />
          <div className="h-3 w-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const WeatherIcon = iconMap[weather.iconName] || Sun;

  return (
    <div className={`p-4 rounded-xl bg-muted/30 border border-border/50 ${className}`}>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        {weather.description}
      </h3>
      <div className="flex items-center gap-4">
        <WeatherIcon className="w-8 h-8 text-primary flex-shrink-0" />
        <span className="text-3xl font-bold text-foreground tracking-tight">{weather.temperature}°</span>
        <div className="flex flex-col gap-1 ml-auto text-right">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground justify-end">
            <Wind className="w-3.5 h-3.5" />{weather.windSpeed} km/h
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground justify-end">
            <Droplets className="w-3.5 h-3.5" />{weather.humidity}%
          </span>
        </div>
      </div>
    </div>
  );
}

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
    <div className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/15 ${className}`}>
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <WeatherIcon className="w-6 h-6 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold text-foreground">{weather.temperature}°C</span>
          <span className="text-xs text-muted-foreground truncate">{weather.description}</span>
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Wind className="w-3 h-3" />{weather.windSpeed} km/h
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Droplets className="w-3 h-3" />{weather.humidity}%
          </span>
        </div>
      </div>
    </div>
  );
}

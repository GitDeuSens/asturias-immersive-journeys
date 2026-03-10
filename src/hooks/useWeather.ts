import { useState, useEffect } from 'react';

export interface WeatherData {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
  description: string;
  iconName: string;
}

const WMO_DESCRIPTIONS: Record<number, { desc: string; iconName: string }> = {
  0: { desc: 'Clear sky', iconName: 'Sun' },
  1: { desc: 'Mainly clear', iconName: 'SunMedium' },
  2: { desc: 'Partly cloudy', iconName: 'CloudSun' },
  3: { desc: 'Overcast', iconName: 'Cloud' },
  45: { desc: 'Fog', iconName: 'CloudFog' },
  48: { desc: 'Rime fog', iconName: 'CloudFog' },
  51: { desc: 'Light drizzle', iconName: 'CloudDrizzle' },
  53: { desc: 'Moderate drizzle', iconName: 'CloudDrizzle' },
  55: { desc: 'Dense drizzle', iconName: 'CloudRain' },
  61: { desc: 'Slight rain', iconName: 'CloudRain' },
  63: { desc: 'Moderate rain', iconName: 'CloudRain' },
  65: { desc: 'Heavy rain', iconName: 'CloudRainWind' },
  71: { desc: 'Slight snow', iconName: 'CloudSnow' },
  73: { desc: 'Moderate snow', iconName: 'CloudSnow' },
  75: { desc: 'Heavy snow', iconName: 'Snowflake' },
  80: { desc: 'Rain showers', iconName: 'CloudDrizzle' },
  81: { desc: 'Moderate showers', iconName: 'CloudRain' },
  82: { desc: 'Violent showers', iconName: 'CloudLightning' },
  95: { desc: 'Thunderstorm', iconName: 'CloudLightning' },
  96: { desc: 'Thunderstorm + hail', iconName: 'CloudLightning' },
  99: { desc: 'Thunderstorm + heavy hail', iconName: 'CloudLightning' },
};

const CACHE_KEY = 'weather-cache';
const CACHE_TTL = 30 * 60 * 1000;

export function useWeather(lat?: number, lng?: number) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!lat || !lng) return;
    const key = `${CACHE_KEY}-${lat.toFixed(2)}-${lng.toFixed(2)}`;

    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const { data, ts } = JSON.parse(cached);
        if (Date.now() - ts < CACHE_TTL) {
          setWeather(data);
          return;
        }
      }
    } catch {}

    setLoading(true);
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`)
      .then(r => r.json())
      .then(data => {
        if (data.current) {
          const code = data.current.weather_code;
          const wmo = WMO_DESCRIPTIONS[code] || { desc: 'Unknown', iconName: 'Thermometer' };
          const w: WeatherData = {
            temperature: Math.round(data.current.temperature_2m),
            weatherCode: code,
            windSpeed: Math.round(data.current.wind_speed_10m),
            humidity: data.current.relative_humidity_2m,
            description: wmo.desc,
            iconName: wmo.iconName,
          };
          setWeather(w);
          try { localStorage.setItem(key, JSON.stringify({ data: w, ts: Date.now() })); } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lat, lng]);

  return { weather, loading };
}

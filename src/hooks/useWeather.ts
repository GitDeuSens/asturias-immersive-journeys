import { useState, useEffect } from 'react';

export interface WeatherData {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
  description: string;
  icon: string;
}

const WMO_DESCRIPTIONS: Record<number, { desc: string; icon: string }> = {
  0: { desc: 'Clear sky', icon: '☀️' },
  1: { desc: 'Mainly clear', icon: '🌤️' },
  2: { desc: 'Partly cloudy', icon: '⛅' },
  3: { desc: 'Overcast', icon: '☁️' },
  45: { desc: 'Fog', icon: '🌫️' },
  48: { desc: 'Rime fog', icon: '🌫️' },
  51: { desc: 'Light drizzle', icon: '🌦️' },
  53: { desc: 'Moderate drizzle', icon: '🌦️' },
  55: { desc: 'Dense drizzle', icon: '🌧️' },
  61: { desc: 'Slight rain', icon: '🌧️' },
  63: { desc: 'Moderate rain', icon: '🌧️' },
  65: { desc: 'Heavy rain', icon: '🌧️' },
  71: { desc: 'Slight snow', icon: '🌨️' },
  73: { desc: 'Moderate snow', icon: '🌨️' },
  75: { desc: 'Heavy snow', icon: '❄️' },
  80: { desc: 'Rain showers', icon: '🌦️' },
  81: { desc: 'Moderate showers', icon: '🌧️' },
  82: { desc: 'Violent showers', icon: '⛈️' },
  95: { desc: 'Thunderstorm', icon: '⛈️' },
  96: { desc: 'Thunderstorm + hail', icon: '⛈️' },
  99: { desc: 'Thunderstorm + heavy hail', icon: '⛈️' },
};

const CACHE_KEY = 'weather-cache';
const CACHE_TTL = 30 * 60 * 1000; // 30 min

export function useWeather(lat?: number, lng?: number) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!lat || !lng) return;
    const key = `${CACHE_KEY}-${lat.toFixed(2)}-${lng.toFixed(2)}`;

    // Check cache
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
          const wmo = WMO_DESCRIPTIONS[code] || { desc: 'Unknown', icon: '🌡️' };
          const w: WeatherData = {
            temperature: Math.round(data.current.temperature_2m),
            weatherCode: code,
            windSpeed: Math.round(data.current.wind_speed_10m),
            humidity: data.current.relative_humidity_2m,
            description: wmo.desc,
            icon: wmo.icon,
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

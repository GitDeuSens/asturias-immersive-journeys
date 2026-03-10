import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface ElevationProfileProps {
  polyline: { lat: number; lng: number }[];
  elevationGain?: number;
  className?: string;
}

// Simple Haversine distance calculator
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Generate a synthetic but plausible elevation profile from polyline + elevation_gain
function generateElevationData(polyline: { lat: number; lng: number }[], elevationGain: number) {
  if (polyline.length < 2) return [];
  
  const distances: number[] = [0];
  for (let i = 1; i < polyline.length; i++) {
    distances.push(distances[i - 1] + haversineDistance(
      polyline[i - 1].lat, polyline[i - 1].lng,
      polyline[i].lat, polyline[i].lng
    ));
  }
  
  const totalDist = distances[distances.length - 1];
  if (totalDist === 0) return [];

  // Sample points for chart
  const numPoints = Math.min(polyline.length, 30);
  const step = Math.max(1, Math.floor(polyline.length / numPoints));
  
  // Generate synthetic elevation using a combination of sin waves
  const baseElevation = 200 + Math.random() * 300;
  
  return Array.from({ length: numPoints }, (_, i) => {
    const idx = Math.min(i * step, polyline.length - 1);
    const progress = distances[idx] / totalDist;
    const elevation = baseElevation + 
      elevationGain * 0.4 * Math.sin(progress * Math.PI) +
      elevationGain * 0.2 * Math.sin(progress * Math.PI * 3) +
      elevationGain * 0.1 * Math.sin(progress * Math.PI * 5);
    
    return {
      dist: Math.round(distances[idx] * 10) / 10,
      elev: Math.round(Math.max(0, elevation)),
    };
  });
}

export function ElevationProfile({ polyline, elevationGain = 200, className = '' }: ElevationProfileProps) {
  const data = useMemo(() => generateElevationData(polyline, elevationGain), [polyline, elevationGain]);

  if (data.length < 2) return null;

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={100}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="elevGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(79, 100%, 36%)" stopOpacity={0.6} />
              <stop offset="100%" stopColor="hsl(79, 100%, 36%)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="dist"
            tick={{ fontSize: 9, fill: 'hsl(210, 11%, 45%)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}km`}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 9, fill: 'hsl(210, 11%, 45%)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}m`}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: 'hsl(0, 0%, 100%)',
              border: '1px solid hsl(90, 10%, 85%)',
              borderRadius: '8px',
              fontSize: '11px',
              padding: '6px 10px',
            }}
            formatter={(value: number) => [`${value} m`, 'Altitud']}
            labelFormatter={(label) => `${label} km`}
          />
          <Area
            type="monotone"
            dataKey="elev"
            stroke="hsl(79, 100%, 36%)"
            strokeWidth={2}
            fill="url(#elevGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

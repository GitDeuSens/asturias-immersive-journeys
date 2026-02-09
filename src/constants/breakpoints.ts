// Responsive breakpoints
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1280,
} as const;

// Map panel offsets for different screen sizes
export const MAP_PANEL_OFFSETS = {
  DESKTOP: { left: 60, right: 460, top: 80, bottom: 60 },
  MOBILE: { left: 40, right: 40, top: 80, bottom: 200 },
} as const;

// Asturias region bounds
export const ASTURIAS_BOUNDS: [number, number][] = [
  [42.7, -7.8],
  [43.9, -4.0],
];

// Default coordinates
export const DEFAULT_COORDINATES = {
  ASTURIAS_CENTER: { lat: 43.36, lng: -5.85 },
  OVIEDO: { lat: 43.36, lng: -5.84 },
} as const;

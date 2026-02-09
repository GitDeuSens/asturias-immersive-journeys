import { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';

// Preload only essential icons
const essentialIcons = {
  MapPin: LucideIcons.MapPin,
  Navigation: LucideIcons.Navigation,
  Search: LucideIcons.Search,
  Home: LucideIcons.Home,
  ArrowLeft: LucideIcons.ArrowLeft,
  X: LucideIcons.X,
  ChevronLeft: LucideIcons.ChevronLeft,
  ChevronRight: LucideIcons.ChevronRight,
  Clock: LucideIcons.Clock,
  Footprints: LucideIcons.Footprints,
  Car: LucideIcons.Car,
  Camera: LucideIcons.Camera,
  Info: LucideIcons.Info,
  Star: LucideIcons.Star
};

export const MapPin = essentialIcons.MapPin;
export const Navigation = essentialIcons.Navigation;
export const Search = essentialIcons.Search;
export const Home = essentialIcons.Home;
export const ArrowLeft = essentialIcons.ArrowLeft;
export const X = essentialIcons.X;
export const ChevronLeft = essentialIcons.ChevronLeft;
export const ChevronRight = essentialIcons.ChevronRight;
export const Clock = essentialIcons.Clock;
export const Footprints = essentialIcons.Footprints;
export const Car = essentialIcons.Car;
export const Camera = essentialIcons.Camera;
export const Info = essentialIcons.Info;
export const Star = essentialIcons.Star;

// Dynamic icon loader for less common icons
export function DynamicIcon({ name, ...props }: { name: keyof typeof LucideIcons; [key: string]: any }) {
  const [IconComponent, setIconComponent] = useState<any>(null);
  
  useEffect(() => {
    const Icon = LucideIcons[name];
    if (Icon) {
      setIconComponent(() => Icon);
    }
  }, [name]);
  
  if (!IconComponent) return null;
  return <IconComponent {...props} />;
}

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import { 
  Route as RouteIcon, 
  MapPin, 
  Search, 
  ChevronUp, 
  ChevronDown, 
  Maximize2,
  ChevronLeft,
  RotateCw
} from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { CategoryChips } from '@/components/CategoryChips';
import { RouteCard } from '@/components/RouteCard';
import { RouteDetailSheet } from '@/components/RouteDetailSheet';
import { RouteExplorerView } from '@/components/RouteExplorerView';
import { PointDetailSheet } from '@/components/PointDetailSheet';
import { immersiveRoutes, ImmersiveRoute, RoutePoint } from '@/data/immersiveRoutes';
import { categories } from '@/data/mockData';
import { useLanguage } from '@/hooks/useLanguage';
import 'leaflet/dist/leaflet.css';

const texts = {
  routes: { es: 'Rutas Inmersivas', en: 'Immersive Routes', fr: 'Itinéraires Immersifs' },
  search: { es: 'Buscar rutas...', en: 'Search routes...', fr: 'Rechercher...' },
  fitBounds: { es: 'Ajustar vista', en: 'Fit view', fr: 'Ajuster la vue' },
  results: { es: 'resultados', en: 'results', fr: 'résultats' },
};

// Create route bubble marker
const createRouteMarkerIcon = (route: ImmersiveRoute) => {
  const borderColor = route.isCircular ? 'hsl(79, 100%, 36%)' : 'hsl(203, 100%, 32%)';
  
  return L.divIcon({
    className: 'route-bubble-marker',
    html: `
      <div style="position: relative; width: 60px; height: 60px; cursor: pointer;">
        <div style="width: 60px; height: 60px; border-radius: 50%; border: 4px solid ${borderColor}; box-shadow: 0 4px 20px rgba(0,0,0,0.35); overflow: hidden; background: white;">
          <img src="${route.coverImage}" style="width: 100%; height: 100%; object-fit: cover;" alt=""/>
        </div>
        ${route.isCircular ? `
          <div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); background: hsl(79, 100%, 36%); color: white; font-size: 8px; font-weight: 700; padding: 2px 8px; border-radius: 10px; white-space: nowrap; font-family: 'Montserrat', sans-serif; box-shadow: 0 2px 6px rgba(0,0,0,0.25);">LAZO</div>
        ` : ''}
        <div style="position: absolute; top: -6px; right: -6px; width: 22px; height: 22px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: ${borderColor}; box-shadow: 0 2px 8px rgba(0,0,0,0.25); font-family: 'Montserrat', sans-serif;">${route.maxPoints}</div>
      </div>
    `,
    iconSize: [60, 68],
    iconAnchor: [30, 34],
  });
};

// Create point marker for route exploration
const createPointMarkerIcon = (point: RoutePoint, index: number) => {
  const hasAR = !!point.content.arExperience;
  const has360 = !!point.content.tour360;
  const borderColor = hasAR ? 'hsl(48, 100%, 50%)' : has360 ? 'hsl(79, 100%, 36%)' : 'hsl(203, 100%, 32%)';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position: relative; width: 48px; height: 48px;">
        <div style="width: 48px; height: 48px; border-radius: 50%; border: 4px solid ${borderColor}; overflow: hidden; background: white; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
          ${point.coverImage ? `<img src="${point.coverImage}" style="width: 100%; height: 100%; object-fit: cover;" alt=""/>` : `<div style="width: 100%; height: 100%; background: ${borderColor}20;"></div>`}
        </div>
        <div style="position: absolute; top: -6px; right: -6px; width: 22px; height: 22px; background: ${borderColor}; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: ${hasAR ? '#1a1a1a' : 'white'}; box-shadow: 0 2px 8px rgba(0,0,0,0.25); font-family: 'Montserrat', sans-serif;">${index + 1}</div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 48],
  });
};

export function RoutesPage() {
  const { t } = useLanguage();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<ImmersiveRoute | null>(null);
  const [showRouteDetail, setShowRouteDetail] = useState(false);
  const [exploringRoute, setExploringRoute] = useState<ImmersiveRoute | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<RoutePoint | null>(null);
  const [panelExpanded, setPanelExpanded] = useState(true);

  const ASTURIAS_BOUNDS: L.LatLngBoundsExpression = [
    [42.70, -7.80],
    [43.90, -4.00]
  ];

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    
    mapRef.current = L.map(mapContainerRef.current, {
      center: [43.36, -5.85],
      zoom: 9,
      zoomControl: false,
      maxBounds: ASTURIAS_BOUNDS,
      maxBoundsViscosity: 1.0,
      minZoom: 8,
      maxZoom: 18,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://osm.org/">OpenStreetMap</a>'
    }).addTo(mapRef.current);

    L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const filteredRoutes = useMemo(() => {
    return immersiveRoutes.filter(route => {
      const matchesSearch = searchQuery === '' || 
        t(route.title).toLowerCase().includes(searchQuery.toLowerCase()) ||
        t(route.theme).toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || 
        route.categoryIds.some(id => selectedCategories.includes(id));
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategories, t]);

  const getPanelOffset = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      return { left: 60, right: 460, top: 80, bottom: 60 };
    }
    return { left: 40, right: 40, top: 80, bottom: 200 };
  }, []);

  const fitToRoute = useCallback((route: ImmersiveRoute) => {
    if (!mapRef.current) return;
    const positions = route.polyline.map(p => [p.lat, p.lng] as [number, number]);
    if (positions.length > 0) {
      const offset = getPanelOffset();
      mapRef.current.fitBounds(positions, { 
        paddingTopLeft: [offset.left, offset.top],
        paddingBottomRight: [offset.right, offset.bottom],
        maxZoom: 13 
      });
    }
  }, [getPanelOffset]);

  const fitToAllRoutes = useCallback(() => {
    if (!mapRef.current) return;
    const positions = filteredRoutes.map(r => [r.center.lat, r.center.lng] as [number, number]);
    if (positions.length > 0) {
      const offset = getPanelOffset();
      mapRef.current.fitBounds(positions, {
        paddingTopLeft: [offset.left, offset.top],
        paddingBottomRight: [offset.right, offset.bottom],
        maxZoom: 10
      });
    }
  }, [filteredRoutes, getPanelOffset]);

  // Update markers
  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (exploringRoute) {
      // Show route polyline and point markers
      let positions = exploringRoute.polyline.map(p => [p.lat, p.lng] as [number, number]);
      if (exploringRoute.isCircular && positions.length > 2) {
        const first = positions[0];
        const last = positions[positions.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) {
          positions = [...positions, first];
        }
      }

      polylineRef.current = L.polyline(positions, {
        color: 'hsl(0, 0%, 25%)',
        weight: 5,
        opacity: 0.9,
        dashArray: '12, 8',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(mapRef.current);

      exploringRoute.points.forEach((point, idx) => {
        const marker = L.marker([point.location.lat, point.location.lng], {
          icon: createPointMarkerIcon(point, idx)
        })
          .addTo(mapRef.current!)
          .on('click', () => setSelectedPoint(point));
        markersRef.current.push(marker);
      });

      fitToRoute(exploringRoute);
    } else {
      // Show all route bubbles
      filteredRoutes.forEach(route => {
        const marker = L.marker([route.center.lat, route.center.lng], {
          icon: createRouteMarkerIcon(route)
        })
          .addTo(mapRef.current!)
          .on('click', () => {
            setSelectedRoute(route);
            setShowRouteDetail(true);
          });
        markersRef.current.push(marker);
      });
    }
  }, [exploringRoute, filteredRoutes, fitToRoute]);

  // Re-center when filters change
  useEffect(() => {
    if (exploringRoute || !mapRef.current) return;
    const timer = setTimeout(() => fitToAllRoutes(), 100);
    return () => clearTimeout(timer);
  }, [selectedCategories, searchQuery, fitToAllRoutes, exploringRoute]);

  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev => 
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const handleEnterRoute = (route: ImmersiveRoute) => {
    setShowRouteDetail(false);
    setExploringRoute(route);
    setSelectedPoint(null);
  };

  const handleExitRoute = () => {
    setExploringRoute(null);
    setSelectedPoint(null);
    setTimeout(() => fitToAllRoutes(), 100);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <AppHeader variant="light" />
      
      <div className="flex-1 relative pt-14">
        <div ref={mapContainerRef} className="h-full w-full z-0" />

        {/* Fit button */}
        <AnimatePresence>
          {exploringRoute && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => fitToRoute(exploringRoute)}
              className="absolute top-20 right-4 z-10 flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm shadow-lg hover:bg-primary/90 transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
              {t(texts.fitBounds)}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Side Panel */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: panelExpanded ? 0 : 'calc(100% - 60px)' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="absolute bottom-0 left-0 right-0 md:top-14 md:bottom-0 md:left-auto md:right-4 md:w-[400px] bg-white/95 backdrop-blur-md border border-border shadow-xl rounded-t-2xl md:rounded-2xl md:my-4 max-h-[75vh] md:max-h-none overflow-hidden flex flex-col"
        >
          {/* Mobile handle */}
          <button
            onClick={() => setPanelExpanded(!panelExpanded)}
            className="w-full p-4 flex items-center justify-between border-b border-border/50 md:hidden"
          >
            <span className="font-serif font-bold text-foreground">
              {exploringRoute ? t(exploringRoute.title) : t(texts.routes)}
            </span>
            {panelExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>

          {exploringRoute ? (
            <RouteExplorerView 
              route={exploringRoute}
              onBack={handleExitRoute}
              onSelectPoint={setSelectedPoint}
              selectedPoint={selectedPoint}
            />
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-serif font-bold text-foreground">{t(texts.routes)}</h2>
                <span className="text-xs text-muted-foreground">
                  {filteredRoutes.length} {t(texts.results)}
                </span>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t(texts.search)}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Categories */}
              <CategoryChips
                categories={categories}
                selectedIds={selectedCategories}
                onToggle={toggleCategory}
                className="justify-start"
              />

              {/* Routes list */}
              <div className="space-y-3">
                {filteredRoutes.map(route => (
                  <RouteCard 
                    key={route.id} 
                    route={route}
                    onClick={() => {
                      setSelectedRoute(route);
                      setShowRouteDetail(true);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Route Detail Sheet */}
      {showRouteDetail && selectedRoute && (
        <RouteDetailSheet 
          route={selectedRoute}
          onClose={() => {
            setShowRouteDetail(false);
            setSelectedRoute(null);
          }}
          onEnterRoute={handleEnterRoute}
        />
      )}

      {/* Point Detail Sheet */}
      {selectedPoint && (
        <PointDetailSheet 
          point={selectedPoint}
          onClose={() => setSelectedPoint(null)}
        />
      )}
    </div>
  );
}

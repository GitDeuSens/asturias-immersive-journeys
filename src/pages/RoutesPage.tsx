import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import { 
  Route as RouteIcon, 
  MapPin, 
  Search, 
  ChevronUp, 
  ChevronDown, 
  RotateCw, 
  Camera, 
  Info, 
  Smartphone, 
  Maximize2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { CategoryChips } from '@/components/CategoryChips';
import { POIDetailSheet } from '@/components/POIDetailSheet';
import { POIPreviewSheet } from '@/components/POIPreviewSheet';
import { routes, pois, categories, Route, POI, getPOIById, ExperienceType, getCategoryById } from '@/data/mockData';
import { useLanguage } from '@/hooks/useLanguage';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import 'leaflet/dist/leaflet.css';

const texts = {
  routes: { es: 'Rutas', en: 'Routes', fr: 'Itinéraires' },
  pois: { es: 'POIs', en: 'POIs', fr: 'POIs' },
  search: { es: 'Buscar...', en: 'Search...', fr: 'Rechercher...' },
  stops: { es: 'paradas', en: 'stops', fr: 'arrêts' },
  loopRoute: { es: 'Ruta en lazo', en: 'Loop route', fr: 'Boucle' },
  seeRoute: { es: 'Ver ruta', en: 'View route', fr: 'Voir l\'itinéraire' },
  viewAR: { es: 'Ver en AR', en: 'View in AR', fr: 'Voir en AR' },
  open360: { es: 'Abrir 360°', en: 'Open 360°', fr: 'Ouvrir 360°' },
  viewDetails: { es: 'Ver detalles', en: 'View details', fr: 'Voir détails' },
  filterByType: { es: 'Filtrar por tipo', en: 'Filter by type', fr: 'Filtrer par type' },
  all: { es: 'Todos', en: 'All', fr: 'Tous' },
  day: { es: 'Día', en: 'Day', fr: 'Jour' },
  fitBounds: { es: 'Ajustar a ruta', en: 'Fit to route', fr: 'Ajuster à l\'itinéraire' },
  backToRoutes: { es: 'Volver a rutas', en: 'Back to routes', fr: 'Retour aux itinéraires' },
  arExperiences: { es: 'experiencias AR', en: 'AR experiences', fr: 'expériences AR' },
};

// Get AR POI count for a route
const getARPOICount = (route: Route): number => {
  return route.poiOrder.reduce((count, poiId) => {
    const poi = getPOIById(poiId);
    return poi?.experienceType === 'AR' ? count + 1 : count;
  }, 0);
};

// Custom marker icons with POI thumbnail and position number
const createMarkerIcon = (number: number, type: ExperienceType, imageUrl?: string) => {
  const typeColors = {
    'AR': { border: 'hsl(48, 100%, 50%)' },      // Amarillo Asturias
    '360': { border: 'hsl(79, 100%, 36%)' },     // Verde Asturias
    'INFO': { border: 'hsl(203, 100%, 32%)' }    // Azul institucional
  };
  const config = typeColors[type];
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        position: relative;
        width: 48px;
        height: 48px;
      ">
        <div style="
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 4px solid ${config.border};
          overflow: hidden;
          background: white;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        ">
          ${imageUrl ? `
            <img src="${imageUrl}" style="
              width: 100%;
              height: 100%;
              object-fit: cover;
            " alt=""/>
          ` : `
            <div style="
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 800;
              font-size: 18px;
              color: ${config.border};
              font-family: 'Montserrat', sans-serif;
            ">${number}</div>
          `}
        </div>
        <div style="
          position: absolute;
          top: -6px;
          right: -6px;
          width: 22px;
          height: 22px;
          background: ${config.border};
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 800;
          color: ${type === 'AR' ? '#1a1a1a' : 'white'};
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
          font-family: 'Montserrat', sans-serif;
        ">${number}</div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 48],
  });
};

const createPOIMarkerIcon = (type: ExperienceType) => {
  const typeColors = {
    'AR': { bg: 'hsl(48, 100%, 50%)', icon: '📱' },      // Amarillo Asturias
    '360': { bg: 'hsl(79, 100%, 36%)', icon: '🔄' },     // Verde Asturias
    'INFO': { bg: 'hsl(203, 100%, 32%)', icon: 'ℹ️' }    // Azul institucional
  };
  const config = typeColors[type];
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 38px;
        height: 38px;
        background: ${config.bg};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.4);
      ">${config.icon}</div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
  });
};

// Calculate route centroid (average of all polyline points)
const getRouteCentroid = (polyline: { lat: number; lng: number }[]) => {
  const sumLat = polyline.reduce((sum, p) => sum + p.lat, 0);
  const sumLng = polyline.reduce((sum, p) => sum + p.lng, 0);
  return {
    lat: sumLat / polyline.length,
    lng: sumLng / polyline.length
  };
};

// Create route bubble marker with thumbnail image
const createRouteMarkerIcon = (route: Route) => {
  const coverImage = route.coverImage || getPOIById(route.poiOrder[0])?.media.images[0] || '';
  const borderColor = route.isLoop ? 'hsl(79, 100%, 36%)' : 'hsl(203, 100%, 32%)';
  
  return L.divIcon({
    className: 'route-bubble-marker',
    html: `
      <div style="
        position: relative;
        width: 60px;
        height: 60px;
        cursor: pointer;
      ">
        <div style="
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 4px solid ${borderColor};
          box-shadow: 0 4px 20px rgba(0,0,0,0.35);
          overflow: hidden;
          background: white;
        ">
          <img src="${coverImage}" style="
            width: 100%;
            height: 100%;
            object-fit: cover;
          " alt=""/>
        </div>
        ${route.isLoop ? `
          <div style="
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            background: hsl(79, 100%, 36%);
            color: white;
            font-size: 8px;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 10px;
            white-space: nowrap;
            font-family: 'Montserrat', sans-serif;
            letter-spacing: 0.5px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.25);
          ">LAZO</div>
        ` : ''}
        <div style="
          position: absolute;
          top: -6px;
          right: -6px;
          width: 22px;
          height: 22px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 800;
          color: ${borderColor};
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
          font-family: 'Montserrat', sans-serif;
        ">${route.poiOrder.length}</div>
      </div>
    `,
    iconSize: [60, 68],
    iconAnchor: [30, 34],
  });
};

// Experience type badge component - Colores oficiales Asturias
const TypeBadge = ({ type, size = 'sm' }: { type: ExperienceType; size?: 'sm' | 'md' }) => {
  const config = {
    'AR': { 
      className: 'bg-[hsl(48,100%,50%)]/20 border-[hsl(48,100%,50%)] text-[hsl(48,100%,35%)]', 
      icon: '📱' 
    },
    '360': { 
      className: 'bg-primary/20 border-primary text-primary', 
      icon: '🔄' 
    },
    'INFO': { 
      className: 'bg-[hsl(203,100%,32%)]/20 border-[hsl(203,100%,32%)] text-[hsl(203,100%,32%)]', 
      icon: 'ℹ️' 
    }
  };
  const style = config[type];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border font-bold ${style.className} ${sizeClasses}`}>
      <span>{style.icon}</span>
      <span>{type}</span>
    </span>
  );
};

export function RoutesPage() {
  const { t } = useLanguage();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);
  
  const [viewMode, setViewMode] = useState<'routes' | 'pois'>('routes');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<ExperienceType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [panelExpanded, setPanelExpanded] = useState(true);
  const [expandedDays, setExpandedDays] = useState<number[]>([1]);

  // Límites de Asturias para restringir navegación del mapa (ampliados para offset del panel)
  const ASTURIAS_BOUNDS: L.LatLngBoundsExpression = [
    [42.70, -7.80],  // Suroeste - más margen
    [43.90, -4.00]   // Noreste - más margen
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

    // Tile layer claro - CartoDB Voyager (gratuito, sin auth)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://osm.org/">OpenStreetMap</a>'
    }).addTo(mapRef.current);

    // Add zoom control to bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const filteredRoutes = useMemo(() => {
    return routes.filter(route => {
      const matchesSearch = searchQuery === '' || 
        t(route.title).toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || 
        route.categoryIds.some(id => selectedCategories.includes(id));
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategories, t]);

  const filteredPOIs = useMemo(() => {
    return pois.filter(poi => {
      const matchesSearch = searchQuery === '' || 
        t(poi.title).toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || 
        poi.categoryIds.some(id => selectedCategories.includes(id));
      const matchesType = selectedTypes.length === 0 || 
        selectedTypes.includes(poi.experienceType);
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [searchQuery, selectedCategories, selectedTypes, t]);

  // Get panel offset based on viewport - accounts for side panel on desktop
  const getPanelOffset = useCallback((): { left: number; right: number; top: number; bottom: number } => {
    // En desktop (md: 768px+), el panel tiene 400px + márgenes
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      return { left: 60, right: 460, top: 80, bottom: 60 }; // 400px panel + 60px padding
    }
    // En móvil, el panel es un bottom sheet, no afecta horizontalmente
    return { left: 40, right: 40, top: 80, bottom: 200 }; // bottom sheet ocupa ~200px
  }, []);

  // Fit map to route bounds with panel offset
  const fitToRoute = useCallback(() => {
    if (!mapRef.current || !selectedRoute) return;
    const positions = selectedRoute.polyline.map(p => [p.lat, p.lng] as [number, number]);
    if (positions.length > 0) {
      const offset = getPanelOffset();
      mapRef.current.fitBounds(positions, { 
        paddingTopLeft: [offset.left, offset.top],
        paddingBottomRight: [offset.right, offset.bottom],
        maxZoom: 15 
      });
    }
  }, [selectedRoute, getPanelOffset]);

  // Fit map to all visible elements (routes or POIs)
  const fitToAllElements = useCallback((mode: 'routes' | 'pois') => {
    if (!mapRef.current) return;
    
    let positions: [number, number][] = [];
    
    if (mode === 'routes') {
      // Gather centroids of all filtered routes
      filteredRoutes.forEach(route => {
        const centroid = getRouteCentroid(route.polyline);
        positions.push([centroid.lat, centroid.lng]);
      });
    } else if (mode === 'pois') {
      // Gather positions of all filtered POIs
      filteredPOIs.forEach(poi => {
        positions.push([poi.access.lat, poi.access.lng]);
      });
    }
    
    if (positions.length > 0) {
      const offset = getPanelOffset();
      mapRef.current.fitBounds(positions, {
        paddingTopLeft: [offset.left, offset.top],
        paddingBottomRight: [offset.right, offset.bottom],
        maxZoom: 12
      });
    }
  }, [filteredRoutes, filteredPOIs, getPanelOffset]);

  // Update markers and polyline when selection changes
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Clear existing polyline
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (selectedRoute) {
      // Draw route polyline - close loop if isLoop
      let positions = selectedRoute.polyline.map(p => [p.lat, p.lng] as [number, number]);
      
      // Ensure loop is closed visually if isLoop=true
      if (selectedRoute.isLoop && positions.length > 2) {
        const first = positions[0];
        const last = positions[positions.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) {
          positions = [...positions, first];
        }
      }

      // Color neutro para la ruta (gris oscuro) - siempre discontinua
      polylineRef.current = L.polyline(positions, {
        color: 'hsl(0, 0%, 25%)',
        weight: 5,
        opacity: 0.9,
        dashArray: '12, 8',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(mapRef.current);

      // Add route POI markers with thumbnails
      selectedRoute.poiOrder.forEach((poiId, index) => {
        const poi = getPOIById(poiId);
        if (poi) {
          const imageUrl = poi.media.images[0];
          const marker = L.marker([poi.access.lat, poi.access.lng], {
            icon: createMarkerIcon(index + 1, poi.experienceType, imageUrl)
          })
            .addTo(mapRef.current!)
            .on('click', () => handlePOIClick(poi));
          markersRef.current.push(marker);
        }
      });

      // Fit bounds to route
      fitToRoute();
    } else if (viewMode === 'pois') {
      // Add all filtered POIs as markers
      filteredPOIs.forEach(poi => {
        const marker = L.marker([poi.access.lat, poi.access.lng], {
          icon: createPOIMarkerIcon(poi.experienceType)
        })
          .addTo(mapRef.current!)
          .on('click', () => handlePOIClick(poi));
        markersRef.current.push(marker);
      });
    } else if (viewMode === 'routes' && !selectedRoute) {
      // Add route bubble markers at centroids
      filteredRoutes.forEach(route => {
        const centroid = getRouteCentroid(route.polyline);
        const marker = L.marker([centroid.lat, centroid.lng], {
          icon: createRouteMarkerIcon(route)
        })
          .addTo(mapRef.current!)
          .on('click', () => handleRouteSelect(route));
        markersRef.current.push(marker);
      });
    }
  }, [selectedRoute, viewMode, selectedCategories, selectedTypes, searchQuery, filteredPOIs, filteredRoutes, fitToRoute]);

  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev => 
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const toggleType = (type: ExperienceType) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleRouteSelect = (route: Route) => {
    setSelectedRoute(route);
    setSelectedPOI(null);
    // Auto-expand first day if itinerary
    if (route.itineraryDays) {
      setExpandedDays([1]);
    }
  };

  const handlePOIClick = (poi: POI) => {
    setSelectedPOI(poi);
    if (mapRef.current) {
      // Calcular offset para centrar en área visible (excluyendo panel)
      if (typeof window !== 'undefined' && window.innerWidth >= 768) {
        // En desktop, desplazar el centro para compensar el panel lateral
        const targetLatLng = L.latLng(poi.access.lat, poi.access.lng);
        const targetPoint = mapRef.current.latLngToContainerPoint(targetLatLng);
        const offsetPoint = L.point(targetPoint.x + 200, targetPoint.y); // +200px = mitad del panel
        const offsetLatLng = mapRef.current.containerPointToLatLng(offsetPoint);
        mapRef.current.panTo(offsetLatLng, { duration: 0.5 });
      } else {
        // En móvil, ajustar para el bottom sheet
        const targetLatLng = L.latLng(poi.access.lat, poi.access.lng);
        const targetPoint = mapRef.current.latLngToContainerPoint(targetLatLng);
        const offsetPoint = L.point(targetPoint.x, targetPoint.y - 100); // -100px hacia arriba
        const offsetLatLng = mapRef.current.containerPointToLatLng(offsetPoint);
        mapRef.current.panTo(offsetLatLng, { duration: 0.5 });
      }
    }
  };

  const toggleDay = (day: number) => {
    setExpandedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <AppHeader variant="light" />
      
      {/* Map container */}
      <div className="flex-1 relative pt-14">
        <div ref={mapContainerRef} className="h-full w-full z-0" />

        {/* Fit to Route button */}
        <AnimatePresence>
          {selectedRoute && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={fitToRoute}
              className="absolute top-20 right-4 z-10 flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm shadow-lg hover:bg-primary/90 transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
              {t(texts.fitBounds)}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Side Panel (desktop) / Bottom Sheet (mobile) */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: panelExpanded ? 0 : 'calc(100% - 60px)' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="absolute bottom-0 left-0 right-0 md:top-14 md:bottom-0 md:left-auto md:right-4 md:w-[400px] bg-white/95 backdrop-blur-md border border-border shadow-xl rounded-t-2xl md:rounded-2xl md:my-4 max-h-[75vh] md:max-h-none overflow-hidden flex flex-col"
        >
          {/* Panel header / Handle */}
          <button
            onClick={() => setPanelExpanded(!panelExpanded)}
            className="w-full p-4 flex items-center justify-between border-b border-border/50 md:hidden"
          >
            <span className="font-serif font-bold text-foreground">
              {selectedRoute ? t(selectedRoute.title) : viewMode === 'routes' ? t(texts.routes) : t(texts.pois)}
            </span>
            {panelExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Back button when route selected */}
            {selectedRoute && (
              <button
                onClick={() => { 
                  setSelectedRoute(null); 
                  setSelectedPOI(null); 
                  setTimeout(() => fitToAllElements('routes'), 100);
                }}
                className="flex items-center gap-2 text-sm text-primary font-medium hover:text-primary/80 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                {t(texts.backToRoutes)}
              </button>
            )}

            {/* View mode toggle - only when no route selected */}
            {!selectedRoute && (
              <>
                <div className="flex rounded-xl bg-muted/50 p-1">
                  <button
                    onClick={() => { 
                      setViewMode('routes'); 
                      setSelectedRoute(null); 
                      setTimeout(() => fitToAllElements('routes'), 100);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all font-semibold ${
                      viewMode === 'routes' ? 'bg-primary text-primary-foreground' : 'text-foreground/70 hover:text-foreground'
                    }`}
                  >
                    <RouteIcon className="w-4 h-4" />
                    {t(texts.routes)}
                  </button>
                  <button
                    onClick={() => { 
                      setViewMode('pois'); 
                      setSelectedRoute(null); 
                      setTimeout(() => fitToAllElements('pois'), 100);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all font-semibold ${
                      viewMode === 'pois' ? 'bg-primary text-primary-foreground' : 'text-foreground/70 hover:text-foreground'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    {t(texts.pois)}
                  </button>
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

                {/* Category filters */}
                <CategoryChips
                  categories={categories}
                  selectedIds={selectedCategories}
                  onToggle={toggleCategory}
                  className="justify-start"
                />

                {/* Type filters (both modes) - Colores oficiales Asturias */}
                <div className="flex flex-wrap gap-2">
                  {(['AR', '360', 'INFO'] as ExperienceType[]).map(type => {
                    const isSelected = selectedTypes.includes(type);
                    const colorClasses = {
                      'AR': isSelected 
                        ? 'bg-[hsl(48,100%,50%)]/20 border-[hsl(48,100%,50%)] text-[hsl(48,100%,35%)]' 
                        : 'bg-muted/30 border-border/50 text-foreground/60 hover:bg-muted/50',
                      '360': isSelected 
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-muted/30 border-border/50 text-foreground/60 hover:bg-muted/50',
                      'INFO': isSelected 
                        ? 'bg-[hsl(203,100%,32%)]/20 border-[hsl(203,100%,32%)] text-[hsl(203,100%,32%)]'
                        : 'bg-muted/30 border-border/50 text-foreground/60 hover:bg-muted/50'
                    };
                    
                    return (
                      <button
                        key={type}
                        onClick={() => toggleType(type)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${colorClasses[type]}`}
                      >
                        {type === 'AR' ? '📱 AR' : type === '360' ? '🔄 360°' : 'ℹ️ INFO'}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* Routes list */}
            {viewMode === 'routes' && !selectedRoute && (
              <div className="space-y-3">
                {filteredRoutes.map(route => {
                  const arCount = getARPOICount(route);
                  return (
                    <button
                      key={route.id}
                      onClick={() => handleRouteSelect(route)}
                      className="w-full text-left p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/50 hover:bg-card/80 transition-all group"
                    >
                      {/* Header with title and loop badge */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-sans font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                          {t(route.title)}
                        </h3>
                        {route.isLoop && (
                          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/15 text-primary text-[10px] font-bold uppercase tracking-wide whitespace-nowrap border border-primary/30">
                            <RotateCw className="w-3 h-3" />
                            {t(texts.loopRoute)}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      {route.shortDescription && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {t(route.shortDescription)}
                        </p>
                      )}

                      {/* Footer with metadata */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Category chips */}
                        {route.categoryIds.slice(0, 2).map(catId => {
                          const cat = getCategoryById(catId);
                          return cat ? (
                            <span key={catId} className="category-chip text-[10px]">
                              {t(cat.label)}
                            </span>
                          ) : null;
                        })}
                        
                        {/* Stops count */}
                        <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                          <MapPin className="w-3 h-3" />
                          {route.poiOrder.length} {t(texts.stops)}
                        </span>

                        {/* AR badge if has AR POIs */}
                        {arCount > 0 && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-warm/15 text-warm text-[10px] font-bold border border-warm/30">
                            📱 {arCount} AR
                          </span>
                        )}

                        <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Selected route details */}
            {selectedRoute && (
              <div className="space-y-4">
                {/* Route header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-xl font-sans font-bold text-foreground">{t(selectedRoute.title)}</h2>
                    {selectedRoute.isLoop && (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/15 text-primary text-[10px] font-bold uppercase tracking-wide whitespace-nowrap border border-primary/30">
                        <RotateCw className="w-3 h-3" />
                        {t(texts.loopRoute)}
                      </span>
                    )}
                  </div>
                  
                  {selectedRoute.shortDescription && (
                    <p className="text-sm text-muted-foreground">
                      {t(selectedRoute.shortDescription)}
                    </p>
                  )}

                  {/* Route metadata */}
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedRoute.categoryIds.map(catId => {
                      const cat = getCategoryById(catId);
                      return cat ? (
                        <span key={catId} className="category-chip text-xs">
                          {t(cat.label)}
                        </span>
                      ) : null;
                    })}
                    <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                      <MapPin className="w-3 h-3" />
                      {selectedRoute.poiOrder.length} {t(texts.stops)}
                    </span>
                    {getARPOICount(selectedRoute) > 0 && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-warm/15 text-warm text-xs font-bold border border-warm/30">
                        📱 {getARPOICount(selectedRoute)} {t(texts.arExperiences)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-border/50" />

                {/* Itinerary days or POI list */}
                {selectedRoute.itineraryDays ? (
                  <div className="space-y-2">
                    {selectedRoute.itineraryDays.map(day => (
                      <Collapsible
                        key={day.day}
                        open={expandedDays.includes(day.day)}
                        onOpenChange={() => toggleDay(day.day)}
                      >
                        <CollapsibleTrigger className="w-full flex items-center justify-between p-3 rounded-lg bg-primary/10 hover:bg-primary/15 transition-colors">
                          <span className="font-semibold text-primary">
                            {t(texts.day)} {day.day}: {t(day.title)}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-primary transition-transform ${expandedDays.includes(day.day) ? 'rotate-180' : ''}`} />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2 space-y-2">
                          {day.poiIds.map((poiId) => {
                            const poi = getPOIById(poiId);
                            if (!poi) return null;
                            const globalIndex = selectedRoute.poiOrder.indexOf(poiId);
                            const isSelected = selectedPOI?.id === poi.id;
                            const typeColor = poi.experienceType === 'AR' ? 'bg-warm' : poi.experienceType === '360' ? 'bg-primary' : 'bg-accent';
                            return (
                              <button
                                key={poiId}
                                onClick={() => handlePOIClick(poi)}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                                  isSelected 
                                    ? 'bg-primary/20 border border-primary/40' 
                                    : 'bg-muted/30 hover:bg-muted/50 border border-transparent'
                                }`}
                              >
                                {/* Thumbnail with position number */}
                                <div className="relative flex-shrink-0">
                                  <div 
                                    className={`w-12 h-12 rounded-lg bg-cover bg-center border-2 ${
                                      poi.experienceType === 'AR' ? 'border-warm' : poi.experienceType === '360' ? 'border-primary' : 'border-accent'
                                    }`}
                                    style={{ backgroundImage: `url(${poi.media.images[0]})` }}
                                  />
                                  <div className={`absolute -top-2 -right-2 w-6 h-6 ${typeColor} rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-sm`}>
                                    {globalIndex + 1}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-foreground truncate">{t(poi.title)}</p>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <TypeBadge type={poi.experienceType} size="sm" />
                                  </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              </button>
                            );
                          })}
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-3">
                      Itinerario
                    </h4>
                    {selectedRoute.poiOrder.map((poiId, idx) => {
                      const poi = getPOIById(poiId);
                      if (!poi) return null;
                      const isSelected = selectedPOI?.id === poi.id;
                      const typeColor = poi.experienceType === 'AR' ? 'bg-warm' : poi.experienceType === '360' ? 'bg-primary' : 'bg-accent';
                      return (
                        <button
                          key={poiId}
                          onClick={() => handlePOIClick(poi)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                            isSelected 
                              ? 'bg-primary/20 border border-primary/40' 
                              : 'bg-muted/30 hover:bg-muted/50 border border-transparent'
                          }`}
                        >
                          {/* Thumbnail with position number */}
                          <div className="relative flex-shrink-0">
                            <div 
                              className={`w-12 h-12 rounded-lg bg-cover bg-center border-2 ${
                                poi.experienceType === 'AR' ? 'border-warm' : poi.experienceType === '360' ? 'border-primary' : 'border-accent'
                              }`}
                              style={{ backgroundImage: `url(${poi.media.images[0]})` }}
                            />
                            <div className={`absolute -top-2 -right-2 w-6 h-6 ${typeColor} rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-sm`}>
                              {idx + 1}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground truncate">{t(poi.title)}</p>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <TypeBadge type={poi.experienceType} size="sm" />
                              {poi.categoryIds.slice(0, 1).map(catId => {
                                const cat = getCategoryById(catId);
                                return cat ? (
                                  <span key={catId} className="text-[10px] text-muted-foreground">
                                    {t(cat.label)}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* POIs list */}
            {viewMode === 'pois' && !selectedRoute && (
              <div className="space-y-3">
                {filteredPOIs.map(poi => (
                  <button
                    key={poi.id}
                    onClick={() => handlePOIClick(poi)}
                    className="w-full text-left p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/50 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-16 h-16 rounded-lg bg-cover bg-center flex-shrink-0"
                        style={{ backgroundImage: `url(${poi.media.images[0]})` }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-sans font-bold text-foreground truncate group-hover:text-primary transition-colors">
                            {t(poi.title)}
                          </h3>
                          <TypeBadge type={poi.experienceType} size="sm" />
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {t(poi.shortDescription)}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {poi.categoryIds.slice(0, 2).map(catId => {
                            const cat = getCategoryById(catId);
                            return cat ? (
                              <span key={catId} className="category-chip text-[10px]">
                                {t(cat.label)}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* POI Preview Sheet */}
        {selectedPOI && !showDetailSheet && (
          <POIPreviewSheet
            poi={selectedPOI}
            onClose={() => setSelectedPOI(null)}
            onViewDetails={() => setShowDetailSheet(true)}
          />
        )}
      </div>

      {/* Full POI Detail Sheet */}
      <POIDetailSheet
        poi={showDetailSheet && selectedPOI ? selectedPOI : null}
        onClose={() => {
          setShowDetailSheet(false);
          setSelectedPOI(null);
        }}
      />
    </div>
  );
}

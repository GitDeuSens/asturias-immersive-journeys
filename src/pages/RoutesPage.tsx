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
  X, 
  Maximize2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { CategoryChips } from '@/components/CategoryChips';
import { POIDetailSheet } from '@/components/POIDetailSheet';
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

// Custom marker icons with improved type badge
const createMarkerIcon = (number: number, type: ExperienceType) => {
  const typeColors = {
    'AR': { bg: 'hsl(38, 92%, 50%)', badge: '📱', label: 'AR' },
    '360': { bg: 'hsl(79, 100%, 36%)', badge: '🔄', label: '360°' },
    'INFO': { bg: 'hsl(199, 89%, 48%)', badge: 'ℹ️', label: 'INFO' }
  };
  const config = typeColors[type];
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        position: relative;
        width: 44px;
        height: 44px;
      ">
        <div style="
          width: 44px;
          height: 44px;
          background: ${config.bg};
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          color: white;
          font-size: 16px;
          font-family: 'Montserrat', sans-serif;
          box-shadow: 0 4px 15px rgba(0,0,0,0.4);
        ">
          ${number}
        </div>
        <div style="
          position: absolute;
          top: -8px;
          right: -8px;
          background: white;
          border-radius: 6px;
          padding: 2px 5px;
          font-size: 9px;
          font-weight: 700;
          color: ${config.bg};
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
          border: 1.5px solid ${config.bg};
          font-family: 'Montserrat', sans-serif;
          letter-spacing: 0.5px;
        ">${config.label}</div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 44],
  });
};

const createPOIMarkerIcon = (type: ExperienceType) => {
  const typeColors = {
    'AR': { bg: 'hsl(38, 92%, 50%)', icon: '📱' },
    '360': { bg: 'hsl(79, 100%, 36%)', icon: '🔄' },
    'INFO': { bg: 'hsl(199, 89%, 48%)', icon: 'ℹ️' }
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

// Experience type badge component
const TypeBadge = ({ type, size = 'sm' }: { type: ExperienceType; size?: 'sm' | 'md' }) => {
  const config = {
    'AR': { bg: 'bg-warm/20', border: 'border-warm', text: 'text-warm', icon: '📱' },
    '360': { bg: 'bg-primary/20', border: 'border-primary', text: 'text-primary', icon: '🔄' },
    'INFO': { bg: 'bg-accent/20', border: 'border-accent', text: 'text-accent', icon: 'ℹ️' }
  };
  const style = config[type];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border font-bold ${style.bg} ${style.border} ${style.text} ${sizeClasses}`}>
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

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    
    mapRef.current = L.map(mapContainerRef.current, {
      center: [43.28, -5.2],
      zoom: 9,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
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

  // Fit map to route bounds
  const fitToRoute = useCallback(() => {
    if (!mapRef.current || !selectedRoute) return;
    const positions = selectedRoute.polyline.map(p => [p.lat, p.lng] as [number, number]);
    if (positions.length > 0) {
      mapRef.current.fitBounds(positions, { padding: [60, 60] });
    }
  }, [selectedRoute]);

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

      polylineRef.current = L.polyline(positions, {
        color: selectedRoute.isLoop ? 'hsl(79, 100%, 36%)' : 'hsl(199, 89%, 48%)',
        weight: 5,
        opacity: 0.9,
        dashArray: selectedRoute.isLoop ? undefined : '12, 8',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(mapRef.current);

      // Add route POI markers
      selectedRoute.poiOrder.forEach((poiId, index) => {
        const poi = getPOIById(poiId);
        if (poi) {
          const marker = L.marker([poi.access.lat, poi.access.lng], {
            icon: createMarkerIcon(index + 1, poi.experienceType)
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
    }
  }, [selectedRoute, viewMode, selectedCategories, selectedTypes, searchQuery, filteredPOIs, fitToRoute]);

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
      mapRef.current.flyTo([poi.access.lat, poi.access.lng], 13, { duration: 0.5 });
    }
  };

  const getCTAForPOI = (poi: POI) => {
    switch (poi.experienceType) {
      case 'AR': return { label: t(texts.viewAR), icon: Smartphone };
      case '360': return { label: t(texts.open360), icon: Camera };
      default: return { label: t(texts.viewDetails), icon: Info };
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
          className="absolute bottom-0 left-0 right-0 md:top-14 md:bottom-0 md:left-auto md:right-4 md:w-[400px] glass-panel rounded-t-2xl md:rounded-2xl md:my-4 max-h-[75vh] md:max-h-none overflow-hidden flex flex-col"
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
                onClick={() => { setSelectedRoute(null); setSelectedPOI(null); }}
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
                    onClick={() => { setViewMode('routes'); setSelectedRoute(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all font-semibold ${
                      viewMode === 'routes' ? 'bg-primary text-primary-foreground' : 'text-foreground/70 hover:text-foreground'
                    }`}
                  >
                    <RouteIcon className="w-4 h-4" />
                    {t(texts.routes)}
                  </button>
                  <button
                    onClick={() => { setViewMode('pois'); setSelectedRoute(null); }}
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

                {/* Type filters (both modes) */}
                <div className="flex flex-wrap gap-2">
                  {(['AR', '360', 'INFO'] as ExperienceType[]).map(type => (
                    <button
                      key={type}
                      onClick={() => toggleType(type)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        selectedTypes.includes(type)
                          ? type === 'AR' ? 'bg-warm/20 border-warm text-warm'
                          : type === '360' ? 'bg-primary/20 border-primary text-primary'
                          : 'bg-accent/20 border-accent text-accent'
                          : 'bg-muted/30 border-border/50 text-foreground/60 hover:bg-muted/50'
                      }`}
                    >
                      {type === 'AR' ? '📱 AR' : type === '360' ? '🔄 360°' : 'ℹ️ INFO'}
                    </button>
                  ))}
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
                        <h3 className="font-serif font-bold text-foreground text-lg group-hover:text-primary transition-colors">
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
                    <h2 className="text-xl font-serif font-bold text-foreground">{t(selectedRoute.title)}</h2>
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
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${
                                  poi.experienceType === 'AR' ? 'bg-warm' : poi.experienceType === '360' ? 'bg-primary' : 'bg-accent'
                                }`}>
                                  {globalIndex + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-foreground truncate">{t(poi.title)}</p>
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
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${
                            poi.experienceType === 'AR' ? 'bg-warm' : poi.experienceType === '360' ? 'bg-primary' : 'bg-accent'
                          }`}>
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{t(poi.title)}</p>
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
                          <h3 className="font-serif font-bold text-foreground truncate group-hover:text-primary transition-colors">
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
        <AnimatePresence>
          {selectedPOI && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="absolute bottom-4 left-4 right-4 md:left-auto md:right-[430px] md:w-80 glass-panel rounded-2xl overflow-hidden z-10 shadow-strong"
            >
              <div 
                className="h-36 bg-cover bg-center relative"
                style={{ backgroundImage: `url(${selectedPOI.media.images[0]})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <button
                  onClick={() => setSelectedPOI(null)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
                <div className="absolute bottom-3 left-3 right-3">
                  <TypeBadge type={selectedPOI.experienceType} size="md" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-serif font-bold text-lg text-foreground mb-2">{t(selectedPOI.title)}</h3>
                
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {selectedPOI.categoryIds.map(catId => {
                    const cat = getCategoryById(catId);
                    return cat ? (
                      <span key={catId} className="category-chip text-[10px]">
                        {t(cat.label)}
                      </span>
                    ) : null;
                  })}
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {t(selectedPOI.shortDescription)}
                </p>

                <button
                  onClick={() => setShowDetailSheet(true)}
                  className="w-full cta-primary flex items-center justify-center gap-2 py-3 text-base"
                >
                  {(() => {
                    const cta = getCTAForPOI(selectedPOI);
                    const Icon = cta.icon;
                    return (
                      <>
                        <Icon className="w-5 h-5" />
                        {cta.label}
                      </>
                    );
                  })()}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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

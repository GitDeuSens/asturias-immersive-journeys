import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import { Route as RouteIcon, MapPin, Search, ChevronUp, ChevronDown, RotateCw, Camera, Info, Smartphone, X } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { CategoryChips } from '@/components/CategoryChips';
import { POIDetailSheet } from '@/components/POIDetailSheet';
import { routes, pois, categories, Route, POI, getPOIById, ExperienceType } from '@/data/mockData';
import { useLanguage } from '@/hooks/useLanguage';
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
};

// Custom marker icons
const createMarkerIcon = (number: number, type: ExperienceType) => {
  const bgColor = type === 'AR' ? '#d97706' : type === '360' ? '#059669' : '#64748b';
  const typeIcon = type === 'AR' ? '📱' : type === '360' ? '🔄' : 'ℹ️';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        position: relative;
        width: 40px;
        height: 40px;
        background: ${bgColor};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      ">
        ${number}
        <span style="
          position: absolute;
          top: -6px;
          right: -6px;
          font-size: 12px;
          background: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">${typeIcon}</span>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
};

const createPOIMarkerIcon = (type: ExperienceType) => {
  const bgColor = type === 'AR' ? '#d97706' : type === '360' ? '#059669' : '#64748b';
  const typeIcon = type === 'AR' ? '📱' : type === '360' ? '🔄' : 'ℹ️';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 36px;
        height: 36px;
        background: ${bgColor};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      ">${typeIcon}</div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
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

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

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
      // Draw route polyline
      const positions = selectedRoute.polyline.map(p => [p.lat, p.lng] as [number, number]);
      polylineRef.current = L.polyline(positions, {
        color: '#059669',
        weight: 4,
        opacity: 0.8,
        dashArray: selectedRoute.isLoop ? undefined : '10, 10'
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
      if (positions.length > 0) {
        mapRef.current.fitBounds(positions, { padding: [50, 50] });
      }
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
  }, [selectedRoute, viewMode, selectedCategories, selectedTypes, searchQuery]);

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

  const handleRouteSelect = (route: Route) => {
    setSelectedRoute(route);
  };

  const handlePOIClick = (poi: POI) => {
    setSelectedPOI(poi);
    if (mapRef.current) {
      mapRef.current.flyTo([poi.access.lat, poi.access.lng], 12, { duration: 0.5 });
    }
  };

  const getCTAForPOI = (poi: POI) => {
    switch (poi.experienceType) {
      case 'AR': return { label: t(texts.viewAR), icon: Smartphone };
      case '360': return { label: t(texts.open360), icon: Camera };
      default: return { label: t(texts.viewDetails), icon: Info };
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <AppHeader />
      
      {/* Map container */}
      <div className="flex-1 relative pt-14">
        <div ref={mapContainerRef} className="h-full w-full z-0" />

        {/* Side Panel (desktop) / Bottom Sheet (mobile) */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: panelExpanded ? 0 : 'calc(100% - 60px)' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="absolute bottom-0 left-0 right-0 md:top-14 md:bottom-0 md:left-auto md:right-4 md:w-96 glass-panel rounded-t-2xl md:rounded-2xl md:my-4 max-h-[70vh] md:max-h-none overflow-hidden flex flex-col"
        >
          {/* Panel header / Handle */}
          <button
            onClick={() => setPanelExpanded(!panelExpanded)}
            className="w-full p-4 flex items-center justify-between border-b border-border/50 md:hidden"
          >
            <span className="font-serif font-bold text-foreground">
              {viewMode === 'routes' ? t(texts.routes) : t(texts.pois)}
            </span>
            {panelExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* View mode toggle */}
            <div className="flex rounded-xl bg-muted/50 p-1">
              <button
                onClick={() => { setViewMode('routes'); setSelectedRoute(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
                  viewMode === 'routes' ? 'bg-primary text-primary-foreground' : 'text-foreground/70 hover:text-foreground'
                }`}
              >
                <RouteIcon className="w-4 h-4" />
                {t(texts.routes)}
              </button>
              <button
                onClick={() => { setViewMode('pois'); setSelectedRoute(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
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
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
              />
            </div>

            {/* Category filters */}
            <CategoryChips
              categories={categories}
              selectedIds={selectedCategories}
              onToggle={toggleCategory}
              className="justify-start"
            />

            {/* Type filters (POIs only) */}
            {viewMode === 'pois' && (
              <div className="flex flex-wrap gap-2">
                {(['AR', '360', 'INFO'] as ExperienceType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                      selectedTypes.includes(type)
                        ? type === 'AR' ? 'bg-accent/30 border-accent text-accent'
                        : type === '360' ? 'bg-primary/30 border-primary text-primary'
                        : 'bg-secondary/50 border-secondary text-secondary-foreground'
                        : 'bg-muted/30 border-border/50 text-foreground/60 hover:bg-muted/50'
                    }`}
                  >
                    {type === 'AR' ? '📱 AR' : type === '360' ? '🔄 360°' : 'ℹ️ INFO'}
                  </button>
                ))}
              </div>
            )}

            {/* Content */}
            {viewMode === 'routes' && !selectedRoute && (
              <div className="space-y-3">
                {filteredRoutes.map(route => (
                  <button
                    key={route.id}
                    onClick={() => handleRouteSelect(route)}
                    className="w-full text-left p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-serif font-bold text-foreground">{t(route.title)}</h3>
                      {route.isLoop && (
                        <span className="route-loop-badge">
                          <RotateCw className="w-3 h-3" />
                          {t(texts.loopRoute)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {route.shortDescription && t(route.shortDescription)}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {route.categoryIds.map(catId => {
                        const cat = categories.find(c => c.id === catId);
                        return cat ? (
                          <span key={catId} className="category-chip text-xs">
                            {t(cat.label)}
                          </span>
                        ) : null;
                      })}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {route.poiOrder.length} {t(texts.stops)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Selected route details */}
            {selectedRoute && (
              <div className="space-y-4">
                <button
                  onClick={() => setSelectedRoute(null)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                  {t(texts.routes)}
                </button>

                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="text-xl font-serif font-bold text-foreground">{t(selectedRoute.title)}</h2>
                    {selectedRoute.isLoop && (
                      <span className="route-loop-badge">
                        <RotateCw className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedRoute.shortDescription && t(selectedRoute.shortDescription)}
                  </p>
                </div>

                {/* Itinerary days or POI list */}
                {selectedRoute.itineraryDays ? (
                  selectedRoute.itineraryDays.map(day => (
                    <div key={day.day} className="space-y-2">
                      <h4 className="text-sm font-semibold text-primary">
                        {t(texts.day)} {day.day}: {t(day.title)}
                      </h4>
                      {day.poiIds.map((poiId) => {
                        const poi = getPOIById(poiId);
                        if (!poi) return null;
                        const globalIndex = selectedRoute.poiOrder.indexOf(poiId);
                        return (
                          <button
                            key={poiId}
                            onClick={() => handlePOIClick(poi)}
                            className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                              poi.experienceType === 'AR' ? 'bg-accent' : poi.experienceType === '360' ? 'bg-primary' : 'bg-secondary'
                            }`}>
                              {globalIndex + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">{t(poi.title)}</p>
                              <p className="text-xs text-muted-foreground">{poi.experienceType}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ))
                ) : (
                  <div className="space-y-2">
                    {selectedRoute.poiOrder.map((poiId, idx) => {
                      const poi = getPOIById(poiId);
                      if (!poi) return null;
                      return (
                        <button
                          key={poiId}
                          onClick={() => handlePOIClick(poi)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                            poi.experienceType === 'AR' ? 'bg-accent' : poi.experienceType === '360' ? 'bg-primary' : 'bg-secondary'
                          }`}>
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{t(poi.title)}</p>
                            <p className="text-xs text-muted-foreground">{poi.experienceType}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* POIs list */}
            {viewMode === 'pois' && (
              <div className="space-y-3">
                {filteredPOIs.map(poi => (
                  <button
                    key={poi.id}
                    onClick={() => handlePOIClick(poi)}
                    className="w-full text-left p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-16 h-16 rounded-lg bg-cover bg-center flex-shrink-0"
                        style={{ backgroundImage: `url(${poi.media.images[0]})` }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-serif font-bold text-foreground truncate">{t(poi.title)}</h3>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            poi.experienceType === 'AR' ? 'badge-ar'
                            : poi.experienceType === '360' ? 'badge-360'
                            : 'badge-info'
                          }`}>
                            {poi.experienceType}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {t(poi.shortDescription)}
                        </p>
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
              className="absolute bottom-4 left-4 right-4 md:left-auto md:right-[420px] md:w-80 glass-panel rounded-2xl overflow-hidden z-10"
            >
              <div 
                className="h-32 bg-cover bg-center"
                style={{ backgroundImage: `url(${selectedPOI.media.images[0]})` }}
              />
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-serif font-bold text-lg text-foreground">{t(selectedPOI.title)}</h3>
                  <button
                    onClick={() => setSelectedPOI(null)}
                    className="p-1 rounded-full hover:bg-muted/50"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedPOI.categoryIds.map(catId => {
                    const cat = categories.find(c => c.id === catId);
                    return cat ? (
                      <span key={catId} className="category-chip text-xs">
                        {t(cat.label)}
                      </span>
                    ) : null;
                  })}
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    selectedPOI.experienceType === 'AR' ? 'badge-ar'
                    : selectedPOI.experienceType === '360' ? 'badge-360'
                    : 'badge-info'
                  }`}>
                    {selectedPOI.experienceType}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
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

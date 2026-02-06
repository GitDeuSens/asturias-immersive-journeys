import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import L from "leaflet";
import { MapPin, Search, ChevronUp, ChevronDown, Maximize2, Locate } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AppHeader } from "@/components/AppHeader";
import { CategoryChips } from "@/components/CategoryChips";
import { RouteCard } from "@/components/RouteCardEnhanced";
import { RouteDetailSheet } from "@/components/RouteDetailSheet";
import { RouteExplorerView } from "@/components/RouteExplorerView";
import { PointDetailSheet } from "@/components/PointDetailSheet";
import { SEOHead } from "@/components/SEOHead";
import { Footer } from "@/components/Footer";
import { immersiveRoutes, ImmersiveRoute, RoutePoint } from "@/data/immersiveRoutes";
import { categories } from "@/data/mockData";
import { useGeolocation } from "@/hooks/useGeolocation";
import {
  createUserPositionMarker,
  createClusterGroup,
  injectMapStyles,
  calculateRouteDistance,
  formatDistance,
  openNavigation,
} from "@/lib/mapUtils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import "leaflet/dist/leaflet.css";

// Create route bubble marker with name label
const createRouteMarkerIcon = (route: ImmersiveRoute, routeName: string) => {
  const borderColor = route.isCircular ? "hsl(79, 100%, 36%)" : "hsl(203, 100%, 32%)";
  const truncatedName = routeName.length > 18 ? routeName.substring(0, 16) + "..." : routeName;

  return L.divIcon({
    className: "route-bubble-marker",
    html: `
      <div style="position: relative; width: 60px; display: flex; flex-direction: column; align-items: center; cursor: pointer;" role="button" aria-label="${routeName}">
        <div style="position: relative; width: 60px; height: 60px;">
          <div style="width: 60px; height: 60px; border-radius: 50%; border: 4px solid ${borderColor}; box-shadow: 0 4px 20px rgba(0,0,0,0.35); overflow: hidden; background: white;">
            <img src="${route.coverImage}" style="width: 100%; height: 100%; object-fit: cover;" alt="${routeName}"/>
          </div>
          <div style="position: absolute; top: -6px; right: -6px; width: 22px; height: 22px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: ${borderColor}; box-shadow: 0 2px 8px rgba(0,0,0,0.25); font-family: 'Montserrat', sans-serif;">${route.maxPoints}</div>
        </div>
        <div style="margin-top: 6px; background: white; color: hsl(0, 0%, 15%); font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 8px; white-space: nowrap; font-family: 'Montserrat', sans-serif; box-shadow: 0 2px 8px rgba(0,0,0,0.2); max-width: 120px; text-align: center; border: 1px solid ${borderColor};">${truncatedName}</div>
      </div>
    `,
    iconSize: [120, 90],
    iconAnchor: [60, 45],
  });
};

// Create point marker for route exploration with name label
const createPointMarkerIcon = (point: RoutePoint, index: number, pointName: string) => {
  const hasAR = !!point.content.arExperience;
  const has360 = !!point.content.tour360;
  const borderColor = hasAR ? "hsl(48, 100%, 50%)" : has360 ? "hsl(79, 100%, 36%)" : "hsl(203, 100%, 32%)";
  const truncatedName = pointName.length > 20 ? pointName.substring(0, 18) + "..." : pointName;

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;" role="button" aria-label="${pointName}">
        <div style="position: relative; width: 48px; height: 48px;">
          <div style="width: 48px; height: 48px; border-radius: 50%; border: 4px solid ${borderColor}; overflow: hidden; background: white; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
            ${point.coverImage ? `<img src="${point.coverImage}" style="width: 100%; height: 100%; object-fit: cover;" alt="${pointName}"/>` : `<div style="width: 100%; height: 100%; background: ${borderColor}20;"></div>`}
          </div>
          <div style="position: absolute; top: -6px; right: -6px; width: 22px; height: 22px; background: ${borderColor}; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: ${hasAR ? "#1a1a1a" : "white"}; box-shadow: 0 2px 8px rgba(0,0,0,0.25); font-family: 'Montserrat', sans-serif;">${index + 1}</div>
        </div>
        <div style="margin-top: 6px; background: white; color: hsl(0, 0%, 15%); font-size: 9px; font-weight: 700; padding: 3px 6px; border-radius: 6px; white-space: nowrap; font-family: 'Montserrat', sans-serif; box-shadow: 0 2px 8px rgba(0,0,0,0.2); max-width: 100px; text-align: center; border: 1px solid ${borderColor};">${truncatedName}</div>
      </div>
    `,
    iconSize: [100, 80],
    iconAnchor: [50, 40],
  });
};

export function RoutesPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as "es" | "en" | "fr";
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<ImmersiveRoute | null>(null);
  const [showRouteDetail, setShowRouteDetail] = useState(false);
  const [exploringRoute, setExploringRoute] = useState<ImmersiveRoute | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<RoutePoint | null>(null);
  const [panelExpanded, setPanelExpanded] = useState(true);

  // Geolocation
  const { latitude, longitude, error: geoError, requestLocation, hasLocation } = useGeolocation();
  const userPosition = hasLocation ? { lat: latitude!, lng: longitude! } : null;

  const ASTURIAS_BOUNDS: L.LatLngBoundsExpression = [
    [42.7, -7.8],
    [43.9, -4.0],
  ];

  // Inject map styles on mount
  useEffect(() => {
    injectMapStyles();
  }, []);

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
      keyboard: true,
      keyboardPanDelta: 80,
    });

    // Make map focusable for keyboard navigation
    mapContainerRef.current.setAttribute("tabindex", "0");
    mapContainerRef.current.setAttribute("role", "application");
    mapContainerRef.current.setAttribute("aria-label", t("a11y.mapInteractive"));

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://osm.org/">OpenStreetMap</a>',
    }).addTo(mapRef.current);

    const zoomControl = L.control.zoom({ position: "bottomright" }).addTo(mapRef.current);
    
    // Move zoom control higher to avoid panel overlap
    const zoomContainer = zoomControl.getContainer();
    if (zoomContainer) {
      zoomContainer.style.marginBottom = "280px";
    }

    // Initialize cluster group
    clusterGroupRef.current = createClusterGroup();
    mapRef.current.addLayer(clusterGroupRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [t]);

  // Update user position marker
  useEffect(() => {
    if (!mapRef.current || !userPosition) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userPosition.lat, userPosition.lng]);
    } else {
      userMarkerRef.current = createUserPositionMarker(userPosition.lat, userPosition.lng);
      userMarkerRef.current.addTo(mapRef.current);
    }
  }, [userPosition]);

  const filteredRoutes = useMemo(() => {
    return immersiveRoutes.filter((route) => {
      const matchesSearch =
        searchQuery === "" ||
        route.title[lang].toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.theme[lang].toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategories.length === 0 || route.categoryIds.some((id) => selectedCategories.includes(id));
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategories, lang]);

  const getPanelOffset = useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      return { left: 60, right: 460, top: 80, bottom: 60 };
    }
    return { left: 40, right: 40, top: 80, bottom: 200 };
  }, []);

  const fitToRoute = useCallback(
    (route: ImmersiveRoute) => {
      if (!mapRef.current) return;
      const positions = route.polyline.map((p) => [p.lat, p.lng] as [number, number]);
      if (positions.length > 0) {
        const offset = getPanelOffset();
        mapRef.current.fitBounds(positions, {
          paddingTopLeft: [offset.left, offset.top],
          paddingBottomRight: [offset.right, offset.bottom],
          maxZoom: 13,
        });
      }
    },
    [getPanelOffset],
  );

  const fitToAllRoutes = useCallback(() => {
    if (!mapRef.current) return;
    const positions = filteredRoutes.map((r) => [r.center.lat, r.center.lng] as [number, number]);
    if (positions.length > 0) {
      const offset = getPanelOffset();
      mapRef.current.fitBounds(positions, {
        paddingTopLeft: [offset.left, offset.top],
        paddingBottomRight: [offset.right, offset.bottom],
        maxZoom: 10,
      });
    }
  }, [filteredRoutes, getPanelOffset]);

  const centerOnUser = useCallback(() => {
    if (!mapRef.current || !userPosition) return;
    mapRef.current.setView([userPosition.lat, userPosition.lng], 12);
  }, [userPosition]);

  // Update markers
  useEffect(() => {
    if (!mapRef.current || !clusterGroupRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    clusterGroupRef.current.clearLayers();

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (exploringRoute) {
      // Show route polyline and point markers
      let positions = exploringRoute.polyline.map((p) => [p.lat, p.lng] as [number, number]);
      if (exploringRoute.isCircular && positions.length > 2) {
        const first = positions[0];
        const last = positions[positions.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) {
          positions = [...positions, first];
        }
      }

      polylineRef.current = L.polyline(positions, {
        color: "hsl(0, 0%, 25%)",
        weight: 5,
        opacity: 0.9,
        dashArray: "12, 8",
        lineCap: "round",
        lineJoin: "round",
      }).addTo(mapRef.current);

      exploringRoute.points.forEach((point, idx) => {
        const pointName = point.title[lang];
        const marker = L.marker([point.location.lat, point.location.lng], {
          icon: createPointMarkerIcon(point, idx, pointName),
        })
          .addTo(mapRef.current!)
          .on("click", () => setSelectedPoint(point));
        markersRef.current.push(marker);
      });

      fitToRoute(exploringRoute);
    } else {
      // Add all routes to cluster group
      filteredRoutes.forEach((route) => {
        const routeName = route.title[lang];
        const marker = L.marker([route.center.lat, route.center.lng], {
          icon: createRouteMarkerIcon(route, routeName),
        }).on("click", () => {
          setSelectedRoute(route);
          setShowRouteDetail(true);
        });

        clusterGroupRef.current!.addLayer(marker);
        markersRef.current.push(marker);
      });
    }
  }, [exploringRoute, filteredRoutes, fitToRoute, lang]);

  // Re-center when filters change
  useEffect(() => {
    if (exploringRoute || !mapRef.current) return;
    const timer = setTimeout(() => fitToAllRoutes(), 100);
    return () => clearTimeout(timer);
  }, [selectedCategories, searchQuery, fitToAllRoutes, exploringRoute]);

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) => (prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]));
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
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead title={t("routes.title")} description={t("routes.title")} />
      <AppHeader variant="light" />

      <main id="main-content" className="flex-1 relative pt-14">
        {/* Map view */}
        <div
          ref={mapContainerRef}
          className="h-full w-full z-0 absolute inset-0"
          aria-label={t("a11y.mapInteractive")}
        />

        {/* Map controls */}
        <div className="absolute top-20 right-4 z-10 flex flex-col gap-2">
          {/* User location button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={userPosition ? centerOnUser : requestLocation}
            className={`shadow-lg ${userPosition ? "bg-accent text-accent-foreground" : ""}`}
            aria-label={userPosition ? t("map.yourLocation") : t("map.enableLocation")}
          >
            <Locate className="w-4 h-4" />
          </Button>

          {/* Fit bounds button */}
          {exploringRoute && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fitToRoute(exploringRoute)}
              className="shadow-lg"
              aria-label={t("routes.fitBounds")}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Side Panel */}
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{
            y: panelExpanded ? 0 : "calc(100% - 60px)",
            opacity: 1,
          }}
          transition={{
            type: "spring",
            damping: 28,
            stiffness: 180,
            mass: 0.9,
            opacity: { duration: 0.25, ease: "easeOut" },
          }}
          className="absolute bottom-0 left-0 right-0 md:top-14 md:bottom-0 md:left-auto md:right-4 md:w-[400px] bg-card/95 backdrop-blur-md border border-border shadow-xl rounded-t-3xl md:rounded-3xl md:my-4 max-h-[75vh] md:max-h-none overflow-hidden flex flex-col z-20"
        >
          {/* Mobile handle */}
          <button
            onClick={() => setPanelExpanded(!panelExpanded)}
            className="w-full p-4 flex items-center justify-end border-b border-border/50 md:hidden"
            aria-expanded={panelExpanded}
            aria-controls="routes-panel"
          >
            <span className="hidden font-serif font-bold text-foreground">
              {exploringRoute ? exploringRoute.title[lang] : t("routes.title")}
            </span>
            {panelExpanded ? (
              <ChevronDown className="w-8 h-8" aria-hidden="true" />
            ) : (
              <ChevronUp className="w-8 h-8" aria-hidden="true" />
            )}
          </button>

          <div id="routes-panel" className="overflow-y-scroll">
            {exploringRoute ? (
              <RouteExplorerView
                route={exploringRoute}
                onBack={handleExitRoute}
                onSelectPoint={setSelectedPoint}
                selectedPoint={selectedPoint}
              />
            ) : (
              <div className="flex-1 p-4 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-serif font-bold text-foreground">{t("routes.title")}</h2>
                  <span className="text-xs text-muted-foreground" aria-live="polite">
                    {filteredRoutes.length} {t("common.results")}
                  </span>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    placeholder={t("routes.search")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                    aria-label={t("routes.search")}
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
                  {filteredRoutes.map((route) => (
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
          </div>
        </motion.div>
      </main>

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
      {selectedPoint && <PointDetailSheet point={selectedPoint} onClose={() => setSelectedPoint(null)} />}
    </div>
  );
}

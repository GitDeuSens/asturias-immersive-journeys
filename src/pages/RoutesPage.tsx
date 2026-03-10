import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import L from "leaflet";
import { MapPin, Search, ChevronUp, ChevronDown, Maximize2, Locate, Loader2 } from "lucide-react";
import { UnifiedSearchBar } from "@/components/UnifiedSearchBar";
import { useTranslation } from "react-i18next";
import { AppHeader } from "@/components/AppHeader";
import { CategoryChips } from "@/components/CategoryChips";
import { RouteCard } from "@/components/RouteCardEnhanced";
import { RouteDetailSheet } from "@/components/RouteDetailSheet";
import { RouteExplorerView } from "@/components/RouteExplorerView";
import { PointDetailSheet } from "@/components/PointDetailSheet";
import { SEOHead } from "@/components/SEOHead";
import { Footer } from "@/components/Footer";
import { RouteCardSkeleton } from "@/components/SkeletonCard";
import type { ImmersiveRoute, RoutePoint } from "@/data/types";
import { useImmersiveRoutes, useDirectusCategories, useDirectusPOIs, directusRouteToImmersive } from "@/hooks/useDirectusData";
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
import { trackRouteStarted } from "@/lib/analytics";
import { BREAKPOINTS, MAP_PANEL_OFFSETS, ASTURIAS_BOUNDS, DEFAULT_COORDINATES } from "@/constants/breakpoints";
import { DIRECTUS_URL } from "@/lib/directus-url";
import "leaflet/dist/leaflet.css";
import { matchesSlug } from "@/lib/slugify";
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
        <div style="margin-top: 6px; background: white; color: hsl(0, 0%, 15%); font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 8px; white-space: nowrap; font-family: 'Montserrat', sans-serif; box-shadow: 0 2px 8px rgba(0,0,0,0.2); text-align: center; border: 1px solid ${borderColor};">${routeName}</div>
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
  const borderColor = hasAR ? "hsl(48, 100%, 50%)" : has360 ? "#C2634C" : "hsl(203, 100%, 32%)";
  const truncatedName = pointName.length > 20 ? pointName.substring(0, 18) + "..." : pointName;
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;" role="button" aria-label="${pointName}">
        <div style="position: relative; width: 48px; height: 48px;">
          <div style="width: 48px; height: 48px; border-radius: 50%; border: 4px solid ${borderColor}; overflow: hidden; background: white; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
            ${point.coverImage ? `<img src="${DIRECTUS_URL}/assets/${point.coverImage}" style="width: 100%; height: 100%; object-fit: cover;" alt="${pointName}"/>` : `<div style="width: 100%; height: 100%; background: ${borderColor}20;"></div>`}
          </div>
          <div style="position: absolute; top: -6px; right: -6px; width: 22px; height: 22px; background: ${borderColor}; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: ${hasAR ? "#1a1a1a" : "white"}; box-shadow: 0 2px 8px rgba(0,0,0,0.25); font-family: 'Montserrat', sans-serif;">${index + 1}</div>
        </div>
        <div style="margin-top: 6px; background: white; color: hsl(0, 0%, 15%); font-size: 9px; font-weight: 700; padding: 3px 6px; border-radius: 6px; white-space: nowrap; font-family: 'Montserrat', sans-serif; box-shadow: 0 2px 8px rgba(0,0,0,0.2); text-align: center; border: 1px solid ${borderColor};">${pointName}</div>
      </div>
    `,
    iconSize: [100, 80],
    iconAnchor: [50, 40],
  });
};

export const RoutesPage = React.memo(function RoutesPage() {
  const { routeCode, id: pointId } = useParams<{ routeCode?: string; id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const lang = i18n.language as "es" | "en" | "fr";
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  // Load routes, categories and ALL POIs from Directus
  const { routes: immersiveRoutes, loading: routesLoading } = useImmersiveRoutes(lang);
  const { categories } = useDirectusCategories(lang);
  const { pois: allDirectusPOIs, loading: poisLoading } = useDirectusPOIs(lang);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<('easy' | 'medium' | 'hard')[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<ImmersiveRoute | null>(null);
  const [showRouteDetail, setShowRouteDetail] = useState(false);
  const [exploringRoute, setExploringRoute] = useState<ImmersiveRoute | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<RoutePoint | null>(null);
  const [panelExpanded, setPanelExpanded] = useState(() => window.innerWidth >= BREAKPOINTS.MOBILE);
  const [viewMode, setViewMode] = useState<'routes' | 'points'>('routes');
  const selectedCategoriesSet = useMemo(() => new Set(selectedCategories), [selectedCategories]);

  const [mapReady, setMapReady] = useState(false);
  const routeCodeHandledRef = useRef(false);

  // Sync URL → state on initial load and when URL params change
  useEffect(() => {
    if (!routeCode || routeCodeHandledRef.current || immersiveRoutes.length === 0) return;
    const matched = immersiveRoutes.find(route => {
      const title = route.title[lang] || route.title.es || '';
      return matchesSlug(routeCode, title, route.id);
    });
    if (matched) {
      setSelectedRoute(matched);
      setExploringRoute(matched);
      setShowRouteDetail(false);
      routeCodeHandledRef.current = true;

      // If a point ID is in the URL, find and select the point
      if (pointId) {
        const point = matched.points.find(p => p.id === pointId);
        if (point) {
          setExploringRoute(matched);
          setShowRouteDetail(false);
          setSelectedPoint(point);
        }
      }
    }
  }, [routeCode, pointId, immersiveRoutes, lang]);

  // UX2: Handle browser back button — close sheets instead of leaving page
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/routes' || path === '/routes/') {
        setSelectedPoint(null);
        setShowRouteDetail(false);
        setExploringRoute(null);
        setSelectedRoute(null);
      } else if (path.match(/^\/routes\/[^/]+$/) && !path.match(/^\/routes\/[^/]+\/.+$/)) {
        // At route level — close point if open
        setSelectedPoint(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // UX6: Escape key closes sheets
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedPoint) {
          setSelectedPoint(null);
          if (exploringRoute) {
            navigate(`/routes/${exploringRoute.id}`, { replace: true });
          } else {
            navigate('/routes', { replace: true });
          }
        } else if (showRouteDetail) {
          setShowRouteDetail(false);
          setSelectedRoute(null);
          navigate('/routes', { replace: true });
        } else if (exploringRoute) {
          handleExitRoute();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPoint, showRouteDetail, exploringRoute, navigate]);

  // Geolocation
  const { latitude, longitude, error: geoError, requestLocation, hasLocation, loading: geoLoading } = useGeolocation();
  const userPosition = hasLocation && latitude != null && longitude != null 
    ? { lat: latitude, lng: longitude } 
    : null;

  // Use constants instead of magic numbers

  // Inject map styles on mount
  useEffect(() => {
    injectMapStyles();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    mapRef.current = L.map(mapContainerRef.current, {
      center: [DEFAULT_COORDINATES.ASTURIAS_CENTER.lat, DEFAULT_COORDINATES.ASTURIAS_CENTER.lng],
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

    L.control.zoom({ position: "bottomright" }).addTo(mapRef.current);

    // Initialize cluster group
    clusterGroupRef.current = createClusterGroup();
    mapRef.current.addLayer(clusterGroupRef.current);
    setMapReady(true);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setMapReady(false);
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
    // Early return for empty routes
    if (!immersiveRoutes.length) return [];
    
    // Pre-compute search query for performance
    const searchLower = searchQuery.toLowerCase();
    
    return immersiveRoutes.filter((route) => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        route.title[lang]?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(searchLower) || 
        route.title[lang]?.toLowerCase().includes(searchLower) ||
        route.theme[lang]?.toLowerCase().includes(searchLower);
      
      // Category filter - use Set for O(1) lookup
      const matchesCategory = selectedCategories.length === 0 || 
        selectedCategoriesSet.has(route.categoryIds?.[0] || '');
      
      // Difficulty filter
      const matchesDifficulty = selectedDifficulties.length === 0 ||
        (route.difficulty && selectedDifficulties.includes(route.difficulty));
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [immersiveRoutes, searchQuery, selectedCategories, selectedDifficulties, lang]);

  // UX7: Sort inside useMemo to avoid mutation on every render
  const sortedFilteredRoutes = useMemo(() => {
    return [...filteredRoutes].sort((a: any, b: any) => {
      const aNum = parseInt(a.id.split('-')[1]) || 0;
      const bNum = parseInt(b.id.split('-')[1]) || 0;
      return aNum - bNum;
    });
  }, [filteredRoutes]);

  // All points for "Ubicaciones" view — includes ALL POIs from DB, not just route-attached ones
  const allPoints = useMemo(() => {
    if (viewMode !== 'points') {
      // In routes mode, just return route points for backwards compat
      return filteredRoutes.flatMap((route) =>
        route.points.map((point) => ({ ...point, routeTitle: route.title, routeId: route.id }))
      );
    }
    
    // In Ubicaciones mode: load ALL POIs from the dedicated endpoint
    // Build a map of route-attached POI IDs to their route info
    const routePointIds = new Set<string>();
    const routeInfoByPointId = new Map<string, { routeTitle: any; routeId: string }>();
    for (const route of immersiveRoutes) {
      for (const pt of route.points) {
        routePointIds.add(pt.poiUUID || pt.id);
        routeInfoByPointId.set(pt.poiUUID || pt.id, { routeTitle: route.title, routeId: route.id });
      }
    }
    
    // Transform all Directus POIs into RoutePoint format
    const points = allDirectusPOIs.map((poi: any, idx: number) => {
      const lat = Number(poi.lat) || 0;
      const lng = Number(poi.lng) || 0;
      const routeInfo = routeInfoByPointId.get(poi.id);
      
      // Check for route-attached points — reuse the already-transformed version
      const routeMatch = immersiveRoutes.find(r => r.points.some(p => (p.poiUUID || p.id) === poi.id));
      if (routeMatch) {
        const existingPoint = routeMatch.points.find(p => (p.poiUUID || p.id) === poi.id);
        if (existingPoint) {
          return { ...existingPoint, routeTitle: routeMatch.title, routeId: routeMatch.id };
        }
      }
      
      // Build content for standalone POIs
      const content: any = {};
      const arScene = typeof poi.ar_scene_id === 'object' && poi.ar_scene_id ? poi.ar_scene_id : null;
      if (arScene) {
        const arSlug = arScene.slug || '';
        const buildPath = arScene.build_path || '';
        const baseUrl = window.location.origin;
        const arBuildUrl = buildPath ? `${DIRECTUS_URL}/builds${buildPath}` : (arSlug ? `${DIRECTUS_URL}/builds/ar-builds/${arSlug}/` : undefined);
        content.arExperience = { launchUrl: arSlug ? `${baseUrl}/ar/${arSlug}` : '', qrValue: arSlug ? `${baseUrl}/ar/${arSlug}` : '', iframe3dUrl: arBuildUrl, arSlug, arSceneId: arScene.id, glb_model: arScene.glb_model || undefined, glb_scale: arScene.glb_scale, glb_rotation_y: arScene.glb_rotation_y, scene_mode: arScene.scene_mode || 'build' };
      }
      const tour360 = typeof poi.tour_360_id === 'object' && poi.tour_360_id ? poi.tour_360_id : null;
      if (tour360) {
        const tourBuildPath = tour360.build_path || '';
        const tourSlug = tour360.slug || '';
        // Use relative path for local builds to avoid redirect on mobile
        const tourBuildUrl = tourBuildPath
          ? (tourBuildPath.startsWith('/tours-builds/') ? tourBuildPath : `${DIRECTUS_URL}/builds${tourBuildPath}`)
          : (tourSlug ? `/tours-builds/${tourSlug}/` : '');
        content.tour360 = { iframe360Url: tourBuildUrl, allowFullscreen: true };
      }
      if (poi.cover_image) content.image = { url: `${DIRECTUS_URL}/assets/${poi.cover_image}` };
      
      return {
        id: poi.slug || poi.id || `point-${idx}`,
        poiUUID: poi.id,
        order: poi.order ?? idx + 1,
        title: poi.title || { es: '', en: '', fr: '' },
        shortDescription: poi.short_description || { es: '', en: '', fr: '' },
        location: { lat, lng, address: poi.address },
        coverImage: poi.cover_image || '',
        content,
        gallery: poi.gallery,
        tags: poi.tags || [],
        routeTitle: routeInfo?.routeTitle || { es: '', en: '', fr: '' },
        routeId: routeInfo?.routeId || '',
      };
    });
    
    // Apply search filter
    const searchLower = searchQuery.toLowerCase();
    return searchQuery === '' ? points : points.filter((p: any) => {
      const title = p.title[lang] || p.title.es || '';
      return title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(searchLower) ||
             title.toLowerCase().includes(searchLower);
    });
  }, [viewMode, filteredRoutes, immersiveRoutes, allDirectusPOIs, searchQuery, lang]);


  const getPanelOffset = useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth >= BREAKPOINTS.MOBILE) {
      return MAP_PANEL_OFFSETS.DESKTOP;
    }
    return MAP_PANEL_OFFSETS.MOBILE;
  }, [BREAKPOINTS.MOBILE, MAP_PANEL_OFFSETS.DESKTOP, MAP_PANEL_OFFSETS.MOBILE]);

  const fitToRoute = useCallback(
    (route: ImmersiveRoute) => {
      if (!mapRef.current) return;
      // Collect all valid positions: polyline + point locations
      const polyPositions = route.polyline.map((p) => [p.lat, p.lng] as [number, number]);
      const pointPositions = route.points
        .filter((p) => p.location.lat !== 0 && p.location.lng !== 0)
        .map((p) => [p.location.lat, p.location.lng] as [number, number]);
      const allPositions = polyPositions.length > 0 ? polyPositions : pointPositions;
      if (allPositions.length > 0) {
        const offset = getPanelOffset();
        mapRef.current.fitBounds(allPositions, {
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
    const positions = filteredRoutes.filter(r => r.hasValidCenter).map((r) => [r.center.lat, r.center.lng] as [number, number]);
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

  // Update markers — depends on mapReady so it re-runs after map initializes
  useEffect(() => {
    if (!mapReady || !mapRef.current || !clusterGroupRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    clusterGroupRef.current.clearLayers();

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (exploringRoute) {
      
      // Show route polyline only if we have at least 2 valid points
      let positions = exploringRoute.polyline.map((p) => [p.lat, p.lng] as [number, number]);
      if (positions.length >= 2) {
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
      }

      // Only place markers for points with valid coordinates
      exploringRoute.points.forEach((point, idx) => {
        if (point.location.lat === 0 && point.location.lng === 0) return;
        const t = point.title as any;
        const pointName = typeof t === 'string' ? t : (t?.[lang] || t?.es || '');
        const marker = L.marker([point.location.lat, point.location.lng], {
          icon: createPointMarkerIcon(point, idx, pointName),
        })
          .addTo(mapRef.current!)
          .on("click", () => handleSelectPoint(point));
        markersRef.current.push(marker);
      });

      fitToRoute(exploringRoute);
    } else if (viewMode === 'points') {
      // Show individual point markers in Ubicaciones mode
      allPoints.forEach((point) => {
        if (point.location.lat === 0 && point.location.lng === 0) return;
        const ptTitle = point.title as any;
        const pointName = typeof ptTitle === 'string' ? ptTitle : (ptTitle?.[lang] || ptTitle?.es || '');
        const idx = allPoints.indexOf(point);
        const marker = L.marker([point.location.lat, point.location.lng], {
          icon: createPointMarkerIcon(point, idx, pointName),
        }).on("click", () => handleSelectPoint(point));

        clusterGroupRef.current?.addLayer(marker);
        markersRef.current.push(marker);
      });
    } else {
      // Add all routes to cluster group — skip routes without real coordinates
      filteredRoutes.forEach((route) => {
        if (!route.hasValidCenter) return; // Don't place marker at default Oviedo fallback
        const routeName = route.title[lang] as any;
        const marker = L.marker([route.center.lat, route.center.lng], {
          icon: createRouteMarkerIcon(route, routeName),
        }).on("click", () => {
          setSelectedRoute(route);
          setExploringRoute(route);
          setShowRouteDetail(false);
          navigate(`/routes/${route.id}`, { replace: false });
        });

        clusterGroupRef.current?.addLayer(marker);
        markersRef.current.push(marker);
      });
    }
  }, [mapReady, exploringRoute, filteredRoutes, fitToRoute, lang, viewMode, allPoints]);

  // Re-center when filters change
  useEffect(() => {
    if (exploringRoute || !mapRef.current) return;
    const timer = setTimeout(() => fitToAllRoutes(), 100);
    return () => clearTimeout(timer);
  }, [selectedCategories, searchQuery, fitToAllRoutes, exploringRoute]);

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      if (polylineRef.current) {
        polylineRef.current.remove();
        polylineRef.current = null;
      }
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    };
  }, []);

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) => (prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]));
  };

  const toggleDifficulty = (d: 'easy' | 'medium' | 'hard') => {
    setSelectedDifficulties((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  };

  const handleEnterRoute = (route: ImmersiveRoute) => {
    const routeName = typeof route.title === 'string' ? route.title : route.title[i18n.language as keyof typeof route.title] || route.title.es;
    trackRouteStarted(route.id, routeName);
    
    setShowRouteDetail(false);
    setExploringRoute(route);
    setSelectedPoint(null);
    navigate(`/routes/${route.id}`, { replace: false });
  };

  const handleExitRoute = () => {
    setExploringRoute(null);
    setSelectedPoint(null);
    navigate('/routes', { replace: false });
    setTimeout(() => fitToAllRoutes(), 100);
  };

  // Helper: update URL when selecting a point
  const handleSelectPoint = (point: RoutePoint) => {
    setSelectedPoint(null);
    setTimeout(() => {
      setSelectedPoint(point);
      const routeId = exploringRoute?.id || selectedRoute?.id;
      if (routeId) {
        navigate(`/routes/${routeId}/${point.id}`, { replace: false });
      }
    }, 0);
  };

  const handleClosePoint = () => {
    setSelectedPoint(null);
    const routeId = exploringRoute?.id || selectedRoute?.id;
    if (routeId) {
      navigate(`/routes/${routeId}`, { replace: true });
    } else {
      navigate('/routes', { replace: true });
    }
  };

  const handleCloseRouteDetail = () => {
    setShowRouteDetail(false);
    setSelectedRoute(null);
   // navigate('/routes', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead title={t("routes.title")} description={t("routes.title")} />
      <AppHeader routes={filteredRoutes} markerRoute={markersRef} mapReference={mapRef} variant="light" />

      <main id="main-content" className="flex-1 relative pt-14 md:pt-[122px]">
        {/* Map view */}
        <div
          ref={mapContainerRef}
          className="h-full w-full z-0 absolute inset-0"
          aria-label={t("a11y.mapInteractive")}
        />

        {/* Map controls */}
        <div className="hidden md:flex absolute top-20 right-4 z-10 flex-col gap-2">
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
      className="fixed right-0 bottom-0 w-full md:w-[420px] lg:w-[460px] md:max-w-lg bg-background z-[1] md:z-[55] shadow-2xl flex flex-col overflow-hidden top-14 md:top-[122px]"
        >
          {/* Mobile handle */}
          <button
            onClick={() => setPanelExpanded(!panelExpanded)}
            className="w-full p-3 flex items-center justify-between border-b border-border/50 md:hidden"
            aria-expanded={panelExpanded}
            aria-controls="routes-panel"
          >
            <span className="text-sm font-semibold text-foreground">
              {viewMode === 'points' ? t("routes.seeAllPoints") : t("routes.seeAllRoutes")}
            </span>
            {panelExpanded ? (
              <ChevronDown className="w-6 h-6" aria-hidden="true" />
            ) : (
              <ChevronUp className="w-6 h-6" aria-hidden="true" />
            )}
          </button>

          <div id="routes-panel" className="overflow-y-scroll">
            <AnimatePresence mode="wait">
            {exploringRoute ? (
              <motion.div
                key={`explorer-${exploringRoute.id}`}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
              <RouteExplorerView
                route={exploringRoute}
                onBack={handleExitRoute}
                onSelectPoint={handleSelectPoint}
                selectedPoint={selectedPoint}
              />
              </motion.div>
            ) : (
              <motion.div
                key="routes-list"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                    {viewMode === 'points' ? t("routes.pointsTitle") : t("routes.title")}
                  </h2>
                  <span className="text-xs text-muted-foreground" aria-live="polite">
                    {viewMode === 'routes' ? sortedFilteredRoutes.length : allPoints.length} {t("common.results")}
                  </span>
                </div>

                {/* Unified Search + Filters */}
                <UnifiedSearchBar
                  query={searchQuery}
                  onQueryChange={setSearchQuery}
                  placeholder={viewMode === 'points' ? t("routes.searchPoints") : t("routes.search")}
                  categories={categories}
                  selectedCategoryIds={selectedCategories}
                  onToggleCategory={toggleCategory}
                  selectedDifficulties={selectedDifficulties}
                  onToggleDifficulty={toggleDifficulty}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  resultCount={viewMode === 'routes' ? sortedFilteredRoutes.length : allPoints.length}
                  extraAction={
                    <button
                      onClick={async () => {
                        if (hasLocation) {
                          centerOnUser();
                        } else {
                          const success = await requestLocation();
                          if (success && mapRef.current) {
                            setTimeout(() => centerOnUser(), 500);
                          }
                        }
                      }}
                      className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                        hasLocation
                          ? 'bg-primary/10 text-primary border-primary/30'
                          : 'bg-muted/40 text-foreground border-border/40 hover:bg-muted/60'
                      }`}
                      disabled={geoLoading}
                    >
                      {geoLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Locate className="w-3.5 h-3.5" />
                      )}
                      <span>{hasLocation ? t("routes.located") : t("routes.locateMe")}</span>
                    </button>
                  }
                />

                {/* Content list */}
                <div className="space-y-3 mt-5">
                  {routesLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <RouteCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : (
                  <AnimatePresence mode="wait">
                  {viewMode === 'routes' ? (
                    <motion.div key="routes-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-3">
                    {sortedFilteredRoutes.map((route, i) => (
                      <motion.div key={route.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: i * 0.04 }}>
                      <RouteCard
                        route={route}
                        onClick={() => {
                          setSelectedRoute(route);
                          setExploringRoute(route);
                          navigate(`/routes/${route.id}`, { replace: false });
                        }}
                      />
                      </motion.div>
                    ))}
                    </motion.div>
                  ) : (
                    <motion.div key="points-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-3">
                    {allPoints.map((point, i) => {
                      const imgSrc = point.coverImage
                        ? `${DIRECTUS_URL}/assets/${point.coverImage}`
                        : '/placeholder-route.jpg';
                      const pointTitle = point.title[lang] || point.title.es || '';
                      const pointDesc = point.shortDescription[lang] || point.shortDescription.es || '';
                      const routeName = point.routeTitle[lang] || point.routeTitle.es || '';
                      return (
                        <motion.button
                          key={point.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, delay: i * 0.04 }}
                          onClick={() => handleSelectPoint(point)}
                          className="w-full text-left rounded-2xl bg-card/50 border border-border/50 hover:border-primary/50 hover:bg-card/80 transition-all duration-200 group overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        >
                          <div className="flex gap-3 p-3">
                            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                              <img src={imgSrc} alt={pointTitle} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                {pointTitle}
                              </h3>
                              <p className="text-xs text-primary/80 font-medium mt-0.5 line-clamp-1">{routeName}</p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{pointDesc}</p>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                    </motion.div>
                  )}
                  </AnimatePresence>
                  )}
                </div>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>

      {/* Route Detail Sheet */}
      <AnimatePresence>
      {showRouteDetail && selectedRoute && (
        <RouteDetailSheet
          route={selectedRoute}
          onClose={handleCloseRouteDetail}
          onEnterRoute={handleEnterRoute}
          onSelectPoint={handleSelectPoint}
        />
      )}
      </AnimatePresence>

      {/* Point Detail Sheet */}
      <AnimatePresence>
      {selectedPoint && (
        <PointDetailSheet
          key={selectedPoint.id}
          point={selectedPoint}
          onClose={handleClosePoint}
          routeTitle={exploringRoute ? (typeof exploringRoute.title === 'string' ? exploringRoute.title : (exploringRoute.title as any)[lang] || (exploringRoute.title as any).es || '') : selectedRoute ? (typeof selectedRoute.title === 'string' ? selectedRoute.title : (selectedRoute.title as any)[lang] || (selectedRoute.title as any).es || '') : undefined}
          onBackToRoute={exploringRoute ? handleClosePoint : undefined}
        />
      )}
      </AnimatePresence>
    </div>
  );
});

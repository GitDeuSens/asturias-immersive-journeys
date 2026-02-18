import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { RotateCcw, House, Facebook, Twitter } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SettingsDropdown } from "@/components/SettingsDropdown";
import { useTheme } from "@/hooks/useTheme";
import { ImmersiveRoute, RoutePoint } from "@/data/types";
import { useRef } from "react";
import L from "leaflet";
interface AppHeaderProps {
  showRestart?: boolean;
  variant?: "light" | "dark";
  routes?: any
  markerRoute?: any
  mapReference?: any
}

export function AppHeader({ showRestart = true, variant = "light", routes = {}, markerRoute, mapReference }: AppHeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const pointsInteresed = [];
  /*markerRoute.current.forEach((marker) => marker.remove());
  markerRoute.current = [];
  console.log('marcador de rutas ', markerRoute);*/
  const markersRef = useRef<L.Marker[]>([]);
  const handleRestart = () => {
    localStorage.removeItem("asturias-mode");
    navigate("/");
  };

  // Create point marker for route exploration with name label
/*  const createPointMarkerIcon = (point: RoutePoint, index: number, pointName: string) => {
    const hasAR = !!point.content.arExperience;
    const has360 = !!point.content.tour360;
    const borderColor = hasAR ? "hsl(48, 100%, 50%)" : has360 ? "#C2634C" : "hsl(203, 100%, 32%)";
    // const truncatedName = pointName.length > 20 ? pointName.substring(0, 18) + "..." : pointName;
    console.log(' dime el punto ', point);
    return L.divIcon({
      className: "custom-marker",
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;" role="button" aria-label="${pointName}">
          <div style="position: relative; width: 48px; height: 48px;">
            <div style="width: 48px; height: 48px; border-radius: 50%; border: 4px solid ${borderColor}; overflow: hidden; background: white; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
              ${point.coverImage ? `<img src="https://back.asturias.digitalmetaverso.com/assets/${point.coverImage}" style="width: 100%; height: 100%; object-fit: cover;" alt="${pointName}"/>` : `<div style="width: 100%; height: 100%; background: ${borderColor}20;"></div>`}
            </div>
            <div style="position: absolute; top: -6px; right: -6px; width: 22px; height: 22px; background: ${borderColor}; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: ${hasAR ? "#1a1a1a" : "white"}; box-shadow: 0 2px 8px rgba(0,0,0,0.25); font-family: 'Montserrat', sans-serif;">${index + 1}</div>
          </div>
          <div style="margin-top: 6px; background: white; color: hsl(0, 0%, 15%); font-size: 9px; font-weight: 700; padding: 3px 6px; border-radius: 6px; white-space: nowrap; font-family: 'Montserrat', sans-serif; box-shadow: 0 2px 8px rgba(0,0,0,0.2); text-align: center; border: 1px solid ${borderColor};">${pointName}</div>
        </div>
      `,
      iconSize: [100, 80],
      iconAnchor: [50, 40],
    });
  };*/


  /*const filterMap = () => {

    routes.map((r) => {
      if (r.points.length > 0) {
        r.points.map((p, index) => {
          const marker = L.marker([p.location.lat, p.location.lng], {
            icon: createPointMarkerIcon(p, index, p.slug),
          })
          .addTo(mapReference.current!)
          //.on("click", () => setSelectedPoint(p));
          markersRef.current.push(marker);
          pointsInteresed.push(p);
          markerRoute.current = markersRef.current;
        })
      }
    });
    console.log(' puntos filtradros ', markersRef, markerRoute);
  }*/

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed -top-3 left-0 right-0 z-50"
    >
      {/* Green accent bar */}
      <div className="h-2 bg-primary" />

      {/* Social bar */}
      <div className="bg-muted border-b border-border">
        <div className="container mx-auto px-4 py-1.5 flex justify-end gap-2">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-muted-foreground/60 hover:bg-primary flex items-center justify-center transition-colors"
            aria-label="Facebook"
          >
            <Facebook className="w-4 h-4 text-white" />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-muted-foreground/60 hover:bg-primary flex items-center justify-center transition-colors"
            aria-label="X (Twitter)"
          >
            <Twitter className="w-4 h-4 text-white" />
          </a>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-background border-b-4 border-primary">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo section */}
          <Link to="/experience" className="flex items-center gap-4 group" aria-label="Asturias Inmersivo - Inicio">
            {/* Coat of arms style icon */}

            {/* Brand text */}
            <div className="flex items-center gap-3">
              <div>
                <span className="font-bold text-xl text-foreground block leading-tight">Asturias</span>
                <span className="text-primary font-semibold text-xs uppercase tracking-widest">Inmersivo</span>
              </div>
              <div className="hidden sm:block h-8 w-px bg-border" />
              <span className="hidden sm:block text-muted-foreground text-sm max-w-[180px] leading-tight">
                {t("common.tagline", "Experiencias turísticas inmersivas")}
              </span>
            </div>
          </Link>

          {/* Right side controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
               // filterMap();
              }}
              style={{ fontSize: '16px', height: '50px' }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all duration-200 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg"
              aria-label={t("common.home")}
            >
              <span className="hidden sm:inline">Ver puntos de interés</span>
            </button>
            {/* Settings dropdown (language + theme) */}
            <SettingsDropdown variant="light" />

            {/* Restart button - styled as primary button */}
            {showRestart && (
              <button
                onClick={handleRestart}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all duration-200 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg"
                aria-label={t("common.home")}
              >
                <House className="w-7 h-7 text-primary-foreground" aria-hidden="true" />
                <span className="hidden sm:inline">{t("common.home")}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}

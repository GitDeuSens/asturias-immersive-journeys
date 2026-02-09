// ============ NEEDLE AR VIEWER COMPONENT ============
// WebXR-compatible AR viewer using Needle Engine

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Camera, AlertTriangle, RefreshCw, Smartphone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackEvent, trackARStarted, trackARCompleted, trackARError } from '@/lib/analytics';
import type { ARScene, Language } from '@/lib/types';

interface NeedleARViewerProps {
  scene: ARScene;
  locale?: Language;
  onStart?: () => void;
  onError?: (error: string) => void;
}

const texts = {
  startAR: { es: 'Iniciar Experiencia AR', en: 'Start AR Experience', fr: 'Démarrer l\'expérience AR' },
  notSupported: { es: 'AR no disponible', en: 'AR not available', fr: 'AR non disponible' },
  notSupportedDesc: { 
    es: 'Tu dispositivo no soporta experiencias de Realidad Aumentada.', 
    en: 'Your device does not support Augmented Reality experiences.',
    fr: 'Votre appareil ne prend pas en charge les expériences de Réalité Augmentée.'
  },
  requirements: {
    es: 'Para disfrutar de esta experiencia, necesitas:',
    en: 'To enjoy this experience, you need:',
    fr: 'Pour profiter de cette expérience, vous avez besoin de:'
  },
  reqMobile: {
    es: 'Un dispositivo móvil con ARCore (Android) o ARKit (iOS)',
    en: 'A mobile device with ARCore (Android) or ARKit (iOS)',
    fr: 'Un appareil mobile avec ARCore (Android) ou ARKit (iOS)'
  },
  reqBrowser: {
    es: 'Un navegador compatible (Chrome, Safari)',
    en: 'A compatible browser (Chrome, Safari)',
    fr: 'Un navigateur compatible (Chrome, Safari)'
  },
  preview: { es: 'Vista previa', en: 'Preview', fr: 'Aperçu' },
  checking: { es: 'Comprobando compatibilidad...', en: 'Checking compatibility...', fr: 'Vérification de la compatibilité...' },
  lighting: { es: 'Asegúrate de estar en un lugar con buena iluminación', en: 'Make sure you are in a well-lit area', fr: 'Assurez-vous d\'être dans un endroit bien éclairé' },
  loading: { es: 'Cargando experiencia AR...', en: 'Loading AR experience...', fr: 'Chargement de l\'expérience AR...' },
  goToLocation: { es: 'Ir a la ubicación', en: 'Go to location', fr: 'Aller à l\'emplacement' },
  geoRequired: {
    es: 'Esta experiencia requiere estar en la ubicación física',
    en: 'This experience requires being at the physical location',
    fr: 'Cette expérience nécessite d\'être à l\'emplacement physique'
  },
};

export function NeedleARViewer({ 
  scene, 
  locale = 'es',
  onStart,
  onError 
}: NeedleARViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [arSupported, setARSupported] = useState<boolean | null>(null);
  const [arActive, setARActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const startTimeRef = useRef<number>(0);

  // Check WebXR AR support
  useEffect(() => {
    const checkARSupport = async () => {
      if ('xr' in navigator) {
        try {
          const supported = await (navigator as any).xr?.isSessionSupported('immersive-ar');
          setARSupported(supported || false);
        } catch {
          setARSupported(false);
        }
      } else {
        setARSupported(false);
      }
    };

    checkARSupport();
  }, []);

  const launchAR = useCallback(async () => {
    if (!containerRef.current) return;

    setIsLoading(true);
    startTimeRef.current = Date.now();

    try {
      // Track AR start
      trackARStarted(scene.id, scene.needle_type, scene.title[locale] || scene.title.es);
      onStart?.();

      setARActive(true);

      // Create iframe for Needle Engine scene
      const iframe = document.createElement('iframe');
      iframe.src = scene.needle_scene_url;
      iframe.style.width = '100%';
      iframe.style.height = '100vh';
      iframe.style.border = 'none';
      iframe.style.position = 'fixed';
      iframe.style.top = '0';
      iframe.style.left = '0';
      iframe.style.zIndex = '9999';
      iframe.allow = 'camera; xr-spatial-tracking; gyroscope; accelerometer; magnetometer';
      iframe.allowFullscreen = true;

      // Add close button
      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '✕';
      closeBtn.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: rgba(0,0,0,0.7);
        color: white;
        border: none;
        font-size: 24px;
        cursor: pointer;
      `;
      closeBtn.onclick = () => {
        iframe.remove();
        closeBtn.remove();
        setARActive(false);
        setIsLoading(false);

        // Track AR completion with time spent
        const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
        if (timeSpent > 2) { // Only track if meaningful interaction
          trackARCompleted(scene.id, timeSpent);
        }
      };

      document.body.appendChild(iframe);
      document.body.appendChild(closeBtn);

      iframe.onload = () => {
        setIsLoading(false);
      };

      iframe.onerror = () => {
        iframe.remove();
        closeBtn.remove();
        setARActive(false);
        setIsLoading(false);
        const errorMsg = 'Failed to load AR scene';
        trackARError(scene.id, errorMsg);
        onError?.(errorMsg);
      };
    } catch (error) {
      setIsLoading(false);
      setARActive(false);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      trackARError(scene.id, errorMsg);
      onError?.(errorMsg);
    }
  }, [scene, locale, onStart, onError]);

  const openNavigation = useCallback(() => {
    if (!scene.location) return;
    const { lat, lng } = scene.location;
    
    // Try Google Maps first, fallback to Apple Maps
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(googleMapsUrl, '_blank');
    
    trackEvent('ar_navigation_opened', { ar_id: scene.id });
  }, [scene]);

  // Loading state
  if (arSupported === null) {
    return (
      <div className="flex items-center justify-center p-8 bg-muted/50 rounded-xl">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>{texts.checking[locale]}</span>
        </div>
      </div>
    );
  }

  // AR not supported
  if (arSupported === false) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-card border border-border rounded-xl"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-destructive/10 rounded-full">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-2">
              {texts.notSupported[locale]}
            </h3>
            <p className="text-muted-foreground mb-4">
              {texts.notSupportedDesc[locale]}
            </p>
            <p className="text-sm text-muted-foreground mb-3">
              {texts.requirements[locale]}
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                {texts.reqMobile[locale]}
              </li>
              <li className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                {texts.reqBrowser[locale]}
              </li>
            </ul>

            {/* Show preview instead */}
            <div className="mt-6">
              <p className="text-sm font-medium text-foreground mb-2">
                {texts.preview[locale]}:
              </p>
              {scene.preview_video ? (
                <video
                  src={scene.preview_video}
                  controls
                  className="w-full rounded-lg"
                  poster={scene.preview_image}
                />
              ) : (
                <img
                  src={scene.preview_image}
                  alt={scene.title[locale] || scene.title.es}
                  className="w-full rounded-lg"
                />
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Geo AR - need to be at location
  if (scene.needle_type === 'geo' && scene.location) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-card border border-border rounded-xl"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-primary/10 rounded-full">
            <MapPin className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              {texts.geoRequired[locale]}
            </h3>
            <p className="text-sm text-muted-foreground">
              Lat: {scene.location.lat.toFixed(4)}, Lng: {scene.location.lng.toFixed(4)}
            </p>
          </div>
        </div>

        <Button onClick={openNavigation} className="w-full mb-4">
          <MapPin className="w-4 h-4 mr-2" />
          {texts.goToLocation[locale]}
        </Button>

        <Button 
          onClick={launchAR} 
          variant="outline" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              {texts.loading[locale]}
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 mr-2" />
              {texts.startAR[locale]}
            </>
          )}
        </Button>
      </motion.div>
    );
  }

  // Ready to launch AR
  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {!arActive && (
        <div className="p-6 bg-card border border-border rounded-xl text-center">
          <div className="mb-6">
            <img
              src={scene.preview_image}
              alt={scene.title[locale] || scene.title.es}
              className="w-full max-h-48 object-cover rounded-lg mb-4"
            />
            <p className="text-sm text-muted-foreground">
              {texts.lighting[locale]}
            </p>
          </div>

          <Button 
            onClick={launchAR}
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                {texts.loading[locale]}
              </>
            ) : (
              <>
                <Camera className="w-5 h-5 mr-2" />
                {texts.startAR[locale]}
              </>
            )}
          </Button>

          {/* Image tracking marker download */}
          {scene.needle_type === 'image-tracking' && scene.tracking_image_url && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">
                {locale === 'es' ? 'Necesitarás este marcador:' : 
                 locale === 'en' ? 'You will need this marker:' : 
                 'Vous aurez besoin de ce marqueur:'}
              </p>
              <a
                href={scene.tracking_image_url}
                download="marcador-ar.png"
                className="inline-flex items-center text-sm text-primary hover:underline"
              >
                ⬇️ {locale === 'es' ? 'Descargar marcador' : 
                    locale === 'en' ? 'Download marker' : 
                    'Télécharger le marqueur'}
              </a>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default NeedleARViewer;

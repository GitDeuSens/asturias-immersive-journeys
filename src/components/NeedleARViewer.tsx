// ============ NEEDLE AR VIEWER COMPONENT ============
// WebXR-compatible AR viewer using Needle Engine

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Camera, AlertTriangle, RefreshCw, Smartphone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackEvent, trackARStarted, trackARCompleted, trackARError } from '@/lib/analytics';
import { GameObject } from '@needle-tools/engine';
import { ModelLoading, loadSceneInto } from '@/utils/DirectusLoader';
import type { ARScene, Language } from '@/lib/types';

// Tell TypeScript about <needle-engine> custom element

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

// ─── Dynamic Viewer: inline needle-engine + GLB from Directus ────────────────
function DynamicNeedleViewer({
  scene,
  locale,
  onStart,
  onError,
}: NeedleARViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);
  const needleRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = needleRef.current;
    if (!el) return;

    const onLoadFinished = async () => {
      if (initialized.current) return;
      initialized.current = true;

      console.log('[AR] loadfinished event fired');

      try {
        onStart?.();
        trackARStarted(scene.id, scene.needle_type, scene.title[locale!] || scene.title.es);

        // Find ModelLoading in the loaded scene
        let modelLoader = GameObject.findObjectOfType(ModelLoading);
        console.log('[AR] ModelLoading found:', modelLoader);

        if (!modelLoader) {
          console.warn('[AR] ModelLoading not found in scene — trying Context');
          const { Context } = await import('@needle-tools/engine');
          const ctx = Context.Current;
          console.log('[AR] Context.current:', ctx);
          const firstChild = ctx?.scene?.children?.[0] as any;
          if (firstChild?.addComponent) {
            modelLoader = firstChild.addComponent(ModelLoading);
            console.log('[AR] ModelLoading added to first child:', modelLoader);
          }
        }

        if (!modelLoader) {
          throw new Error('Could not create ModelLoading — no suitable GameObject found');
        }

        await loadSceneInto(modelLoader, scene.slug);
        setIsLoading(false);
      } catch (err: any) {
        const msg = err?.message ?? 'Unknown error';
        console.error('[AR] Error loading scene:', msg);
        trackARError(scene.id, msg);
        onError?.(msg);
        setIsLoading(false);
      }
    };

    el.addEventListener('loadfinished', onLoadFinished);
    return () => el.removeEventListener('loadfinished', onLoadFinished);
  }, [scene, locale, onStart, onError]);

  return (
    <div
      className="relative rounded-xl overflow-hidden border border-border bg-black"
      style={{ minHeight: 500 }}
    >
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#000',
            color: '#fff',
            zIndex: 10,
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              border: '3px solid rgba(255,255,255,0.3)',
              borderTopColor: '#fff',
              borderRadius: '50%',
              animation: 'needle_spin 1s linear infinite',
            }}
          />
          <span style={{ fontSize: '0.9rem' }}>{texts.loading[locale!]}</span>
        </div>
      )}

      <needle-engine
        ref={needleRef as any}
        src="/assets/scene.glb"
        loading-background="#000000"
        style={{ width: '100%', height: '100%', minHeight: 500, display: 'block' }}
      />

      <style>{`@keyframes needle_spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function NeedleARViewer({
  scene,
  locale = 'es',
  onStart,
  onError,
}: NeedleARViewerProps) {
  const [isARSupported, setIsARSupported] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [arActive, setARActive] = useState(false);
  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkARSupport = async () => {
      if ('xr' in navigator) {
        try {
          const supported = await (navigator as any).xr?.isSessionSupported('immersive-ar');
          setIsARSupported(supported || false);
        } catch {
          setIsARSupported(false);
        }
      } else {
        setIsARSupported(false);
      }
    };
    checkARSupport();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      iframeRef.current?.remove();
      closeBtnRef.current?.remove();
    };
  }, []);

  const launchIframeAR = useCallback(async () => {
    if (!containerRef.current) return;
    setIsLoading(true);
    startTimeRef.current = Date.now();

    try {
      trackARStarted(scene.id, scene.needle_type, scene.title[locale] || scene.title.es);
      onStart?.();
      setARActive(true);

      const iframe = document.createElement('iframe');
      iframe.src = scene.needle_scene_url;
      iframe.style.cssText = 'width:100%;height:100vh;border:none;position:fixed;top:0;left:0;z-index:9999';
      iframe.allow = 'camera; xr-spatial-tracking; gyroscope; accelerometer; magnetometer';
      iframe.allowFullscreen = true;
      iframeRef.current = iframe;

      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '✕';
      closeBtn.style.cssText = `
        position:fixed;top:20px;right:20px;z-index:10000;
        width:48px;height:48px;border-radius:50%;
        background:rgba(0,0,0,0.7);color:white;
        border:none;font-size:24px;cursor:pointer;
      `;

      const cleanup = () => {
        iframeRef.current?.remove(); iframeRef.current = null;
        closeBtnRef.current?.remove(); closeBtnRef.current = null;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setARActive(false);
        setIsLoading(false);
      };

      closeBtn.onclick = () => {
        const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
        if (timeSpent > 2) trackARCompleted(scene.id, timeSpent);
        cleanup();
      };

      closeBtnRef.current = closeBtn;
      document.body.appendChild(iframe);
      document.body.appendChild(closeBtn);

      timeoutRef.current = setTimeout(() => {
        if (isLoading) {
          cleanup();
          const msg = 'AR scene loading timeout';
          trackARError(scene.id, msg);
          onError?.(msg);
        }
      }, 15000);

      iframe.onload = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsLoading(false);
      };

      iframe.onerror = () => {
        cleanup();
        const msg = 'Failed to load AR scene';
        trackARError(scene.id, msg);
        onError?.(msg);
      };
    } catch (error) {
      setIsLoading(false);
      setARActive(false);
      const msg = error instanceof Error ? error.message : 'Unknown error';
      trackARError(scene.id, msg);
      onError?.(msg);
    }
  }, [scene, locale, onStart, onError]);

  const openNavigation = useCallback(() => {
    if (!scene.location) return;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${scene.location.lat},${scene.location.lng}`, '_blank');
    trackEvent('ar_navigation_opened', { ar_id: scene.id });
  }, [scene]);

  // ── Checking AR support ──
  if (isARSupported === null) {
    return (
      <div className="flex items-center justify-center p-8 bg-muted/50 rounded-xl">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>{texts.checking[locale]}</span>
        </div>
      </div>
    );
  }

  // ── Dynamic mode: inline Needle Engine viewer ──
  // Shown regardless of AR support check — Needle handles its own AR session
  if (scene.scene_mode === 'dynamic') {
    return (
      <DynamicNeedleViewer
        scene={scene}
        locale={locale}
        onStart={onStart}
        onError={onError}
      />
    );
  }

  // ── AR not supported (for iframe/build modes) ──
  if (isARSupported === false) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-card border border-border rounded-xl"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-destructive/10 rounded-full">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-2">{texts.notSupported[locale]}</h3>
            <p className="text-muted-foreground mb-4">{texts.notSupportedDesc[locale]}</p>
            <p className="text-sm text-muted-foreground mb-3">{texts.requirements[locale]}</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Smartphone className="w-4 h-4" />{texts.reqMobile[locale]}</li>
              <li className="flex items-center gap-2"><Camera className="w-4 h-4" />{texts.reqBrowser[locale]}</li>
            </ul>
            <div className="mt-6">
              <p className="text-sm font-medium text-foreground mb-2">{texts.preview[locale]}:</p>
              {scene.preview_video
                ? <video src={scene.preview_video} controls className="w-full rounded-lg" poster={scene.preview_image} />
                : <img src={scene.preview_image} alt={scene.title[locale] || scene.title.es} className="w-full rounded-lg" />
              }
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Geo AR ──
  if (scene.needle_type === 'geo' && scene.location) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-card border border-border rounded-xl"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-primary/10 rounded-full">
            <MapPin className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">{texts.geoRequired[locale]}</h3>
            <p className="text-sm text-muted-foreground">
              Lat: {scene.location.lat.toFixed(4)}, Lng: {scene.location.lng.toFixed(4)}
            </p>
          </div>
        </div>
        <Button onClick={openNavigation} className="w-full mb-4">
          <MapPin className="w-4 h-4 mr-2" />{texts.goToLocation[locale]}
        </Button>
        <Button onClick={launchIframeAR} variant="outline" className="w-full" disabled={isLoading}>
          {isLoading
            ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />{texts.loading[locale]}</>
            : <><Camera className="w-4 h-4 mr-2" />{texts.startAR[locale]}</>
          }
        </Button>
      </motion.div>
    );
  }

  // ── Default: launch via iframe (build mode) ──
  return (
    <motion.div ref={containerRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
      {!arActive && (
        <div className="p-6 bg-card border border-border rounded-xl text-center">
          <div className="mb-6">
            <img
              src={scene.preview_image}
              alt={scene.title[locale] || scene.title.es}
              className="w-full max-h-48 object-cover rounded-lg mb-4"
            />
            <p className="text-sm text-muted-foreground">{texts.lighting[locale]}</p>
          </div>
          <Button onClick={launchIframeAR} size="lg" className="w-full" disabled={isLoading}>
            {isLoading
              ? <><RefreshCw className="w-5 h-5 mr-2 animate-spin" />{texts.loading[locale]}</>
              : <><Camera className="w-5 h-5 mr-2" />{texts.startAR[locale]}</>
            }
          </Button>
          {scene.needle_type === 'image-tracking' && scene.tracking_image_url && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">
                {locale === 'es' ? 'Necesitarás este marcador:' : locale === 'en' ? 'You will need this marker:' : 'Vous aurez besoin de ce marqueur:'}
              </p>
              <a href={scene.tracking_image_url} download="marcador-ar.png"
                className="inline-flex items-center text-sm text-primary hover:underline"
              >
                ⬇️ {locale === 'es' ? 'Descargar marcador' : locale === 'en' ? 'Download marker' : 'Télécharger le marqueur'}
              </a>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default NeedleARViewer;
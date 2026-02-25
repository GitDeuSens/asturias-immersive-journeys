// ============ NEEDLE AR VIEWER COMPONENT ============
// WebXR-compatible AR viewer using Needle Engine

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Smartphone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackEvent, trackARStarted, trackARCompleted, trackARError } from '@/lib/analytics';
import '@needle-tools/engine';
import '../generated/register_types';
import { GameObject } from '@needle-tools/engine';
import { ModelLoading, loadSceneInto } from '@/utils/DirectusLoader';
import type { ARScene, Language } from '@/lib/types';

interface NeedleARViewerProps {
  scene: ARScene;
  locale?: Language;
  onStart?: () => void;
  onError?: (error: string) => void;
}

const texts = {
  startAR: { es: 'Iniciar Experiencia AR', en: 'Start AR Experience', fr: "Démarrer l'expérience AR" },
  notSupported: { es: 'AR no disponible', en: 'AR not available', fr: 'AR non disponible' },
  notSupportedDesc: {
    es: 'Tu dispositivo no soporta experiencias de Realidad Aumentada.',
    en: 'Your device does not support Augmented Reality experiences.',
    fr: "Votre appareil ne prend pas en charge les expériences de Réalité Augmentée."
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
  lighting: { es: 'Asegúrate de estar en un lugar con buena iluminación', en: 'Make sure you are in a well-lit area', fr: "Assurez-vous d'être dans un endroit bien éclairé" },
  loading: { es: 'Cargando experiencia AR...', en: 'Loading AR experience...', fr: "Chargement de l'expérience AR..." },
  goToLocation: { es: 'Ir a la ubicación', en: 'Go to location', fr: "Aller à l'emplacement" },
  geoRequired: {
    es: 'Esta experiencia requiere estar en la ubicación física',
    en: 'This experience requires being at the physical location',
    fr: "Cette expérience nécessite d'être à l'emplacement physique"
  },
};

// Dynamic Viewer
function DynamicNeedleViewer({ scene, locale, onStart, onError }: NeedleARViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);
  const needleRef = useRef<HTMLElement | null>(null);
  const autostart = typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).get('autostart') === '1';

  useEffect(() => {
    (window as any).__DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL ?? 'http://192.168.12.71:8055';
  }, []);

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

        let modelLoader = GameObject.findObjectOfType(ModelLoading);

        const { Context } = await import('@needle-tools/engine');
        const ctx = Context.Current;

        const firstChild = ctx?.scene?.children?.[0] as any;

        if (!modelLoader) {
          if (!firstChild?.addComponent) {
            throw new Error('[AR] firstChild has no addComponent method.');
          }
          modelLoader = firstChild.addComponent(ModelLoading);
        }

        if (!modelLoader) {
          throw new Error('Could not create ModelLoading — no suitable GameObject found.');
        }

        await loadSceneInto(modelLoader, scene.slug);
        setIsLoading(false);

        // Auto-trigger AR session if ?autostart=1 (from QR scan)
        // Browser will show camera/XR permission popup — this is expected
        if (autostart) {
          setTimeout(async () => {
            try {
              const { WebXRButtonFactory } = await import('@needle-tools/engine');
              const factory = WebXRButtonFactory.getOrCreate();
              if (factory?.arButton) { factory.arButton.click(); return; }
            } catch {}
            const btn = document.querySelector('[ar-button]') as HTMLElement
              ?? document.querySelector('needle-button[ar]') as HTMLElement
              ?? (el as any)?.shadowRoot?.querySelector('[ar-button]') as HTMLElement;
            btn?.click();
          }, 500);
        }
      } catch (err: any) {
        const msg = err?.message ?? 'Unknown error';
        console.error('[AR] Error loading scene:', msg);
        trackARError(scene.id, msg);
        onError?.(msg);
        setIsLoading(false);
      }
    };

    const hideQRLabel = () => {
      const shadow = (el as any).shadowRoot;
      if (!shadow) return;
      const style = document.createElement('style');
      style.textContent = `
        .qr-code-label, [class*="qr"] a, [class*="qr"] span, [class*="qr"] p,
        .webxr-ar-button + *, a[href*="localhost"], a[href*="ar/"],
        .quit-ar, .quit-ar-button, [class*="quit-ar"], svg.quit-ar-button,
        .content > slot[name="quit-ar"],
        div[style*="position: fixed"][style*="z-index: 600"],
        button[class*="close"], .close-button,
        svg[width="40px"][height="40px"] { display: none !important; }
      `;
      shadow.appendChild(style);
    };

    el.addEventListener('loadfinished', onLoadFinished);
    el.addEventListener('loadfinished', hideQRLabel);
    setTimeout(hideQRLabel, 500);
    return () => el.removeEventListener('loadfinished', onLoadFinished);
  }, [scene, locale, onStart, onError]);

  return (
    <div className="relative rounded-2xl border border-border bg-black overflow-hidden" style={{ minHeight: 500 }}>
      {isLoading && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', background: '#000',
          color: '#fff', zIndex: 10, gap: '1rem',
        }}>
          <div style={{
            width: 40, height: 40, border: '3px solid rgba(255,255,255,0.3)',
            borderTopColor: '#fff', borderRadius: '50%', animation: 'needle_spin 1s linear infinite',
          }} />
          <span style={{ fontSize: '0.9rem' }}>{texts.loading[locale!]}</span>
        </div>
      )}
      <needle-engine
        ref={needleRef as any}
        src="/assets/scene.glb"
        loading-background="#000000"
        no-menu
        style={{ width: '100%', height: '100%', minHeight: 500, display: 'block' }}
      >
        <div id="needle-overlay-slot" style={{ display: 'contents' }} />
      </needle-engine>
      <style>{`
        @keyframes needle_spin { to { transform: rotate(360deg); } }
        needle-engine .qr-code-label,
        needle-engine [class*="qr"] span,
        needle-engine [class*="qr"] a,
        needle-engine [class*="qr"] p { display: none !important; }
      `}</style>
    </div>
  );
}

// Main Component
export function NeedleARViewer({ scene, locale = 'es', onStart, onError }: NeedleARViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div ref={containerRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative space-y-4">
      {/* 3D Preview with built-in AR button inside needle-engine */}
      <DynamicNeedleViewer scene={scene} locale={locale} onStart={onStart} onError={onError} />

      {/* Geo-located scene → navigation button */}
      {scene.needle_type === 'geo' && scene.location && (
        <Button onClick={() => {
          if (!scene.location) return;
          window.open(`https://www.google.com/maps/dir/?api=1&destination=${scene.location.lat},${scene.location.lng}`, '_blank');
          trackEvent('ar_navigation_opened', { ar_id: scene.id });
        }} variant="outline" className="w-full">
          <MapPin className="w-4 h-4 mr-2" />{texts.goToLocation[locale]}
        </Button>
      )}

      {/* Image tracking → marker download */}
      {scene.needle_type === 'image-tracking' && scene.tracking_image_url && (
        <div className="pt-3 border-t border-border">
          <p className="text-sm text-muted-foreground mb-2">
            {locale === 'es' ? 'Necesitarás este marcador:' : locale === 'en' ? 'You will need this marker:' : 'Vous aurez besoin de ce marqueur:'}
          </p>
          <a href={scene.tracking_image_url} download="marcador-ar.png" className="inline-flex items-center text-sm text-primary hover:underline">
            ⬇️ {locale === 'es' ? 'Descargar marcador' : locale === 'en' ? 'Download marker' : 'Télécharger le marqueur'}
          </a>
        </div>
      )}
    </motion.div>
  );
}

export default NeedleARViewer;
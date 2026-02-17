import { Suspense, lazy, useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import { SkipToContent } from '@/components/SkipToContent';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { NetworkStatusAlert } from '@/components/NetworkStatusAlert';
import { initGA, trackPageView, initSessionTracking } from '@/lib/analytics';
import { 
  PerformanceMonitor, 
  useResourceHints, 
  useBFCacheOptimization, 
  ScriptOptimizer,
  useFontOptimization
} from '@/components/PerformanceOptimizer';
import { BFCacheOptimizer as WebSocketBFCacheOptimizer, useJSOptimization } from '@/components/WebSocketManager';
import { useServiceWorker } from '@/hooks/useServiceWorker';

// Lazy load pages for performance
const Index = lazy(() => import("./pages/Index"));
const ARScenePage = lazy(() => import("./pages/ARScenePage").then(m => ({ default: m.ARScenePage })));
const AccessibilityPage = lazy(() => import("./pages/AccessibilityPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const CookiesPage = lazy(() => import("./pages/CookiesPage"));
const LegalPage = lazy(() => import("./pages/LegalPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading fallback
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background" role="status" aria-label="Cargando...">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" aria-hidden="true" />
        <span className="text-muted-foreground font-medium">Cargando...</span>
      </div>
    </div>
  );
}

// Analytics tracker component
function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    initGA();
    initSessionTracking();
  }, []);

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return null;
}

// Redirect helper for /tours/ar/:slug -> /ar/:slug
function RedirectToAR() {
  const { slug } = useParams();
  return <Navigate to={`/ar/${slug}`} replace />;
}


// Lazy load heavy components
const CookieConsent = lazy(() => import("./components/CookieConsent").then(m => ({ default: m.CookieConsent })));
const AnalyticsDashboard = lazy(() => import("./pages/AnalyticsDashboard").then(m => ({ default: m.AnalyticsDashboard })));
const ARExperiencesPage = lazy(() => import("./pages/ARExperiencesPage").then(m => ({ default: m.ARExperiencesPage })));
const VRExperiencesPage = lazy(() => import("./components/VRExperiencesPage").then(m => ({ default: m.VRExperiencesPage })));
const Tours360Page = lazy(() => import("./pages/Tours360Page").then(m => ({ default: m.Tours360Page })));
const RoutesPage = lazy(() => import("./pages/RoutesPage").then(m => ({ default: m.RoutesPage })));
const RouteDetailSheet = lazy(() => import("./components/CookieConsent").then(m => ({ default: m.CookieConsent })));
// Internal component for performance optimizations
function AppWithOptimizations() {
  useServiceWorker();
  useResourceHints();
  useBFCacheOptimization();
  useFontOptimization();
  useJSOptimization();
  
  return (
    <>
      <PerformanceMonitor />
      <ScriptOptimizer />
      <WebSocketBFCacheOptimizer />
      <SkipToContent />
      <NetworkStatusAlert />
      <Toaster />
      <Sonner />
      <>
        <AnalyticsTracker />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/experience" element={<Index />} />
            <Route path="/tours" element={<Tours360Page />} />
            <Route path="/tours/:slug" element={<Tours360Page />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/routes/:routeCode" element={<RoutesPage />} />
            <Route path="/routes/:routeCode/:id" element={<RoutesPage />} />
            <Route path="/vr" element={<VRExperiencesPage />} />
            <Route path="/ar" element={<ARExperiencesPage />} />
            <Route path="/ar/:slug" element={<ARScenePage />} />
            {/* Redirects for relative navigation from /tours/:slug */}
            <Route path="/tours/ar/:slug" element={<RedirectToAR />} />
            <Route path="/accessibility" element={<AccessibilityPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/cookies" element={<CookiesPage />} />
            <Route path="/legal" element={<LegalPage />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        {/* Cookie Consent Banner */}
        <Suspense fallback={null}>
          <CookieConsent />
        </Suspense>
      </>
    </>
  );
}

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <TooltipProvider>
        <AppWithOptimizations />
      </TooltipProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;

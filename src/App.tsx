import { Suspense, lazy } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SkipToContent } from '@/components/SkipToContent';

// Lazy load pages for performance
const Index = lazy(() => import("./pages/Index"));
const Tours360Page = lazy(() => import("./pages/Tours360Page").then(m => ({ default: m.Tours360Page })));
const RoutesPage = lazy(() => import("./pages/RoutesPage").then(m => ({ default: m.RoutesPage })));
const VRExperiencesPage = lazy(() => import("./components/VRExperiencesPage").then(m => ({ default: m.VRExperiencesPage })));
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

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SkipToContent />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/experience" element={<Index />} />
              <Route path="/tours" element={<Tours360Page />} />
              <Route path="/routes" element={<RoutesPage />} />
              <Route path="/vr" element={<VRExperiencesPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;

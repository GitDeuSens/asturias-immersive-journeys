import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import App from './App';
import i18n from './i18n';
import { queryClient } from '@/lib/queryClient';
import { loadDirectusTranslations } from '@/i18n/directus-backend';
import './index.css';
import './generated/register_types';

// Lazy load devtools — only in development, zero cost in production
const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() => import('@tanstack/react-query-devtools').then(m => ({ default: m.ReactQueryDevtools })))
  : () => null;

// ─── Needle Engine ──────────────────────────────────────────────────────────
// Needle Engine is loaded lazily by NeedleARViewer and ARScenePage components.
// No global preload — saves ~2-3MB for users who don't visit AR pages.

// Load CMS-managed translations (merges over bundled fallbacks)
loadDirectusTranslations().catch(() => {});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} />
        </Suspense>
        <ErrorBoundary>
          <Toaster />
          <App />
        </ErrorBoundary>
      </QueryClientProvider>
    </I18nextProvider>
  </BrowserRouter>
);
import React from 'react';
import ReactDOM from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import App from './App';
import i18n from './i18n';
import { queryClient } from '@/lib/queryClient';
import { loadDirectusTranslations } from '@/i18n/directus-backend';
import './index.css';

// Load CMS-managed translations (merges over bundled fallbacks)
loadDirectusTranslations().catch(err => {
  // Silently fail translation loading
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <I18nextProvider i18n={i18n}>
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <ErrorBoundary>
        <Toaster />
        <App />
      </ErrorBoundary>
    </QueryClientProvider>
  </I18nextProvider>
);

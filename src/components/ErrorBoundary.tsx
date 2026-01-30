import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Mountain } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

const texts = {
  title: {
    es: 'Algo salió mal',
    en: 'Something went wrong',
    fr: 'Une erreur est survenue'
  },
  description: {
    es: 'Ha ocurrido un error inesperado. Por favor, intenta recargar la página o volver al inicio.',
    en: 'An unexpected error occurred. Please try reloading the page or going back to home.',
    fr: 'Une erreur inattendue s\'est produite. Veuillez recharger la page ou retourner à l\'accueil.'
  },
  reload: {
    es: 'Recargar página',
    en: 'Reload page',
    fr: 'Recharger la page'
  },
  home: {
    es: 'Ir al inicio',
    en: 'Go to home',
    fr: 'Aller à l\'accueil'
  },
  technicalDetails: {
    es: 'Detalles técnicos',
    en: 'Technical details',
    fr: 'Détails techniques'
  }
};

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private getLocale(): 'es' | 'en' | 'fr' {
    const stored = localStorage.getItem('i18nextLng');
    if (stored && ['es', 'en', 'fr'].includes(stored)) {
      return stored as 'es' | 'en' | 'fr';
    }
    return 'es';
  }

  private t(textObj: Record<string, string>): string {
    const locale = this.getLocale();
    return textObj[locale] || textObj.es;
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full text-center"
          >
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
                <Mountain className="w-10 h-10 text-primary-foreground" />
              </div>
            </div>

            {/* Error Icon */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center"
            >
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </motion.div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-foreground mb-3">
              {this.t(texts.title)}
            </h1>

            {/* Description */}
            <p className="text-muted-foreground mb-8">
              {this.t(texts.description)}
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={this.handleReload}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {this.t(texts.reload)}
              </Button>
              <Button
                variant="outline"
                onClick={this.handleGoHome}
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                {this.t(texts.home)}
              </Button>
            </div>

            {/* Technical Details (collapsible in dev) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                  {this.t(texts.technicalDetails)}
                </summary>
                <div className="mt-3 p-4 bg-muted rounded-lg overflow-auto max-h-48">
                  <pre className="text-xs text-destructive whitespace-pre-wrap break-words">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              </details>
            )}
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

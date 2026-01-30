import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mountain, Home, Search, Map, ArrowLeft, Compass } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    
    // Generate suggestions based on current path
    const path = location.pathname.toLowerCase();
    const newSuggestions: string[] = [];
    
    if (path.includes('tour') || path.includes('360')) {
      newSuggestions.push('/tours');
    }
    if (path.includes('ruta') || path.includes('route') || path.includes('camino')) {
      newSuggestions.push('/routes');
    }
    if (path.includes('ar') || path.includes('realidad')) {
      newSuggestions.push('/ar');
    }
    if (path.includes('vr') || path.includes('virtual')) {
      newSuggestions.push('/vr');
    }
    
    // Always add home as fallback
    if (newSuggestions.length === 0) {
      newSuggestions.push('/');
    }
    
    setSuggestions(newSuggestions);
  }, [location.pathname]);

  const content = {
    es: {
      title: "Página no encontrada",
      subtitle: "¡Ups! Parece que te has perdido en los Picos de Europa",
      description: "La página que buscas no existe o ha sido movida. Pero no te preocupes, hay mucho más por explorar en Asturias.",
      home: "Volver al inicio",
      explore: "Explorar experiencias",
      back: "Ir atrás",
      suggestions: "Quizás buscabas:",
      suggestionsMap: {
        '/tours': 'Tours Virtuales 360°',
        '/routes': 'Rutas Inmersivas',
        '/ar': 'Experiencias AR',
        '/vr': 'Experiencias VR',
        '/': 'Página de inicio'
      }
    },
    en: {
      title: "Page not found",
      subtitle: "Oops! It seems you got lost in the Picos de Europa",
      description: "The page you're looking for doesn't exist or has been moved. But don't worry, there's much more to explore in Asturias.",
      home: "Back to home",
      explore: "Explore experiences",
      back: "Go back",
      suggestions: "Maybe you were looking for:",
      suggestionsMap: {
        '/tours': 'Virtual 360° Tours',
        '/routes': 'Immersive Routes',
        '/ar': 'AR Experiences',
        '/vr': 'VR Experiences',
        '/': 'Home page'
      }
    },
    fr: {
      title: "Page non trouvée",
      subtitle: "Oups ! Il semble que vous vous soyez perdu dans les Pics d'Europe",
      description: "La page que vous recherchez n'existe pas ou a été déplacée. Mais ne vous inquiétez pas, il y a beaucoup plus à explorer dans les Asturies.",
      home: "Retour à l'accueil",
      explore: "Explorer les expériences",
      back: "Retour",
      suggestions: "Peut-être cherchiez-vous :",
      suggestionsMap: {
        '/tours': 'Visites Virtuelles 360°',
        '/routes': 'Routes Immersives',
        '/ar': 'Expériences AR',
        '/vr': 'Expériences VR',
        '/': 'Page d\'accueil'
      }
    }
  };

  const lang = (i18n.language?.substring(0, 2) as 'es' | 'en' | 'fr') || 'es';
  const c = content[lang] || content.es;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <Mountain className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-lg text-foreground">Asturias</span>
              <span className="text-primary font-semibold text-sm ml-1 uppercase tracking-wider">Inmersivo</span>
            </div>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 pt-20 pb-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* 404 Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="relative inline-block">
              <span className="text-[150px] sm:text-[200px] font-bold text-primary/20 leading-none select-none">
                404
              </span>
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Compass className="w-20 h-20 sm:w-28 sm:h-28 text-primary" />
              </motion.div>
            </div>
          </motion.div>

          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {c.title}
            </h1>
            <p className="text-xl text-primary font-medium mb-2">
              {c.subtitle}
            </p>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              {c.description}
            </p>
          </motion.div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mb-8"
            >
              <p className="text-sm text-muted-foreground mb-3">{c.suggestions}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestions.map((path) => (
                  <Link key={path} to={path}>
                    <Button variant="outline" size="sm" className="gap-2">
                      {path === '/tours' && <Search className="w-4 h-4" />}
                      {path === '/routes' && <Map className="w-4 h-4" />}
                      {path === '/' && <Home className="w-4 h-4" />}
                      {c.suggestionsMap[path as keyof typeof c.suggestionsMap] || path}
                    </Button>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {c.back}
            </Button>
            <Link to="/">
              <Button className="gap-2 w-full sm:w-auto">
                <Home className="w-4 h-4" />
                {c.home}
              </Button>
            </Link>
          </motion.div>

          {/* Attempted path for debugging */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-8 text-xs text-muted-foreground/50 font-mono"
          >
            {location.pathname}
          </motion.p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-border bg-muted/30">
        <div className="container mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Asturias Inmersivo · Turismo de Asturias
          </p>
        </div>
      </footer>
    </div>
  );
};

export default NotFound;

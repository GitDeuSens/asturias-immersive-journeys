import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, View, Map, Sparkles, Glasses, MapPin, Trash2, Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { Footer } from '@/components/Footer';
import { SEOHead } from '@/components/SEOHead';
import { FavoriteButton } from '@/components/FavoriteButton';
import { useFavorites, type FavoriteType, type FavoriteItem } from '@/hooks/useFavorites';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage,
} from '@/components/ui/breadcrumb';

const texts = {
  title: { es: 'Guardados', en: 'Saved', fr: 'Enregistrés' },
  subtitle: {
    es: 'Lo guardado en este dispositivo para volver después',
    en: 'Saved on this device to come back later',
    fr: 'Enregistré sur cet appareil pour y revenir plus tard',
  },
  empty: {
    es: 'Aún no has guardado nada. Explora y toca el ❤️ para volver aquí luego en este dispositivo.',
    en: "You haven't saved anything yet. Explore and tap ❤️ to return here later on this device.",
    fr: "Vous n'avez encore rien enregistré. Explorez et touchez ❤️ pour revenir ici plus tard sur cet appareil.",
  },
  all: { es: 'Todos', en: 'All', fr: 'Tous' },
};

const typeConfig: Record<FavoriteType, { icon: any; label: Record<string, string>; path: string }> = {
  tour: { icon: View, label: { es: 'Tours', en: 'Tours', fr: 'Visites' }, path: '/tours' },
  route: { icon: Map, label: { es: 'Rutas', en: 'Routes', fr: 'Itinéraires' }, path: '/routes' },
  ar: { icon: Sparkles, label: { es: 'AR', en: 'AR', fr: 'AR' }, path: '/xr' },
  vr: { icon: Glasses, label: { es: 'VR', en: 'VR', fr: 'VR' }, path: '/xr' },
  poi: { icon: MapPin, label: { es: 'Puntos', en: 'Points', fr: 'Points' }, path: '/routes' },
};

export function FavoritesPage() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useFavorites();
  const [filter, setFilter] = useState<FavoriteType | 'all'>('all');

  const filtered = filter === 'all' ? favorites : favorites.filter(f => f.type === filter);
  const types = [...new Set(favorites.map(f => f.type))];

  const getItemLink = (item: FavoriteItem): string => {
    switch (item.type) {
      case 'tour': return `/tours/${item.id}`;
      case 'route': return `/routes/${item.id}`;
      case 'ar': return `/ar/${item.id}`;
      case 'vr': return '/vr';
      case 'poi': return '/routes';
      default: return '/';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead title={t(texts.title)} description={t(texts.subtitle)} />
      <AppHeader variant="light" />

      <main className="flex-1 pt-14 md:pt-[122px]">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 max-w-6xl pt-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="flex items-center gap-1 text-xs">
                  <Home className="w-3 h-3" />
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-xs">{t(texts.title)}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Hero */}
        <div className="bg-gradient-to-r from-red-500 to-rose-600 py-6 sm:py-12 mb-6 sm:mb-8 mt-2">
          <div className="container mx-auto px-4 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-white"
            >
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3">
                <Heart className="w-8 h-8 sm:w-10 sm:h-10 fill-current" />
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold">{t(texts.title)}</h1>
              </div>
              <p className="text-sm sm:text-lg text-white/90">{t(texts.subtitle)}</p>
              {favorites.length > 0 && (
                <p className="text-white/70 text-sm mt-2">{favorites.length} {language === 'es' ? 'guardados' : language === 'en' ? 'saved' : 'sauvegardés'}</p>
              )}
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-6xl pb-8">
          {/* Type filter chips */}
          {types.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  filter === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border hover:border-primary'
                }`}
              >
                {t(texts.all)} ({favorites.length})
              </button>
              {types.map(type => {
                const config = typeConfig[type];
                const Icon = config.icon;
                const count = favorites.filter(f => f.type === type).length;
                return (
                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all border flex items-center gap-1.5 ${
                      filter === type ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border hover:border-primary'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {t(config.label)} ({count})
                  </button>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {favorites.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <Heart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg mb-6">{t(texts.empty)}</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/tours">
                  <Button variant="outline"><View className="w-4 h-4 mr-2" />Tours 360°</Button>
                </Link>
                <Link to="/routes">
                  <Button variant="outline"><Map className="w-4 h-4 mr-2" />{language === 'es' ? 'Rutas' : 'Routes'}</Button>
                </Link>
                <Link to="/xr">
                  <Button variant="outline"><Sparkles className="w-4 h-4 mr-2" />XR</Button>
                </Link>
              </div>
            </motion.div>
          )}

          {/* Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filtered.map((item, i) => {
                const config = typeConfig[item.type];
                const Icon = config.icon;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.04 }}
                    className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary transition-all cursor-pointer shadow-sm hover:shadow-lg"
                    onClick={() => navigate(getItemLink(item))}
                  >
                    <div className="relative aspect-[16/10] bg-muted">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                          <Icon className="w-12 h-12 text-primary/30" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 text-white text-xs font-bold backdrop-blur-sm">
                          <Icon className="w-3 h-3" />
                          {t(config.label)}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <FavoriteButton id={item.id} type={item.type} title={item.title} image={item.image} size="sm" />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{item.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(item.addedAt).toLocaleDateString(language === 'es' ? 'es-ES' : language === 'fr' ? 'fr-FR' : 'en-US')}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        <Footer />
      </main>
    </div>
  );
}

export default FavoritesPage;

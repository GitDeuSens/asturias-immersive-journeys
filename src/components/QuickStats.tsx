import { motion } from 'framer-motion';
import { View, Map, Sparkles, Glasses, MapPin } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface QuickStatsProps {
  tourCount: number;
  routeCount: number;
  arCount: number;
  vrCount: number;
  poiCount: number;
}

const texts = {
  tours: { es: 'Tours 360°', en: '360° Tours', fr: 'Visites 360°' },
  routes: { es: 'Rutas', en: 'Routes', fr: 'Itinéraires' },
  ar: { es: 'Escenas AR', en: 'AR Scenes', fr: 'Scènes AR' },
  vr: { es: 'Experiencias VR', en: 'VR Experiences', fr: 'Expériences VR' },
  poi: { es: 'Puntos de interés', en: 'Points of interest', fr: "Points d'intérêt" },
};

export function QuickStats({ tourCount, routeCount, arCount, vrCount, poiCount }: QuickStatsProps) {
  const { t } = useLanguage();

  const stats = [
    { icon: View, count: tourCount, label: t(texts.tours), color: 'text-primary' },
    { icon: Map, count: routeCount, label: t(texts.routes), color: 'text-accent' },
    { icon: Sparkles, count: arCount, label: t(texts.ar), color: 'text-warm' },
    { icon: Glasses, count: vrCount, label: t(texts.vr), color: 'text-primary' },
    { icon: MapPin, count: poiCount, label: t(texts.poi), color: 'text-accent' },
  ].filter(s => s.count > 0);

  if (stats.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="flex flex-wrap justify-center gap-3 sm:gap-5"
    >
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 + i * 0.08 }}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 min-w-[70px]"
        >
          <stat.icon className={`w-4 h-4 ${stat.color}`} />
          <span className="text-xl sm:text-2xl font-bold text-white">{stat.count}</span>
          <span className="text-[10px] sm:text-xs text-white/70 text-center leading-tight">{stat.label}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

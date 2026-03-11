import { motion } from 'framer-motion';
import { CheckCircle2, MapPin } from 'lucide-react';
import { useVisited } from '@/hooks/useVisited';
import { Progress } from '@/components/ui/progress';

interface RouteProgressBarProps {
  routeId: string;
  totalPoints: number;
  className?: string;
}

const texts = {
  visited: { es: 'visitados', en: 'visited', fr: 'visités' },
  complete: { es: '¡Completada!', en: 'Completed!', fr: 'Terminée !' },
};

export function RouteProgressBar({ routeId, totalPoints, className = '' }: RouteProgressBarProps) {
  const { getRouteProgress } = useVisited();
  const { visited, total, percent } = getRouteProgress(routeId, totalPoints);

  if (visited === 0) return null;

  const isComplete = visited >= total;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className={`flex items-center gap-2 ${className}`}
    >
      {isComplete ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
      ) : (
        <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      )}
      <Progress value={percent} className="h-1.5 flex-1" />
      <span className={`text-[10px] font-semibold whitespace-nowrap ${isComplete ? 'text-primary' : 'text-muted-foreground'}`}>
        {visited}/{total}
      </span>
    </motion.div>
  );
}

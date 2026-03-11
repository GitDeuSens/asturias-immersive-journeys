import { Users } from 'lucide-react';

interface LiveVisitorCounterProps {
  routeId: string;
  viewCount?: number;
  className?: string;
}

/**
 * Shows total view count from the database (real data).
 * Only displays when viewCount > 0.
 */
export function LiveVisitorCounter({ viewCount = 0, className = '' }: LiveVisitorCounterProps) {
  if (viewCount <= 0) return null;

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground ${className}`}>
      <Users className="w-3 h-3" />
      {viewCount}
    </span>
  );
}

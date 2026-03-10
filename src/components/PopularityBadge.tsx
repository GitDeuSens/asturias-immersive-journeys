import { BarChart3, Eye } from 'lucide-react';

interface PopularityBadgeProps {
  viewCount?: number;
  launchCount?: number;
  size?: 'sm' | 'md';
  className?: string;
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function PopularityBadge({ viewCount, launchCount, size = 'sm', className = '' }: PopularityBadgeProps) {
  const count = Math.max(viewCount ?? 0, launchCount ?? 0);
  const emphasis = count >= 100 ? 'text-primary' : 'text-muted-foreground';

  const sizeClasses = size === 'sm'
    ? 'h-6 px-2 text-[10px] gap-1'
    : 'h-7 px-2.5 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full border border-border bg-background/90 backdrop-blur-sm font-medium shadow-sm ${sizeClasses} ${emphasis} ${className}`}
      aria-label={`Popularity ${count}`}
      title={`Popularity ${count}`}
    >
      {count >= 20 ? <BarChart3 className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} /> : <Eye className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span className="tabular-nums">{formatCount(count)}</span>
    </span>
  );
}

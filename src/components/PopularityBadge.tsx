import { Eye, Flame, TrendingUp } from 'lucide-react';

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
  const count = viewCount || launchCount || 0;
  if (count < 5) return null;

  const isPopular = count >= 50;
  const isTrending = count >= 100;

  const Icon = isTrending ? Flame : isPopular ? TrendingUp : Eye;
  const label = isTrending ? 'Popular' : formatCount(count);

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-[10px] gap-1'
    : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span className={`inline-flex items-center font-bold rounded-full ${sizeClasses} ${
      isTrending
        ? 'bg-destructive/15 text-destructive border border-destructive/30'
        : isPopular
          ? 'bg-warm/15 text-warm border border-warm/30'
          : 'bg-muted/50 text-muted-foreground border border-border/50'
    } ${className}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {label}
    </span>
  );
}

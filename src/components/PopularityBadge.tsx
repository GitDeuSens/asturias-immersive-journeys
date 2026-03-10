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
    ? 'px-1.5 py-0.5 text-[10px] gap-0.5'
    : 'px-2 py-1 text-xs gap-1';

  return (
    <span className={`inline-flex items-center font-semibold rounded-md backdrop-blur-sm ${sizeClasses} ${
      isTrending
        ? 'bg-card/90 text-destructive'
        : isPopular
          ? 'bg-card/90 text-warm'
          : 'bg-card/90 text-muted-foreground'
    } ${className}`}>
      <Icon className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      {label}
    </span>
  );
}

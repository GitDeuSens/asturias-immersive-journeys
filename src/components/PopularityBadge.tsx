import { TrendingUp, Flame, Zap, BarChart3, Clock } from 'lucide-react';

interface PopularityBadgeProps {
  viewCount?: number;
  launchCount?: number;
  dateCreated?: string;
  size?: 'sm' | 'md';
  className?: string;
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function daysSince(dateStr?: string): number {
  if (!dateStr) return 999;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

type BadgeStatus = { label: string; color: string; Icon: typeof Flame };

function getStatus(count: number, days: number): BadgeStatus {
  if (count >= 500) return { label: 'HOT', color: 'text-destructive', Icon: Flame };
  if (count >= 200) return { label: 'TRENDING', color: 'text-primary', Icon: TrendingUp };
  if (count >= 50) return { label: 'POPULAR', color: 'text-primary', Icon: BarChart3 };
  if (count >= 10) return { label: 'RISING', color: 'text-muted-foreground', Icon: Zap };
  if (days <= 14) return { label: 'NEW', color: 'text-accent-foreground', Icon: Clock };
  return { label: formatCount(count), color: 'text-muted-foreground', Icon: BarChart3 };
}

export function PopularityBadge({ viewCount, launchCount, dateCreated, size = 'sm', className = '' }: PopularityBadgeProps) {
  const count = Math.max(viewCount ?? 0, launchCount ?? 0);
  const days = daysSince(dateCreated);
  const { label, color, Icon } = getStatus(count, days);

  const sizeClasses = size === 'sm'
    ? 'h-5 px-1.5 text-[9px] gap-0.5'
    : 'h-6 px-2 text-[10px] gap-1';

  return (
    <span
      className={`inline-flex items-center rounded-full border border-border/60 bg-background/80 backdrop-blur-sm font-semibold tracking-wide uppercase ${sizeClasses} ${color} ${className}`}
      aria-label={`Popularity: ${label}`}
      title={`${formatCount(count)} views`}
    >
      <Icon className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} strokeWidth={2} />
      <span className="tabular-nums leading-none">{label}</span>
    </span>
  );
}

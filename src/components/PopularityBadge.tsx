import { TrendingUp, Flame, Zap, Sparkles, Clock } from 'lucide-react';

interface PopularityBadgeProps {
  viewCount?: number;
  launchCount?: number;
  dateCreated?: string;
  size?: 'sm' | 'md';
  className?: string;
}

function normalizeCount(value?: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return Math.max(0, Math.floor(value));
}

function daysSince(dateStr?: string): number {
  if (!dateStr) return 999;
  const parsedDate = new Date(dateStr).getTime();
  if (Number.isNaN(parsedDate)) return 999;
  const diff = Date.now() - parsedDate;
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

type BadgeStatus = { label: string; color: string; Icon: typeof Flame } | null;

/**
 * Social proof logic — only word-based labels, no numbers.
 * 
 * Priority order (first match wins):
 * 1. HOT       — 500+ interactions (viral)
 * 2. TRENDING  — 200+ interactions (growing fast)
 * 3. POPULAR   — 50+ interactions (well-known)
 * 4. RISING    — 10+ interactions (gaining traction)
 * 5. NEW       — created ≤14 days ago, <10 interactions
 * 6. null      — nothing to show (old content with few interactions)
 */
function getStatus(count: number, days: number): BadgeStatus {
  if (count >= 500) return { label: 'HOT', color: 'text-destructive', Icon: Flame };
  if (count >= 200) return { label: 'TRENDING', color: 'text-primary', Icon: TrendingUp };
  if (count >= 50) return { label: 'POPULAR', color: 'text-primary', Icon: Sparkles };
  if (count >= 10) return { label: 'RISING', color: 'text-accent-foreground', Icon: Zap };
  if (days <= 14) return { label: 'NEW', color: 'text-accent-foreground', Icon: Clock };
  return null; // Don't show badge for old low-activity content
}

export function PopularityBadge({ viewCount, launchCount, dateCreated, size = 'sm', className = '' }: PopularityBadgeProps) {
  const count = Math.max(normalizeCount(viewCount), normalizeCount(launchCount));
  const days = daysSince(dateCreated);
  const status = getStatus(count, days);

  // Don't render anything if there's no meaningful status
  if (!status) return null;

  const { label, color, Icon } = status;

  const sizeClasses = size === 'sm'
    ? 'h-5 px-1.5 text-[9px] gap-0.5'
    : 'h-6 px-2 text-[10px] gap-1';

  return (
    <span
      className={`inline-flex items-center rounded-full border border-border/60 bg-background/80 backdrop-blur-sm font-semibold tracking-wide uppercase ${sizeClasses} ${color} ${className}`}
      aria-label={`Popularity: ${label}`}
    >
      <Icon className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} strokeWidth={2} />
      <span className="leading-none">{label}</span>
    </span>
  );
}

/**
 * Reusable skeleton cards for loading states.
 */

export function RouteCardSkeleton() {
  return (
    <div className="w-full rounded-2xl bg-card/50 border border-border/50 overflow-hidden animate-pulse">
      <div className="w-full h-36 bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-muted rounded-lg w-3/4" />
        <div className="h-3 bg-muted rounded-lg w-1/2" />
        <div className="h-4 bg-muted rounded-lg w-full" />
        <div className="h-4 bg-muted rounded-lg w-5/6" />
        <div className="flex gap-2 mt-2">
          <div className="h-5 bg-muted rounded-full w-16" />
          <div className="h-5 bg-muted rounded-full w-20" />
          <div className="h-5 bg-muted rounded-full w-14" />
        </div>
      </div>
    </div>
  );
}

export function TourCardSkeleton() {
  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-md border border-border animate-pulse">
      <div className="aspect-[16/10] bg-muted" />
      <div className="p-3 sm:p-5 space-y-3">
        <div className="h-5 bg-muted rounded-lg w-3/4" />
        <div className="h-4 bg-muted rounded-lg w-full" />
        <div className="h-4 bg-muted rounded-lg w-2/3" />
        <div className="flex items-center justify-between">
          <div className="h-4 bg-muted rounded-lg w-20" />
          <div className="h-4 bg-muted rounded-lg w-24" />
        </div>
      </div>
    </div>
  );
}

export function PointCardSkeleton() {
  return (
    <div className="flex gap-3 p-3 rounded-xl bg-card/50 border border-border/50 animate-pulse">
      <div className="w-16 h-16 rounded-xl bg-muted flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted rounded-lg w-3/4" />
        <div className="h-3 bg-muted rounded-lg w-1/2" />
        <div className="h-3 bg-muted rounded-lg w-full" />
      </div>
    </div>
  );
}

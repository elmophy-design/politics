export function CardGridSkeleton({
  count = 6,
  aspect = "aspect-square",
  columns = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
}: {
  count?: number;
  aspect?: string;
  columns?: string;
}) {
  return (
    <div className={`grid gap-3 ${columns}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`animate-pulse rounded-sm bg-ink-900/5 ${aspect}`} />
      ))}
    </div>
  );
}

export function ListCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-sm border border-ink-900/10 bg-parchment-50 p-6">
          <div className="h-3 w-1/3 rounded bg-ink-900/10" />
          <div className="mt-3 h-4 w-2/3 rounded bg-ink-900/10" />
          <div className="mt-3 h-3 w-full rounded bg-ink-900/5" />
        </div>
      ))}
    </div>
  );
}

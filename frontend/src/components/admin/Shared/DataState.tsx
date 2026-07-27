import type { LucideIcon } from "lucide-react";

export function DataState({
  loading,
  empty,
  error,
  emptyIcon: Icon,
  emptyText,
}: {
  loading: boolean;
  empty: boolean;
  error: string | null;
  emptyIcon: LucideIcon;
  emptyText: string;
}) {
  if (error) {
    return (
      <p className="mt-6 rounded-sm border border-clay-500/30 bg-clay-500/5 px-4 py-3 text-sm text-clay-600">
        {error}
      </p>
    );
  }

  if (loading) {
    return <p className="mt-10 font-mono text-sm text-graphite-500">Loading…</p>;
  }

  if (empty) {
    return (
      <div className="mt-10 flex flex-col items-center gap-3 rounded-sm border border-dashed border-ink-900/15 py-20 text-center">
        <Icon className="h-8 w-8 text-graphite-500" strokeWidth={1.5} />
        <p className="text-sm text-graphite-500">{emptyText}</p>
      </div>
    );
  }

  return null;
}
